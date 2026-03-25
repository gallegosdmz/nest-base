import { Role } from 'src/modules/rbac/external-system/entities/role.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column('varchar', { length: 20, unique: true, nullable: true })
  phone?: string;

  @Column('varchar', { length: 254, select: false })
  password: string;

  @Column('varchar', { length: 100 })
  firstName: string;

  @Column('varchar', { length: 150 })
  lastName: string;

  @Column('varchar', { length: 254 })
  email: string;

  @Column({ default: false })
  isVerified?: boolean;

  @Column({ default: false })
  isPhoneVerified?: boolean;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column('uuid', { nullable: true })
  roleId?: string;
}