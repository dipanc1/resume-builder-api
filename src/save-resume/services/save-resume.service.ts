import { BadRequestException, Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { SaveResume } from '../models/save-resume.interface';
import { Template } from '../models/template.interface';

import { MODELS } from 'src/constants';

import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';
import { User } from 'src/auth/models/user.interface';

@Injectable()
export class SaveResumeService {
  constructor(
    @InjectModel(MODELS.RESUME) private saveResumeModel: Model<SaveResume>,
    @InjectModel(MODELS.TEMPLATE) private templateModel: Model<Template>,
    @InjectModel(MODELS.USER) private userModel: Model<User>
  ) {}

  async saveResume(saveResume: SaveResumeBody) {
    const user = await this.userModel.findOne({
      _id: saveResume.userId
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const template = await this.templateModel.findOne({
      _id: saveResume.templateId
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    const resume = await this.saveResumeModel.findOne({
      name: saveResume.name,
      templateId: saveResume.templateId,
      userId: saveResume.userId
    });

    if (resume) {
      throw new BadRequestException('Resume already exists');
    }

    return this.saveResumeModel.create(saveResume);
  }

  async saveTemplate(saveTemplate: TemplateBody) {
    const user = await this.userModel.findOne({
      _id: saveTemplate.user
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const template = await this.templateModel.findOne({
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
