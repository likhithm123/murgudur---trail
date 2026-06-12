import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { MeiliSearch } from "meilisearch";

@Injectable()
export class CatalogService {
  private readonly meili = new MeiliSearch({
    host: process.env.MEILI_HOST ?? "http://localhost:7700",
    apiKey: process.env.MEILI_MASTER_KEY
  });

  constructor(@InjectQueue("catalog-sync") private readonly queue: Queue) {}

  async search(query: string, limit: number) {
    const result = await this.meili.index("products").search(query, { limit });
    return { hits: result.hits, processingTimeMs: result.processingTimeMs };
  }

  async enqueueSync(productId: string) {
    return this.queue.add("sync-product", { productId }, { attempts: 5, backoff: { type: "exponential", delay: 5000 } });
  }
}
