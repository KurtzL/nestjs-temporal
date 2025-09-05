import { Reflector } from '@nestjs/core';

import { TemporalMetadataAccessor } from '../temporal-metadata.accessors';
import { Activities, Activity } from '..';

describe('TemporalMetadataAccessor', () => {
  let temporalMetadataAccessor: TemporalMetadataAccessor;

  beforeAll(() => {
    temporalMetadataAccessor = new TemporalMetadataAccessor(new Reflector());
  });

  describe('isActivities', () => {
    it('should return true if the given class contains activity', () => {
      @Activities()
      class ActivitiesClass {}
      expect(temporalMetadataAccessor.isActivities(ActivitiesClass)).toBe(true);
    });
    it('should return false if the given class is not contains activity', () => {
      class NoActivitiesClass {}
      expect(temporalMetadataAccessor.isActivity(NoActivitiesClass)).toBe(
        false,
      );
    });
  });

  describe('getActivities', () => {
    it('should return given activities metadata', () => {
      const opts = { name: 'test' };
      @Activities(opts)
      class ActivitiesClass {
        activityMethod() {}
      }
      expect(
        temporalMetadataAccessor.getActivities(ActivitiesClass),
      ).toStrictEqual(opts);
    });
  });

  describe('isActivity', () => {
    it('should return true if the given class contains activity', () => {
      class ActivitiesClass {
        @Activity()
        activityMethod() {}
      }
      const activitiesClass = new ActivitiesClass();

      expect(
        temporalMetadataAccessor.isActivity(activitiesClass.activityMethod),
      ).toBe(true);
    });
    it('should return false if the given class is not contains activity', () => {
      class NoActivitiesClass {
        activityMethod() {}
      }
      const noActivitiesClass = new NoActivitiesClass();
      expect(
        temporalMetadataAccessor.isActivity(noActivitiesClass.activityMethod),
      ).toBe(false);
    });
  });

  describe('getActivity', () => {
    it('should return given activity metadata', () => {
      const opts = { name: 'test' };

      class ActivitiesClass {
        @Activity(opts)
        activityMethod() {}
      }
      const activitiesClass = new ActivitiesClass();
      expect(
        temporalMetadataAccessor.getActivity(activitiesClass.activityMethod),
      ).toBe(opts);
    });
  });
});
