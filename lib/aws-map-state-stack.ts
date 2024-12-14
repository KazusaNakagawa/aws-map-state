import * as yaml from 'yaml';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';
import * as path from 'path';

export class StepFunctionStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackName = this.stackName;
    const account = this.account;
    const region = this.region;
    const env = this.node.tryGetContext('env');

    this.createStepFunction(env, account, region, stackName);
  }

  private createStepFunction(env: string, account: string, region: string, stackName: string) {
    const loadConfigFunction = new lambda.Function(this, 'LoadConfigFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'load_config.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `LoadConfig-${env}`,
    });

    const processSchemaFunction = new lambda.Function(this, 'ProcessSchemaFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'process_schema.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `ProcessSchema-${env}`,
    });

    const aggregateResultsFunction = new lambda.Function(this, 'AggregateResultsFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'aggregate_results.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `AggregateResults-${env}`,
    });

    const notifySlackFunction = new lambda.Function(this, 'NotifySlackFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'notify_slack.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `NotifySlack-${env}`,
    });

    const yamlDefinition = fs.readFileSync(
      path.join(__dirname, '../stepfunctions/workflow.yaml'),
      'utf8'
    );
    let definitionObject = yaml.parse(yamlDefinition);
    // replace variables in the definition
    definitionObject = JSON.parse(
      JSON.stringify(definitionObject)
        .replace(/\${account}/g, account)
        .replace(/\${region}/g, region)
        .replace(/\${env}/g, env)
        .replace('${LoadConfigFunctionArn}', loadConfigFunction.functionArn)
        .replace('${ProcessSchemaFunctionArn}', processSchemaFunction.functionArn)
        .replace('${AggregateResultsFunctionArn}', aggregateResultsFunction.functionArn)
        .replace('${NotifySlackFunctionArn}', notifySlackFunction.functionArn)
    );
    const definitionJson = JSON.stringify(definitionObject);

    // create IAM role for Step Functions
    const stateMachineRole = new iam.Role(this, 'StateMachineRole', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    });

    // 必要なポリシーをアタッチ
    stateMachineRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'));

    // Step Functions ステートマシンの作成
    const stateMachine = new sfn.CfnStateMachine(this, 'StateMachine', {
      roleArn: stateMachineRole.roleArn,
      definitionString: definitionJson,
      stateMachineName: stackName,
    });

    // 出力
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.attrArn,
    });
  }
}
