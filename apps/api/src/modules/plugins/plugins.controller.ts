import { Controller, Get } from "@nestjs/common";
import { PluginsService } from "./plugins.service";

@Controller("plugins")
export class PluginsController {
  constructor(private readonly pluginsService: PluginsService) {}

  @Get()
  list() {
    return this.pluginsService.list();
  }
}
