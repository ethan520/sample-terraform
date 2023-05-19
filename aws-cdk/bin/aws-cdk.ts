#!/usr/bin/env node
// import 'source-map-support/register';
// import * as cdk from 'aws-cdk-lib';
// import { AwsCdkStack } from '../lib/aws-cdk-stack';

// const app = new cdk.App();
// new AwsCdkStack(app, 'AwsCdkStack', {
//   /* If you don't specify 'env', this stack will be environment-agnostic.
//    * Account/Region-dependent features and context lookups will not work,
//    * but a single synthesized template can be deployed anywhere. */

//   /* Uncomment the next line to specialize this stack for the AWS Account
//    * and Region that are implied by the current CLI configuration. */
//   // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

//   /* Uncomment the next line if you know exactly what Account and Region you
//    * want to deploy the stack to. */
//   // env: { account: '123456789012', region: 'ap-southeast-1' },

//   /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
// });

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AlphaDatabaseStack } from '../lib/alpha-rds-stack'
import { BetaDatabaseStack } from '../lib/beta-rds-stack'
import { S3Stack } from '../lib/s3-stack'
import { PeeringStack } from '../lib/peering-stack'
import { VpcStack } from '../lib/vpc-stack'

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const StackProps = {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT as string,
        region: process.env.CDK_DEFAULT_REGION as string,
      },
    }

    const app = new cdk.App();

    // Create Alpha VPC and its subnets
    const alphaVpc = new VpcStack(app, 'AlphaStack', {
      vpcSetup: {
        cidrs: ['10.0.0.0/24'], // <--- CIDR ranges for the vpc(s)
        maxAzs: 1, // <--- to keep the costs down, we'll stick to 1 availability zone per VPC
      },
    });

    // Create Beta VPC and its subnets
    const betaVpc = new VpcStack(app, 'BetaStack', {
      vpcSetup: {
        cidrs: ['10.0.1.0/24'],
        maxAzs: 1, 
      },
    });

    // Establish a VPC Peering connection between the two VPCs
    new PeeringStack(app, 'PeeringStack', {
      vpcs: [alphaVpc.createdVpcs[0], betaVpc.createdVpcs[0]],
    });

    // Create Alpha RDS
    const alphaDBStack = new AlphaDatabaseStack(app, "AlphaDB", {
      ...StackProps,
      description: "This stack creates an alpha RDS Postgres database in private subnet"
    })

    // Create Beta RDS
    const betaDBStack = new BetaDatabaseStack(app, "BetaDB", {
      ...StackProps,
      description: "This stack creates an beta RDS Postgres database in private subnet"
    })

    // Create S3 resources
    new S3Stack(app, 'S3Stack');
  }
}
