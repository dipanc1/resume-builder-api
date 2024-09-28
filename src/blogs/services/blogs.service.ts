import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { blogAdminEmails, convertToSlug, MODELS } from 'src/constants';

import { Blog } from '../models/blog.interface';
import { from, map, Observable, switchMap } from 'rxjs';
import { AuthService } from 'src/auth/services/auth.service';
import { BlogBody } from '../models/blog-body.class';
import { User } from 'src/auth/models/user.interface';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(MODELS.BLOG) private blogModel: Model<Blog>,
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private authService: AuthService
  ) {}

  getBlogs(): Observable<Blog[]> {
    return from(
      this.blogModel.find().populate('author', 'firstName lastName')
    ).pipe(
      map(blogs => {
        return blogs as Blog[];
      })
    );
  }

  getBlog(slug: string): Observable<Blog | BadRequestException> {
    return from(
      this.blogModel.findOne({ slug }).populate('author', 'firstName lastName')
    ).pipe(
      map(blog => {
        if (blog) {
          return blog as Blog;
        } else {
          throw new BadRequestException('Blog not found');
        }
      })
    );
  }

  createBlog(
    blog: BlogBody,
    token: string
  ): Observable<Blog | BadRequestException> {
    const { title, content, image, tags } = blog;
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(async email => {
        if (blogAdminEmails.includes(email)) {
          const user = await this.userModel.findOne({ email });

          if (!user) {
            throw new BadRequestException('User not found');
          }

          const blogExists = await this.blogModel.findOne({
            slug: convertToSlug(title)
          });

          if (blogExists) {
            throw new BadRequestException('Blog already exists');
          }

          if (user && !blogExists) {
            const newBlog = new this.blogModel({
              title,
              content,
              image,
              tags,
              slug: convertToSlug(title),
              author: user._id
            });
            try {
              const blog = (await newBlog.save()).populate(
                'author',
                'firstName lastName'
              );
              return blog;
            } catch (err) {
              throw new BadRequestException(err.message);
            }
          } else {
            throw new BadRequestException(
              'You are not authorized to create a blog'
            );
          }
        }
      })
    );
  }

  updateBlog(
    slug: string,
    blog: BlogBody,
    token: string
  ): Observable<Blog | BadRequestException> {
    const { title, content, image, tags } = blog;
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(async email => {
        if (blogAdminEmails.includes(email)) {
          const user = await this.userModel.findOne({ email });
          if (user) {
            const blogExists = await this.blogModel.findOne({ slug });
            if (blogExists) {
              try {
                const updatedBlog = await this.blogModel
                  .findOneAndUpdate(
                    { slug },
                    {
                      title,
                      content,
                      image,
                      tags,
                      slug: convertToSlug(title),
                      updatedAt: new Date()
                    },
                    { new: true }
                  )
                  .populate('author', 'firstName lastName');
                return updatedBlog;
              } catch (err) {
                throw new BadRequestException(err.message);
              }
            } else {
              throw new BadRequestException('Blog not found');
            }
          }
        }
      })
    );
  }

  deleteBlog(
    slug: string,
    token: string
  ): Observable<string | BadRequestException> {
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(async email => {
        if (blogAdminEmails.includes(email)) {
          const user = await this.userModel.findOne({ email });
          if (user) {
            const blog = await this.blogModel.findOneAndDelete({ slug });
            if (blog) {
              return 'Blog deleted successfully';
            } else {
              throw new BadRequestException('Blog not found');
            }
          } else {
            throw new BadRequestException(
              'You are not authorized to delete a blog'
            );
          }
        }
      })
    );
  }
}
