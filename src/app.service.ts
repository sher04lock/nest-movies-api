import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  ping(): string {
    const now = Date.now().toString();
    return now;
  }
}
