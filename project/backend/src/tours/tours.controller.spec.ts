import { Test, TestingModule } from '@nestjs/testing';
import { ToursController } from './tours.controller';
import { ToursService } from './tours.service';
import { StorageService } from '../common/storage/storage.service';

describe('ToursController', () => {
  let controller: ToursController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToursController],
      providers: [
        {
          provide: ToursService,
          useValue: {
            getTours: jest.fn(),
            getRecommendedTours: jest.fn(),
            create: jest.fn(),
            seedTours: jest.fn(),
            getTourById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadPublicFile: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ToursController>(ToursController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
