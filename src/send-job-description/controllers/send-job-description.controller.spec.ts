import { Test, TestingModule } from "@nestjs/testing";
import { SendJobDescriptionController } from "./send-job-description.controller";

describe("SendJobDescriptionController", () => {
    let controller: SendJobDescriptionController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SendJobDescriptionController]
        }).compile();

        controller = module.get<SendJobDescriptionController>(
            SendJobDescriptionController
        );
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});
