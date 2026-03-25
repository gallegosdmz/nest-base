import { IRole } from "src/modules/rbac/business/entities/Role";

export interface IUser {
  id?: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  roleId?: string;
  role?: IRole;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;
}