import { Injectable } from "@nestjs/common";
import {
  SendResumeType,
  SendResumeTypeArray,
  SendResumeTypes
} from "../models/send-resume.type";
import { Observable, of } from "rxjs";
import { ResumeBody } from "../models/resume-body.class";
import { GetTextFromPDF } from "../../utils/pdfExport";

@Injectable()
export class SendResumeService {
  sendResume(resume: ResumeBody, type: SendResumeTypes): Observable<any> {
    if (SendResumeTypeArray.includes(type)) {
      return of(`Resume has been sent as ${type}, ${resume.resume}`);
    }

    if (type === SendResumeType.PDF) {
      const pdfText = GetTextFromPDF(resume.resume);
      return of(`Resume has been sent as ${type}, ${pdfText}`);
    }

    return of("Invalid type of resume. Please provide a valid type.");
  }
}
