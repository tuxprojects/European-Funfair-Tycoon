export interface GameTime {
  hours: number;
  minutes: number;
  day: number;
  dayOfWeek: number; // 0-6 (0=Mon, 1=Tue, ..., 5=Sat, 6=Sun)
}

export interface PricingSettings {
  ticketPrice: number; // Price per ride
  wristbandPrice: number; // All day access
  seasonPassPrice: number; // Lifetime access (for current city stay)
  bundlePrice: number; // 5 rides for the price of X
  bundleSize: number; // Number of rides in a bundle
}

export interface ParkSettings {
  openTime: number; // 0-23
  closeTime: number; // 0-23
  isManuallyClosed: boolean;
  pricing: PricingSettings;
}

export type TerrainType = 'GRASS' | 'ASPHALT' | 'GRAVEL';

export interface City {
  id: string;
  name: string;
  country: string;
  visitorMultiplier: number;
  travelCost: number;
  description: string;
  mapWidth: number;
  mapHeight: number;
  terrain: TerrainType;
}

export interface CompanyInfo {
  name: string;
  currentCityId: string;
  homeCityId?: string;
  warehouseLevel: number;
}

export interface FinanceStats {
  income: {
    tickets: number;
    wristbands: number;
    seasonPasses: number;
    bundles: number;
    food: number;
    other: number;
  };
  expenses: {
    wages: number;
    electricity: number;
    rent: number;
    maintenance: number;
    other: number;
  };
  visitorStats: {
    totalVisitors: number;
    avgHappiness: number;
    avgSpend: number;
  };
}

export interface GameState {
  money: number;
  rides: RideInstance[];
  inventory: RideInstance[];
  staff: StaffInstance[];
  visitors: Visitor[];
  time: GameTime;
  settings: ParkSettings;
  company: CompanyInfo;
  cities: City[];
  currentMapSize: { width: number, height: number };
  finances: FinanceStats;
  dailyHistory: FinanceStats[]; // Last 7 days
  tutorialStep: number;
  showTutorial: boolean;
}

