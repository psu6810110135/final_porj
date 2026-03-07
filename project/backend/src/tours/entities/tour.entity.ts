import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TourCategory {
  SEA = 'Sea',
  MOUNTAIN = 'Mountain',
  CULTURAL = 'Cultural',
  NATURE = 'Nature',
  CITY = 'City',
  ADVENTURE = 'Adventure',
}

export enum TourRegion {
  NORTH = 'North',
  SOUTH = 'South',
  CENTRAL = 'Central',
  EAST = 'East',
  WEST = 'West',
  NORTHEAST = 'Northeast',
}

export enum TourDuration {
  ONE_DAY = '1 day',
  ONE_DAY_ONE_NIGHT = '1 day 1 night',
  TWO_DAYS_ONE_NIGHT = '2 days 1 night',
  TWO_DAYS_TWO_NIGHTS = '2 days 2 nights',
  THREE_DAYS_TWO_NIGHTS = '3 days 2 nights',
  THREE_DAYS_THREE_NIGHTS = '3 days 3 nights',
  FOUR_DAYS_THREE_NIGHTS = '4 days 3 nights',
  FOUR_DAYS_FOUR_NIGHTS = '4 days 4 nights',
  FIVE_DAYS_FOUR_NIGHTS = '5 days 4 nights',
  FIVE_DAYS_FIVE_NIGHTS = '5 days 5 nights',
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
    default: TourRegion.CENTRAL,
  })
  region: TourRegion;

  @Column({
    type: 'enum',
    enum: TourDuration,
    default: TourDuration.ONE_DAY,
  })
  duration: TourDuration;

  @Column({ type: 'int', default: 15 })
  max_group_size: number;

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

  @Column('text', { array: true, default: [] })
  preparation: string[];

  @Column('text', { nullable: true })
  itinerary: string;

  @Column({ type: 'jsonb', nullable: true })
  itinerary_data: { day?: number; time: string; detail: string }[];

  @Column('text', { nullable: true })
  included: string;

  @Column('text', { nullable: true })
  excluded: string;

  @Column('text', { nullable: true })
  conditions: string;

  @Column({
    type: 'enum',
    enum: TourCategory,
    default: TourCategory.NATURE,
  })
  category: TourCategory;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_recommended: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}