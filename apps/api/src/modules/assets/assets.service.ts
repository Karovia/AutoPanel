import { Injectable } from "@nestjs/common";

@Injectable()
export class AssetsService {
  normalizeSnapshot<T>(snapshot: T): T {
    return snapshot;
  }
}
