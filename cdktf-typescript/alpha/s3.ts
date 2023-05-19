import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { S3Bucket } from '../.gen/providers/aws/s3-bucket';
import { S3BucketPublicAccessBlock } from '../.gen/providers/aws/s3-bucket-public-access-block';
import { S3BucketPolicy } from '../.gen/providers/aws/s3-bucket-policy';
import { } from '../.gen/providers/aws/s3-bucket-server-side-encryption-configuration';

export class MyStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        // Create an S3 bucket
        const bucket = new S3Bucket(this, 'MyS3Bucket', {
            bucket: 'my-bucket-name',
            versioning: {
                enabled: true, // Enable versioning
            },
            serverSideEncryptionConfiguration:
            {
                rule:
                {
                    applyServerSideEncryptionByDefault:
                    {
                        sseAlgorithm: 'AES256', // Use 'aws:kms' for KMS encryption
                    },
                },
            },
        });

        // Apply public access block to the bucket
        const publicAccessBlock = new S3BucketPublicAccessBlock(this, 'MyPublicAccessBlock', {
            bucket: bucket.bucket, // Use the bucket name from the created bucket
            blockPublicAcls: true,
            blockPublicPolicy: true,
            ignorePublicAcls: true,
            restrictPublicBuckets: true,
        });

        // Set bucket policy to enforce SSL only access
        new S3BucketPolicy(this, 'MyBucketPolicy', {
            bucket: bucket.bucket, // Use the bucket name from the created bucket
            policy: JSON.stringify({
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: 'EnforceSSLOnlyAccess',
                        Effect: 'Deny',
                        Principal: '*',
                        Action: 's3:*',
                        Resource: [
                            `arn:aws:s3:::${bucket.bucket}`,
                            `arn:aws:s3:::${bucket.bucket}/*`,
                        ],
                        Condition: {
                            Bool: {
                                'aws:SecureTransport': 'false',
                            },
                        },
                    },
                ],
            }),
        });
    }
}