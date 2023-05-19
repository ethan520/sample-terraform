import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface VpcProps extends cdk.StackProps {
  vpcSetup: {
    cidrs: string[], // <--- each VPC will need a list of CIDRs
    maxAzs?: number, // <--- optionally the number of Availability Zones can be provided; defaults to 2 in our particular case
  };
}

export class VpcStack extends cdk.Stack {

  readonly createdVpcs: ec2.Vpc[]; // <-- create a class property for exposing the list of VPC objects

  constructor(scope: Construct, id: string, props: VpcProps) {
    super(scope, id, props);

    const createdVpcs: ec2.Vpc[] = [];

    // for each of the provided CIDR ranges, create a VPC with two /27 subnets (one public and one private) per AZ
    props.vpcSetup.cidrs.forEach((cidr, index) => {
      createdVpcs.push(new ec2.Vpc(this, 'Vpc' + index, {
        cidr,
        maxAzs: props.vpcSetup.maxAzs,
        subnetConfiguration: [
          {
            cidrMask: 27,
            name: 'application',
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          },
          {
            cidrMask: 27,
            name: 'database',
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          },
        ],
      }));
    });

    // For each VPC's default security group, allow inbound tcp requests
    createdVpcs.forEach((vpc, index) => {
      ec2.SecurityGroup.fromSecurityGroupId(this, 'DefaultSecurityGroup' + index, vpc.vpcDefaultSecurityGroup)
        .addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTcp(), 'VPC Default Security Groups');
    });

    //expose the list of created VPC objects so that they can be used by different stacks
    createdVpcs.forEach((vpc, index) => {
      new cdk.CfnOutput(this, 'VpcIdOutput', {
        value: vpc.vpcId,
        exportName: "VpcID" + index,
      });
    });
  }
}