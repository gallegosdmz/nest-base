import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { IsMexicanPhone } from "src/shared/decorators";

export class CreateUserDto {
  @IsMexicanPhone()
  @IsOptional()
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string; 
}