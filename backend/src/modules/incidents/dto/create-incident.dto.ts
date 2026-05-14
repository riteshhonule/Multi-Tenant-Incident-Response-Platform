import { IsEnum, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Severity, Status } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Database Connection Failure' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'The main production database is unreachable.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: Severity, example: Severity.CRITICAL })
  @IsEnum(Severity)
  severity: Severity;

  @ApiProperty({ enum: Status, example: Status.OPEN })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsOptional()
  assigneeId?: number;
}
