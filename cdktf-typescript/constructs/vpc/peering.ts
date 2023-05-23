import { Construct } from 'constructs';
import { VpcPeeringConnection } from '@cdktf/provider-aws/lib/vpc-peering-connection';
import { RouteTable } from '@cdktf/provider-aws/lib/route-table';
import { Route } from '@cdktf/provider-aws/lib/route';

export interface VpcPeeringProps {
    readonly peerOwnerId?: string;
    readonly peerRegion?: string;
    readonly peerVpcId: string; // Required
    readonly vpcId: string; // Required
    readonly tags?: { [key: string]: string };
}

class Peering extends Construct {
    public vpcPeering: VpcPeeringConnection
    constructor(scope: Construct, name: string, props: VpcPeeringProps) {
        super(scope, name);

        const peering = new VpcPeeringConnection(this, "id", {
            peerOwnerId: props.peerOwnerId,
            peerRegion: props.peerRegion,
            peerVpcId: props.peerVpcId,
            tags: props.tags,
            vpcId: props.vpcId,
        });

        const routeTable = new RouteTable(this, "routeTable" + props.vpcId, {
            tags: {
                name: "Route Table for Peering"
            },
            vpcId: props.vpcId,  // Required
        })

        new Route(this, "Route" + props.vpcId, {
            destinationCidrBlock: props.peerVpcId,
            routeTableId: routeTable.id,
        });

        this.vpcPeering = peering;
    }
}

export class VpcPeering extends Peering {
    
}