export const CITIES: City[] = [
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    visitorMultiplier: 1.2,
    travelCost: 0,
    description: 'A classic park in the heart of London.',
    mapWidth: 40,
    mapHeight: 30,
    terrain: 'GRASS'
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    visitorMultiplier: 1.5,
    travelCost: 5000,
    description: 'An elegant urban plaza in Paris.',
    mapWidth: 30,
    mapHeight: 30,
    terrain: 'ASPHALT'
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    visitorMultiplier: 1.1,
    travelCost: 3000,
    description: 'A gritty industrial space in Berlin.',
    mapWidth: 50,
    mapHeight: 25,
    terrain: 'GRAVEL'
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    visitorMultiplier: 1.4,
    travelCost: 6000,
    description: 'Historic cobblestone square in Rome.',
    mapWidth: 25,
    mapHeight: 40,
    terrain: 'ASPHALT'
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    visitorMultiplier: 1.3,
    travelCost: 4500,
    description: 'Sun-drenched park in Madrid.',
    mapWidth: 45,
    mapHeight: 35,
    terrain: 'GRASS'
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    visitorMultiplier: 1.6,
    travelCost: 7000,
    description: 'Compact canal-side lot in Amsterdam.',
    mapWidth: 20,
    mapHeight: 50,
    terrain: 'ASPHALT'
  },
  {
    id: 'vienna',
    name: 'Vienna',
    country: 'Austria',
    visitorMultiplier: 1.2,
    travelCost: 4000,
    description: 'Grand imperial grounds in Vienna.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'GRASS'
  },
  {
    id: 'warsaw',
    name: 'Warsaw',
    country: 'Poland',
    visitorMultiplier: 1.1,
    travelCost: 2500,
    description: 'Reconstructed historic plaza in Warsaw.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'GRAVEL'
  },
  {
    id: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    visitorMultiplier: 1.4,
    travelCost: 5500,
    description: 'Medieval square in the heart of Prague.',
    mapWidth: 30,
    mapHeight: 45,
    terrain: 'ASPHALT'
  },
  {
    id: 'athens',
    name: 'Athens',
    country: 'Greece',
    visitorMultiplier: 1.5,
    travelCost: 6500,
    description: 'Ancient dusty grounds near the Acropolis.',
    mapWidth: 50,
    mapHeight: 30,
    terrain: 'GRAVEL'
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    country: 'Sweden',
    visitorMultiplier: 1.3,
    travelCost: 8000,
    description: 'Clean, modern waterfront in Stockholm.',
    mapWidth: 35,
    mapHeight: 25,
    terrain: 'ASPHALT'
  },
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    visitorMultiplier: 1.2,
    travelCost: 5000,
    description: 'Coastal terrace in Lisbon.',
    mapWidth: 30,
    mapHeight: 35,
    terrain: 'GRASS'
  },
  {
    id: 'munich',
    name: 'Munich',
    country: 'Germany',
    visitorMultiplier: 1.8,
    travelCost: 9000,
    description: 'Home of the world-famous Oktoberfest.',
    mapWidth: 50,
    mapHeight: 50,
    terrain: 'GRASS'
  },
  {
    id: 'hamburg',
    name: 'Hamburg',
    country: 'Germany',
    visitorMultiplier: 1.6,
    travelCost: 7500,
    description: 'Host of the massive Hamburger Dom funfair.',
    mapWidth: 45,
    mapHeight: 45,
    terrain: 'ASPHALT'
  },
  {
    id: 'cologne',
    name: 'Cologne',
    country: 'Germany',
    visitorMultiplier: 1.5,
    travelCost: 6000,
    description: 'Vibrant fairgrounds by the Rhine river.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'ASPHALT'
  },
  {
    id: 'dusseldorf',
    name: 'Düsseldorf',
    country: 'Germany',
    visitorMultiplier: 1.7,
    travelCost: 8500,
    description: 'Home to the "Biggest Fair on the Rhine".',
    mapWidth: 45,
    mapHeight: 40,
    terrain: 'GRASS'
  },
  {
    id: 'stuttgart',
    name: 'Stuttgart',
    country: 'Germany',
    visitorMultiplier: 1.6,
    travelCost: 7000,
    description: 'Cannstatter Wasen, a huge traditional festival.',
    mapWidth: 40,
    mapHeight: 45,
    terrain: 'GRAVEL'
  },
  {
    id: 'frankfurt',
    name: 'Frankfurt',
    country: 'Germany',
    visitorMultiplier: 1.4,
    travelCost: 5500,
    description: 'Dippemess fairgrounds in the financial hub.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT'
  },
  {
    id: 'bremen',
    name: 'Bremen',
    country: 'Germany',
    visitorMultiplier: 1.3,
    travelCost: 4000,
    description: 'Historic Freimarkt, one of Germany\'s oldest fairs.',
    mapWidth: 30,
    mapHeight: 40,
    terrain: 'GRAVEL'
  },
  {
    id: 'leipzig',
    name: 'Leipzig',
    country: 'Germany',
    visitorMultiplier: 1.2,
    travelCost: 3500,
    description: 'The Kleinmesse fairgrounds in eastern Germany.',
    mapWidth: 35,
    mapHeight: 30,
    terrain: 'GRASS'
  },
  {
    id: 'nuremberg',
    name: 'Nuremberg',
    country: 'Germany',
    visitorMultiplier: 1.4,
    travelCost: 5000,
    description: 'Traditional Volksfest in a historic setting.',
    mapWidth: 40,
    mapHeight: 35,
    terrain: 'GRAVEL'
  },
  {
    id: 'hanover',
    name: 'Hanover',
    country: 'Germany',
    visitorMultiplier: 1.3,
    travelCost: 4500,
    description: 'Host of the world\'s largest marksmen\'s fair.',
    mapWidth: 45,
    mapHeight: 35,
    terrain: 'GRASS'
  },
  {
    id: 'dortmund',
    name: 'Dortmund',
    country: 'Germany',
    visitorMultiplier: 1.4,
    travelCost: 5000,
    description: 'Industrial heartland with a love for funfairs.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'ASPHALT'
  },
  {
    id: 'essen',
    name: 'Essen',
    country: 'Germany',
    visitorMultiplier: 1.2,
    travelCost: 3000,
    description: 'Urban space in the densely populated Ruhr area.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT'
  },
  {
    id: 'duisburg',
    name: 'Duisburg',
    country: 'Germany',
    visitorMultiplier: 1.1,
    travelCost: 2500,
    description: 'Riverside fairgrounds in an industrial setting.',
    mapWidth: 30,
    mapHeight: 30,
    terrain: 'GRAVEL'
  },
  {
    id: 'bochum',
    name: 'Bochum',
    country: 'Germany',
    visitorMultiplier: 1.1,
    travelCost: 2000,
    description: 'Friendly local fair in the Ruhr region.',
    mapWidth: 30,
    mapHeight: 25,
    terrain: 'ASPHALT'
  },
  {
    id: 'wuppertal',
    name: 'Wuppertal',
    country: 'Germany',
    visitorMultiplier: 1.1,
    travelCost: 2200,
    description: 'Fairgrounds near the famous suspension railway.',
    mapWidth: 25,
    mapHeight: 35,
    terrain: 'GRASS'
  },
  {
    id: 'brussels',
    name: 'Brussels',
    country: 'Belgium',
    visitorMultiplier: 1.4,
    travelCost: 5500,
    description: 'The Foire du Midi in the heart of Europe.',
    mapWidth: 35,
    mapHeight: 40,
    terrain: 'ASPHALT'
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    visitorMultiplier: 1.7,
    travelCost: 8000,
    description: 'Home to the historic Tivoli Gardens.',
    mapWidth: 30,
    mapHeight: 30,
    terrain: 'GRASS'
  },
  {
    id: 'oslo',
    name: 'Oslo',
    country: 'Norway',
    visitorMultiplier: 1.3,
    travelCost: 9000,
    description: 'Modern waterfront space in the north.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT'
  },
  {
    id: 'helsinki',
    name: 'Helsinki',
    country: 'Finland',
    visitorMultiplier: 1.2,
    travelCost: 8500,
    description: 'Cool, clean Nordic fairgrounds.',
    mapWidth: 30,
    mapHeight: 30,
    terrain: 'GRAVEL'
  },
  {
    id: 'dublin',
    name: 'Dublin',
    country: 'Ireland',
    visitorMultiplier: 1.3,
    travelCost: 6000,
    description: 'Lively green space in the Irish capital.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'GRASS'
  },
  {
    id: 'zurich',
    name: 'Zurich',
    country: 'Switzerland',
    visitorMultiplier: 1.5,
    travelCost: 9500,
    description: 'High-end lakeside fairgrounds.',
    mapWidth: 30,
    mapHeight: 30,
    terrain: 'ASPHALT'
  },
  {
    id: 'budapest',
    name: 'Budapest',
    country: 'Hungary',
    visitorMultiplier: 1.4,
    travelCost: 5000,
    description: 'Grand fairgrounds by the Danube.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'GRAVEL'
  },
  {
    id: 'bucharest',
    name: 'Bucharest',
    country: 'Romania',
    visitorMultiplier: 1.2,
    travelCost: 4000,
    description: 'Spacious parks in the "Little Paris".',
    mapWidth: 45,
    mapHeight: 45,
    terrain: 'GRASS'
  },
  {
    id: 'milan',
    name: 'Milan',
    country: 'Italy',
    visitorMultiplier: 1.5,
    travelCost: 7000,
    description: 'Fashionable fairgrounds in northern Italy.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT'
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'Spain',
    visitorMultiplier: 1.6,
    travelCost: 7500,
    description: 'Sun-soaked plaza near the Mediterranean.',
    mapWidth: 40,
    mapHeight: 30,
    terrain: 'ASPHALT'
  }
];

