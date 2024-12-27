import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import { Construct} from 'constructs';


export function stateMachine(scope: Construct, definitionJson: string, stackName: string) { 
  // IAM Role for Step Function
  const stateMachineRole = new iam.Role(scope, 'StateMachineRole', {
    assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
  });
  stateMachineRole.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole')
  );
  // Create L2 StateMachine
  const stateMachine = new sfn.StateMachine(scope, 'StateMachine', {
    definitionBody: sfn.DefinitionBody.fromString(definitionJson),
    role: stateMachineRole,
    stateMachineName: stackName,
  });

  // EventBridge Rule for triggering the State Machine
  const ruleRole = new iam.Role(scope, 'EventBridgeRuleRole', {
    assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
  });
  ruleRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['states:StartExecution'],
      resources: [stateMachine.stateMachineArn],
    })
  );

  new events.Rule(scope, 'RuleType1', {
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
  new events.Rule(scope, 'RuleType2', {
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

  new cdk.CfnOutput(scope, 'StateMachineArn', {
    value: stateMachine.stateMachineArn,
  });
}