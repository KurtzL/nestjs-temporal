<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

# nestjs-temporal

[Temporal](https://github.com/temporalio/sdk-typescript) module for [Nest](https://github.com/nestjs/nest).

## Quick start

```ts
import { Module } from '@nestjs/common';
import { TemporalModule } from 'nestjs-temporal';

@Module({
  imports: [
    TemporalModule.forRoot({
      taskQueue: 'default',
      workflowsPath: require.resolve('./temporal/workflow'),
    }),
    
    TemporalModule.registerClient(),
  ],
})
export class AppModule {}
```

```ts
import { Injectable } from '@nestjs/common';
import { Activities, Activity } from 'nestjs-temporal';
import { ActivityInterface } from '@temporalio/activity';

@Injectable()
@Activities()
export class GreetingActivity {
  constructor() {}

  @Activity()
  async greeting(name: string): Promise<string> {
    return 'Hello ' + name;
  }
}

export interface IGreetingActivity extends ActivityInterface {
  greeting(name: string): Promise<string>;
}
```

```ts
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import { IGreetingActivity } from '../activities';

const { greeting, reverseGreeting } = proxyActivities<IGreetingActivity>({
  startToCloseTimeout: '1 minute',
});

export async function example(name: string): Promise<string> {
  return await greeting(name);
}
```

```ts
import { Controller, Post } from '@nestjs/common';
import { Connection, WorkflowClient } from '@temporalio/client';
import { InjectTemporalClient } from 'nestjs-temporal';

@Controller()
export class AppController {
  constructor(
    @InjectTemporalClient() private readonly temporalClient: WorkflowClient,
  ) {}

  @Post()
  async greeting() {
    const handle = await this.temporalClient.start('example', {
      args: ['Temporal'],
      taskQueue: 'default',
      workflowId: 'wf-id-' + Math.floor(Math.random() * 1000),
    });
    console.log(`Started workflow ${handle.workflowId}`);
  }
}
```

## Advanced Options

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TemporalModule } from 'nestjs-temporal';
import { bundleWorkflowCode, NativeConnection, Runtime } from '@temporalio/worker';
import * as path from 'path';

@Module({
  imports: [
    TempModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        Runtime.install({});
        const temporalHost = config.get('app.temporalHost');
        const connection = await NativeConnection.connect({
          address: temporalHost,
        });
        const workflowBundle = await bundleWorkflowCode({
          workflowsPath: path.join(__dirname, './workflows'),
        });

        return {
          connection,
          taskQueue: 'default',
          workflowBundle,
        };
      },
    }),
  ],
})
export class AppModule {}
```

## People

- Author - [Zegue kurt](https://github.com/KurtzL)
- Contributor - [Surya Prashanth](https://github.com/Prashant-Surya)
- Contributor - [AmirSaber Sharifi](https://github.com/amirsaber)
- Contributor - [J.D Nicholls](https://github.com/jdnichollsc)

## License

Nest is [MIT licensed](https://github.com/KurtzL/nestjs-temporal/blob/main/LICENCE).
