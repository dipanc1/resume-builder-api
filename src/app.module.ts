import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SendResumeModule } from "./send-resume/send-resume.module";

@Module({
    imports: [SendResumeModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
