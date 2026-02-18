import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

export interface AuditOptions {
  action: string;
  entity: string;
  entityId?: string;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async (result) => {
        // Only log if there's a user authenticated
        if (user) {
          await this.auditService.log({
            action: request.method,
            entity: request.route?.path || 'unknown',
            entityId: result?.id,
            userId: user.id,
            userEmail: user.email,
            newValue: result,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          });
        }
      }),
    );
  }
}
