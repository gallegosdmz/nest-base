import { Action } from "./Action";

export interface IPermission {
  id?: string;
  action: Action;
  resourceId?: string;
  roleId?: string;
}