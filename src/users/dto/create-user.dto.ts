import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: "L'email est requis" })
  @MaxLength(100, { message: "L'email est trop long" })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  })
  @MaxLength(100, {
    message: 'Le mot de passe est trop long',
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une lettre et un chiffre',
  })
  password: string;

  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères' })
  @MaxLength(50, { message: 'Le prénom est trop long' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  @MaxLength(50, { message: 'Le nom est trop long' })
  lastName?: string;
}
