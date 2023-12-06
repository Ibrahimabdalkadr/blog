import { Test, TestingModule } from "@nestjs/testing";
import { BlogService } from "./BlogService.service";

describe("ServicesService", () => {
    let service: BlogService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BlogService],
        }).compile();

        service = module.get<BlogService>(BlogService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
