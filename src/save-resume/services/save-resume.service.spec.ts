import { Test, TestingModule } from '@nestjs/testing';
import { SaveResumeService } from './save-resume.service';

describe('SaveResumeService', () => {
  let service: SaveResumeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaveResumeService]
    }).compile();

    service = module.get<SaveResumeService>(SaveResumeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
