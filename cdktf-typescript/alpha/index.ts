import { App, Fn, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { EcsService } from '@cdktf/provider-aws/lib/ecs-service';
import { Vpc } from "../.gen/modules/terraform-aws-modules/aws/vpc";
import { PrivateS3Bucket } from '../constructs/s3';
import { PostgresDB } from '../constructs/rds';
import { VpcPeering } from '../constructs/vpc/peering';
import { SimpleService } from '../constructs/ecs';

const REGION = "ap-southeast-1";
const tags = {
    team: "alpha",
    owner: "project_alpha",
};

interface StackProps {
    alphaSg: SecurityGroup | undefined
}

export class AlphaStack extends TerraformStack {
    public alphaSg: SecurityGroup
    constructor(scope: Construct, name: string) {
        super(scope, name);

        new AwsProvider(this, "aws", {
            region: REGION,
        });

        // Create VPC
        const alpha_vpc = new Vpc(this, "vpc", {
            // Use the name of the stack
            name,
            tags,
            cidr: "10.0.0.0/16",
            // We want to run on three availability zones
            azs: ["a", "b", "c"].map((i) => `${REGION}${i}`),
            // We need three CIDR blocks as we have three availability zones
            privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
            //publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
            databaseSubnets: ["10.0.201.0/24", "10.0.202.0/24", "10.0.203.0/24"],
            createDatabaseSubnetGroup: true,
            enableNatGateway: true,
            // Using a single NAT Gateway will save us some money, coming with the cost of less redundancy
            singleNatGateway: true,
        });

        // Create VPC peering
        new VpcPeering(this, 'vpcPeeringAtoB', {
            peerRegion: REGION,
            peerVpcId: "string",
            vpcId: Fn.tostring(alpha_vpc.vpcIdOutput),
        })

        const serviceSecurityGroup = new SecurityGroup(
            this,
            `service-security-group`,
            {
                vpcId: Fn.tostring(alpha_vpc.vpcIdOutput),
                tags,
                ingress: [
                    // only allow incoming traffic from beta service
                    {
                        protocol: "TCP",
                        fromPort: 5432,
                        toPort: 5432,
                        //securityGroups: beta.securityGroups,
                    },
                ],
                egress: [
                    // allow all outgoing traffic to beta rds
                    {
                        fromPort: 5432,
                        toPort: 5432,
                        protocol: "TCP",
                        //securityGroups: beta.securityGroups,
                    },
                ],
            }
        );

        this.alphaSg = serviceSecurityGroup;

        // Create ECS
        new SimpleService(this, 'alpha', alpha_vpc);

        // Create DB
        const db = new PostgresDB(
            this,
            "alpha_db",
            alpha_vpc,
            serviceSecurityGroup
        );

        // Create S3 bucket
        const bucket = new PrivateS3Bucket(this, 's3_proj_alpha', {
            bucket: 's3_proj_alpha'
        });

    }
}

const app = new App();
new AlphaStack(app, "Alpha");
app.synth();