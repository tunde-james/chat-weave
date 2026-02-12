import { Request, Router } from 'express';
import multer from 'multer';

import { cloudinary } from '../../config/cloudinary.config';
import { BadRequestError } from '../../lib/app-error';
import { HTTP_STATUS } from '../../config/http-status.config';

export const uploadRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: File upload endpoints
 */

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(_req, file, callback) {
    if (file.mimetype.startsWith('image/')) {
      callback(null, true);
    } else {
      callback(new BadRequestError('Only image files are allowed'));
    }
  },
});

/**
 * @swagger
 * /api/v1/upload/image-upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 width:
 *                   type: integer
 *                 height:
 *                   type: integer
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequestsError'
 */
uploadRouter.post(
  '/image-upload',
  upload.single('file'),
  async (req: Request, res, next) => {
    try {
      if (!req.file) {
        throw new BadRequestError('No file provided');
      }

      const file = req.file;

      const result = await new Promise<{
        secure_url: string;
        width: number;
        height: number;
      }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'chat_weave',
          },
          (err, uploaded) => {
            if (err || !uploaded) {
              return reject(err ?? new Error('Image upload failed'));
            }

            resolve({
              secure_url: uploaded.secure_url,
              width: uploaded.width,
              height: uploaded.height,
            });
          },
        );

        uploadStream.end(file.buffer);
      });

      return res.status(HTTP_STATUS.OK).json({
        url: result.secure_url,
        width: result.width,
        height: result.height,
      });
    } catch (error) {
      next(error);
    }
  },
);
