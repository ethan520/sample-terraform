import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
//import { VpcStack } from "./vpc";
import { AlphaStack } from './alpha';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    //new VpcStack(this, 'VpcStack');
    new AlphaStack(this, 'AlphaStack');
  }
}

const app = new App();
new MyStack(app, "cdktf-typescript-project");
app.synth();
