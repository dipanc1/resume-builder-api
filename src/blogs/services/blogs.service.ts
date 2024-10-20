import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { catchError, from, map, mergeMap, Observable, switchMap } from 'rxjs';

import { Model } from 'mongoose';

import { convertToSlug, MODELS } from 'src/constants';

import { Blog } from '../models/blog.interface';
import { User } from 'src/auth/models/user.interface';

import { BlogBody } from '../models/blog-body.class';

import { AuthService } from 'src/auth/services/auth.service';

import * as FormData from 'form-data';

import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

type validImageMimeType = 'image/jpeg' | 'image/png';

const validImageMimeTypes: validImageMimeType[] = ['image/jpeg', 'image/png'];

const IMAGE_UPLOAD_ACCOUNT_ID = process.env.CLOUDFLARE_IMAGE_UPLOAD_ACCOUNT_ID;

const IMAGE_UPLOAD_URL = `https://api.cloudflare.com/client/v4/accounts/${IMAGE_UPLOAD_ACCOUNT_ID}/images/v1`;
const IMAGE_TOKEN = process.env.CLOUDFLARE_IMAGE_TOKEN;

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(MODELS.BLOG) private blogModel: Model<Blog>,
    @InjectModel(MODELS.USER) private userModel: Model<User>,
    private authService: AuthService,
    private readonly httpService: HttpService
  ) {}

  getBlogs(
    skip: number,
    limit: number
  ): Observable<{
    blogs: Blog[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    return from(
      this.blogModel
        .find({ draft: false })
        .populate('author', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
    ).pipe(
      switchMap(blogs => {
        return from(this.blogModel.countDocuments({ draft: false })).pipe(
          map(totalCount => {
            return {
              blogs: blogs as Blog[],
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
              currentPage: skip + 1
            };
          })
        );
      })
    );
  }

  getAllBlogs(
    skip: number,
    limit: number
  ): Observable<{
    blogs: Blog[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    return from(
      this.blogModel
        .find()
        .populate('author', 'firstName lastName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
    ).pipe(
      switchMap(blogs => {
        return from(this.blogModel.countDocuments()).pipe(
          map(totalCount => {
            return {
              blogs: blogs as Blog[],
              totalCount,
              totalPages: Math.ceil(totalCount / limit),
              currentPage: skip + 1
            };
          })
        );
      })
    );
  }

  getBlog(slug: string): Observable<Blog | BadRequestException> {
    return from(
      this.blogModel
        .findOne({ slug, draft: false })
        .populate('author', 'firstName lastName')
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

  getAnyBlog(slug: string): Observable<Blog | BadRequestException> {
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

  setBlogsDraftStatus(slug: string, draft: boolean): Observable<Blog> {
    if (slug) {
      return from(
        this.blogModel.findOneAndUpdate({ slug }, { draft }, { new: true })
      ).pipe(
        map(blog => {
          if (blog) {
            return blog as Blog;
          } else {
            throw new BadRequestException('Blog not found');
          }
        })
      );
    } else {
      return from(this.blogModel.updateMany({}, { draft })).pipe(
        map(() => {
          return null;
        })
      );
    }
  }

  createBlog(
    blog: BlogBody,
    token: string
  ): Observable<Blog | BadRequestException> {
    const { title, content, image, description, imageIds, draft } = blog;
    return from(this.authService.decodeToken(token)).pipe(
      mergeMap(async email => {
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
            description,
            draft,
            slug: convertToSlug(title),
            author: user._id,
            imageIds
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
      })
    );
  }

  uploadImage(
    image: Express.Multer.File,
    token: string
  ): Observable<string | BadRequestException> {
    return from(this.authService.decodeToken(token)).pipe(
      mergeMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          mergeMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            if (
              !validImageMimeTypes.includes(
                image.mimetype as validImageMimeType
              )
            ) {
              throw new BadRequestException(
                'File type not allowed. Please upload a JPEG or PNG image.' +
                  image.mimetype
              );
            }

            const formData = new FormData();
            formData.append('file', image.buffer, image.originalname);
            formData.append(
              'metadata',
              JSON.stringify({ thumbnail: 'yes it is' })
            );
            formData.append('requireSignedURLs', 'false');

            return this.httpService
              .post(IMAGE_UPLOAD_URL, formData, {
                headers: {
                  Authorization: `Bearer ${IMAGE_TOKEN}`
                }
              })
              .pipe(
                map((response: AxiosResponse) =>
                  response.data.result.variants[0].includes('public')
                    ? response.data.result.variants[0]
                    : response.data.result.variants[1]
                ),
                catchError(err => {
                  throw new BadRequestException(
                    'Image upload failed: ' + err.message
                  );
                })
              );
          })
        );
      }),
      catchError(err => {
        throw new BadRequestException(err.message);
      })
    );
  }

  deleteImage(
    token: string,
    imageId: string
  ): Observable<string | BadRequestException> {
    return from(this.authService.decodeToken(token)).pipe(
      mergeMap(email => {
        return from(this.userModel.findOne({ email })).pipe(
          mergeMap(user => {
            if (!user) {
              throw new BadRequestException('User not found');
            }

            return this.httpService
              .delete(`${IMAGE_UPLOAD_URL}/${imageId}`, {
                headers: {
                  Authorization: `Bearer ${IMAGE_TOKEN}`
                }
              })
              .pipe(
                map(() => 'Image deleted successfully'),
                catchError(err => {
                  throw new BadRequestException(
                    'Image delete failed: ' + err.message
                  );
                })
              );
          })
        );
      }),
      catchError(err => {
        throw new BadRequestException(err.message);
      })
    );
  }

  updateBlog(
    slug: string,
    blog: BlogBody,
    token: string
  ): Observable<Blog | BadRequestException> {
    const { title, content, image, description, imageIds, draft } = blog;
    return from(this.authService.decodeToken(token)).pipe(
      switchMap(async email => {
        const user = await this.userModel.findOne({ email });
        if (user) {
          const blogExists = await this.blogModel.findOne({ slug });
          if (blogExists) {
            try {
              // Retrieve existing imageIds from the blog
              const existingImageIds = blogExists?.imageIds;

              if (existingImageIds.length) {
                // Find imageIds to delete
                const imageIdsToDelete = existingImageIds.filter(
                  id => !imageIds.includes(id)
                );

                // Delete imageIds that are not in the new imageIds array from Cloudflare
                await Promise.all(
                  imageIdsToDelete.map(imageId =>
                    this.httpService.delete(`${IMAGE_UPLOAD_URL}/${imageId}`, {
                      headers: {
                        Authorization: `Bearer ${IMAGE_TOKEN}`
                      }
                    })
                  )
                );
              }
              const updatedBlog = await this.blogModel
                .findOneAndUpdate(
                  { slug },
                  {
                    title,
                    content,
                    image,
                    description,
                    draft,
                    imageIds,
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
          }
        } else {
          throw new BadRequestException(
            'You are not authorized to update a blog'
          );
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
      })
    );
  }
}
