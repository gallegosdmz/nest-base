import { JwtPayload } from "src/shared/interfaces/Jwt-payload.interface";
import { IAuth } from "../entities/Auth";
import { IUser } from "../entities/User";

export interface AuthRepository {
  create(data: IUser): Promise<IAuth>;
  login(email: string, password: string): Promise<IAuth>;
  checkAuthStatus(user: IUser): Promise<IAuth>;
  getJwtToken(payload: JwtPayload): string;
}