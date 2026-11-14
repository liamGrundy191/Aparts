import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// Mirrors registerSchema in @aparts/shared. No `role`: the API decides it.
export class RegisterDto {
  @ApiProperty({ example: 'Jane' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Smith' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: 'tenant@aparts.dev' })
  @Transform(trim)
  @IsEmail()
  email!: string;

  // Only presence is checked here: AuthService runs normalizePhone, the same check as the form.
  @ApiProperty({ example: '050-123-4567' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // bcrypt ignores everything after 72 bytes
  password!: string;
}
