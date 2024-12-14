#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StepFunctionStack } from '../lib/aws-map-state-stack';

const app = new cdk.App();

/* Get the context parameter for environment */
const env = app.node.tryGetContext('env');
if (!env) {
  throw new Error('Please provide env parameter');
}

const _ = new StepFunctionStack(app, `StepFunctionStack-${env}`, {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();
