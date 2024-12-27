import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';


export function lambdaFunction(scope: Construct, env: string, account: string, region: string) {

  const layer = new lambda.LayerVersion(scope, 'PythonLayer', {
    code: lambda.Code.fromAsset(path.join(__dirname, '../layers/layer_content.zip')),
    layerVersionName: `PythonLayer-${env}`,
    compatibleRuntimes: [lambda.Runtime.PYTHON_3_12],
    description: 'Python dependencies',
  });

  const excludeLambda = [
    '.gitignore',
    '.pytest_cache',
    '.venv',
    '__pycache__',
    'requirements.test.txt',
    'tests',
  ]

  const loadConfigFunction = new lambda.Function(scope, 'LoadConfigFunction', {
    runtime: lambda.Runtime.PYTHON_3_12,
    handler: 'load_config.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas'),
      { exclude: excludeLambda }
    ),
    functionName: `LoadConfig-${env}`,
    timeout: cdk.Duration.seconds(30),
  });

  const processSchemaFunction = new lambda.Function(scope, 'ProcessSchemaFunction', {
    runtime: lambda.Runtime.PYTHON_3_12,
    handler: 'process_schema.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas'),
      { exclude: excludeLambda }
    ),
    functionName: `ProcessSchema-${env}`,
    timeout: cdk.Duration.seconds(60),
  });

  const processTablesFunction = new lambda.Function(scope, 'ProcessTablesFunction', {
    runtime: lambda.Runtime.PYTHON_3_12,
    handler: 'process_tables.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas'),
      { exclude: excludeLambda }
    ),
    layers: [layer],
    functionName: `ProcessTables-${env}`,
    timeout: cdk.Duration.seconds(30),
  });

  const aggrResultsFunction = new lambda.Function(scope, 'AggrResultsFunction', {
    runtime: lambda.Runtime.PYTHON_3_12,
    handler: 'aggr_results.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas'),
      { exclude: excludeLambda }
    ),
    functionName: `AggrResults-${env}`,
    timeout: cdk.Duration.seconds(30),
  });

  const notifySlackFunction = new lambda.Function(scope, 'NotifySlackFunction', {
    runtime: lambda.Runtime.PYTHON_3_12,
    handler: 'notify_slack.handler',
    code: lambda.Code.fromAsset(
      path.join(__dirname, '../lambdas'),
      { exclude: excludeLambda }
    ),
    layers: [layer],
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
      .replace('${ProcessTablesFunctionArn}', processTablesFunction.functionArn)
      .replace('${AggrResultsFunctionArn}', aggrResultsFunction.functionArn)
      .replace('${NotifySlackFunctionArn}', notifySlackFunction.functionArn)
  );
  const definitionJson = JSON.stringify(definitionObject);
  return definitionJson;
}
