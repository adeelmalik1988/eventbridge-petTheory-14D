import * as cdk from '@aws-cdk/core';
import * as appsync from "@aws-cdk/aws-appsync"
import * as lambda from "@aws-cdk/aws-lambda"
import * as dynamoDb from "@aws-cdk/aws-dynamodb"
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions"
import * as targets from "@aws-cdk/aws-events-targets"
import * as events from "@aws-cdk/aws-events"
import * as sns from "@aws-cdk/aws-sns"
import * as sqs from "@aws-cdk/aws-sqs"
import * as iam from "@aws-cdk/aws-iam"
import * as apigw from "@aws-cdk/aws-apigateway"
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment'

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const API = new appsync.GraphqlApi(this, "appsync-petTheory-eventbridge", {
      name: "appsync-petTheory-eventbridge",
      schema: appsync.Schema.fromAsset('graphql/schema.sql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          //apiKeyConfig: {
          //  expires: cdk.Expiration.after(cdk.Duration.days(365))
         // }
        }
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL
      },
      xrayEnabled: true
    })

    // HTTP data Source

    const httpDs =  API.addHttpDataSource("ds",`https://events.${this.region}.amazonaws.com/`,{
      name: "httpsDsWithEventBridge",
      description: "From Appsync to Eventbridge",
      authorizationConfig: {
        signingRegion: this.region,
        signingServiceName: "events"
      }
    })

    events.EventBus.grantAllPutEvents(httpDs)

    const reportLambda = new lambda.Function(this,"ReportLambda",{
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "main.handler"

    })

    //Resolver

    httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "reportEvent",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("requestReport.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("responseReport.vtl")
      
    })
    //Creating an SNS Topic
    const myTopic = new sns.Topic(this,"MyTopic")

    //creating a dead letter Queue
    const dlQueue = new sqs.Queue(this,"DeadLetterQueue",{
      queueName: "MySubscription_DLQ"
    })
    //subscribe Lambda to the topic
    myTopic.addSubscription(new subscriptions.LambdaSubscription(reportLambda,{
      deadLetterQueue: dlQueue,
      filterPolicy:{
        

      }
    }))

    //create a rule to publish events on SNS Topic
    const rule = new events.Rule(this, "ReportEventBridgeRule", {
      eventPattern: {
        source: ["report-events"]
      }

    })

    rule.addTarget(new targets.SnsTopic(myTopic))

    //Creating DynamoDB Table
    const reportDbTable = new dynamoDb.Table(this, "ReportTableDynamo",{
      tableName: "ReportTable",
      partitionKey: {
        name: "id",
        type: dynamoDb.AttributeType.STRING
      }

    })
    //Creating Lambdafunction for Report CRUD operation
    const reportCRUDLambda = new lambda.Function(this,"ReportCRUDLambda",{
      code: lambda.Code.fromAsset("./functions/reportCRUDFunction"),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "main.handler"

    })

    reportDbTable.grantFullAccess(reportCRUDLambda)

    reportCRUDLambda.addEnvironment("REPORT_TABLE",reportDbTable.tableName)

    const lambdaDataSource = API.addLambdaDataSource("ReportLambdaDataSource",reportCRUDLambda)

    //Creating resolvers for Report CRUD operation

    lambdaDataSource.createResolver({
      typeName: "Query",
      fieldName: "getReports"
    })

    lambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "createReport"
    })

    lambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "updateReport"
    })

    lambdaDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "deleteReport"
    })

    //Creating IAM Role for lambda to give access of SES send email
    const emailRole =  new iam.Role(this,"lambdaEmailRole",{
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });

    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ses:SendEmail", "ses:SendRawEmail", "logs:*"],
      resources: ["*"]
    })

    emailRole.addToPolicy(policy)

    const emailSender = new lambda.Function(this,"EmailSenderLambda",{
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("./functions/consumerFunction/emailFunc"),
      handler: "main.handler",
      role: emailRole

    })

    const api = new apigw.RestApi(this,"SendEmailEndPoint")
    
    api.root
    .resourceForPath("sendmail")
    .addMethod("POST", new apigw.LambdaIntegration(emailSender))

    // logging api endpoint
    new cdk.CfnOutput(this,"Send Email EndPoint",{
      value: `${api.url}sendmail`
    })

    myTopic.addSubscription(new subscriptions.LambdaSubscription(emailSender,{
      deadLetterQueue: dlQueue,
      filterPolicy:{
        
      }
    }))

    //Creating Policy for sms lambda function
    const smsRole = new iam.Role(this,"RoleforsmsLambda",{
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")

    })

    const smspolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sns:*" , "logs:*"],
      resources: ["*"]
    })

    smsRole.addToPolicy(smspolicy)

    //Creating SMS LambdaFunction
    const smsSender = new lambda.Function(this,"SmsSenderLambda",{
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("./functions/consumerFunction/smsFunc"),
      handler: "main.handler",
      role: smsRole
    })

    myTopic.addSubscription(new subscriptions.LambdaSubscription(smsSender,{
      deadLetterQueue: dlQueue,
    }))

    myTopic.addSubscription(new subscriptions.SmsSubscription("+923151020319",{
      deadLetterQueue: dlQueue,

    }))

    //Deploying Frontend Gatsby Site

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket',{
      versioned: true
    } )

    // create a CDN to deploy your website

    const distribution = new cloudfront.Distribution(this,"Distribution",{
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket)
      },
      defaultRootObject: "index.html"
    })

    // Prints out the web endpoint to the terminal

    new cdk.CfnOutput(this,"DistributionDomainName",{
      value: distribution.domainName
    })

    new s3deploy.BucketDeployment(this,"DeployWebsie",{
      sources: [s3deploy.Source.asset("../frontend/public" )],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ["/*"],

    })



  }
}
