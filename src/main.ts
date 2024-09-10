import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

import * as express from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb' }));

  app.enableCors({
    origin: '*'
  });
  await app.listen(process.env.PORT || 3000);
  fs.unlink('error.log', err => {
    if (err) {
      Logger.error(err);
    }
  });
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
