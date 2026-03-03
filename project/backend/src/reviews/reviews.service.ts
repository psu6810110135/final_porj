import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Tour } from '../tours/entities/tour.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
	constructor(
		@InjectRepository(Review)
		private readonly reviewRepository: Repository<Review>,
		@InjectRepository(Booking)
		private readonly bookingRepository: Repository<Booking>,
		private readonly dataSource: DataSource,
	) {}

	async create(userId: string, createReviewDto: CreateReviewDto) {
		const { bookingId, rating, comment } = createReviewDto;

		const booking = await this.bookingRepository.findOne({
			where: { id: bookingId, userId },
		});

		if (!booking) {
			throw new NotFoundException('Booking not found or does not belong to you');
		}

		if (booking.status !== BookingStatus.CONFIRMED) {
			throw new BadRequestException('You can only review confirmed bookings');
		}

		const completedDateValue = booking.endDate || booking.travelDate || booking.startDate;
		if (!completedDateValue) {
			throw new BadRequestException('Booking does not contain a travel date');
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const completedDate = new Date(completedDateValue);
		completedDate.setHours(0, 0, 0, 0);

		if (completedDate > today) {
			throw new BadRequestException('Cannot review a tour that has not ended yet');
		}

		const existingReview = await this.reviewRepository.findOne({
			where: { bookingId },
		});
		if (existingReview) {
			throw new ConflictException('You have already reviewed this booking');
		}

		return this.dataSource.transaction(async (manager) => {
			const review = manager.create(Review, {
				bookingId: booking.id,
				tourId: booking.tourId,
				userId,
				rating,
				comment,
			});
			const savedReview = await manager.save(Review, review);

			const tour = await manager.findOne(Tour, {
				where: { id: booking.tourId },
				lock: { mode: 'pessimistic_write' },
			});

			if (tour) {
				const currentCount = Number(tour.review_count || 0);
				const currentTotal = Number(tour.rating || 0) * currentCount;
				const newCount = currentCount + 1;
				const newRating = (currentTotal + rating) / newCount;

				tour.review_count = newCount;
				tour.rating = Number(newRating.toFixed(1));
				await manager.save(Tour, tour);
			}

			return savedReview;
		});
	}

	async findByTour(tourId: string, page = 1, limit = 20) {
		const safePage = Number.isFinite(page) && page > 0 ? page : 1;
		const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;
		const skip = (safePage - 1) * safeLimit;

		const [data, total] = await this.reviewRepository.findAndCount({
			where: { tourId },
			relations: ['user'],
			select: {
				id: true,
				rating: true,
				comment: true,
				createdAt: true,
				user: {
					id: true,
					username: true,
					full_name: true,
					first_name: true,
					last_name: true,
				},
			},
			order: { createdAt: 'DESC' },
			skip,
			take: safeLimit,
		});

		return {
			data,
			total,
			page: safePage,
			limit: safeLimit,
			totalPages: Math.ceil(total / safeLimit),
		};
	}
}
