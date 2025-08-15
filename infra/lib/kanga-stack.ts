import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";

export class KangaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const vpc = new ec2.Vpc(this, "KangaVpc", {
      maxAzs: 3,
      natGateways: 0, // Disable NAT Gateways for LocalStack compatibility
    });

    const cluster = new ecs.Cluster(this, "KangaCluster", {
      vpc,
    });

    const fargateService =
      new ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "KangaFargateService",
        {
          cluster,
          cpu: 256,
          memoryLimitMiB: 512,
          desiredCount: 2,
          runtimePlatform: {
            cpuArchitecture: ecs.CpuArchitecture.ARM64,
            operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          },
          taskImageOptions: {
            image: ecs.ContainerImage.fromAsset("../packages/web"),
            containerName: "kanga-web",
            environment: {
              NODE_ENV: "production",
            },
            containerPort: 3000,
          },
          assignPublicIp: true,
          publicLoadBalancer: true,
        }
      );

    // Output the Load Balancer URL
    new cdk.CfnOutput(this, "LoadBalancerURL", {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: "The URL of the Load Balancer",
      exportName: "KangaLoadBalancerURL",
    });
  }
}
