import config from 'config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
    get<T>(key: string): T {
        return config.get(key);
    }
}
