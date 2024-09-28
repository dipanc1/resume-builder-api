import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';
import { BlogsService } from '../services/blogs.service';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { BlogBody } from '../models/blog-body.class';
import { Observable } from 'rxjs';
import { Blog } from '../models/blog.interface';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Get()
  getBlogs(): Observable<Blog[]> {
    return this.blogsService.getBlogs();
  }

  @Get(':slug')
  getBlog(@Param('slug') slug: string): Observable<Blog | BadRequestException> {
    return this.blogsService.getBlog(slug);
  }

  @Post()
  @UseGuards(JwtGuard)
  createBlog(
    @Headers('authorization') token: string,
    @Body() blog: BlogBody
  ): Observable<Blog | BadRequestException> {
    return this.blogsService.createBlog(blog, token);
  }

  @Put(':slug')
  @UseGuards(JwtGuard)
  updateBlog(
    @Param('slug') slug: string,
    @Body() blog: BlogBody,
    @Headers('authorization') token: string
  ): Observable<Blog | BadRequestException> {
    return this.blogsService.updateBlog(slug, blog, token);
  }

  @Delete(':slug')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(
    @Headers('authorization') token: string,
    @Param('slug') slug: string
  ): Observable<string | BadRequestException> {
    return this.blogsService.deleteBlog(slug, token);
  }
}
