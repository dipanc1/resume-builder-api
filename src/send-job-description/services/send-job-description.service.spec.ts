import { Test, TestingModule } from '@nestjs/testing';
import { SendJobDescriptionService } from './send-job-description.service';

describe('SendJobDescriptionService', () => {
  let service: SendJobDescriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendJobDescriptionService]
    }).compile();

    service = module.get<SendJobDescriptionService>(SendJobDescriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
