const cdk = require('@aws-cdk/core')
const s3 = require('@aws-cdk/aws-s3')
const s3Deployment = require('@aws-cdk/aws-s3-deployment')
const iam = require('@aws-cdk/aws-iam')
const cloudfront = require('@aws-cdk/aws-cloudfront')
const origins = require('@aws-cdk/aws-cloudfront-origins')
const acm = require('@aws-cdk/aws-certificatemanager')
const route53 = require('@aws-cdk/aws-route53')
const ec2 = require('@aws-cdk/aws-ec2')
const rds = require('@aws-cdk/aws-rds')
const apigw = require('@aws-cdk/aws-apigateway')
const lambda = require('@aws-cdk/aws-lambda')

class CdkStack extends cdk.Stack {
    /**
     *
     * @param {cdk.Construct} scope
     * @param {string} id
     * @param {cdk.StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props)

        // Frontend
        const boundary = iam.ManagedPolicy.fromManagedPolicyArn(
            this,
            `${this.prefix}-permissions-boundary`,
            `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`
        )
        iam.PermissionsBoundary.of(this).apply(boundary)

        const clientBucket = new s3.Bucket(
            this,
            `${this.prefix}-static-react-bucket`,
            {
                bucketName: `${this.prefix}-static-react-bucket`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            }
        )

        const redirectsFunction = new cloudfront.Function(
            this,
            `${this.prefix}-redirects-function`,
            {
                code: cloudfront.FunctionCode.fromFile({
                    filePath: 'functions/redirects.js',
                }),
            }
        )

        const cert = acm.Certificate.fromCertificateArn(
            this,
            `${this.prefix}-cloudfront-cert`,
            `arn:aws:acm:us-east-1:${process.env.AWS_ACCOUNT}:certificate/${process.env.NJA_CERT_ID}`
        )

        const clientDistribution = new cloudfront.Distribution(
            this,
            `${this.prefix}-cloudfront-distribution`,
            {
                defaultBehavior: {
                    origin: new origins.S3Origin(clientBucket),
                    viewerProtocolPolicy:
                        cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    functionAssociations: [
                        {
                            eventType:
                                cloudfront.FunctionEventType.VIEWER_REQUEST,
                            function: redirectsFunction,
                        },
                    ],
                },
                defaultRootObject: 'index.html',
                domainNames: [`${this.prefix}.${process.env.NJA_DOMAIN_NAME}`],
                certificate: cert,
            }
        )

        const deployment = new s3Deployment.BucketDeployment(
            this,
            `${this.prefix}-react-bucket-deployment`,
            {
                sources: [s3Deployment.Source.asset('../build')],
                destinationBucket: clientBucket,
                retainOnDelete: false,
                distribution: clientDistribution,
                distributionPaths: ['/*'],
                prune: true,
            }
        )

        const zone = route53.HostedZone.fromLookup(
            this,
            `${this.prefix}-hosted-zone`,
            {
                domainName: process.env.NJA_DOMAIN_NAME ?? '',
            }
        )

        const record = new route53.CnameRecord(
            this,
            `${this.prefix}-cname-record`,
            {
                zone,
                domainName: clientDistribution.domainName,
                recordName: `${this.prefix}.${process.env.NJA_DOMAIN_NAME}`,
            }
        )

        new cdk.CfnOutput(this, 's3BucketDomain', {
            value: clientBucket.bucketDomainName ?? 'NO_DATA',
        })
        new cdk.CfnOutput(this, 'cloudfrontUrl', {
            value: clientDistribution.distributionDomainName ?? 'NO_DATA',
        })
        new cdk.CfnOutput(this, 'prettyDomainName', {
            value: `https://${this.prefix}.${process.env.NJA_DOMAIN_NAME}`,
        })

        // Backend
        const teamVpc = ec2.Vpc.fromLookup(this, 'lookup-nja-shared-vpc', {
            vpcId: this.teamVpcId,
        })

        const teamSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
            this,
            'lookup-nja-shared-sg',
            this.teamSecurityGroupId,
            {
                allowAllOutbound: true,
                mutable: false,
            }
        )

        const rdsCluster = new rds.ServerlessCluster(
            this,
            `${this.prefix}-rds-AuroraCluster`,
            {
                engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
                parameterGroup: rds.ParameterGroup.fromParameterGroupName(
                    this,
                    'ParameterGroup',
                    'default.aurora-postgresql10'
                ),
                vpc: teamVpc,
                scaling: { autoPause: cdk.Duration.seconds(0) },
                defaultDatabaseName: this.yourDbName,
                securityGroups: [teamSecurityGroup],
            }
        )

        const apiResourcePolicyVPN = new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
                    actions: ['execute-api:Invoke'],
                    principals: [new iam.AnyPrincipal()],
                    resources: ['execute-api:/*/*/*'],
                }),
                new iam.PolicyStatement({
                    effect: iam.Effect.DENY,
                    principals: [new iam.AnyPrincipal()],
                    actions: ['execute-api:Invoke'],
                    resources: ['execute-api:/*/*/*'],
                    conditions: {
                        NotIpAddress: {
                            'aws:SourceIp': [this.iwVpnIp],
                        },
                    },
                }),
            ],
        })

        const api = new apigw.RestApi(this, `${this.prefix}-rds-apigw`, {
            defaultCorsPreflightOptions: {
                allowOrigins: ['*'],
                allowMethods: [apigw.Cors.ALL_METHODS],
            },
            deployOptions: {
                stageName: 'v1',
            },
            policy: apiResourcePolicyVPN,
            cloudWatchRole: false,
        })

        const rdsExecutionRole = iam.Role.fromRoleArn(
            this,
            `${this.prefix}-execution-role-rds`,
            this.teamLambdaExecutionRoleArn,
            {
                mutable: false,
            }
        )

        const rdsLambda = new lambda.Function(
            this,
            `${this.prefix}-rds-lambda`,
            {
                runtime: lambda.Runtime.NODEJS_14_X,
                code: new lambda.AssetCode('functions'),
                handler: 'index.handler',
                role: rdsExecutionRole,
                environment: {
                    DB_NAME: this.yourDbName,
                    CLUSTER_ARN: rdsCluster.clusterArn,
                    SECRET_ARN: rdsCluster.secret.secretArn || '',
                    AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                },
            }
        )

        rdsCluster.grantDataApiAccess(rdsLambda)

        const rdsLambdaIntegration = new apigw.LambdaIntegration(rdsLambda)

        const scores = api.root.addResource('scores')
        scores.addMethod('GET', rdsLambdaIntegration)
        scores.addMethod('POST', rdsLambdaIntegration)

        const boundary = iam.ManagedPolicy.fromManagedPolicyArn(
            this,
            'Boundary',
            `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`
        )
        iam.PermissionsBoundary.of(this).apply(boundary)

        new cdk.CfnOutput(this, 'API_URL', {
            value: api.url ?? 'NO_URL',
        })
    }
}

module.exports = { CdkStack }
