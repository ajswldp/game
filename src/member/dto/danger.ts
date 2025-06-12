import { IsDefined } from 'class-validator';

export class Danger {
  @IsDefined()
  danger: { id: number; distance: number }[];
}
