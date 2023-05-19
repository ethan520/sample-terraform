import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { VpcStack } from "./vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // define resources here
    new VpcStack(this, 'VpcStack');
  }
}

const app = new App();
new MyStack(app, "cdktf-typescript");
app.synth();
