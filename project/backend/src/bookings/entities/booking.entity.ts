import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tour } from '../../tours/entities/tour.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column()
  pax: number;

  @Column({
    type: 'varchar',
    default: 'pending_pay',
  })
  status: string; // confirmed, pending_pay, pending_verify, cancelled

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Tour, (tour) => tour.id)
  tour: Tour;
}