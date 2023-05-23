import { Construct } from "constructs";
import { Fn } from "cdktf";
import { EcsService } from "@cdktf/provider-aws/lib/ecs-service";
import { EcsTaskDefinition } from "@cdktf/provider-aws/lib/ecs-task-definition";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Vpc } from "../../.gen/modules/terraform-aws-modules/aws/vpc";

class Service extends Construct {
    public service: EcsService;
    constructor(scope: Construct, name: string, vpc: Vpc) {
        super(scope, name);

        // Create a task definition
        const taskDefinition = new EcsTaskDefinition(this, 'my-task-def', {
            family: 'my-task-def',
            containerDefinitions: JSON.stringify([
                {
                    name: 'my-container',
                    image: 'nginx:latest', // Sample image for this use case
                    memory: 128,
                    portMappings: [
                        {
                            containerPort: 80,
                            hostPort: 80,
                            protocol: 'tcp',
                        },
                    ],
                },
            ]),
        });

        // Create a security group
        const serviceSecurityGroup = new SecurityGroup(this, 'my-security-group', {
            name: 'my-security-group',
            ingress: [
                {
                    fromPort: 80,
                    toPort: 80,
                    protocol: 'tcp',
                    cidrBlocks: ['0.0.0.0/0'],
                },
            ],
        });

        // Create an ECS service
        const ecsService = new EcsService(this, 'alpha_service', {
            name: 'alpha',
            launchType: "FARGATE",
            taskDefinition: taskDefinition.arn,
            desiredCount: 1,
            networkConfiguration: {
                subnets: Fn.tolist(vpc.privateSubnetsOutput),
                assignPublicIp: true,
                securityGroups: [serviceSecurityGroup.id],
            },
        });

        this.service = ecsService;
    }
}

export class SimpleService extends Service {

}