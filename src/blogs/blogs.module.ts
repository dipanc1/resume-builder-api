import { Module } from '@nestjs/common';

import { BlogsController } from './controllers/blogs.controller';
import { BlogsService } from './services/blogs.service';

@Module({
  imports: [],
  controllers: [BlogsController],
  providers: [BlogsService]
})
export class BlogsModule {}