export interface Position {
  x: number;
  y: number;
}

export type RideCategory = 'RIDE' | 'FOOD' | 'FACILITY';

export type RideType = 'TEA_CUPS' | 'CAROUSEL' | 'FERRIS_WHEEL' | 'ROLLERCOASTER' | 'BUMPER_CARS' | 'FOOD_STALL' | 'RESTROOM' | 'BENCH' | 'HAUNTED_HOUSE' | 'LOG_FLUME' | 'DROP_TOWER' | 'SWING_RIDE' | 'PIRATE_SHIP' | 'COTTON_CANDY' | 'ICE_CREAM';

export interface RideConfig {
  type: RideType;
  category: RideCategory;
  name: string;
  cost: number;
  baseIncome: number;
  baseCapacity: number;
  width: number; // in grid cells
  height: number; // in grid cells
  color: string;
  icon: string;
  buildTimeHours: number;
  electricityCost: number; // per hour
}

export const RIDE_CONFIGS: Record<RideType, RideConfig> = {
  TEA_CUPS: {
    type: 'TEA_CUPS',
    category: 'RIDE',
    name: 'Tea Cups',
    cost: 500,
    baseIncome: 3,
    baseCapacity: 4,
    width: 2,
    height: 2,
    color: '#FFD700',
    icon: '☕',
    buildTimeHours: 2,
    electricityCost: 5
  },
  CAROUSEL: {
    type: 'CAROUSEL',
    category: 'RIDE',
    name: 'Carousel',
    cost: 1200,
    baseIncome: 4,
    baseCapacity: 8,
    width: 3,
    height: 3,
    color: '#FF69B4',
    icon: '🎠',
    buildTimeHours: 4,
    electricityCost: 8
  },
  BUMPER_CARS: {
    type: 'BUMPER_CARS',
    category: 'RIDE',
    name: 'Bumper Cars',
    cost: 2500,
    baseIncome: 6,
    baseCapacity: 6,
    width: 5,
    height: 3,
    color: '#1E90FF',
    icon: '🚗',
    buildTimeHours: 6,
    electricityCost: 15
  },
  FERRIS_WHEEL: {
    type: 'FERRIS_WHEEL',
    category: 'RIDE',
    name: 'Ferris Wheel',
    cost: 5000,
    baseIncome: 8,
    baseCapacity: 16,
    width: 4,
    height: 5,
    color: '#ADFF2F',
    icon: '🎡',
    buildTimeHours: 8,
    electricityCost: 12
  },
  ROLLERCOASTER: {
    type: 'ROLLERCOASTER',
    category: 'RIDE',
    name: 'Rollercoaster',
    cost: 15000,
    baseIncome: 10,
    baseCapacity: 12,
    width: 8,
    height: 4,
    color: '#FF4500',
    icon: '🎢',
    buildTimeHours: 12,
    electricityCost: 40
  },
  FOOD_STALL: {
    type: 'FOOD_STALL',
    category: 'FOOD',
    name: 'Hot Dog Stand',
    cost: 800,
    baseIncome: 5,
    baseCapacity: 2,
    width: 2,
    height: 2,
    color: '#FFA500',
    icon: '🌭',
    buildTimeHours: 2,
    electricityCost: 10
  },
  RESTROOM: {
    type: 'RESTROOM',
    category: 'FACILITY',
    name: 'Restroom',
    cost: 1000,
    baseIncome: 0,
    baseCapacity: 4,
    width: 2,
    height: 2,
    color: '#F0F8FF',
    icon: '🚻',
    buildTimeHours: 3,
    electricityCost: 2
  },
  BENCH: {
    type: 'BENCH',
    category: 'FACILITY',
    name: 'Park Bench',
    cost: 100,
    baseIncome: 0,
    baseCapacity: 2,
    width: 1,
    height: 1,
    color: '#8B4513',
    icon: '🪑',
    buildTimeHours: 1,
    electricityCost: 0
  },
  HAUNTED_HOUSE: {
    type: 'HAUNTED_HOUSE',
    category: 'RIDE',
    name: 'Haunted House',
    cost: 4000,
    baseIncome: 7,
    baseCapacity: 10,
    width: 4,
    height: 4,
    color: '#4B0082',
    icon: '👻',
    buildTimeHours: 6,
    electricityCost: 10
  },
  LOG_FLUME: {
    type: 'LOG_FLUME',
    category: 'RIDE',
    name: 'Log Flume',
    cost: 8000,
    baseIncome: 9,
    baseCapacity: 15,
    width: 6,
    height: 3,
    color: '#00CED1',
    icon: '🛶',
    buildTimeHours: 10,
    electricityCost: 25
  },
  DROP_TOWER: {
    type: 'DROP_TOWER',
    category: 'RIDE',
    name: 'Drop Tower',
    cost: 6000,
    baseIncome: 8,
    baseCapacity: 12,
    width: 2,
    height: 2,
    color: '#FF0000',
    icon: '🗼',
    buildTimeHours: 8,
    electricityCost: 30
  },
  SWING_RIDE: {
    type: 'SWING_RIDE',
    category: 'RIDE',
    name: 'Swing Ride',
    cost: 3000,
    baseIncome: 5,
    baseCapacity: 20,
    width: 4,
    height: 4,
    color: '#DA70D6',
    icon: '🎪',
    buildTimeHours: 5,
    electricityCost: 12
  },
  PIRATE_SHIP: {
    type: 'PIRATE_SHIP',
    category: 'RIDE',
    name: 'Pirate Ship',
    cost: 3500,
    baseIncome: 6,
    baseCapacity: 24,
    width: 5,
    height: 2,
    color: '#708090',
    icon: '🏴‍☠️',
    buildTimeHours: 6,
    electricityCost: 18
  },
  COTTON_CANDY: {
    type: 'COTTON_CANDY',
    category: 'FOOD',
    name: 'Cotton Candy',
    cost: 600,
    baseIncome: 4,
    baseCapacity: 1,
    width: 2,
    height: 2,
    color: '#FFB6C1',
    icon: '🍭',
    buildTimeHours: 2,
    electricityCost: 5
  },
  ICE_CREAM: {
    type: 'ICE_CREAM',
    category: 'FOOD',
    name: 'Ice Cream Truck',
    cost: 700,
    baseIncome: 4,
    baseCapacity: 1,
    width: 2,
    height: 2,
    color: '#FFFACD',
    icon: '🍦',
    buildTimeHours: 2,
    electricityCost: 8
  }
};

