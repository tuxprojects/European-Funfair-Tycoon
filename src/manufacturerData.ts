import { Manufacturer } from './types';

export const MANUFACTURERS: Manufacturer[] = [
  {
    id: 'ironworks',
    name: 'Ironworks Attractions',
    description: 'Rugged, reliable, but heavy. Their machines rarely break down.',
    reliabilityBonus: 1.5,
    costMultiplier: 1.2
  },
  {
    id: 'skyline',
    name: 'Skyline Engineering',
    description: 'Precision engineering and sleek designs. High performance at a premium.',
    reliabilityBonus: 1.2,
    costMultiplier: 1.5
  },
  {
    id: 'vintage',
    name: 'Vintage Carousel Co.',
    description: 'Traditional craftsmanship. Beautiful machines that require constant oiling.',
    reliabilityBonus: 0.8,
    costMultiplier: 0.9
  },
  {
    id: 'budget_rides',
    name: 'Budget Rides Inc.',
    description: 'Mass-produced and affordable. You get what you pay for.',
    reliabilityBonus: 0.6,
    costMultiplier: 0.7
  },
  {
    id: 'future_fun',
    name: 'Future Fun Labs',
    description: 'Experimental technology. Cutting edge thrills, if you can afford the repairs.',
    reliabilityBonus: 1.0,
    costMultiplier: 1.3
  }
];
