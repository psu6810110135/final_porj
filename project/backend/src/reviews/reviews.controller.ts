import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewByAdminDto } from './dto/update-review-by-admin.dto';
import { ReviewsService } from './reviews.service';

@Controller('api/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user?.id, createReviewDto);
  }

  @Get('recommended')
  findRecommended(@Query('limit') limit = '6') {
    return this.reviewsService.findRecommended(Number(limit));
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'))
  findForAdmin(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('search') search = '',
    @Query('recommended') recommended = 'all',
    @Query('rating') rating = 'all',
  ) {
    const normalizedRecommended =
      recommended === 'true'
        ? true
        : recommended === 'false'
          ? false
          : undefined;

    const normalizedRating =
      rating === 'all' ? undefined : Number.parseInt(rating, 10);

    return this.reviewsService.findForAdmin(
      {
        page: Number(page),
        limit: Number(limit),
        search,
        recommended: normalizedRecommended,
        rating: normalizedRating,
      },
      req.user,
    );
  }

  @Patch('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  updateByAdmin(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewByAdminDto,
  ) {
    return this.reviewsService.updateByAdmin(id, dto, req.user);
  }

  @Get('tour/:tourId')
  findByTour(
    @Param('tourId', ParseUUIDPipe) tourId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.reviewsService.findByTour(tourId, Number(page), Number(limit));
  }
}
