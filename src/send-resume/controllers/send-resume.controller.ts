import { Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import { SendResumeService } from "../services/send-resume.service";
import { SendResumeTypes } from "../models/send-resume.type";
import { Observable } from "rxjs";
import { ResumeBody } from "../models/resume-body.class";

@Controller("send-resume")
export class SendResumeController {
  constructor(private readonly sendResumeService: SendResumeService) {}

  @Post(":type")
  @HttpCode(200)
  sendResume(
    @Body() resume: ResumeBody,
    @Param("type") type: SendResumeTypes
  ): Observable<any> {
    return this.sendResumeService.sendResume(resume, type);
  }
}
