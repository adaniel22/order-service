// IDEIGLENES DTO — a CRUD-váz teszteléséhez.
// Később: a kliens csak a termékeket + mennyiségeket küldi,
// a totalAmount-ot és a status-t a SZERVER határozza meg. 🔒
import { IsNumberString } from 'class-validator';

export class CreateOrderDto {
  @IsNumberString()
  totalAmount!: string;
}
