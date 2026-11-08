import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ example: '3A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  unitNumber!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0) // 0 = studio
  @Max(50)
  bedrooms!: number;

  @ApiProperty({ example: 5200 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99_999_999.99) // fits the Decimal(10, 2) column
  rentAmount!: number;
}
