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
  describe('findDuplicateActivityMethods', () => {
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

    async function buildModule({
      options,
    }: {
      options: Partial<TemporalModuleOptions>;
    }) {
      if (options.activityClasses) {
        options.activityClasses = options.activityClasses.map(
          (classOrWrapper) => {
            return { instance: new (classOrWrapper as any)() };
          },
        );
      }

      return await Test.createTestingModule({
        providers: [
          DiscoveryService,
          TemporalExplorer,
          TemporalMetadataAccessor,
          Reflector,
          MetadataScanner,
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
});
