import { Test, TestingModule } from '@nestjs/testing';
import { SendResumeController } from './send-resume.controller';

describe('SendResumeController', () => {
  let controller: SendResumeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SendResumeController]
    }).compile();

    controller = module.get<SendResumeController>(SendResumeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
