import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Role } from '../roles.enum';

export class RegisterDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsEmail({}, { message: 'Email invalide' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Rôle invalide' })
  role?: Role;
}
