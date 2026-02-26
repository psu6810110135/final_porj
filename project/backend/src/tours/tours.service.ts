import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { TourSchedule } from './entities/tour-schedule.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
    @InjectRepository(TourSchedule)
    private schedulesRepository: Repository<TourSchedule>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  // 1. Get Tours with Filter
  async getTours(filterDto: GetToursFilterDto): Promise<Tour[]> {
    const {
      search,
      province,
      region,
      category,
      minPrice,
      maxPrice,
      sort,
      duration,
      show_all, // 👈 Destructure this
    } = filterDto;

    const query = this.toursRepository.createQueryBuilder('tour');

    // 👇 UPDATED LOGIC:
    // Only filter for active tours if show_all is NOT 'true'
    if (show_all !== 'true') {
      query.where('tour.is_active = :isActive', { isActive: true });
    }

    if (search) {
      query.andWhere(
        '(LOWER(tour.title) LIKE LOWER(:search) OR LOWER(tour.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }
    if (province) query.andWhere('tour.province = :province', { province });
    if (region) query.andWhere('tour.region = :region', { region });
    if (category) query.andWhere('tour.category = :category', { category });
    if (duration) query.andWhere('tour.duration = :duration', { duration });
    if (minPrice) query.andWhere('tour.price >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('tour.price <= :maxPrice', { maxPrice });

    if (sort) {
      query.orderBy('tour.price', sort);
    } else {
      query.orderBy('tour.created_at', 'DESC');
    }

    return await query.getMany();
  }

  // 2. Get Single Tour
  async getTourById(id: string): Promise<Tour> {
    const found = await this.toursRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Tour with ID "${id}" not found`);
    }
    return found;
  }

  // 3. Create Tour (Used by Admin)
  async create(createTourDto: CreateTourDto): Promise<Tour> {
    const { schedules, ...tourData } = createTourDto;

    const tour = this.toursRepository.create({
      ...tourData,
      images: createTourDto.image_cover ? [createTourDto.image_cover] : [],
      is_active: true,
    });
    const savedTour = await this.toursRepository.save(tour);

    //
    if (schedules && schedules.length > 0) {
      const scheduleEntities = schedules.map((s) => ({
        tour_id: savedTour.id,
        available_date: new Date(s.date),
        max_capacity_override: s.capacity ?? undefined,
        is_available: true,
      }));
      await this.schedulesRepository.insert(scheduleEntities);
    }

    return savedTour;
  }

  // 4. Seed Data
  async seedTours() {
    return { message: 'Seed functionality available' };
  }

  // 5. Update & Remove
  async update(id: string, updateTourDto: UpdateTourDto) {
    const tour = await this.getTourById(id);
    Object.assign(tour, updateTourDto);
    return this.toursRepository.save(tour);
  }

  async remove(id: string) {
    const tour = await this.getTourById(id);

    const bookingCount = await this.bookingsRepository.count({
      where: { tourId: id },
    });
    if (bookingCount > 0) {
      throw new BadRequestException(
        'Cannot delete this tour because it has related bookings. Please cancel or remove bookings first.',
      );
    }

    try {
      await this.schedulesRepository.delete({ tour_id: id });
      await this.toursRepository.remove(tour);
      return { message: 'Tour deleted successfully' };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Cannot delete this tour because it has related bookings. Please cancel or remove bookings first.',
        );
      }
      throw error;
    }
  }
}
