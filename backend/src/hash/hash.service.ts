import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  async generate(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async verify(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
