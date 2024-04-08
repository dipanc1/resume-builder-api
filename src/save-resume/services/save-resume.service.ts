import { BadRequestException, Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { SaveResume } from '../models/save-resume.interface';
import { Template } from '../models/template.interface';

import { MODELS } from 'src/constants';

import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';
import { User } from 'src/auth/models/user.interface';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const kebabCase = require('lodash.kebabcase');

@Injectable()
export class SaveResumeService {
  constructor(
    @InjectModel(MODELS.RESUME) private saveResumeModel: Model<SaveResume>,
    @InjectModel(MODELS.TEMPLATE) private templateModel: Model<Template>,
    @InjectModel(MODELS.USER) private userModel: Model<User>
  ) {}

  async saveResume(saveResume: SaveResumeBody) {
    const { userId, templateId, name } = saveResume;
    const user = await this.userModel.findOne({
      _id: userId
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const template = await this.templateModel.findOne({
      _id: templateId
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    const resume = await this.saveResumeModel.findOne({
      name,
      templateId,
      userId
    });

    if (resume) {
      throw new BadRequestException('Resume already exists');
    }

    return this.saveResumeModel.create(saveResume);
  }

  async saveTemplate(saveTemplate: TemplateBody) {
    const { imageUrl, price } = saveTemplate;
    const template = await this.templateModel.findOne({
      name: saveTemplate.name
    });

    if (template) {
      throw new BadRequestException('Template already exists');
    }

    const name = kebabCase(saveTemplate.name);

    const payload = {
      name,
      imageUrl,
      price,
      createdAt: new Date()
    };

    return this.templateModel.create(payload);
  }
}
