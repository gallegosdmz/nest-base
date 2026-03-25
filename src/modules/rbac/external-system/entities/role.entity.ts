import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { User } from "src/modules/users/external-system/entities/user.entity";

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, unique: true })
  name: string;

  @Column('varchar', { length: 255 })
  description: string;

  @OneToMany(() => Permission, (permission) => permission.role, { eager: true })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}