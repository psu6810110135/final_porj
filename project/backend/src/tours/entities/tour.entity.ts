import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 👇 ใส่ export ตรงนี้เพื่อให้ไฟล์ DTO มองเห็นครับ
export enum TourCategory {
  SEA = 'Sea',
  MOUNTAIN = 'Mountain',
  CULTURAL = 'Cultural',
  NATURE = 'Nature',
  CITY = 'City',
  ADVENTURE = 'Adventure'
}

// 👇 ใส่ export ตรงนี้ด้วย
export enum TourRegion {
  NORTH = 'North',
  SOUTH = 'South',
  CENTRAL = 'Central',
  EAST = 'East',
  WEST = 'West',
  NORTHEAST = 'Northeast'
}

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  child_price: number;

  @Column({ length: 50 })
  province: string;

  @Column({
    type: 'enum',
    enum: TourRegion,
    default: TourRegion.CENTRAL
  })
  region: TourRegion;

  @Column({ length: 50 })
  duration: string;

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ default: 0 })
  review_count: number;

  @Column({ nullable: true })
  image_cover: string;

  @Column('text', { array: true, default: [] })
  images: string[];

  @Column('text', { array: true, default: [] })
  highlights: string[]; 

  @Column('text', { nullable: true })
  itinerary: string;

  @Column('text', { nullable: true })
  included: string;

  @Column('text', { nullable: true })
  excluded: string;

  @Column('text', { nullable: true })
  conditions: string;

  @Column({
    type: 'enum',
    enum: TourCategory,
    default: TourCategory.NATURE
  })
  category: TourCategory;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}