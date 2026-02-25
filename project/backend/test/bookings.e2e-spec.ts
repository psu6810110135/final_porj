import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../src/bookings/entities/booking.entity';
import { User, UserRole } from '../src/users/entities/user.entity';
import {
  Tour,
  TourCategory,
  TourRegion,
} from '../src/tours/entities/tour.entity';
import { DataSource, Repository } from 'typeorm';
import { BookingStatus } from '../src/bookings/entities/booking.entity';
import { BookingsService } from '../src/bookings/bookings.service';
import { generateTestToken } from './helpers/auth.helper';

describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;
  let tourRepository: Repository<Tour>;
  let bookingsService: BookingsService;

  const mockUserId = '11111111-1111-4111-a111-111111111111';
  const mockTourId = '22222222-2222-4222-a222-222222222222';
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TypeOrmModule.forFeature([Booking, User, Tour])],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    dataSource = moduleFixture.get<DataSource>(DataSource);
    bookingRepository =
      moduleFixture.get<Repository<Booking>>('BookingRepository');
    userRepository = moduleFixture.get<Repository<User>>('UserRepository');
    tourRepository = moduleFixture.get<Repository<Tour>>('TourRepository');
    bookingsService = moduleFixture.get<BookingsService>(BookingsService);

    // Create test user and tour
    await userRepository.save({
      id: mockUserId,
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      full_name: 'Test User',
      role: UserRole.CUSTOMER,
    });

    await tourRepository.save({
      id: mockTourId,
      title: 'Test Tour',
      description: 'A test tour',
      price: 5000,
      child_price: 2500,
      province: 'Bangkok',
      region: TourRegion.CENTRAL,
      category: TourCategory.ADVENTURE,
      duration: '1 วัน',
      max_group_size: 10,
      is_active: true,
      images: [],
      highlights: [],
      preparation: [],
    });

    await tourRepository.save({
      id: '33333333-3333-4333-a333-333333333333',
      title: 'Another Test Tour',
      description: 'Another test tour',
      price: 3000,
      child_price: 1500,
      province: 'Chiang Mai',
      region: TourRegion.NORTH,
      category: TourCategory.NATURE,
      duration: '2 วัน 1 คืน',
      max_group_size: 20,
      is_active: true,
      images: [],
      highlights: [],
      preparation: [],
    });

    await app.init();

    // Generate JWT token for test user
    authToken = generateTestToken(mockUserId, 'testuser', 'customer');
  });

  afterEach(async () => {
    // Clean up all test data after each test
    if (bookingRepository) {
      await bookingRepository.query('DELETE FROM bookings');
    }
  });

  afterAll(async () => {
    // Clean up test user and tours
    if (userRepository) {
      await userRepository.query(
        `DELETE FROM users WHERE id = '${mockUserId}'`,
      );
    }
    if (tourRepository) {
      await tourRepository.query(
        `DELETE FROM tours WHERE id IN ('${mockTourId}', '33333333-3333-4333-a333-333333333333')`,
      );
    }
    await app.close();
  });

  describe('POST /api/v1/bookings/calculate', () => {
    it('should calculate booking price successfully', () => {
      const calculateDto = {
        tourId: mockTourId,
        travelDate: '2025-01-15',
        pax: 2,
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings/calculate')
        .send(calculateDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('basePrice');
          expect(res.body).toHaveProperty('discount');
          expect(res.body).toHaveProperty('totalPrice');
          expect(res.body).toHaveProperty('breakdown');
          expect(res.body.basePrice).toBeGreaterThan(0);
          expect(res.body.totalPrice).toBeLessThanOrEqual(res.body.basePrice);
          expect(res.body.breakdown.pricePerPerson).toBeGreaterThan(0);
          expect(
            res.body.breakdown.pax || res.body.breakdown.numberOfTravelers,
          ).toBe(2);
        });
    });

    it('should apply weekend discount for Saturday bookings', () => {
      const calculateDto = {
        tourId: mockTourId,
        travelDate: '2025-01-18', // Saturday
        pax: 2,
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings/calculate')
        .send(calculateDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.discount).toBeGreaterThan(0);
          expect(res.body.breakdown.discountPercentage).toBe(5);
          expect(res.body.discount).toBe(500); // 5% of 10000
        });
    });

    it('should apply weekend discount for Sunday bookings', () => {
      const calculateDto = {
        tourId: mockTourId,
        travelDate: '2025-01-19', // Sunday
        pax: 3,
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings/calculate')
        .send(calculateDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.discount).toBeGreaterThan(0);
          expect(res.body.breakdown.discountPercentage).toBe(5);
          expect(res.body.discount).toBe(750); // 5% of 15000
        });
    });

    it('should fail validation with invalid date format', () => {
      const calculateDto = {
        tourId: mockTourId,
        travelDate: 'invalid-date',
        pax: 2,
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings/calculate')
        .send(calculateDto)
        .expect(400);
    });

    it('should fail validation with numberOfTravelers less than 1', () => {
      const calculateDto = {
        tourId: mockTourId,
        travelDate: '2025-01-15',
        pax: 0,
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings/calculate')
        .send(calculateDto)
        .expect(400);
    });

    it('should fail validation with missing required fields', () => {
      const calculateDto = {
        tourId: mockTourId,
        travelDate: '2025-01-15',
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings/calculate')
        .send(calculateDto)
        .expect(400);
    });

    it('should expire pending_pay bookings past paymentDeadline', async () => {
      const pastDeadline = new Date(Date.now() - 60 * 60 * 1000);
      const startDate = '2025-02-01';
      const endDate = '2025-02-03';

      const booking = await bookingRepository.save({
        bookingReference: 'BK-EXPIRE',
        tourId: mockTourId,
        userId: mockUserId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfTravelers: 1,
        pax: 1,
        basePrice: 1000,
        discount: 0,
        totalPrice: 1000,
        contactInfo: {
          name: 'Expire User',
          email: 'expire@example.com',
          phone: '+1111111111',
        },
        status: BookingStatus.PENDING_PAY,
        paymentDeadline: pastDeadline,
      });

      await bookingsService.expireOldBookings();

      const refreshed = await bookingRepository.findOne({
        where: { id: booking.id },
      });

      expect(refreshed?.status).toBe(BookingStatus.EXPIRED);
    });
  });

  describe('POST /api/v1/bookings', () => {
    const validBookingDto = {
      tourId: mockTourId,
      startDate: '2025-01-15',
      endDate: '2025-01-20',
      numberOfTravelers: 2,
      pax: 2,
      contactInfo: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
      },
      specialRequests: 'Vegetarian meals required',
    };

    it('should create a new booking successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validBookingDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('bookingReference');
          expect(res.body).toHaveProperty('status', BookingStatus.PENDING_PAY);
          expect(res.body).toHaveProperty('tourId', mockTourId);
          expect(res.body).toHaveProperty('numberOfTravelers', 2);
          expect(res.body).toHaveProperty('totalPrice');
          expect(res.body).toHaveProperty('contactInfo');
          expect(res.body.contactInfo).toEqual(validBookingDto.contactInfo);
          expect(res.body.bookingReference).toMatch(/^BK-/);
        });
    });

    it('should create booking without special requests', () => {
      const bookingDtoWithoutSpecialRequests = {
        tourId: mockTourId,
        startDate: '2025-01-15',
        endDate: '2025-01-20',
        numberOfTravelers: 1,
        pax: 1,
        contactInfo: {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+0987654321',
        },
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingDtoWithoutSpecialRequests)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('bookingReference');
          expect(res.body.status).toBe(BookingStatus.PENDING_PAY);
        });
    });

    it('should reject second concurrent booking when capacity exceeded', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const startDate = futureDate.toISOString().split('T')[0];
      const endDate = new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const payload = {
        tourId: mockTourId,
        startDate,
        endDate,
        numberOfTravelers: 6,
        pax: 6,
        contactInfo: {
          name: 'Concurrent User',
          email: 'concurrent@example.com',
          phone: '+1234567890',
        },
      };

      const [resA, resB] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(payload),
        request(app.getHttpServer())
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${authToken}`)
          .send(payload),
      ]);

      const statuses = [resA.status, resB.status];
      expect(statuses).toContain(201);
      expect(statuses).toContain(400);
    });

    it('should fail validation with invalid email', () => {
      const invalidBookingDto = {
        ...validBookingDto,
        contactInfo: {
          name: 'John Doe',
          email: 'invalid-email',
          phone: '+1234567890',
        },
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBookingDto)
        .expect(400);
    });

    it('should fail validation with missing contact info', () => {
      const { contactInfo, ...bookingWithoutContactInfo } = validBookingDto;

      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingWithoutContactInfo)
        .expect(400);
    });

    it('should fail validation with invalid date format', () => {
      const invalidBookingDto = {
        ...validBookingDto,
        startDate: 'not-a-date',
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBookingDto)
        .expect(400);
    });

    it('should fail validation with numberOfTravelers less than 1', () => {
      const invalidBookingDto = {
        ...validBookingDto,
        numberOfTravelers: 0,
      };

      return request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidBookingDto)
        .expect(400);
    });
  });

  describe('GET /api/v1/bookings/my-bookings', () => {
    it('should return empty array when user has no bookings', () => {
      return request(app.getHttpServer())
        .get('/api/v1/bookings/my-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(0);
        });
    });

    it('should return all bookings for a user', async () => {
      // Create multiple bookings
      const bookingDto1 = {
        tourId: mockTourId,
        startDate: '2025-02-01',
        endDate: '2025-02-05',
        numberOfTravelers: 2,
        pax: 2,
        contactInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      };

      const bookingDto2 = {
        tourId: '33333333-3333-4333-a333-333333333333',
        startDate: '2025-03-01',
        endDate: '2025-03-03',
        numberOfTravelers: 1,
        pax: 1,
        contactInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
        },
      };

      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingDto1)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingDto2)
        .expect(201);

      return request(app.getHttpServer())
        .get('/api/v1/bookings/my-bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('bookingReference');
          expect(res.body[0]).toHaveProperty('status');
        });
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should return a booking by id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tourId: mockTourId,
          startDate: '2025-02-01',
          endDate: '2025-02-05',
          numberOfTravelers: 2,
          pax: 2,
          contactInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        });

      const bookingId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', bookingId);
          expect(res.body).toHaveProperty('bookingReference');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('tourId');
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('startDate');
          expect(res.body).toHaveProperty('endDate');
          expect(res.body).toHaveProperty('numberOfTravelers');
          expect(res.body).toHaveProperty('basePrice');
          expect(res.body).toHaveProperty('discount');
          expect(res.body).toHaveProperty('totalPrice');
          expect(res.body).toHaveProperty('contactInfo');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });

    it('should return 404 for non-existent booking', () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      return request(app.getHttpServer())
        .get(`/api/v1/bookings/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 404);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 400 for invalid UUID format', () => {
      return request(app.getHttpServer())
        .get('/api/v1/bookings/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/bookings/:id/cancel', () => {
    it('should cancel a booking with 100% refund (7+ days before start)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const startDate = futureDate.toISOString().split('T')[0];
      const endDate = new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tourId: mockTourId,
          startDate,
          endDate,
          numberOfTravelers: 2,
          pax: 2,
          contactInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        });

      const bookingId = createResponse.body.id;
      const cancelDto = {
        reason: 'Changed travel plans',
      };

      return request(app.getHttpServer())
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', bookingId);
          expect(res.body).toHaveProperty('status', BookingStatus.CANCELLED);
          expect(res.body).toHaveProperty('refundPercentage', 100);
          expect(res.body).toHaveProperty('refundAmount');
          expect(res.body.refundAmount).toBeGreaterThan(0);
          expect(res.body).toHaveProperty(
            'cancellationReason',
            cancelDto.reason,
          );
        });
    });

    it('should cancel a booking with 50% refund (3-6 days before start)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 4);
      const startDate = futureDate.toISOString().split('T')[0];
      const endDate = new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tourId: mockTourId,
          startDate,
          endDate,
          numberOfTravelers: 2,
          pax: 2,
          contactInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        });

      const bookingId = createResponse.body.id;
      const cancelDto = {
        reason: 'Need to cancel',
      };

      return request(app.getHttpServer())
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', BookingStatus.CANCELLED);
          expect(res.body).toHaveProperty('refundPercentage', 50);
          expect(res.body).toHaveProperty('refundAmount');
          expect(res.body.refundAmount).toBeGreaterThan(0);
        });
    });

    it('should cancel a booking with 0% refund (less than 3 days before start)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const startDate = futureDate.toISOString().split('T')[0];
      const endDate = new Date(futureDate.getTime() + 2 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tourId: mockTourId,
          startDate,
          endDate,
          numberOfTravelers: 2,
          pax: 2,
          contactInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        });

      const bookingId = createResponse.body.id;
      const cancelDto = {
        reason: 'Last minute cancellation',
      };

      return request(app.getHttpServer())
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', BookingStatus.CANCELLED);
          expect(res.body).toHaveProperty('refundPercentage', 0);
          expect(res.body).toHaveProperty('refundAmount', 0);
        });
    });

    it('should return 400 when trying to cancel already cancelled booking', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const startDate = futureDate.toISOString().split('T')[0];
      const endDate = new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tourId: mockTourId,
          startDate,
          endDate,
          numberOfTravelers: 2,
          pax: 2,
          contactInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        });

      const bookingId = createResponse.body.id;
      const cancelDto = {
        reason: 'First cancellation',
      };

      // First cancellation
      await request(app.getHttpServer())
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelDto)
        .expect(200);

      // Second cancellation attempt
      return request(app.getHttpServer())
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Second cancellation' })
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode', 400);
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 404 when cancelling non-existent booking', () => {
      const nonExistentId = '00000000-0000-4000-a000-000000000000';

      return request(app.getHttpServer())
        .patch(`/api/v1/bookings/${nonExistentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(404);
    });

    it('should fail validation with missing reason', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const startDate = futureDate.toISOString().split('T')[0];
      const endDate = new Date(futureDate.getTime() + 4 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tourId: mockTourId,
          startDate,
          endDate,
          numberOfTravelers: 2,
          pax: 2,
          contactInfo: {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+1234567890',
          },
        });

      const bookingId = createResponse.body.id;

      return request(app.getHttpServer())
        .patch(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });
});
