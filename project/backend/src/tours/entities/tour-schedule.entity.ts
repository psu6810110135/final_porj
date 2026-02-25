import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tour } from './tour.entity';

@Entity('tour_schedules')
@Index(['tour_id', 'available_date'], { unique: true })
@Index(['available_date'])
export class TourSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tour_id: string;

  @ManyToOne(() => Tour, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tour_id' })
  tour: Tour;

  @Column('date')
  available_date: Date;

  @Column('int', { nullable: true })
  max_capacity_override: number;

  @Column({ default: true })
  is_available: boolean;

  @CreateDateColumn()
  created_at: Date;
}
