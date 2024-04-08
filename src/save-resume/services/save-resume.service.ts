import { BadRequestException, Injectable } from '@nestjs/common';
import { SaveResume } from '../models/save-resume.interface';
import { MODELS } from 'src/constants';
import { Template } from '../models/template.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';

@Injectable()
export class SaveResumeService {
  constructor(
    @InjectModel(MODELS.RESUME) private saveResumeModel: Model<SaveResume>,
    @InjectModel(MODELS.TEMPLATE) private templateModel: Model<Template>
  ) {}

  saveResume(saveResume: SaveResumeBody) {
    const template = this.templateModel.findOne({
      _id: saveResume.templateId
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    // const resume = this.saveResumeModel.findOne({
    //   name: saveResume.name,
    //   templateId: saveResume.templateId,
    //   userId: saveResume.userId
    // });

    // if (resume) {
    //   throw new BadRequestException('Resume already exists');
    // }

    return this.saveResumeModel.create(saveResume);
  }

  saveTemplate(saveTemplate: TemplateBody) {
    const template = this.templateModel.findOne({
      name: saveTemplate.name,
      users: saveTemplate.user
    });

    if (template) {
      throw new BadRequestException('Template already exists');
    }

    const payload = {
      name: saveTemplate.name,
      image: saveTemplate.image,
      createdAt: new Date(),
      users: [saveTemplate.user]
    };
    return this.templateModel.create(payload);
  }
}
