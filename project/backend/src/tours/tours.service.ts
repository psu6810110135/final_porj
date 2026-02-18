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

  // 1. ฟังก์ชันดึงข้อมูล + Filter
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

    // Default: เอาเฉพาะที่ Active
    query.where('tour.is_active = :isActive', { isActive: true });

    if (search) {
      query.andWhere(
        '(LOWER(tour.title) LIKE LOWER(:search) OR LOWER(tour.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (province) {
      query.andWhere('tour.province = :province', { province });
    }

    if (region) {
      query.andWhere('tour.region = :region', { region });
    }

    if (category) {
      query.andWhere('tour.category = :category', { category });
    }

    if (duration) {
      query.andWhere('tour.duration = :duration', { duration });
    }

    if (minPrice) {
      query.andWhere('tour.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      query.andWhere('tour.price <= :maxPrice', { maxPrice });
    }

    if (sort) {
      query.orderBy('tour.price', sort);
    } else {
      query.orderBy('tour.created_at', 'DESC');
    }

    return await query.getMany();
  }

  // 2. ฟังก์ชันดึงรายตัว (Detail)
  async getTourById(id: string): Promise<Tour> {
    const found = await this.toursRepository.findOne({ where: { id } });
    if (!found) {
      throw new NotFoundException(`Tour with ID "${id}" not found`);
    }
    return found;
  }

  // 3. ฟังก์ชัน Seed ข้อมูล
  async seedTours() {
    const mockTours = [
      {
        title: 'เกาะสมุย',
        description: 'สวรรค์กลางอ่าวไทย ชมหินตาหินยาย พักผ่อนบนหาดทรายขาว',
        price: 1200,
        province: 'Surat Thani',
        region: 'South',
        category: 'Sea',
        duration: '1 Day',
        rating: 4.8,
        image_cover:
          'https://images.unsplash.com/photo-1535262412227-85541e910204?q=80&w=2069&auto=format&fit=crop',
      },
      {
        title: 'ดอยอินทนนท์',
        description: 'สัมผัสอากาศหนาวบนยอดเขาสูงสุดแดนสยาม',
        price: 1590,
        province: 'Chiang Mai',
        region: 'North',
        category: 'Mountain',
        duration: '1 Day',
        rating: 4.9,
        image_cover:
          'https://images.unsplash.com/photo-1599553767526-78c66e74f266?q=80&w=2070&auto=format&fit=crop',
      },
      {
        title: 'เกาะพีพี',
        description: 'ดำน้ำดูปะการัง เยือนอ่าวมาหยา น้ำใสราวกับกระจก',
        price: 1800,
        province: 'Krabi',
        region: 'South',
        category: 'Sea',
        duration: '1 Day',
        rating: 4.8,
        image_cover:
          'https://images.unsplash.com/photo-1599824683050-672580cc4281?q=80&w=1974&auto=format&fit=crop',
      },
      {
        title: 'วัดไชยวัฒนาราม',
        description: 'ย้อนรอยประวัติศาสตร์ ชมความงามกรุงเก่า',
        price: 890,
        province: 'Ayutthaya',
        region: 'Central',
        category: 'Cultural',
        duration: '1 Day',
        rating: 4.7,
        image_cover:
          'https://images.unsplash.com/photo-1563294376-79c2944b1c28?q=80&w=2070&auto=format&fit=crop',
      },
      {
        title: 'เขื่อนเชี่ยวหลาน',
        description: 'กุ้ยหลินเมืองไทย นอนแพสัมผัสธรรมชาติ',
        price: 2500,
        province: 'Surat Thani',
        region: 'South',
        category: 'Nature',
        duration: '2 Days 1 Night',
        rating: 4.8,
        image_cover:
          'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?q=80&w=2070&auto=format&fit=crop',
      },
      {
        title: 'เกาะล้าน',
        description: 'น้ำใส หาดทรายขาว เดินทางง่ายใกล้กรุงเทพฯ',
        price: 690,
        province: 'Chonburi',
        region: 'East',
        category: 'Sea',
        duration: '1 Day',
        rating: 4.5,
        image_cover:
          'https://images.unsplash.com/photo-1590089415225-401eb6b986b8?q=80&w=2070&auto=format&fit=crop',
      },
    ];

    const savedTours: Tour[] = [];

    for (const item of mockTours) {
      const exists = await this.toursRepository.findOne({
        where: { title: item.title },
      });
      if (!exists) {
        const tour = this.toursRepository.create({
          ...item,
          images: [item.image_cover],
          highlights: ['รถรับส่งฟรี', 'อาหารกลางวัน', 'ประกันอุบัติเหตุ'],
          is_active: true,
        } as any);

        // 👇👇 จุดที่แก้: ใช้ as Tour เพื่อบังคับบอก TypeScript ว่านี่คือตัวเดียวนะ ไม่ใช่ Array
        const saved = await this.toursRepository.save(tour);

        // ใส่ as any กันเหนียวให้ครับ จะได้ไม่แดงแน่นอน
        savedTours.push(saved as any);
      }
    }
    return { message: 'Seeding Complete', added: savedTours.length };
  }

  create(createTourDto: CreateTourDto) {
    const tour = this.toursRepository.create(createTourDto);
    return this.toursRepository.save(tour);
  }

  findAll() {
    // FIX: Changed createdAt to created_at to match the Entity definition
    return this.toursRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string) {
    const tour = await this.toursRepository.findOne({ where: { id } });
    if (!tour) throw new NotFoundException(`Tour #${id} not found`);
    return tour;
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    const tour = await this.findOne(id);
    Object.assign(tour, updateTourDto);
    return this.toursRepository.save(tour);
  }

  async remove(id: string) {
    const tour = await this.findOne(id);
    return this.toursRepository.remove(tour);
  }
}
