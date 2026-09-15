import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<
  T,
  PaginatedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<PaginatedResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response && response.data && response.total !== undefined) {
          return {
            data: response.data,
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: Math.ceil(response.total / response.limit),
          };
        }
        return response;
      }),
    );
  }
}
