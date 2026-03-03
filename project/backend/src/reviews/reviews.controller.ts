import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	Request,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('api/v1/reviews')
export class ReviewsController {
	constructor(private readonly reviewsService: ReviewsService) {}

	@Post()
	@UseGuards(AuthGuard('jwt'))
	create(@Request() req: any, @Body() createReviewDto: CreateReviewDto) {
		return this.reviewsService.create(req.user?.id, createReviewDto);
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
