import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private toursRepository: Repository<Tour>,
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
    } = filterDto;

    const query = this.toursRepository.createQueryBuilder('tour');

    // Default: Show only active tours
    query.where('tour.is_active = :isActive', { isActive: true });

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
    const tour = this.toursRepository.create({
      ...createTourDto,
      // If image_cover is provided, add it to the images array automatically
      images: createTourDto.image_cover ? [createTourDto.image_cover] : [],
      is_active: true,
    });
    return await this.toursRepository.save(tour);
  }

  // 4. Seed Data
  async seedTours() {
    // ... (Your existing seed logic is fine, you can keep it empty or copy previous seed logic here)
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
    return this.toursRepository.remove(tour);
  }
}