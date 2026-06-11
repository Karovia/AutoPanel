import { Controller, Get } from "@nestjs/common";
import { ConnectionsService } from "./connections.service";

@Controller("connections")
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Get()
  list() {
    return this.connectionsService.list();
  }
}
