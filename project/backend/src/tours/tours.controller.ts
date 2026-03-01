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
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { ToursService } from './tours.service';
import { GetToursFilterDto } from './dto/get-tours-filter.dto';
import { Tour } from './entities/tour.entity';

// 💡 ตรวจสอบและสร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to configure file storage
const storageConfig = diskStorage({
  destination: uploadDir,
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

// Helper สำหรับแปลงชนิดข้อมูลที่ส่งมาจาก FormData
const parseFormData = (dto: any) => {
  if (!dto) return;

  // 1. แปลง Boolean แบบชัวร์ 100% (แก้ปัญหาเปลี่ยน Inactive ไม่ได้)
  if (dto.is_active !== undefined) dto.is_active = String(dto.is_active) === 'true';
  if (dto.is_recommended !== undefined) dto.is_recommended = String(dto.is_recommended) === 'true';

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
  const arrayFields = ['highlights', 'preparation', 'included', 'excluded', 'conditions'];
  arrayFields.forEach(field => {
    if (dto[field] !== undefined && !Array.isArray(dto[field])) {
      dto[field] = [dto[field]];
    }
  });

  return dto;
};

@Controller('api/v1/tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  getTours(@Query() filterDto: GetToursFilterDto): Promise<Tour[]> {
    return this.toursService.getTours(filterDto);
  }

  @Get('recommended')
  getRecommendedTours(): Promise<Tour[]> {
    return this.toursService.getRecommendedTours();
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor({ storage: storageConfig }))
  createTour(
    @Body() createTourDto: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Tour> {
    parseFormData(createTourDto);

    if (files && files.length > 0) {
      const cover = files.find(f => f.fieldname === 'image_cover');
      const extras = files.filter(f => f.fieldname === 'images');
      
      if (cover) createTourDto.image_cover = `uploads/${cover.filename}`;
      if (extras.length > 0) createTourDto.images = extras.map(f => `uploads/${f.filename}`);
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
  @UseInterceptors(AnyFilesInterceptor({ storage: storageConfig }))
  update(
    @Param('id') id: string, 
    @Body() updateTourDto: any,
    @UploadedFiles() files: Array<any>
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
      const cover = files.find(f => f.fieldname === 'image_cover');
      const extras = files.filter(f => f.fieldname === 'images');
      
      if (cover) updateTourDto.image_cover = `uploads/${cover.filename}`;
      
      if (extras.length > 0) {
        finalImages = [...finalImages, ...extras.map(f => `uploads/${f.filename}`)];
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
  remove(@Param('id') id: string) {
    return this.toursService.remove(id);
  }
}