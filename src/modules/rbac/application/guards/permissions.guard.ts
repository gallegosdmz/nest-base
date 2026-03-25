import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesService } from "../../business/services/roles.service";
import { Observable } from "rxjs";
import { PERMISSIONS_KEY, RequiredPermission } from "../decorators/requiere-permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user?.roleId) {
      throw new ForbiddenException('No role assigned');
    }

    for (const permission of requiredPermissions) {
      const hasPermission = await this.rolesService.hasPermission(
        user.roleId,
        permission.resource,
        permission.action,
      );

      if (!hasPermission)
        throw new ForbiddenException(`Missing permission: ${permission.action} on ${permission.resource}`);
    }

    return true; 
  }
}