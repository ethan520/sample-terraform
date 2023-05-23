import { TerraformStack, TerraformOutput, DataTerraformRemoteState } from 'cdktf';
import { Construct } from 'constructs';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { VpcConstruct } from '../constructs/vpc'
import { VpcPeeringConnection } from '@cdktf/provider-aws/lib/vpc-peering-connection';

interface VpcStackProps {
    alpha_vpcId: string | undefined
    beta_vpcId: string | undefined
}

export class VpcStack extends TerraformStack {
    public readonly alpha_vpcId: string | undefined;
    public readonly beta_vpcId: string | undefined;

    constructor(scope: Construct, name: string) {
        super(scope, name);

        // Create AWS provider
        new AwsProvider(this, 'aws', {
            region: 'ap-southeast-1', // Replace with your desired AWS region
        });

        // Create VPCs
        const alpha = new VpcConstruct(this, 'alpha', {
            vpcName: "alpha_vpc",
            cidrBlock: '10.0.0.0/16',
            subnet_cidrBlock: ['10.0.1.0/24', '10.0.2.0/24'],
            availabilityZone: 'ap-southeast-1a'
        });

        const beta = new VpcConstruct(this, 'beta', {
            vpcName: "beta_vpc",
            cidrBlock: '10.1.0.0/16',
            subnet_cidrBlock: ['10.1.1.0/24', '10.1.2.0/24'],
            availabilityZone: 'ap-southeast-1a'
        });

        new VpcPeeringConnection(this, 'vpcPeeringAB', {
            peerVpcId: alpha.getVpcId(),
            vpcId: beta.getVpcId(),
        });

        new VpcPeeringConnection(this, 'vpcPeeringBA', {
            peerVpcId: beta.getVpcId(),
            vpcId: alpha.getVpcId(),
        });

        this.alpha_vpcId = alpha.getVpcId();
        this.beta_vpcId = beta.getVpcId();
    }
}