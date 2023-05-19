# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


# Assuming the ECS services for Alpha & Beta are existing in the respective VPC

* SG rules for Alpha service:
- has ingress for Beta to access Alpha's service
- has egress to both Alpha and Beta RDS

* SG rules for Beta service:
- has only egress rule to access Alpha's service and access to its own RDS
