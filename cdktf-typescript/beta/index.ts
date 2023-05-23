import { Fn, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Vpc } from "../.gen/modules/terraform-aws-modules/aws/vpc";
import { PrivateS3Bucket } from '../constructs/s3';
import { PostgresDB } from '../constructs/rds';
import { SimpleService } from '../constructs/ecs';
import { Rds } from '../.gen/modules/terraform-aws-modules/aws/rds';

const REGION = "ap-southeast-1";
const tags = {
    team: "beta",
    owner: "project_beta",
};

export class BetaStack extends TerraformStack {
    public readonly beta_vpcId: string;
    public readonly beta_rds: Rds;

    constructor(scope: Construct, name: string) {
        super(scope, name);

        new AwsProvider(this, "aws", {
            region: REGION,
        });

        // Create VPC
        const beta_vpc = new Vpc(this, "beta_vpc", {
            // Use the name of the stack
            name,
            tags,
            cidr: "10.0.0.0/16",
            // For our case, we run it in one az for now
            azs: ["a", "b", "c"].map((i) => `${REGION}${i}`),
            // We need three CIDR blocks as we have three availability zones
            privateSubnets: ["10.0.101.0/24"],
            databaseSubnets: ["10.0.201.0/24"],
            createDatabaseSubnetGroup: true,
        });

        // Create ECS
        const beta_ecs = new SimpleService(this, 'beta', beta_vpc);

        const serviceSecurityGroup = new SecurityGroup(
            this,
            `service-security-group`,
            {
                vpcId: Fn.tostring(beta_vpc.vpcIdOutput),
                tags,
                egress: [
                    // allow outgoing traffic to alpha service
                    {
                        fromPort: 80,
                        toPort: 80,
                        protocol: "TCP",
                        securityGroups: ["security-group-from-alpha"],
                    },
                ],
            }
        );

        // Create DB
        const db = new PostgresDB(
            this,
            "db-proj-beta",
            beta_vpc,
            serviceSecurityGroup
        );

        // Create S3 bucket
        const bucket = new PrivateS3Bucket(this, 's3_proj_beta', {
            bucket: 's3_proj_beta'
        });

        this.beta_vpcId = beta_vpc.vpcIdOutput
        this.beta_rds = db.instance;
    }
}