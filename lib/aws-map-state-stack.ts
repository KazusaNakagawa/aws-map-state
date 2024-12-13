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

    // 環境変数の取得
    const account = this.account; // デプロイ時のアカウント
    const region = this.region;   // デプロイ時のリージョン

    // Lambda関数の定義
    const loadConfigFunction = new lambda.Function(this, 'LoadConfigFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'load_config.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: 'LoadConfig',
    });

    const processSchemaFunction = new lambda.Function(this, 'ProcessSchemaFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'process_schema.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: 'ProcessSchema',
    });

    const aggregateResultsFunction = new lambda.Function(this, 'AggregateResultsFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'aggregate_results.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: 'AggregateResults',
    });

    const notifySlackFunction = new lambda.Function(this, 'NotifySlackFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'notify_slack.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: 'NotifySlack',
    });

    const yamlDefinition = fs.readFileSync(
      path.join(__dirname, '../stepfunctions/workflow.yaml'),
      'utf8'
    );

    // YAMLをオブジェクトに変換
    let definitionObject = yaml.parse(yamlDefinition);

    // プレースホルダー置換
    definitionObject = JSON.parse(
      JSON.stringify(definitionObject)
        .replace(/\${account}/g, account)
        .replace(/\${region}/g, region)
        .replace('${LoadConfigFunctionArn}', loadConfigFunction.functionArn)
        .replace('${ProcessSchemaFunctionArn}', processSchemaFunction.functionArn)
        .replace('${AggregateResultsFunctionArn}', aggregateResultsFunction.functionArn)
        .replace('${NotifySlackFunctionArn}', notifySlackFunction.functionArn)
    );

    // JSON文字列化
    const definitionJson = JSON.stringify(definitionObject);

    // IAMロールの作成
    const stateMachineRole = new iam.Role(this, 'StateMachineRole', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'), // Step Functionsがこのロールを利用
    });

    // 必要なポリシーをアタッチ
    stateMachineRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'));

    // Step Functions ステートマシンの作成
    const stateMachine = new sfn.CfnStateMachine(this, 'StateMachine', {
      roleArn: stateMachineRole.roleArn, // 作成したロールのARNを指定
      definitionString: definitionJson,
    });

    // 出力
    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.attrArn,
    });
  }
}
