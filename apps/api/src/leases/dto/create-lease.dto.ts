import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';
import { IsAfterDate, IsDateOnly, trim } from '../../common/validators';

// Mirrors createLeaseSchema in @aparts/shared. The unit comes from the URL and the tenant is
// looked up by email + phone, so there is no unitId, tenantId or status in the body.
export class CreateLeaseDto {
  @ApiProperty({ example: 'tenant1@aparts.dev' })
  @Transform(trim)
  @IsEmail()
  email!: string;

  // Only presence is checked here: the service runs normalizePhone, the same check as the form.
  @ApiProperty({ example: '050-100-0001' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  // Dates stay YYYY-MM-DD strings. `new Date('2026-01-01')` is UTC midnight, which is how they are stored.
  @ApiProperty({ example: '2026-01-01' })
  @IsDateOnly()
  startDate!: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateOnly()
  @IsAfterDate('startDate')
  endDate!: string;

  @ApiProperty({ example: 5200 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99_999_999.99) // fits the Decimal(10, 2) column
  monthlyRent!: number;
}