export type RideStatus = 'OPERATIONAL' | 'MAINTENANCE' | 'BROKEN' | 'CONSTRUCTING' | 'DISMANTLING';

export interface RideInstance {
  id: string;
  type: RideType;
  x: number;
  y: number;
  level: number;
  price: number;
  currentVisitors: number;
  lastIncomeTime: number;
  status: RideStatus;
  condition: number; // 0-100
  isPlaced: boolean;
  buildProgress: number; // 0-100
  operatorId?: string;
  mechanicId?: string;
  avgWaitTime: number; // in game minutes
  satisfaction: number; // 0-100
  totalVisitorsServed: number;
  totalHappinessGained: number;
}

export interface Visitor {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'WANDERING' | 'QUEUING' | 'RIDING' | 'LEAVING' | 'EATING' | 'USING_FACILITY' | 'RESTING';
  targetRideId?: string;
  happiness: number;
  money: number;
  stamina: number; // 0-100, decreases over time
  hunger: number; // 0-100, increases over time
  bladder: number; // 0-100, increases over time
  timeEntered: number; // Timestamp when they entered
  color: string;
  preferredRideTypes: RideType[];
  hasWristband: boolean;
  hasSeasonPass: boolean;
  remainingBundleRides: number;
}

export const GRID_SIZE = 40;

