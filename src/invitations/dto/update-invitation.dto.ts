import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInvitationDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  guests?: number;

  @IsOptional()
  @IsString()
  specificNeeds?: string;
}
