import { Injectable } from "@nestjs/common";
import { Observable, of } from "rxjs";
import { JobDescriptionBody } from "../models/job-description-body.class";

@Injectable()
export class SendJobDescriptionService {
  sendJobDescription(jobDescription: JobDescriptionBody): Observable<string> {
    return of(jobDescription.jobDescription);
  }
}
