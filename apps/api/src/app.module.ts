import { Module } from "@nestjs/common";
import { AssetsService } from "./modules/assets/assets.service";
import { ConnectionsController } from "./modules/connections/connections.controller";
import { ConnectionsService } from "./modules/connections/connections.service";
import { DatabaseService } from "./modules/database/database.service";
import { PluginsController } from "./modules/plugins/plugins.controller";
import { PluginsService } from "./modules/plugins/plugins.service";
import { ProjectsController } from "./modules/projects/projects.controller";
import { ProjectsService } from "./modules/projects/projects.service";
import { RunsController } from "./modules/runs/runs.controller";
import { RunsService } from "./modules/runs/runs.service";

@Module({
  controllers: [
    ProjectsController,
    PluginsController,
    ConnectionsController,
    RunsController,
  ],
  providers: [
    AssetsService,
    ConnectionsService,
    DatabaseService,
    PluginsService,
    ProjectsService,
    RunsService,
  ],
})
export class AppModule {}
