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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { BlogsService } from '../services/blogs.service';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { BlogBody } from '../models/blog-body.class';
import { Observable } from 'rxjs';
import { Blog } from '../models/blog.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('blogs')
export class BlogsController {
  constructor(private blogsService: BlogsService) {}

  @Get()
  getBlogs(
    @Query('pageNumber') pageNumber: string,
    @Query('pageSize') pageSize: string
  ): Observable<{
    blogs: Blog[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const skip = parseInt(pageNumber) > 0 ? parseInt(pageNumber) - 1 : 0;
    const limit = parseInt(pageSize) > 0 ? parseInt(pageSize) : 10;
    return this.blogsService.getBlogs(skip, limit);
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

  @Post('upload-image')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile() image: Express.Multer.File,
    @Headers('authorization') token: string
  ): Observable<string | BadRequestException> {
    return this.blogsService.uploadImage(image, token);
  }

  @Delete('delete-image/:imageId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(
    @Headers('authorization') token: string,
    @Param('imageId') imageId: string
  ): Observable<string | BadRequestException> {
    return this.blogsService.deleteImage(token, imageId);
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
