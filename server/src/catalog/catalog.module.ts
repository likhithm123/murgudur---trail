import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";

@Module({
  imports: [BullModule.registerQueue({ name: "catalog-sync" })],
  controllers: [CatalogController],
  providers: [CatalogService]
})
export class CatalogModule {}
