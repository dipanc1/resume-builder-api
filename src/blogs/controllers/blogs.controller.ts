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
import { Roles } from 'src/auth/roles/roles.decorator';
import { Role } from 'src/helpers/role.enum';
import { RoleGuard } from 'src/auth/guards/role.guard';

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

  @Roles(Role.ADMIN)
  @Get('get-all-blogs')
  @UseGuards(JwtGuard, RoleGuard)
  getAllBlogs(
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
    return this.blogsService.getAllBlogs(skip, limit);
  }

  @Get('get-blog/:slug')
  getBlog(@Param('slug') slug: string): Observable<Blog | BadRequestException> {
    return this.blogsService.getBlog(slug);
  }

  @Roles(Role.ADMIN)
  @Get('get-any-blog/:slug')
  @UseGuards(JwtGuard, RoleGuard)
  getAnyBlog(
    @Param('slug') slug: string
  ): Observable<Blog | BadRequestException> {
    return this.blogsService.getAnyBlog(slug);
  }

  @Roles(Role.ADMIN)
  @Get('set-draft')
  @UseGuards(JwtGuard, RoleGuard)
  setDraft(
    @Query('slug') slug: string,
    @Query('draft') draft: boolean
  ): Observable<Blog | BadRequestException> {
    return this.blogsService.setBlogsDraftStatus(slug, draft);
  }

  @Roles(Role.ADMIN)
  @Post()
  @UseGuards(JwtGuard, RoleGuard)
  createBlog(
    @Headers('authorization') token: string,
    @Body() blog: BlogBody
  ): Observable<Blog | BadRequestException> {
    return this.blogsService.createBlog(blog, token);
  }

  @Roles(Role.ADMIN)
  @Post('upload-image')
  @UseGuards(JwtGuard, RoleGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadImage(
    @UploadedFile() image: Express.Multer.File,
    @Headers('authorization') token: string
  ): Observable<string | BadRequestException> {
    return this.blogsService.uploadImage(image, token);
  }

  @Roles(Role.ADMIN)
  @Delete('delete-image/:imageId')
  @UseGuards(JwtGuard, RoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteImage(
    @Headers('authorization') token: string,
    @Param('imageId') imageId: string
  ): Observable<string | BadRequestException> {
    return this.blogsService.deleteImage(token, imageId);
  }

  @Roles(Role.ADMIN)
  @Put(':slug')
  @UseGuards(JwtGuard, RoleGuard)
  updateBlog(
    @Param('slug') slug: string,
    @Body() blog: BlogBody,
    @Headers('authorization') token: string
  ): Observable<Blog | BadRequestException> {
    return this.blogsService.updateBlog(slug, blog, token);
  }

  @Roles(Role.ADMIN)
  @Delete(':slug')
  @UseGuards(JwtGuard, RoleGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBlog(
    @Headers('authorization') token: string,
    @Param('slug') slug: string
  ): Observable<string | BadRequestException> {
    return this.blogsService.deleteBlog(slug, token);
  }
}
