import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as certificatemanager from "aws-cdk-lib/aws-certificatemanager";
import * as targets from "aws-cdk-lib/aws-route53-targets";

export class KangaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // example resource
    const vpc = new ec2.Vpc(this, "KangaVpc", {
      maxAzs: 3,
      natGateways: 0, // Disable NAT Gateways for LocalStack compatibility
    });

    const cluster = new ecs.Cluster(this, "KangaCluster", {
      vpc,
    });

    const certificate = new certificatemanager.Certificate(this, "KangaCert", {
      domainName: "kanga.irix.dev",
      validation: certificatemanager.CertificateValidation.fromEmail(),
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
          certificate,
          redirectHTTP: true,
        }
      );

    // Lookup the hosted zone
    const zone = new route53.HostedZone(this, "irix.dev", {
      zoneName: "irix.dev",
    });

    new route53.MxRecord(this, "KangaMxRecord", {
      zone,
      recordName: "",
      values: [
        {
          priority: 10,
          hostName: "mx1.improvmx.com.",
        },
        {
          priority: 20,
          hostName: "mx2.improvmx.com.",
        },
      ],
      ttl: cdk.Duration.minutes(5),
    });

    new route53.TxtRecord(this, "KangaTxtRecord", {
      zone,
      recordName: "", // or "" for the root domain, or a subdomain
      values: [
        "v=spf1 include:spf.improvmx.com ~all",
        // Add more strings if needed
      ],
      ttl: cdk.Duration.minutes(5),
    });

    // Create an alias record for the ALB
    new route53.ARecord(this, "AliasRecord", {
      zone,
      recordName: "kanga.irix.dev",
      target: route53.RecordTarget.fromAlias(
        new targets.LoadBalancerTarget(fargateService.loadBalancer)
      ),
    });

    // Output the Load Balancer URL
    new cdk.CfnOutput(this, "LoadBalancerURL", {
      value: fargateService.loadBalancer.loadBalancerDnsName,
      description: "The URL of the Load Balancer",
      exportName: "KangaLoadBalancerURL",
    });
  }
}
