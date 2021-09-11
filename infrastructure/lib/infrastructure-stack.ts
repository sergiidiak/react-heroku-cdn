import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'
import * as cloudFront from '@aws-cdk/aws-cloudfront'

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const s3Site = new s3.Bucket(this, `react-heroku-cdn`, {
      bucketName: `react-heroku-cdn-resources`,
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
    })

    ;(s3Site.node.findChild('Resource') as s3.CfnBucket).addPropertyOverride('CorsConfiguration', {
      CorsRules: [
        {
          AllowedOrigins: ['*'],
          AllowedMethods: ['HEAD', 'GET', 'PUT', 'POST', 'DELETE'],
          ExposedHeaders: ['x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2'],
          AllowedHeaders: ['*'],
        },
      ],
    })

    const distribution = new cloudFront.CloudFrontWebDistribution(
      this,
      `react-heroku-cdn-distribution`,
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: s3Site,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                compress: true,
                allowedMethods: cloudFront.CloudFrontAllowedMethods.ALL,
                defaultTtl: cdk.Duration.seconds(31536000),
                cachedMethods: cloudFront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: 'none',
                  },
                  headers: [
                    'Access-Control-Request-Headers',
                    'Access-Control-Request-Method',
                    'Origin',
                  ],
                },
              },
            ],
          },
        ],
        comment: `react-heroku-cdn - CloudFront Distribution`,
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    )

    new s3deploy.BucketDeployment(this, `react-heroku-cdn-resource-deployment`, {
      sources: [s3deploy.Source.asset('../build')],
      destinationBucket: s3Site,
      distribution: distribution,
      distributionPaths: ['/*'],
      cacheControl: [s3deploy.CacheControl.maxAge(cdk.Duration.seconds(31536000))],
      prune: false,
      retainOnDelete: true,
    })

    new cdk.CfnOutput(this, 'CloudFront URL', {
      value: distribution.distributionDomainName,
    })
  }
}
