import { Construct } from 'constructs';
import { Vpc } from '@cdktf/provider-aws/lib/vpc';
import { Subnet } from '@cdktf/provider-aws/lib/subnet';

export interface VpcProps {
    readonly vpcName: string;
    readonly cidrBlock: string;
    readonly subnet_cidrBlock?: string[];
    readonly availabilityZone?: string;
}

class DefaultVpc extends Construct {
    public readonly createdVpc: Vpc;
    constructor(
        scope: Construct,
        name: string,
        props: VpcProps
    ) {
        super(scope, name);

        // Create vpc resource
        const vpc = new Vpc(this, "vpc", {
            cidrBlock: props.cidrBlock,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            tags: {
                name: props.vpcName
            },
        });

        this.createdVpc = vpc;

        if (props.subnet_cidrBlock && props.subnet_cidrBlock.length > 0) {
            props.subnet_cidrBlock.forEach((cidr, index) => {
                new Subnet(this, "subnet" + (index+1), {
                    assignIpv6AddressOnCreation: false,
                    availabilityZone: props.availabilityZone,
                    cidrBlock: cidr,
                    enableDns64: false,
                    ipv6Native: false,
                    tags: {
                        name: "Subnet " + (index+1) + " of " + props.vpcName
                    },
                    vpcId: vpc.id, // Required
                });
            });
        }
    }

    public getVpcId() {
        return this.createdVpc.id;
    }
}

export class VpcConstruct extends DefaultVpc {
    // New behaviour was patched in by overwriting
    public getVpcId() {
        return this.createdVpc.id;
    }
}