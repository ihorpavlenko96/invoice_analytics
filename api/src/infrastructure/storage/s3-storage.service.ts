import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageService {
    private readonly client: S3Client;
    private readonly bucketName: string;
    private readonly region: string;
    private readonly logger = new Logger(S3StorageService.name);

    constructor(private configService: ConfigService) {
        this.region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';

        this.client = new S3Client({
            region: this.region,
        });

        if (!this.bucketName) {
            this.logger.warn('AWS_S3_BUCKET_NAME not configured. S3 storage will not work.');
        }
    }

    /**
     * Uploads a file to S3
     * @param userId - The user ID for folder organization
     * @param file - The file buffer to upload
     * @param originalFilename - Original filename for reference
     * @param contentType - MIME type of the file
     * @returns The public URL of the uploaded file
     */
    async uploadAvatar(
        userId: string,
        file: Buffer,
        originalFilename: string,
        contentType: string,
    ): Promise<string> {
        if (!this.bucketName) {
            throw new InternalServerErrorException('S3 bucket not configured');
        }

        const fileExtension = originalFilename.split('.').pop();
        const filename = `${uuidv4()}.${fileExtension}`;
        const key = `avatars/${userId}/${filename}`;

        const params: PutObjectCommandInput = {
            Bucket: this.bucketName,
            Key: key,
            Body: file,
            ContentType: contentType,
            // Make the file publicly readable
            ACL: 'public-read',
        };

        try {
            const command = new PutObjectCommand(params);
            await this.client.send(command);

            // Construct the public URL
            const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

            this.logger.log(`Successfully uploaded avatar for user ${userId} to ${url}`);
            return url;
        } catch (error) {
            this.logger.error(
                `Failed to upload avatar for user ${userId}: ${error.message}`,
                error.stack,
            );
            throw new InternalServerErrorException('Failed to upload avatar to storage');
        }
    }

    /**
     * Deletes a file from S3
     * @param avatarUrl - The full URL of the avatar to delete
     */
    async deleteAvatar(avatarUrl: string): Promise<void> {
        if (!this.bucketName) {
            throw new InternalServerErrorException('S3 bucket not configured');
        }

        try {
            // Extract the key from the URL
            const url = new URL(avatarUrl);
            const key = url.pathname.substring(1); // Remove leading '/'

            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });

            await this.client.send(command);
            this.logger.log(`Successfully deleted avatar from ${key}`);
        } catch (error) {
            this.logger.error(
                `Failed to delete avatar from ${avatarUrl}: ${error.message}`,
                error.stack,
            );
            // Don't throw error for deletion failures as the user operation should succeed
            // even if the old file couldn't be deleted
        }
    }
}
