import { Injectable, Provider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { TemporalExplorer } from '../temporal.explorer';
import { TemporalMetadataAccessor } from '../temporal-metadata.accessors';
import {
  TEMPORAL_MODULE_OPTIONS_TOKEN,
  TemporalModuleOptions,
} from '../temporal.module-definition';
import { Activities, Activity } from '..';

describe('TemporalExplorer', () => {
  @Activities()
  class ActivityClass1 {
    @Activity()
    duplicateActivity() {}

    ignoredDuplicateMethod() {}
  }

  @Activities()
  class ActivityClass2 {
    @Activity()
    duplicateActivity() {}

    ignoredDuplicateMethod() {}
  }

  @Activities()
  class ActivityClass3 {
    @Activity()
    distinctMethod() {}
  }

  @Injectable()
  class ScheduleClient {
    readonly namespace = 'test-namespace';
  }

  // Mirrors a real activity that derives state from an injected dependency in
  // its constructor. It can only be built by the DI container.
  @Injectable()
  @Activities()
  class ActivityWithDependencies {
    private readonly namespace: string;

    constructor(scheduleClient: ScheduleClient) {
      this.namespace = scheduleClient.namespace;
    }

    @Activity()
    activityUsingDependency(): string {
      return this.namespace;
    }
  }

  // Activity classes are registered with the DI container the same way
  // consumers register them, and passed to the module options as the raw
  // classes rather than as pre-built instances.
  async function buildModule({
    options,
    providers = [],
  }: {
    options: Partial<TemporalModuleOptions>;
    providers?: Provider[];
  }) {
    return await Test.createTestingModule({
      providers: [
        DiscoveryService,
        TemporalExplorer,
        TemporalMetadataAccessor,
        Reflector,
        MetadataScanner,
        ...((options.activityClasses ?? []) as Provider[]),
        ...providers,
        {
          provide: TEMPORAL_MODULE_OPTIONS_TOKEN,
          useValue: {
            workerOptions: { taskQueue: 'test-queue' },
            ...options,
          },
        },
      ],
    }).compile();
  }

  describe('findDuplicateActivityMethods', () => {
    it('should not throw error when errorOnDuplicateActivities is false', async () => {
      const module = await buildModule({
        options: {
          activityClasses: [ActivityClass1, ActivityClass2],
          errorOnDuplicateActivities: false,
        },
      });
      const temporalExplorer = module.get(TemporalExplorer);

      expect(() =>
        temporalExplorer.findDuplicateActivityMethods(),
      ).not.toThrow();
    });

    it('should not throw error when no activity classes are provided', async () => {
      const module = await buildModule({
        options: {
          activityClasses: [],
          errorOnDuplicateActivities: true,
        },
      });
      const temporalExplorer = module.get(TemporalExplorer);

      expect(() =>
        temporalExplorer.findDuplicateActivityMethods(),
      ).not.toThrow();
    });

    it('should not throw error when there are no duplicate activity methods', async () => {
      const module = await buildModule({
        options: {
          activityClasses: [ActivityClass1, ActivityClass3],
          errorOnDuplicateActivities: true,
        },
      });
      const temporalExplorer = module.get(TemporalExplorer);

      expect(() =>
        temporalExplorer.findDuplicateActivityMethods(),
      ).not.toThrow();
    });

    it('should not throw error when an activity class depends on other providers', async () => {
      const module = await buildModule({
        options: {
          activityClasses: [ActivityWithDependencies],
          errorOnDuplicateActivities: true,
        },
        providers: [ScheduleClient],
      });
      const temporalExplorer = module.get(TemporalExplorer);

      expect(() =>
        temporalExplorer.findDuplicateActivityMethods(),
      ).not.toThrow();
    });

    it('should throw error when there are duplicate activity methods', async () => {
      const module = await buildModule({
        options: {
          activityClasses: [ActivityClass1, ActivityClass2],
          errorOnDuplicateActivities: true,
        },
      });
      const temporalExplorer = module.get(TemporalExplorer);

      // Both classes have ignoredDuplicateMethod() but it's not decorated with @Activity
      // Only duplicateActivity() is decorated, so it should still throw for that one
      expect(() => temporalExplorer.findDuplicateActivityMethods()).toThrow(
        'Activity names must be unique across all Activity classes. Identified activities with conflicting names: {"duplicateActivity":["ActivityClass1","ActivityClass2"]}',
      );
    });

    it('should handle multiple duplicate methods correctly', async () => {
      @Activities()
      class MultiDuplicateClass1 {
        @Activity()
        duplicate1() {}
        @Activity()
        duplicate2() {}
      }

      @Activities()
      class MultiDuplicateClass2 {
        @Activity()
        duplicate1() {}
        @Activity()
        duplicate2() {}
      }

      const module = await buildModule({
        options: {
          activityClasses: [MultiDuplicateClass1, MultiDuplicateClass2],
          errorOnDuplicateActivities: true,
        },
      });
      const temporalExplorer = module.get(TemporalExplorer);

      expect(() => temporalExplorer.findDuplicateActivityMethods()).toThrow(
        'Activity names must be unique across all Activity classes. Identified activities with conflicting names: {"duplicate1":["MultiDuplicateClass1","MultiDuplicateClass2"],"duplicate2":["MultiDuplicateClass1","MultiDuplicateClass2"]}',
      );
    });
  });

  describe('handleActivities', () => {
    it('should only register the activity classes named in the options', async () => {
      const module = await buildModule({
        options: { activityClasses: [ActivityClass3] },
        providers: [ActivityClass1],
      });
      const temporalExplorer = module.get(TemporalExplorer);

      expect(Object.keys(await temporalExplorer.handleActivities())).toEqual([
        'distinctMethod',
      ]);
    });

    it('should bind activities to the instance held by the DI container', async () => {
      const module = await buildModule({
        options: { activityClasses: [ActivityWithDependencies] },
        providers: [ScheduleClient],
      });
      const temporalExplorer = module.get(TemporalExplorer);

      const activities = await temporalExplorer.handleActivities();

      expect(activities.activityUsingDependency()).toBe('test-namespace');
    });
  });
});
