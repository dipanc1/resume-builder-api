import { BadRequestException, Injectable } from '@nestjs/common';

import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { SaveResume } from '../models/save-resume.interface';
import { Template } from '../models/template.interface';

import { MODELS, checkNameRegex } from 'src/constants';

import { SaveResumeBody } from '../models/save-resume-body.class';
import { TemplateBody } from '../models/template-body.class';
import { User } from 'src/auth/models/user.interface';
import { AuthService } from 'src/auth/services/auth.service';

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

  async saveResume(saveResume: SaveResumeBody, token: string) {
    const email = await this.authService.decodeToken(token);

    const userDetails = await this.userModel.findOne({
      email
    });

    if (!userDetails) {
      throw new BadRequestException('User not found');
    }

    const userId = userDetails._id;

    const { templateId, name } = saveResume;

    if (!userId || !templateId || !name) {
      throw new BadRequestException('Invalid request');
    }

    if (!checkNameRegex(name)) {
      throw new BadRequestException('Invalid resume name');
    }

    if (!isValidObjectId(templateId)) {
      throw new BadRequestException('Invalid template id');
    }

    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user id');
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

    return this.saveResumeModel.create({
      name,
      templateId,
      userId,
      data: saveResume.data,
      rawData: saveResume.rawData,
      createdAt: new Date()
    });
  }

  async updateResume(
    resumeId: string,
    saveResume: SaveResumeBody,
    token: string
  ) {
    if (!isValidObjectId(resumeId)) {
      throw new BadRequestException('Invalid resume id');
    }

    const email = await this.authService.decodeToken(token);

    const userDetails = await this.userModel.findOne({
      email
    });

    if (!userDetails) {
      throw new BadRequestException('User not found');
    }

    const resume = await this.saveResumeModel.findOne({
      _id: resumeId,
      userId: userDetails._id
    });

    if (!resume) {
      throw new BadRequestException('Resume not found');
    }

    const { templateId, name } = saveResume;

    if (!templateId || !name) {
      throw new BadRequestException('Invalid request');
    }

    if (!checkNameRegex(name)) {
      throw new BadRequestException('Invalid resume name');
    }

    if (!isValidObjectId(templateId)) {
      throw new BadRequestException('Invalid template id');
    }

    const template = await this.templateModel.findOne({
      _id: templateId
    });

    if (!template) {
      throw new BadRequestException('Template not found');
    }

    const editedResume = await this.saveResumeModel.updateOne(
      {
        _id: resumeId
      },
      {
        name,
        templateId,
        data: saveResume.data,
        rawData: saveResume.rawData
      }
    );

    if (editedResume) {
      return await this.saveResumeModel.findOne({
        _id: resumeId
      });
    }

    throw new BadRequestException('Failed to update resume');
  }

  async deleteResume(resumeId: string, token: string) {
    if (!isValidObjectId(resumeId)) {
      throw new BadRequestException('Invalid resume id');
    }

    const email = await this.authService.decodeToken(token);

    const userDetails = await this.userModel.findOne({
      email
    });

    if (!userDetails) {
      throw new BadRequestException('User not found');
    }

    const resume = await this.saveResumeModel.findOne({
      _id: resumeId,
      userId: userDetails._id
    });

    if (!resume) {
      throw new BadRequestException('Resume not found');
    }

    const deleted = await this.saveResumeModel.deleteOne({
      _id: resumeId
    });

    if (deleted) {
      return {
        message: 'Resume deleted successfully'
      };
    }

    throw new BadRequestException('Failed to delete resume');
  }

  async getResume(resumeId: string, token: string) {
    if (!isValidObjectId(resumeId)) {
      throw new BadRequestException('Invalid resume id');
    }

    const email = await this.authService.decodeToken(token);

    const userDetails = await this.userModel.findOne({
      email
    });

    if (!userDetails) {
      throw new BadRequestException('User not found');
    }

    const resume = await this.saveResumeModel.findOne({
      _id: resumeId,
      userId: userDetails._id
    });

    if (!resume) {
      throw new BadRequestException('Resume not found');
    }

    return resume;
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
