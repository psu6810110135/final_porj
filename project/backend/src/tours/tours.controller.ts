import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Patch,
  Delete,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ToursService } from './tours.service';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';
import { Tour } from './entities/tour.entity';
import { StorageService } from '../common/storage/storage.service';

// Helper สำหรับแปลงชนิดข้อมูลที่ส่งมาจาก FormData
const parseFormData = (dto: any) => {
  if (!dto) return;

  // 1. แปลง Boolean แบบชัวร์ 100% (แก้ปัญหาเปลี่ยน Inactive ไม่ได้)
  if (dto.is_active !== undefined)
    dto.is_active = String(dto.is_active) === 'true';
  if (dto.is_recommended !== undefined)
    dto.is_recommended = String(dto.is_recommended) === 'true';

  // 2. แปลงตัวเลข
  if (dto.price) dto.price = Number(dto.price);
  if (dto.child_price) dto.child_price = Number(dto.child_price);
  if (dto.max_group_size) dto.max_group_size = Number(dto.max_group_size);
  if (dto.rating) dto.rating = Number(dto.rating);
  if (dto.review_count) dto.review_count = Number(dto.review_count);

  // 3. แปลง JSON / Text กลับเป็น Object/Array
  if (typeof dto.itinerary_data === 'string') {
    try {
      dto.itinerary_data = JSON.parse(dto.itinerary_data);
    } catch (e) {}
  }

  // 4. บังคับให้เป็น Array ในกรณีที่ผู้ใช้ส่งค่ามาแค่ 1 รายการ
  const arrayFields = [
    'highlights',
    'preparation',
    'included',
    'excluded',
    'conditions',
  ];
  arrayFields.forEach((field) => {
    if (dto[field] !== undefined && !Array.isArray(dto[field])) {
      dto[field] = [dto[field]];
    }
  });

  return dto;
};

// 👇 เปลี่ยนจาก 'api/tours' เป็น 'api/tours'
@Controller('api/tours')
export class ToursController {
  constructor(
    private readonly toursService: ToursService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  getTours(@Query() filterDto: GetToursFilterDto): Promise<Tour[]> {
    return this.toursService.getTours(filterDto);
  }

  @Get('recommended')
  getRecommendedTours(): Promise<Tour[]> {
    return this.toursService.getRecommendedTours();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(AnyFilesInterceptor({ 
    storage: memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // เพิ่มบรรทัดนี้เพื่อกำหนดขนาดไฟล์สูงสุด (เช่น 50MB)
  }))
  async createTour(
    @Body() createTourDto: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<Tour> {
    parseFormData(createTourDto);

    if (files && files.length > 0) {
      const cover = files.find((f) => f.fieldname === 'image_cover');
      const extras = files.filter((f) => f.fieldname === 'images');

      if (cover) {
        createTourDto.image_cover = await this.storageService.uploadPublicFile(
          cover,
          'tours',
        );
      }
      if (extras.length > 0) {
        createTourDto.images = await Promise.all(
          extras.map((file) =>
            this.storageService.uploadPublicFile(file, 'tours'),
          ),
        );
      }
    }

    // ลบตัวแปรขยะที่ส่งมาจาก Frontend เพื่อไม่ให้ DB Error
    delete createTourDto.existing_images;
    delete createTourDto.images_updated;

    return this.toursService.create(createTourDto);
  }

  @Post('seed')
  seedTours() {
    return this.toursService.seedTours();
  }

  @Get(':id')
  getTourById(@Param('id') id: string): Promise<Tour> {
    return this.toursService.getTourById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(AnyFilesInterceptor({ storage: memoryStorage() }))
  async update(
    @Param('id') id: string,
    @Body() updateTourDto: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    parseFormData(updateTourDto);

    let finalImages: string[] = [];

    // ดึงรูปภาพเก่าที่ไม่ได้ถูกลบออกมารวม
    if (updateTourDto.existing_images) {
      finalImages = Array.isArray(updateTourDto.existing_images)
        ? updateTourDto.existing_images
        : [updateTourDto.existing_images];
    }

    if (files && files.length > 0) {
      const cover = files.find((f) => f.fieldname === 'image_cover');
      const extras = files.filter((f) => f.fieldname === 'images');

      if (cover) {
        updateTourDto.image_cover = await this.storageService.uploadPublicFile(
          cover,
          'tours',
        );
      }

      if (extras.length > 0) {
        const uploadedImages = await Promise.all(
          extras.map((file) =>
            this.storageService.uploadPublicFile(file, 'tours'),
          ),
        );
        finalImages = [...finalImages, ...uploadedImages];
      }
    }

    // ถ้ามีการส่งอัปเดตรูปภาพมา ให้เซ็ต images ใหม่ทั้งหมดเลย
    if (String(updateTourDto.images_updated) === 'true') {
      updateTourDto.images = finalImages;
    }

    // 🚨 สำคัญมาก: ต้องลบฟิลด์นี้เสมอ ไม่งั้นจะอัปเดตไม่ติด
    delete updateTourDto.existing_images;
    delete updateTourDto.images_updated;

    return this.toursService.update(id, updateTourDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}