export type StaffType = 'JANITOR' | 'MECHANIC' | 'VENDOR' | 'OPERATOR' | 'SECURITY';

export interface StaffConfig {
  type: StaffType;
  name: string;
  baseSalary: number;
  description: string;
  icon: string;
}

export const STAFF_CONFIGS: Record<StaffType, StaffConfig> = {
  OPERATOR: {
    type: 'OPERATOR',
    name: 'Ride Operator',
    baseSalary: 15, // per hour
    description: 'Required to run rides. Higher level increases ride safety.',
    icon: '👤'
  },
  MECHANIC: {
    type: 'MECHANIC',
    name: 'Mechanic',
    baseSalary: 25,
    description: 'Repairs rides and reduces wear and tear.',
    icon: '🔧'
  },
  JANITOR: {
    type: 'JANITOR',
    name: 'Janitor',
    baseSalary: 12,
    description: 'Keeps the park clean, improving visitor happiness.',
    icon: '🧹'
  },
  SECURITY: {
    type: 'SECURITY',
    name: 'Security Guard',
    baseSalary: 18,
    description: 'Ensures safety and prevents happiness from dropping too fast.',
    icon: '👮'
  },
  VENDOR: {
    type: 'VENDOR',
    name: 'Vendor',
    baseSalary: 14,
    description: 'Increases secondary income from visitors.',
    icon: '🍦'
  }
};

export interface StaffInstance {
  id: string;
  type: StaffType;
  level: number;
  salary: number;
  hiredTime: number;
  lastPaidTime: number;
  assignedRideId?: string;
  happiness: number; // 0-100
}
