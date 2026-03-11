import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourSchedule } from './entities/tour-schedule.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { Tour } from './entities/tour.entity';
import { CreateTourScheduleDto } from './dto/create-tour-schedule.dto';
import { UpdateTourScheduleDto } from './dto/update-tour-schedule.dto';

@Injectable()
export class TourSchedulesService {
  constructor(
    @InjectRepository(TourSchedule)
    private readonly scheduleRepository: Repository<TourSchedule>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
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

  async findAll(tourId: string): Promise<any[]> {
    const schedules = await this.scheduleRepository.find({
      where: { tour_id: tourId },
      order: { available_date: 'ASC' },
    });

    const tour = await this.tourRepository.findOne({ where: { id: tourId } });
    const defaultCapacity = tour?.max_group_size || 30;

    // Calculate booked_seats and available_seats for each schedule
    const schedulesWithAvailability = await Promise.all(
      schedules.map(async (schedule) => {
        const maxCapacity = schedule.max_capacity_override ?? defaultCapacity;

        const now = new Date();

        // Count booked seats for this schedule
        const result = await this.bookingRepository
          .createQueryBuilder('booking')
          .select('COALESCE(SUM(booking.pax), 0)', 'total')
          .where('booking.tourScheduleId = :scheduleId', {
            scheduleId: schedule.id,
          })
          .andWhere('booking.status NOT IN (:...statuses)', {
            statuses: [BookingStatus.CANCELLED, BookingStatus.EXPIRED],
          })
          .andWhere(
            '(booking.status != :pendingStatus OR booking.paymentDeadline > :now)',
            {
              pendingStatus: BookingStatus.PENDING_PAY,
              now: now,
            },
          )
          .getRawOne<{ total: string }>();

        const bookedSeats = Number(result?.total || 0);
        const availableSeats = maxCapacity - bookedSeats;

        return {
          ...schedule,
          booked_seats: bookedSeats,
          available_seats: availableSeats,
        };
      }),
    );

    return schedulesWithAvailability;
  }

  async findOne(id: string): Promise<TourSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Tour schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async findTravelers(tourId: string, scheduleId: string) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId, tour_id: tourId },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Tour schedule with ID ${scheduleId} not found`,
      );
    }

    const now = new Date();
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .where('booking.tourScheduleId = :scheduleId', { scheduleId })
      .andWhere('booking.status NOT IN (:...statuses)', {
        statuses: [BookingStatus.CANCELLED, BookingStatus.EXPIRED],
      })
      .andWhere(
        '(booking.status != :pendingStatus OR booking.paymentDeadline > :now)',
        {
          pendingStatus: BookingStatus.PENDING_PAY,
          now,
        },
      )
      .orderBy('booking.createdAt', 'ASC')
      .getMany();

    return {
      schedule: {
        id: schedule.id,
        available_date: schedule.available_date,
        is_available: schedule.is_available,
      },
      totalBookings: bookings.length,
      totalTravelers: bookings.reduce((sum, booking) => sum + booking.pax, 0),
      travelers: bookings.map((booking) => ({
        id: booking.id,
        bookingReference: booking.bookingReference,
        pax: booking.pax,
        status: booking.status,
        createdAt: booking.createdAt,
        paymentDeadline: booking.paymentDeadline ?? null,
        contactInfo: booking.contactInfo,
        user: booking.user
          ? {
              id: booking.user.id,
              username: booking.user.username,
              email: booking.user.email,
              full_name: booking.user.full_name,
              phone: booking.user.phone,
            }
          : null,
      })),
    };
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
