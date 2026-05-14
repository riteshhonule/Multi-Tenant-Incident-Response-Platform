import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Investigating the logs now.' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
