import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3';
import { BadRequestException, Logger } from '@nestjs/common';

import { Observable, from, map, switchMap } from 'rxjs';

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
require('dotenv').config();

import { v4 as uuidv4 } from 'uuid';

type validMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'text/plain'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

type validImageMimeType = 'image/jpeg' | 'image/png';

const validMimeTypes: validMimeType[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const validImageMimeTypes: validImageMimeType[] = ['image/jpeg', 'image/png'];

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;

const region = process.env.CLOUDFLARE_BUCKET_REGION;

const S3 = new S3Client({
  region,
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  }
});

export const saveResumeToR2Storage = (
  resume: Express.Multer.File
): Observable<string> => {
  const allowedMimeTypes: validMimeType[] = validMimeTypes;

  if (!allowedMimeTypes.includes(resume.mimetype as validMimeType)) {
    throw new BadRequestException(
      'File type not allowed. Please upload a PDF, DOC, DOCX, or TXT file.'
    );
  }

  const fileName = uuidv4() + '_' + resume.originalname;

  const uploadParams = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: resume.buffer,
    ContentType: resume.mimetype
  };

  return from(S3.send(new PutObjectCommand(uploadParams))).pipe(
    map(
      () => {
        fs.writeFileSync(`./uploads/${fileName}`, resume.buffer);
        return fileName;
      },
      (error: string) => {
        Logger.log('Error uploading file to R2 storage: ', error);
        throw new BadRequestException('An error happened!');
      }
    )
  );
};

export const saveImageToR2Storage = (
  image: Express.Multer.File
): Observable<string | BadRequestException> => {
  const allowedMimeTypes: validImageMimeType[] = validImageMimeTypes;

  if (!allowedMimeTypes.includes(image.mimetype as validImageMimeType)) {
    throw new BadRequestException(
      'File type not allowed. Please upload a JPEG or PNG file.'
    );
  }

  const fileName = uuidv4() + '_' + image.originalname;

  const uploadParams = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: image.buffer,
    ContentType: image.mimetype
  };

  return from(S3.send(new PutObjectCommand(uploadParams))).pipe(
    map(
      () => {
        return fileName;
      },
      (error: string) => {
        Logger.log('Error uploading file to R2 storage: ', error);
        throw new BadRequestException('An error happened!');
      }
    )
  );
};

export const getResumeFromR2Storage = (
  resumeName: string
): Observable<Uint8Array> => {
  const downloadParams = {
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: resumeName
  };

  // return from(S3.send(new GetObjectCommand(downloadParams))).pipe(
  //   switchMap(response => {
  //     return from(response.Body.transformToByteArray()).pipe(
  //       map(buffer => {
  //         fs.writeFileSync(`./uploads/${resumeName}`, buffer);
  //       })
  //     );
  //   })
  // );

  return from(S3.send(new GetObjectCommand(downloadParams))).pipe(
    switchMap(response => {
      return from(response.Body.transformToByteArray());
    })
  );
};
