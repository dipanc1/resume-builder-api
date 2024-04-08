import { Module } from '@nestjs/common';
import { SaveResumeController } from './controllers/save-resume.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MODELS } from 'src/constants';
import { SaveResumeSchema } from './schema/save-resume.schema';
import { TemplateSchema } from './schema/template.schema';
import { SaveResumeService } from './services/save-resume.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MODELS.RESUME, schema: SaveResumeSchema },
      { name: MODELS.TEMPLATE, schema: TemplateSchema }
    ])
  ],
  controllers: [SaveResumeController],
  providers: [SaveResumeService]
})
export class SaveResumeModule {}
