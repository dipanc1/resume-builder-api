import { Test, TestingModule } from '@nestjs/testing';
import { SaveResumeController } from './save-resume.controller';

describe('SaveResumeController', () => {
  let controller: SaveResumeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaveResumeController]
    }).compile();

    controller = module.get<SaveResumeController>(SaveResumeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
