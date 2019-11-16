import { Inject, CACHE_MANAGER } from "@nestjs/common";
import { Cache } from "cache-manager";

export class Cacheable {
    @Inject(CACHE_MANAGER) cache: Cache;
}
