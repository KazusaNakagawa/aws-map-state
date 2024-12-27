import * as cdk from 'aws-cdk-lib';
import { lambdaFunction } from './lambda';
import { stateMachine } from './state-machine'


export class StepFunctionStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackName = this.stackName;
    const account = this.account;
    const region = this.region;
    const env = this.node.tryGetContext('env');

    const definitionJson = lambdaFunction(this, env, account, region);
    stateMachine(this, definitionJson, stackName);
  }
}
