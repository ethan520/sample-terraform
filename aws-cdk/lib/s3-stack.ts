import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class S3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a logs bucket
    const accessLogsBucket = new s3.Bucket(this, 'AccessLogsBucket', {
      bucketName: 'logs-bucket',
      encryption: s3.BucketEncryption.S3_MANAGED,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      enforceSSL: true,
    });

    // Create an Alpha S3 bucket
    const bucket_alpha = new s3.Bucket(this, 'Aplha_S3_Bucket', {
      bucketName: 's3_proj_alpha', // Replace with your desired bucket name
      versioned: true,              // Enable versioning
      removalPolicy: cdk.RemovalPolicy.DESTROY, // This will destroy the bucket when the stack is deleted. Change it according to your needs.
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL, // Provide full access for owner
      encryption: s3.BucketEncryption.S3_MANAGED, // Enable bucket encryption using s3 default kms key
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Enable all block public access settings
      publicReadAccess: false, // Disable s3 from public facing
      serverAccessLogsBucket: accessLogsBucket, // Enable server access logging for ease of security audit
      serverAccessLogsPrefix: 's3/alpha/logs', // Define the logs prefix
      enforceSSL: true, // To require all requests use Secure Socket Layer (SSL)
    });

    // Create an Beta S3 bucket
    const bucket_beta = new s3.Bucket(this, 'Beta_S3_Bucket', {
      bucketName: 's3_proj_beta',
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: 's3/beta/logs',
      enforceSSL: true,
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'alpha_bucketname', {
      value: bucket_alpha.bucketName
    });
    new cdk.CfnOutput(this, 'beta_bucketname', {
      value: bucket_beta.bucketName
    });
  }
}
