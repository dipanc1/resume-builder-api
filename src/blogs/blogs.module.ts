import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './controllers/blogs.controller';

import { BlogsService } from './services/blogs.service';
import { AuthService } from 'src/auth/services/auth.service';

import { BlogSchema } from './schemas/blog.schema';

import { MODELS } from 'src/constants';
import { JwtService } from '@nestjs/jwt';
import { UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MODELS.BLOG, schema: BlogSchema },
      { name: MODELS.USER, schema: UserSchema }
    ])
  ],
  controllers: [BlogsController],
  providers: [BlogsService, AuthService, JwtService]
})
export class BlogsModule {}
