import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  getHello() {
    return { message: 'Elyron API v1' };
  }
}
