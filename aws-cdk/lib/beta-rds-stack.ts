import { Duration, RemovalPolicy, Stack, StackProps, Fn } from "aws-cdk-lib"
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    Vpc,
} from "aws-cdk-lib/aws-ec2"
import { DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion } from "aws-cdk-lib/aws-rds"
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from "constructs"

interface DatabaseProps extends StackProps {
}

export class BetaDatabaseStack extends Stack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const engine = DatabaseInstanceEngine.postgres({ version: PostgresEngineVersion.VER_15_2 });
        const instanceType = InstanceType.of(InstanceClass.T3, InstanceSize.SMALL);
        const port = 5432;
        const dbName = "beta"

        // Create db credentials
        const alphaDBSecret = new secretsmanager.Secret(this, 'BetaDBSecret', {
            secretName: "db-master-user-secret-beta",
            description: "Database master user credentials",
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: "postgres" }),
                generateStringKey: "password",
                passwordLength: 16,
                excludePunctuation: true,
            },
        });
        const alpha_VpcId = Fn.importValue('VpcID1');
        const beta_VpcId = Fn.importValue('VpcID2');

        // VPC
        const alphaVpc = Vpc.fromLookup(this, "Vpc1", { vpcId: alpha_VpcId, isDefault: false });
        const betaVpc = Vpc.fromLookup(this, "Vpc2", { vpcId: beta_VpcId, isDefault: false });

        // Create Security Group
        const dbSecurityGroup = new SecurityGroup(this, "Database-SG", {
            securityGroupName: "Database-SG-Beta",
            vpc: betaVpc
        })

        // Add Inbound rule
        dbSecurityGroup.addIngressRule(
            Peer.ipv4(betaVpc.vpcCidrBlock),
            Port.tcp(port),
            'Allow port ${port} for the database connection from Beta within the VPC'
        )

        // Add Inbound rule
        dbSecurityGroup.addIngressRule(
            Peer.ipv4(alphaVpc.vpcCidrBlock),
            Port.tcp(port),
            'Allow port ${port} for the database connection from Alpha within the VPC'
        )

        // Create RDS instance (PostgreSQL)
        const BetaDBInstance = new DatabaseInstance(this, "db_proj_beta", {
            vpc: betaVpc,
            vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
            instanceType,
            engine,
            port,
            securityGroups: [dbSecurityGroup],
            databaseName: dbName,
            credentials: {
                username: alphaDBSecret.secretValueFromJson('username').toString(),
                password: alphaDBSecret.secretValueFromJson('password')
            },
            backupRetention: Duration.days(7),
            deleteAutomatedBackups: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoMinorVersionUpgrade: true,
            deletionProtection: true,
            publiclyAccessible: false
        });
    }
}
