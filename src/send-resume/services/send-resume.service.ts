import { Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { ResumeBody } from "../models/resume-body.class";

@Injectable()
export class SendResumeService {
    sendResume(resume: ResumeBody): Observable<any> {
        if (!resume.resume) return of("Please provide a resume.");

        return of(`Resume sent successfully ${resume.resume}`);
    }
}
