import { Test, TestingModule } from "@nestjs/testing";
import { SendResumeService } from "./send-resume.service";

describe("SendResumeService", () => {
    let service: SendResumeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SendResumeService]
        }).compile();

        service = module.get<SendResumeService>(SendResumeService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
