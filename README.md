# order-service

Order management service for the microservices webshop. It is one component of the stack orchestrated by [shop-infra](https://github.com/adaniel22/shop-infra).

## Overview

The service owns orders and their line items (`Order` → `OrderItem`, one-to-many).

**Prices are computed server-side.** When creating an order the client sends only product IDs and quantities — never prices. For each line the service fetches the current product from `catalog-service` over HTTP and uses that price, so a client cannot tamper with what an order costs.

**Line items are snapshots.** Each `OrderItem` stores the product name and unit price *as they were at order time*. If the product is renamed or repriced later, existing orders are unaffected and still show what the customer actually bought.

**Events are best-effort.** After the order is persisted, an `order.created` event is published to NATS with `{ orderId, totalAmount, itemCount, createdAt }`. Publishing is wrapped in a try/catch: if NATS is unavailable the order still succeeds and the failure is only logged — notifications never block ordering.

Money (`totalAmount`, `unitPrice`) is stored as `numeric(10,2)` and travels through the API as a string, matching the convention in `catalog-service`.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/orders` | Creates an order from `{ items: [{ productId, quantity }] }` (at least one item, `quantity` ≥ 1). Prices, names and the total are resolved server-side. |
| `GET` | `/orders` | Lists all orders. |
| `GET` | `/orders/:id` | Returns a single order. |
| `PATCH` | `/orders/:id` | Partially updates an order (404 if unknown). |
| `DELETE` | `/orders/:id` | Deletes an order (404 if unknown). |

`GET /` returns a plain health/greeting string.

Request bodies are validated globally with `class-validator` (`whitelist` + `forbidNonWhitelisted`), so unknown properties — including any client-supplied price — are rejected.

> **No authentication yet.** None of these routes carry a JWT guard, so anyone who can reach the service can read or modify any order. Placing them behind the access token issued by `auth-service`, and scoping orders to their owner, is a planned improvement.

Two smaller rough edges worth knowing: `GET /orders/:id` returns `null` with a 200 for an unknown id instead of a 404, and `PATCH /orders/:id` currently accepts the same `items` shape as create, which is not a meaningful update payload for an already-priced order.

## Dependencies

| Dependency | Protocol | Used for |
| --- | --- | --- |
| `catalog-service` | HTTP (`CATALOG_SERVICE_URL`) | `GET /products/:id` per line item at order creation. An unreachable or unknown product fails the order with a 404. |
| NATS | `NATS_URL` | Publishing `order.created`. Consumed by the notification side of the stack. |
| PostgreSQL | `DB_*` | Order and order item storage. |

The catalog lookup is a hard dependency of order creation; NATS is not.

## Tech stack

- NestJS 11 (TypeScript)
- MikroORM 6 + PostgreSQL 16
- `@nestjs/axios` (HTTP client for catalog-service)
- `@nestjs/microservices` + `nats` (NATS transport)
- `class-validator` / `class-transformer` for request validation
- Docker (Node 24 Alpine)

## Running this service

Normally you do not start this service on its own — it runs as part of the Docker Compose stack in [shop-infra](https://github.com/adaniel22/shop-infra), which provides the `order-db` PostgreSQL instance, the NATS broker and `catalog-service`, and injects the environment variables. See that repo for the full setup. In the stack the service listens on port **3002**.

Configuration comes from environment variables; `.env.example` lists all of them (database connection, `PORT`, `CATALOG_SERVICE_URL`, `NATS_URL`). Copy it to `.env` and fill in your own values — never commit real secrets.

## Migrations

When the service runs in the Docker Compose stack, database migrations are **automatic**. On container startup an entrypoint script applies any pending migrations before the app starts — so there is no manual step when running via `docker compose`.

For local development outside a container, you can run migrations manually:

```bash
npm run mikro-orm -- migration:up
```

For local development against a reachable database, catalog service and NATS:

```bash
npm install
npm run start:dev     # http://localhost:3002
```

Tests:

```bash
npm test
```
