import { IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @Min(1)
  amount: number;

  @IsBoolean()
  @IsOptional()
  hidden: boolean;

  itemId: number;
}
