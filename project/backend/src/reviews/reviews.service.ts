import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Tour } from '../tours/entities/tour.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewByAdminDto } from './dto/update-review-by-admin.dto';
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
      throw new NotFoundException(
        'Booking not found or does not belong to you',
      );
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('You can only review confirmed bookings');
    }

    const completedDateValue =
      booking.endDate || booking.travelDate || booking.startDate;
    if (!completedDateValue) {
      throw new BadRequestException('Booking does not contain a travel date');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedDate = new Date(completedDateValue);
    completedDate.setHours(0, 0, 0, 0);

    if (completedDate > today) {
      throw new BadRequestException(
        'Cannot review a tour that has not ended yet',
      );
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

      await this.refreshTourRating(manager, booking.tourId);

      return savedReview;
    });
  }

  async findByTour(tourId: string, page = 1, limit = 20) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 20;
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await this.reviewRepository.findAndCount({
      where: { tourId },
      relations: ['user'],
      select: {
        id: true,
        rating: true,
        comment: true,
        is_recommended: true,
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

  async findRecommended(limit = 6) {
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 12) : 6;

    return this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .leftJoin('review.tour', 'tour')
      .select([
        'review.id',
        'review.rating',
        'review.comment',
        'review.is_recommended',
        'review.createdAt',
        'user.id',
        'user.username',
        'user.full_name',
        'user.first_name',
        'user.last_name',
        'user.avatar_url',
        'tour.id',
        'tour.title',
      ])
      .where('review.is_recommended = :recommended', { recommended: true })
      .andWhere("COALESCE(TRIM(review.comment), '') <> ''")
      .orderBy('review.createdAt', 'DESC')
      .take(safeLimit)
      .getMany();
  }

  async findForAdmin(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      recommended?: boolean;
      rating?: number;
    },
    requestUser?: { role?: string },
  ) {
    if (requestUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can access review management');
    }

    const safePage =
      Number.isFinite(params.page) && (params.page as number) > 0
        ? Number(params.page)
        : 1;
    const safeLimit =
      Number.isFinite(params.limit) && (params.limit as number) > 0
        ? Math.min(Number(params.limit), 50)
        : 12;
    const skip = (safePage - 1) * safeLimit;

    const qb = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('review.user', 'user')
      .leftJoin('review.tour', 'tour')
      .leftJoin('review.booking', 'booking')
      .select([
        'review.id',
        'review.bookingId',
        'review.userId',
        'review.tourId',
        'review.rating',
        'review.comment',
        'review.is_recommended',
        'review.createdAt',
        'review.updatedAt',
        'user.id',
        'user.username',
        'user.full_name',
        'user.first_name',
        'user.last_name',
        'tour.id',
        'tour.title',
        'tour.province',
        'booking.id',
        'booking.bookingReference',
        'booking.travelDate',
        'booking.startDate',
        'booking.endDate',
      ])
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(safeLimit);

    if (params.search?.trim()) {
      const search = `%${params.search.trim().toLowerCase()}%`;
      qb.andWhere(
        `(
          LOWER(COALESCE(review.comment, '')) LIKE :search
          OR LOWER(COALESCE(tour.title, '')) LIKE :search
          OR LOWER(COALESCE(user.full_name, '')) LIKE :search
          OR LOWER(COALESCE(user.username, '')) LIKE :search
          OR LOWER(CONCAT(COALESCE(user.first_name, ''), ' ', COALESCE(user.last_name, ''))) LIKE :search
          OR LOWER(COALESCE(booking.bookingReference, '')) LIKE :search
        )`,
        { search },
      );
    }

    if (typeof params.recommended === 'boolean') {
      qb.andWhere('review.is_recommended = :recommended', {
        recommended: params.recommended,
      });
    }

    if (
      Number.isFinite(params.rating) &&
      Number(params.rating) >= 1 &&
      Number(params.rating) <= 5
    ) {
      qb.andWhere('review.rating = :rating', { rating: Number(params.rating) });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async updateByAdmin(
    id: string,
    dto: UpdateReviewByAdminDto,
    requestUser?: { role?: string },
  ) {
    if (requestUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can update reviews');
    }

    if (dto.is_recommended === undefined) {
      throw new BadRequestException(
        'Admin can only update recommended status',
      );
    }

    if (dto.rating !== undefined || dto.comment !== undefined) {
      throw new BadRequestException(
        'Admin cannot edit customer rating or comment',
      );
    }

    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    review.is_recommended = dto.is_recommended;
    return this.reviewRepository.save(review);
  }

  async removeByAdmin(id: string, requestUser?: { role?: string }) {
    if (requestUser?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can delete reviews');
    }

    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.remove(Review, review);
      await this.refreshTourRating(manager, review.tourId);
    });

    return { success: true, message: 'Review deleted successfully' };
  }

  private async refreshTourRating(manager: EntityManager, tourId: string) {
    const aggregate = await manager
      .getRepository(Review)
      .createQueryBuilder('review')
      .select('COUNT(review.id)', 'count')
      .addSelect('AVG(review.rating)', 'avg')
      .where('review.tourId = :tourId', { tourId })
      .getRawOne<{ count: string; avg: string | null }>();

    const tour = await manager.findOne(Tour, {
      where: { id: tourId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!tour) {
      return;
    }

    const reviewCount = Number(aggregate?.count || 0);
    const average = aggregate?.avg ? Number(aggregate.avg) : 0;

    tour.review_count = reviewCount;
    tour.rating = Number(average.toFixed(1));
    await manager.save(Tour, tour);
  }
}
