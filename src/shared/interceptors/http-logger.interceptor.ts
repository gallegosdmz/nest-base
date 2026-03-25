import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, originalUrl, ip } = request;
    const userAgent = request.get('user-agent') ?? '-';
    const userId = (request as any).user?.id ?? 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = ctx.getResponse<Response>();
          const duration = Date.now() - start;
          this.logger.log(
            `${method} ${originalUrl} ${response.statusCode} ${duration}ms - ${userId} - ${ip} - ${userAgent}`,
            'HTTP',
          );
        },
        error: (error) => {
          const duration = Date.now() - start;
          const status = error?.status ?? 500;
          this.logger.error(
            `${method} ${originalUrl} ${status} ${duration}ms - ${userId} - ${ip} - ${userAgent} - ${error.message}`,
            error.stack,
            'HTTP',
          );
        },
      }),
    );
  }
}
