import { IUser } from "../entities/User";

export interface UsersValidator {
  validateEmailUniqueness(email: string, userId?: string): Promise<boolean>;
  validatePhoneUniqueness(phone: string, userId?: string): Promise<boolean>;
  validateOwnerToUserUpdate(toUpdateId: string, userEditor: IUser): Promise<boolean>;
}