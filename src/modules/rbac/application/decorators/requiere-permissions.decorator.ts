import { SetMetadata } from "@nestjs/common";
import { Action } from "../../business/entities/Action";

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  resource: string;
  action: Action;
}

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);