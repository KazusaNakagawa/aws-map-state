import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as iam from 'aws-cdk-lib/aws-iam';


export class StepFunctionStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackName = this.stackName;
    const account = this.account;
    const region = this.region;
    const env = this.node.tryGetContext('env');

    const definitionJson = this.createFunction(env, account, region);
    this.createStateMachine(definitionJson, stackName);
  }

  private createFunction(env: string, account: string, region: string) {
    const loadConfigFunction = new lambda.Function(this, 'LoadConfigFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'load_config.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `LoadConfig-${env}`,
      timeout: cdk.Duration.seconds(30),
    });

    const processSchemaFunction = new lambda.Function(this, 'ProcessSchemaFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'process_schema.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `ProcessSchema-${env}`,
      timeout: cdk.Duration.seconds(60),
    });

    const aggregateResultsFunction = new lambda.Function(this, 'AggregateResultsFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'aggregate_results.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `AggregateResults-${env}`,
      timeout: cdk.Duration.seconds(30),
    });

    const notifySlackFunction = new lambda.Function(this, 'NotifySlackFunction', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'notify_slack.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambdas')),
      functionName: `NotifySlack-${env}`,
      timeout: cdk.Duration.seconds(30),
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
    return definitionJson;
  }

  private createStateMachine(definitionJson: string, stackName: string) { 
    // IAM Role for Step Function
    const stateMachineRole = new iam.Role(this, 'StateMachineRole', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    });
    stateMachineRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole')
    );
    // Create L2 StateMachine
    const stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definitionBody: sfn.DefinitionBody.fromString(definitionJson),
      role: stateMachineRole,
      stateMachineName: stackName,
    });

    // EventBridge Rule for triggering the State Machine
    const ruleRole = new iam.Role(this, 'EventBridgeRuleRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });
    ruleRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['states:StartExecution'],
        resources: [stateMachine.stateMachineArn],
      })
    );

    new events.Rule(this, 'RuleType1', {
      schedule: events.Schedule.expression('cron(*/10 * * * ? *)'),
      enabled: false,
      ruleName: `${stackName}-RuleType1`,
      targets: [
        new targets.SfnStateMachine(stateMachine, {
          input: events.RuleTargetInput.fromObject({
            category: 'type1',
            dt_date: '2021-01-01',
            schemas: ['schema1', 'schema2', 'schema3'],
          }),
          role: ruleRole,
        }),
      ],
    });
    new events.Rule(this, 'RuleType2', {
      schedule: events.Schedule.expression('cron(*/3 * * * ? *)'),
      enabled: false,
      ruleName: `${stackName}-RuleType2`,
      targets: [
        new targets.SfnStateMachine(stateMachine, {
          input: events.RuleTargetInput.fromObject({
            category: 'type2',
            dt_date: '2021-01-01',
            schemas: ['schema4', 'schema5'],
          }),
          role: ruleRole,
        }),
      ],
    });

    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: stateMachine.stateMachineArn,
    });
  }
}
