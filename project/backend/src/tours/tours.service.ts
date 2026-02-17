import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';

@Injectable()
export class ToursService {
  constructor(
    @InjectRepository(Tour)
    private tourRepository: Repository<Tour>,
  ) {}

  create(createTourDto: CreateTourDto) {
    const tour = this.tourRepository.create(createTourDto);
    return this.tourRepository.save(tour);
  }

  findAll() {
    // FIX: Changed createdAt to created_at to match the Entity definition
    return this.tourRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const tour = await this.tourRepository.findOne({ where: { id } });
    if (!tour) throw new NotFoundException(`Tour #${id} not found`);
    return tour;
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    const tour = await this.findOne(id);
    Object.assign(tour, updateTourDto);
    return this.tourRepository.save(tour);
  }

  async remove(id: string) {
    const tour = await this.findOne(id);
    return this.tourRepository.remove(tour);
  }
}