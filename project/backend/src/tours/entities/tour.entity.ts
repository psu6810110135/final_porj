import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TourRegion {
  NORTH = 'North',   // ภาคเหนือ
  SOUTH = 'South',   // ภาคใต้
  CENTRAL = 'Central', // ภาคกลาง
  EAST = 'East',     // ภาคตะวันออก
  WEST = 'West',     // ภาคตะวันตก
  NORTHEAST = 'Northeast' // ภาคอีสาน
}

@Entity('tours')
export class Tour {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  description: string; // คำอธิบายสั้นๆ หน้าการ์ด

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // ราคาผู้ใหญ่

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  child_price: number; // ราคาเด็ก (เผื่อไว้คำนวณหน้า Booking)

  @Column({ length: 50 })
  province: string;

  @Column({
    type: 'enum',
    enum: TourRegion,
    default: TourRegion.CENTRAL
  })
  region: TourRegion; // **เพิ่ม: สำหรับ Filter ภูมิภาค**

  @Column({ length: 50 })
  duration: string; // **เพิ่ม: เช่น "1 Day", "2 Days 1 Night"**

  @Column('decimal', { precision: 2, scale: 1, default: 0 })
  rating: number; // **เพิ่ม: เช่น 4.8**

  @Column({ default: 0 })
  review_count: number; // **เพิ่ม: จำนวนรีวิว (เช่น 120 รีวิว)**

  @Column({ nullable: true })
  image_cover: string; // รูปปก 1 รูป

  @Column('text', { array: true, default: [] })
  images: string[]; // **สำคัญ: รูป Gallery ทั้งหมด (เก็บเป็น Array URL)**

  // --- ส่วนรายละเอียดหน้า Detail (เก็บเป็น JSON หรือ Text ยาว) ---
  
  @Column('text', { array: true, default: [] })
  highlights: string[]; // **เพิ่ม: จุดเช็คอิน (เป็นข้อๆ)**

  @Column('text', { nullable: true })
  itinerary: string; // แผนการเดินทาง (HTML หรือ Text)

  @Column('text', { nullable: true })
  included: string; // สิ่งที่รวมในแพ็กเกจ

  @Column('text', { nullable: true })
  excluded: string; // สิ่งที่ไม่รวม

  @Column('text', { nullable: true })
  conditions: string; // ข้อควรรู้ / ความปลอดภัย

  @Column()
  category: string; // Adventure, Sea, etc.

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}