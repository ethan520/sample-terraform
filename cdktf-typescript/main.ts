import { Construct } from "constructs";
import { App, Fn, TerraformStack } from "cdktf";
import { AlphaStack } from './alpha';
import { BetaStack } from "./beta";
import { VpcPeering } from "./constructs/vpc/peering";

const REGION = "ap-southeast-1";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    const alpha = new AlphaStack(this, 'alpha');
    const beta = new BetaStack(this, 'beta');

    // Create VPC peering
    new VpcPeering(this, 'vpcPeeringAtoB', {
      peerRegion: REGION,
      peerVpcId: Fn.tostring(beta.beta_vpcId),
      vpcId: Fn.tostring(alpha.alpha_vpcId),
    })
    new VpcPeering(this, 'vpcPeeringBtoA', {
      peerRegion: REGION,
      peerVpcId: Fn.tostring(alpha.alpha_vpcId),
      vpcId: Fn.tostring(beta.beta_vpcId),
    })

  }
}

const app = new App();
new MyStack(app, "project");
app.synth();
