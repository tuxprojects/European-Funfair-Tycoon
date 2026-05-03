import { ResearchProject } from './types';

export const RESEARCH_PROJECTS: ResearchProject[] = [
  {
    id: 'advanced_thrills_1',
    name: 'Advanced Thrills I',
    description: 'Unlocks higher intensity rides like the Bungee Jump and Slingshot.',
    cost: 100,
    tier: 1,
    unlocksRides: ['BUNGEE_JUMP', 'SLINGSHOT'],
    prerequisiteIds: []
  },
  {
    id: 'food_expansion_1',
    name: 'Gourmet Treats',
    description: 'Master the art of fast food. Unlocks Burger Joint and Pizza Parlor.',
    cost: 50,
    tier: 1,
    unlocksRides: ['BURGER_JOINT', 'PIZZA_PARLOR'],
    prerequisiteIds: []
  },
  {
    id: 'high_tech_rides',
    name: 'High Tech Attractions',
    description: 'State of the art engineering. Unlocks Enterprise and Top Spin.',
    cost: 200,
    tier: 2,
    unlocksRides: ['ENTERPRISE', 'TOP_SPIN'],
    prerequisiteIds: ['advanced_thrills_1']
  },
  {
    id: 'infrastructure_elite',
    name: 'Elite Infrastructure',
    description: 'Better facilities for your guests. Unlocks First Aid and ATM.',
    cost: 150,
    tier: 1,
    unlocksRides: ['FIRST_AID', 'ATM'],
    prerequisiteIds: []
  },
  {
    id: 'mega_rollercoasters',
    name: 'Mega Coasters',
    description: 'Giant machines of pure adrenaline. Unlocks Giant Wheel and Wooden Coaster.',
    cost: 500,
    tier: 3,
    unlocksRides: ['GIANT_WHEEL', 'WOODEN_COASTER'],
    prerequisiteIds: ['high_tech_rides']
  }
];

export const INITIAL_UNLOCKED_RIDES = [
  'TEA_CUPS', 'CAROUSEL', 'BUMPER_CARS', 'FERRIS_WHEEL', 'ROLLERCOASTER',
  'FOOD_STALL', 'RESTROOM', 'BENCH', 'HAUNTED_HOUSE', 'LOG_FLUME',
  'DROP_TOWER', 'SWING_RIDE', 'PIRATE_SHIP', 'COTTON_CANDY', 'ICE_CREAM',
  'WALTZER', 'HELTER_SKELTER', 'KIDDIE_COASTER', 'DUCK_POND', 'SHOOTING_GALLERY',
  'COCONUT_SHY', 'STRENGTH_TEST', 'PONY_TREK', 'CARAVAN', 'QUEUE_PATH',
  'TACO_TRUCK', 'SODA_FOUNTAIN', 'WHACK_A_MOLE', 'BASKETBALL_TOSS',
  'CLAW_MACHINE', 'INFO_KIOSK'
];
// Wait, I should probably check which ones are currently available in the shop to avoid locking everything by mistake.
// Let's look at RIDE_CONFIGS again.
