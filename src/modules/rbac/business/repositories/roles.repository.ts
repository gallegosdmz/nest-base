import { IRole } from "../entities/Role";

export interface RolesRepository {
  findAll(): Promise<IRole[]>;
  findOneByName(name: string): Promise<IRole | null>;
  findOneWithPermissions(roleId: string): Promise<IRole | null>;
  hasPermission(roleId: string, resourceSlug: string, action: string): Promise<boolean>;
}