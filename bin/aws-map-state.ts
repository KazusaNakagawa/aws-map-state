#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { StepFunctionStack } from '../lib/aws-map-state-stack';

const app = new cdk.App();

new StepFunctionStack(app, 'StepFunctionStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
