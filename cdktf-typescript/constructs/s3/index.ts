import { Construct } from "constructs";
import { S3Bucket, S3BucketConfig } from "@cdktf/provider-aws/lib/s3-bucket";
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import { S3BucketPublicAccessBlock } from "@cdktf/provider-aws/lib/s3-bucket-public-access-block";

export interface S3BucketProps {
  readonly bucket_name: string;
  readonly sse_algorithm?: string;
  readonly bucketPrefix?: string;
  readonly tags?: { [key: string]: string };
}

class DefaultS3Bucket extends Construct {
  constructor(
    protected scope: Construct,
    protected name: string,
    protected s3Options: S3BucketConfig
  ) {
    super(scope, name);
    const bucket = new S3Bucket(this, "s3Bucket", {
      ...s3Options,
      bucket: this.getBucketName(),
      versioning: { enabled: true },
      acl: "private",
      serverSideEncryptionConfiguration: {
        rule: {
          applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256"
          }
        }
      }
    });
    new S3BucketPolicy(this, 'bucketPolicy', {
      bucket: bucket.id,
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'DenyPublicAccess',
            Effect: 'Deny',
            Principal: '*',
            Action: 's3:*',
            Resource: [`${bucket.arn}/*`, `${bucket.arn}`],
            Condition: {
              Bool: {
                'aws:SecureTransport': 'false',
              },
            },
          },
        ],
      }),
    });
    new S3BucketPublicAccessBlock(this, 'bucketPublicAccessBlock', {
      bucket: bucket.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true
    });
  }

  public getBucketName() {
    return this.s3Options.bucket || this.name;
  }
  public getBucketArn() {
    return `arn:aws:s3:::${this.name}`;
  }
}

export class PrivateS3Bucket extends DefaultS3Bucket {
  public getBucketName() {
    return this.s3Options.bucket || this.name;
  }
  public getBucketArn() {
    return `arn:aws:s3:::${this.name}`;
  }
}