import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { Observable, from, map, switchMap } from 'rxjs';

import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { SaveResume } from '../models/save-resume.interface';
import { Template } from '../models/template.interface';

import { ResponseDto } from 'src/helpers/common/response.dto';
import { User } from 'src/auth/models/user.interface';

import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';

import { AuthService } from 'src/auth/services/auth.service';

import { MODELS, checkNameRegex } from 'src/constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const kebabCase = require('lodash.kebabcase');

@Injectable()
export class SaveResumeService {
  constructor(
    @InjectModel(MODELS.RESUME) private saveResumeModel: Model<SaveResume>,
    @InjectModel(MODELS.TEMPLATE) private templateModel: Model<Template>,
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private authService: AuthService
  ) {}

  saveResume(
    saveResume: SaveResumeBody,
    token: string
  ): Observable<SaveResume | BadRequestException> {
    if (!isValidObjectId(saveResume.templateId)) {
      throw new BadRequestException('Invalid template id');
    }

    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            if (!checkNameRegex(saveResume.name)) {
              throw new BadRequestException('Invalid resume name');
            }

            return from(
              this.templateModel.findOne({ _id: saveResume.templateId })
            ).pipe(
              switchMap(template => {
                if (!template) {
                  throw new BadRequestException('Template not found');
                }

                return from(
                  this.saveResumeModel.create({
                    name: saveResume.name,
                    data: saveResume.data,
                    rawData: saveResume.rawData,
                    templateId: saveResume.templateId,
                    resumeUrl: saveResume.resumeUrl ?? '',
                    userId: user._id
                  })
                ).pipe(
                  map(resume => {
                    if (!resume) {
                      throw new BadRequestException('Failed to save resume');
                    }

                    return resume as SaveResume;
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  updateResume(
    resumeId: string,
    saveResume: SaveResumeBody,
    token: string
  ): Observable<SaveResume | BadRequestException> {
    if (!isValidObjectId(resumeId) || !isValidObjectId(saveResume.templateId)) {
      throw new BadRequestException(
        `Invalid ${!isValidObjectId(resumeId) ? 'resume' : 'template'} id`
      );
    }

    if (!checkNameRegex(saveResume.name)) {
      throw new BadRequestException('Invalid resume name');
    }

    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.saveResumeModel
                .findOneAndUpdate(
                  {
                    _id: resumeId,
                    userId: user._id
                  },
                  {
                    name: saveResume.name,
                    data: saveResume.data,
                    rawData: saveResume.rawData,
                    templateId: saveResume.templateId,
                    updatedAt: new Date()
                  },
                  { new: true }
                )
                .populate('templateId', '-users')
                .populate('userId')
            ).pipe(
              map(resume => {
                if (!resume) {
                  throw new BadRequestException(
                    'Failed to update resume, resume not found'
                  );
                }

                return resume as SaveResume;
              })
            );
          })
        );
      })
    );
  }

  deleteResume(
    resumeId: string,
    token: string
  ): Observable<ResponseDto | BadRequestException> {
    if (!isValidObjectId(resumeId)) {
      throw new BadRequestException('Invalid resume id');
    }

    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.saveResumeModel.deleteOne({
                _id: resumeId,
                userId: user._id
              })
            ).pipe(
              map(resume => {
                if (!resume) {
                  throw new BadRequestException('Failed to delete resume');
                }

                return new ResponseDto(
                  HttpStatus.OK,
                  'Resume deleted successfully',
                  null
                );
              })
            );
          })
        );
      })
    );
  }

  getResume(
    resumeId: string,
    token: string
  ): Observable<SaveResume | BadRequestException> {
    if (!isValidObjectId(resumeId)) {
      throw new BadRequestException('Invalid resume id');
    }

    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.saveResumeModel
                .findOne({
                  _id: resumeId,
                  userId: user._id
                })
                .populate('templateId')
                .populate('userId')
            ).pipe(
              map(resume => {
                if (!resume) {
                  throw new BadRequestException('Resume not found');
                }

                return resume as SaveResume;
              })
            );
          })
        );
      })
    );
  }

  getAllResumes(token: string): Observable<SaveResume[] | BadRequestException> {
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.saveResumeModel
                .find({
                  userId: user._id
                })
                .populate('templateId')
                .populate('userId')
                .sort({ updatedAt: -1 })
            ).pipe(
              map(resumes => {
                if (!resumes) {
                  throw new BadRequestException('No resumes found');
                }

                return resumes as SaveResume[];
              })
            );
          })
        );
      })
    );
  }

  saveTemplate(
    saveTemplate: TemplateBody
  ): Observable<Template | BadRequestException> {
    const { imageUrl, price, name } = saveTemplate;
    return from(this.templateModel.findOne({ slug: kebabCase(name) })).pipe(
      switchMap(template => {
        if (template) {
          throw new BadRequestException('Template already exists');
        }

        return from(
          this.templateModel.create({
            imageUrl,
            price,
            name,
            slug: kebabCase(name)
          })
        ).pipe(
          map(template => {
            if (!template) {
              throw new BadRequestException('Failed to save template');
            }

            return template as Template;
          })
        );
      })
    );
  }

  getTemplates(): Observable<Template[] | BadRequestException> {
    return from(this.templateModel.find()).pipe(
      map(templates => {
        if (!templates) {
          throw new BadRequestException('No templates found');
        }

        return templates as Template[];
      })
    );
  }

  getTemplate(token: string): Observable<Template[] | BadRequestException> {
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.templateModel.find({
                users: { $in: [user._id] }
              })
            ).pipe(
              map(templates => {
                if (!templates) {
                  throw new BadRequestException('No templates found');
                }

                return templates as Template[];
              })
            );
          })
        );
      })
    );
  }

  purchaseTemplate(
    templateId: string,
    token: string
  ): Observable<Template | BadRequestException> {
    if (!isValidObjectId(templateId)) {
      throw new BadRequestException('Invalid template id');
    }

    return from(this.authService.decodeToken(token)).pipe(
      switchMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          switchMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return from(
              this.templateModel.findOneAndUpdate(
                {
                  _id: templateId
                },
                {
                  $addToSet: { users: user._id }
                },
                { new: true }
              )
            ).pipe(
              map(template => {
                if (!template) {
                  throw new BadRequestException('Failed to purchase template');
                }

                return template as Template;
              })
            );
          })
        );
      })
    );
  }
}
