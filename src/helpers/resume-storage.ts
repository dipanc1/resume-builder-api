/* eslint-disable @typescript-eslint/no-var-requires */
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const fs = require('fs');
const FileType = require('file-type');

import { from, Observable, of, switchMap } from 'rxjs';

type validFileExtension = 'pdf' | 'doc' | 'docx' | 'txt';
type validMimeType =
  | 'application/pdf'
  | 'application/msword'
  | 'text/plain'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const validFileExtensions: validFileExtension[] = ['pdf', 'doc', 'docx', 'txt'];
const validMimeTypes: validMimeType[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const MAX_RESUME_SIZE_IN_BYTES = 1024 * 1024; // 1MB

export const isFileSizeLessThanOneMB = (fileSize: number): boolean => {
  return fileSize > MAX_RESUME_SIZE_IN_BYTES;
};

export const saveResumeToStorage = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const fileName: string = uuidv4() + '_' + file.originalname;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  }
};

export const isFileExtensionSafe = (
  fullFilePath: string
): Observable<boolean> => {
  return from(FileType.fromFile(fullFilePath)).pipe(
    switchMap(
      (fileExtensionAndMimeType: {
        ext: validFileExtension;
        mime: validMimeType;
      }) => {
        if (!fileExtensionAndMimeType) {
          return of(false);
        }

        const isFileTypeLegit = validFileExtensions.includes(
          fileExtensionAndMimeType.ext
        );
        const isMimeTypeLegit = validMimeTypes.includes(
          fileExtensionAndMimeType.mime
        );

        const isFileLegit = isFileTypeLegit && isMimeTypeLegit;

        return of(isFileLegit);
      }
    )
  );
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (error) {
    console.error(error);
  }
};
