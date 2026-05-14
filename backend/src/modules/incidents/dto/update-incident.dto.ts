import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Severity, Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIncidentDto {
  @ApiProperty({ example: 'Updated Title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Updated Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: Severity })
  @IsEnum(Severity)
  @IsOptional()
  severity?: Severity;

  @ApiProperty({ enum: Status })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  assigneeId?: number;

  @ApiProperty({ example: 1, description: 'Current version for optimistic locking' })
  @IsInt()
  version: number;
}
