import { IMeta } from "src/shared/interfaces/Meta";
import { IUser } from "../entities/User";

export interface UsersRepository {
  findAll(limit?: number, offset?: number): Promise<{ users: IUser[], meta: IMeta }>;
  findOne(id: string): Promise<IUser | null>;
  update(id: string, data: IUser): Promise<IUser>;
  verifyPhone(phone: string): Promise<void>;
  remove(id: string): Promise<{ message: string }>;
}