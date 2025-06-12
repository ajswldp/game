import { IsDefined } from 'class-validator';

export class NameDto {
  @IsDefined()
  beforeName: string;
  @IsDefined()
  afterName: string;
}
