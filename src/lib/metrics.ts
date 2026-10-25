import { OpportunityMetric } from '../types';

export function convertOpportunityCost(
  costInUSD: number,
  metric: OpportunityMetric,
  focusHourRate: number = 75
): { value: string; unit: string; label: string } {
  switch (metric) {
    case 'focus_hours': {
      const hours = costInUSD / (focusHourRate || 75);
      return {
        value: hours.toFixed(1),
        unit: 'hrs',
        label: 'Engineering Focus Capacity',
      };
    }
    case 'support_hours': {
      const hours = costInUSD / 35; // Standard Tier-1/2 Support loaded rate
      return {
        value: hours.toFixed(1),
        unit: 'hrs',
        label: 'Operations & Support Hours',
      };
    }
    case 'money':
    default:
      return {
        value: costInUSD.toFixed(2),
        unit: '$',
        label: 'Real-Time Labor Cost',
      };
  }
}
