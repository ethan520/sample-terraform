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
    team: "alpha",
    owner: "project_alpha",
};

export class AlphaStack extends TerraformStack {
    public readonly alpha_vpcId: string;
    public readonly alpha_rds: Rds;

    constructor(scope: Construct, name: string) {
        super(scope, name);

        new AwsProvider(this, "aws", {
            region: REGION,
        });

        // Create VPC
        const alpha_vpc = new Vpc(this, "alpha_vpc", {
            // Use the name of the stack
            name,
            tags,
            cidr: "10.0.0.0/16",
            // For our use case, we run it in one az for now
            azs: ["a"].map((i) => `${REGION}${i}`),
            // We only need one CIDR block as we have one availability zone
            privateSubnets: ["10.0.1.0/24"],
            databaseSubnets: ["10.0.2.0/24"],
            createDatabaseSubnetGroup: true,
        });

        // Create ECS
        const alpha_ecs = new SimpleService(this, 'alpha', alpha_vpc);

        const serviceSecurityGroup = new SecurityGroup(
            this,
            `alpha-service-security-group`,
            {
                vpcId: Fn.tostring(alpha_vpc.vpcIdOutput),
                tags,
                egress: [
                    // allow outcoming traffic to beta rds
                    {
                        protocol: "TCP",
                        fromPort: 5432,
                        toPort: 5432,
                        securityGroups: ["security-group-id-from-beta-rds"],
                    },
                ],
            }
        );

        // Create DB
        const db = new PostgresDB(
            this,
            "db-proj-alpha",
            alpha_vpc,
            serviceSecurityGroup
        );

        // Create S3 bucket
        const bucket = new PrivateS3Bucket(this, 's3_proj_alpha', {
            bucket: 's3_proj_alpha'
        });

        this.alpha_vpcId = alpha_vpc.vpcIdOutput;
        this.alpha_rds = db.instance;
    }
}