import { Construct } from "constructs";
import { SecurityGroup } from "@cdktf/provider-aws/lib/security-group";
import { Vpc } from "../../.gen/modules/terraform-aws-modules/aws/vpc";
import { Rds } from "../../.gen/modules/terraform-aws-modules/aws/rds";
import { Password } from "../../.gen/providers/random/password";
import { Fn } from "cdktf";

class DefaultDB extends Construct {
    public instance: Rds;
  
    constructor(
      scope: Construct,
      name: string,
      vpc: Vpc,
      serviceSecurityGroup: SecurityGroup
    ) {
      super(scope, name);
  
      // Create a password stored in the TF State on the fly
      const password = new Password(this, `db-password`, {
        length: 16,
        special: false,
      });
  
      const dbPort = 5432;
  
      const dbSecurityGroup = new SecurityGroup(this, "db-security-group", {
        vpcId: Fn.tostring(vpc.vpcIdOutput),
        ingress: [
          // allow traffic to the DBs port from the service
          {
            fromPort: dbPort,
            toPort: dbPort,
            protocol: "TCP",
            securityGroups: [serviceSecurityGroup.id],
          },
        ],
      });
  
      // Using this module: https://registry.terraform.io/modules/terraform-aws-modules/rds/aws/latest
      const db = new Rds(this, "db", {
        identifier: `${name}-db`,
  
        engine: "postgres",
        engineVersion: "15.2",
        family: "postgres15",
        majorEngineVersion: "15",
        instanceClass: "db.t3.micro",
        allocatedStorage: "5",
  
        createDbOptionGroup: false,
        createDbParameterGroup: false,
        applyImmediately: true,

        autoMinorVersionUpgrade: true,
        deletionProtection: true,
        publiclyAccessible: false,
  
        name,
        port: String(dbPort),
        username: `${name}user`,
        password: password.result,
  
        maintenanceWindow: "Mon:00:00-Mon:03:00",
        backupWindow: "03:00-06:00",
  
        // This is necessary due to a shortcoming in our token system to be adressed in
        // https://github.com/hashicorp/terraform-cdk/issues/651
        subnetIds: vpc.databaseSubnetsOutput as unknown as any,
        vpcSecurityGroupIds: [dbSecurityGroup.id],
      });
  
      this.instance = db;
    }
  }

  export class PostgresDB extends DefaultDB {

  }