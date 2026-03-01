import { IsNotEmpty, IsString, Length } from 'class-validator';

export class MarkFailedDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 500)
  reason!: string;
}
