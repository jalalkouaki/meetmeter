import { Person, RoleTier } from '../types';

export interface MeetingCostState {
  elapsedSeconds: number;
  liveCost: number;
  costPerMinute: number;
  costPerSecond: number;
  plannedBudget: number;
  isOvertime: boolean;
  overtimeSeconds: number;
  overtimeCost: number;
  budgetPercentage: number; // 0 to 100+
  statusColor: 'green' | 'amber' | 'red';
}

/**
 * Calculates loaded hourly rate for a person given base rate and overhead multiplier.
 */
export function getLoadedRate(baseRate: number, overheadMultiplier: number = 1.3): number {
  return baseRate * overheadMultiplier;
}

/**
 * Calculates aggregate burn rate per minute and per second for selected attendees.
 */
export function calculateBurnRates(
  attendees: Person[],
  overheadMultiplier: number = 1.3
): { perHour: number; perMinute: number; perSecond: number } {
  const perHour = attendees.reduce((sum, person) => {
    return sum + getLoadedRate(person.base_hourly_rate, overheadMultiplier);
  }, 0);

  const perMinute = perHour / 60;
  const perSecond = perHour / 3600;

  return { perHour, perMinute, perSecond };
}

/**
 * Calculates the planned budget for a given planned duration (in minutes).
 */
export function calculatePlannedBudget(
  attendees: Person[],
  plannedMinutes: number,
  overheadMultiplier: number = 1.3
): number {
  const { perMinute } = calculateBurnRates(attendees, overheadMultiplier);
  return perMinute * plannedMinutes;
}

/**
 * Evaluates live meeting cost and budget status.
 */
export function evaluateCostState(
  elapsedSeconds: number,
  plannedMinutes: number,
  burnRates: { perHour: number; perMinute: number; perSecond: number }
): MeetingCostState {
  const plannedSeconds = plannedMinutes * 60;
  const liveCost = elapsedSeconds * burnRates.perSecond;
  const plannedBudget = plannedMinutes * burnRates.perMinute;

  const isOvertime = elapsedSeconds > plannedSeconds;
  const overtimeSeconds = isOvertime ? elapsedSeconds - plannedSeconds : 0;
  const overtimeCost = overtimeSeconds * burnRates.perSecond;

  const budgetPercentage = plannedBudget > 0 ? (liveCost / plannedBudget) * 100 : 0;

  let statusColor: 'green' | 'amber' | 'red' = 'green';
  if (budgetPercentage > 100 || isOvertime) {
    statusColor = 'red';
  } else if (budgetPercentage >= 50) {
    statusColor = 'amber';
  } else {
    statusColor = 'green';
  }

  return {
    elapsedSeconds,
    liveCost,
    costPerMinute: burnRates.perMinute,
    costPerSecond: burnRates.perSecond,
    plannedBudget,
    isOvertime,
    overtimeSeconds,
    overtimeCost,
    budgetPercentage,
    statusColor,
  };
}

/**
 * Calculates "Could Have Been An Email" score based on attendee count, duration, overtime and ROI.
 */
export function calculateEmailScore(
  durationMinutes: number,
  plannedMinutes: number,
  attendeeCount: number,
  category: string,
  roiRating: number | null = null
): number {
  let score = 30; // base score

  // Status updates have high email potential
  if (category === 'Status Update') score += 25;
  if (category === '1-on-1') score -= 15;
  if (category === 'Brainstorm') score -= 10;

  // Large meetings with many people
  if (attendeeCount > 6) score += 20;
  else if (attendeeCount > 4) score += 10;

  // Overtime penalty
  if (durationMinutes > plannedMinutes) {
    const overtimeRatio = (durationMinutes - plannedMinutes) / plannedMinutes;
    score += Math.min(25, overtimeRatio * 30);
  }

  // Low ROI rating
  if (roiRating !== null) {
    if (roiRating <= 2) score += 20;
    if (roiRating >= 4) score -= 20;
  }

  return Math.min(99, Math.max(5, Math.round(score)));
}
