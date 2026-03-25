import { IPermission } from "./Permission";

export interface IRole {
  id?: string;
  name: string;
  description: string;
  permissions?: IPermission[];
}