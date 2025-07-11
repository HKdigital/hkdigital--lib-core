// > Units

export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;

// > Fixed length intervals

export const HOURLY = 'hourly';
export const DAILY = 'daily';
export const WEEKLY = 'weekly';
export const TWO_WEEKLY = 'two-weekly';
export const FOUR_WEEKLY = 'four-weekly';

export const INTERVALS_MS = {
  [HOURLY]: HOUR_MS,
  [DAILY]: DAY_MS,
  [WEEKLY]: WEEK_MS,
  [TWO_WEEKLY]: WEEK_MS * 2,
  [FOUR_WEEKLY]: WEEK_MS * 4
};

// > Offsets

export const TIME_2025_01_01 = 1577836800000; // 2020-01-01T00:00:00.000Z
// export const TIME_2100_01_01 = 4102444800000; // 2100-01-01T00:00:00.000Z
