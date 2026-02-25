import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourSchedule } from './entities/tour-schedule.entity';
import { CreateTourScheduleDto } from './dto/create-tour-schedule.dto';
import { UpdateTourScheduleDto } from './dto/update-tour-schedule.dto';

@Injectable()
export class TourSchedulesService {
  constructor(
    @InjectRepository(TourSchedule)
    private readonly scheduleRepository: Repository<TourSchedule>,
  ) {}

  async create(
    tourId: string,
    createDto: CreateTourScheduleDto,
  ): Promise<TourSchedule> {
    const schedule = this.scheduleRepository.create({
      tour_id: tourId,
      ...createDto,
    });
    return this.scheduleRepository.save(schedule);
  }

  async findAll(tourId: string): Promise<TourSchedule[]> {
    return this.scheduleRepository.find({
      where: { tour_id: tourId },
      order: { available_date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TourSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Tour schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async update(
    id: string,
    updateDto: UpdateTourScheduleDto,
  ): Promise<TourSchedule> {
    const schedule = await this.findOne(id);
    Object.assign(schedule, updateDto);
    return this.scheduleRepository.save(schedule);
  }

  async remove(id: string): Promise<void> {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
  }

  async findAvailableByTour(tourId: string): Promise<TourSchedule[]> {
    return this.scheduleRepository.find({
      where: { tour_id: tourId, is_available: true },
      order: { available_date: 'ASC' },
    });
  }

  async findByDate(tourId: string, date: Date): Promise<TourSchedule | null> {
    return this.scheduleRepository.findOne({
      where: { tour_id: tourId, available_date: date },
    });
  }
}
