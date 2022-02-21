import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { TemporalService } from './temporal.service';

@Module({})
export class TemporalModule {
  /**
   * Registers a globally available configuration.
   *
   * @param config
   */
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: TemporalModule,
      providers: [],
      exports: [],
    };
  }

  static registerWorker(): DynamicModule {
    return {
      module: TemporalModule,
      imports: [TemporalModule.registerCore()],
      providers: [],
      exports: [],
    };
  }

  private static registerCore() {
    return {
      global: true,
      module: TemporalModule,
      imports: [DiscoveryModule],
      providers: [TemporalService, TemporalMetadataAccessor],
    };
  }
}
