import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../middleware/auth.guard';
import { TenantId, CurrentUser } from '../../middleware/tenant.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('incidents/:incidentId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to an incident' })
  create(
    @TenantId() tenantId: number,
    @CurrentUser() user: any,
    @Param('incidentId', ParseIntPipe) incidentId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(tenantId, user.sub, incidentId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all comments for an incident' })
  findAll(
    @TenantId() tenantId: number,
    @Param('incidentId', ParseIntPipe) incidentId: number,
  ) {
    return this.commentsService.findAll(tenantId, incidentId);
  }
}
