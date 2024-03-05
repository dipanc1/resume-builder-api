import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SendResumeModule } from "./send-resume/send-resume.module";
import { SendJobDescriptionModule } from "./send-job-description/send-job-description.module";

@Module({
    imports: [SendResumeModule, SendJobDescriptionModule],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
