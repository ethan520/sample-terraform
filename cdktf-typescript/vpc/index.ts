import { TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { AwsProvider } from '../.gen/providers/aws/provider';
import { VpcPeeringConnection } from '../.gen/providers/aws/vpc-peering-connection';
import { Vpc } from '../.gen/providers/aws/vpc';
import { Subnet } from '../.gen/providers/aws/subnet';
import { RouteTable } from '../.gen/providers/aws/route-table';
import { RouteTableAssociation } from '../.gen/providers/aws/route-table-association';

export class VpcStack extends TerraformStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        // Create AWS provider
        new AwsProvider(this, 'aws', {
            region: 'ap-southeast-1', // Replace with your desired AWS region
        });

        // Create VPCs
        const alpha_vpc = new Vpc(this, 'alpha_vpc', {
            cidrBlock: '10.0.0.0/16',
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });

        const beta_vpc = new Vpc(this, 'beta_vpc', {
            cidrBlock: '10.1.0.0/16',
            enableDnsHostnames: true,
            enableDnsSupport: true,
        });

        // Create subnets in alpha_vpc
        const alpha_app_subnet = new Subnet(this, 'alpha_app_subnet', {
            vpcId: alpha_vpc.id,
            cidrBlock: '10.0.254.0/24',
            availabilityZone: 'ap-southeast-1a', // Replace with desired AZ
        });

        const alpha_database_subnet = new Subnet(this, 'alpha_database_subnet', {
            vpcId: alpha_vpc.id,
            cidrBlock: '10.0.255.0/24',
            availabilityZone: 'ap-southeast-1a', // Replace with desired AZ
        });

        // Create subnets in beta_vpc
        const beta_app_subnet = new Subnet(this, 'beta_app_subnet', {
            vpcId: beta_vpc.id,
            cidrBlock: '10.1.254.0/24',
            availabilityZone: 'ap-southeast-1a', // Replace with desired AZ
        });

        const beta_database_subnet = new Subnet(this, 'beta_database_subnet', {
            vpcId: beta_vpc.id,
            cidrBlock: '10.1.255.0/24',
            availabilityZone: 'ap-southeast-1a', // Replace with desired AZ
        });

        // Create VPC peering connection
        const peeringConnection_alpha_to_beta = new VpcPeeringConnection(
            this,
            'vpcPeeringConnection_alpha_to_beta',
            {
                peerVpcId: beta_vpc.id,
                vpcId: alpha_vpc.id,
            }
        );

        const peeringConnection_beta_to_alpha = new VpcPeeringConnection(
            this,
            'vpcPeeringConnection_beta_to_alpha',
            {
                peerVpcId: alpha_vpc.id,
                vpcId: beta_vpc.id,
            }
        );

        // Create route tables
        const routeTable1 = new RouteTable(this, 'routeTable1', {
            vpcId: alpha_vpc.id,
        });

        const routeTable2 = new RouteTable(this, 'routeTable2', {
            vpcId: beta_vpc.id,
        });

        // Associate subnets with route tables
        new RouteTableAssociation(this, 'alpha_app_subnetAssociation', {
            subnetId: alpha_app_subnet.id,
            routeTableId: routeTable1.id,
        });

        new RouteTableAssociation(this, 'alpha_database_subnetAssociation', {
            subnetId: alpha_database_subnet.id,
            routeTableId: routeTable1.id,
        });

        new RouteTableAssociation(this, 'beta_app_subnetAssociation', {
            subnetId: beta_app_subnet.id,
            routeTableId: routeTable1.id,
        });

        new RouteTableAssociation(this, 'beta_database_subnetAssociation', {
            subnetId: beta_database_subnet.id,
            routeTableId: routeTable2.id,
        });
    }
}