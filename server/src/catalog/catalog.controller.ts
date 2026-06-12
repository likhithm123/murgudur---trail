import { Body, Controller, Get, Post } from "@nestjs/common";
import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { CatalogService } from "./catalog.service";

class SearchDto {
  @IsString()
  query!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}

@Controller("catalog")
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get("health")
  health() {
    return { ok: true, service: "catalog" };
  }

  @Post("search")
  search(@Body() body: SearchDto) {
    return this.catalog.search(body.query, body.limit ?? 12);
  }
}
