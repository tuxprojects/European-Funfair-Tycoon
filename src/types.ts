export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

export type WeatherType = 'SUNNY' | 'CLOUDY' | 'RAINY' | 'SNOWY' | 'FREEZING' | 'STORMY';

export interface WeatherInfo {
  type: WeatherType;
  temperature: number;
  description: string;
  visitorMultiplier: number;
  canOpen: boolean;
}

export interface GameTime {
  hours: number;
  minutes: number;
  day: number;
  dayOfWeek: number; // 0-6 (0=Mon, 1=Tue, ..., 5=Sat, 6=Sun)
  season: Season;
  month: number; // 1-12
  dayOfMonth: number; // 1-10
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
  isPaused: boolean;
  musicVolume: number;
  sfxVolume: number;
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
  weatherProbabilities: Record<Season, Partial<Record<WeatherType, number>>>;
  x: number;
  y: number;
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
  currentWeather: WeatherInfo;
  settings: ParkSettings;
  company: CompanyInfo;
  cities: City[];
  currentMapSize: { width: number, height: number };
  finances: FinanceStats;
  dailyHistory: FinanceStats[]; // Last 7 days
  tutorialStep: number;
  showTutorial: boolean;
}

const DEFAULT_WEATHER_PROBABILITIES: Record<Season, Partial<Record<WeatherType, number>>> = {
  SPRING: { SUNNY: 0.4, CLOUDY: 0.3, RAINY: 0.2, STORMY: 0.1 },
  SUMMER: { SUNNY: 0.6, CLOUDY: 0.2, RAINY: 0.1, STORMY: 0.1 },
  AUTUMN: { SUNNY: 0.3, CLOUDY: 0.4, RAINY: 0.2, STORMY: 0.1 },
  WINTER: { SUNNY: 0.2, CLOUDY: 0.3, RAINY: 0.2, SNOWY: 0.2, FREEZING: 0.1 },
};

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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 0,
    y: 0
  },
  {
    id: 'manchester',
    name: 'Manchester',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 1500,
    description: 'A vibrant city in the north of England, known for its rain.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      AUTUMN: { SUNNY: 0.2, CLOUDY: 0.4, RAINY: 0.3, STORMY: 0.1 },
      WINTER: { SUNNY: 0.1, CLOUDY: 0.3, RAINY: 0.4, SNOWY: 0.1, FREEZING: 0.1 }
    },
    x: 0,
    y: 200
  },
  {
    id: 'birmingham',
    name: 'Birmingham',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 1200,
    description: 'The heart of the Midlands, with more canals than Venice.',
    mapWidth: 40,
    mapHeight: 35,
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 0,
    y: 100
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    country: 'UK',
    visitorMultiplier: 1.2,
    travelCost: 1800,
    description: 'A historic port city with a rich musical heritage.',
    mapWidth: 30,
    mapHeight: 40,
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: -50,
    y: 200
  },
  {
    id: 'glasgow',
    name: 'Glasgow',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 2500,
    description: 'A friendly Scottish city with a grand industrial past.',
    mapWidth: 45,
    mapHeight: 30,
    terrain: 'GRASS',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.1, CLOUDY: 0.2, RAINY: 0.4, SNOWY: 0.2, FREEZING: 0.1 }
    },
    x: 0,
    y: 400
  },
  {
    id: 'edinburgh',
    name: 'Edinburgh',
    country: 'UK',
    visitorMultiplier: 1.4,
    travelCost: 3000,
    description: 'The stunning Scottish capital, overlooked by its castle.',
    mapWidth: 30,
    mapHeight: 45,
    terrain: 'GRAVEL',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.1, CLOUDY: 0.2, RAINY: 0.3, SNOWY: 0.3, FREEZING: 0.1 }
    },
    x: 50,
    y: 400
  },
  {
    id: 'cardiff',
    name: 'Cardiff',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 2000,
    description: 'The capital of Wales, a modern city with a medieval heart.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: -100,
    y: 150
  },
  {
    id: 'belfast',
    name: 'Belfast',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 3500,
    description: 'A city of shipyards and history across the Irish Sea.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: -200,
    y: 300
  },
  {
    id: 'bristol',
    name: 'Bristol',
    country: 'UK',
    visitorMultiplier: 1.2,
    travelCost: 1600,
    description: 'A creative maritime city in the South West.',
    mapWidth: 40,
    mapHeight: 30,
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: -100,
    y: 100
  },
  {
    id: 'leeds',
    name: 'Leeds',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 1400,
    description: 'A major hub in Yorkshire with a bustling city center.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 50,
    y: 200
  },
  {
    id: 'newcastle',
    name: 'Newcastle',
    country: 'UK',
    visitorMultiplier: 1.1,
    travelCost: 2200,
    description: 'A legendary party city in the North East.',
    mapWidth: 35,
    mapHeight: 40,
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 50,
    y: 300
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 100,
    y: -200
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
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 300,
    y: -100
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
    terrain: 'GRAVEL',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      SUMMER: { SUNNY: 0.8, CLOUDY: 0.1, RAINY: 0.05, STORMY: 0.05 },
      WINTER: { SUNNY: 0.6, CLOUDY: 0.2, RAINY: 0.2 }
    },
    x: 500,
    y: -600
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
    terrain: 'GRASS',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.5, CLOUDY: 0.3, RAINY: 0.2 }
    },
    x: -200,
    y: -500
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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 250,
    y: -200
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 250,
    y: 0
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 200,
    y: -100
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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 200,
    y: -80
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
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 220,
    y: -200
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 220,
    y: -150
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
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 200,
    y: 0
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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 280,
    y: -100
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
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 260,
    y: -150
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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 240,
    y: -50
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 200,
    y: -90
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 190,
    y: -90
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
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 180,
    y: -90
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 195,
    y: -90
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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 195,
    y: -110
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 150,
    y: -150
  },
  {
    id: 'rome',
    name: 'Rome',
    country: 'Italy',
    visitorMultiplier: 1.5,
    travelCost: 4500,
    description: 'The Eternal City, where history comes alive.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'GRAVEL',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      SUMMER: { SUNNY: 0.8, CLOUDY: 0.1, RAINY: 0.1, STORMY: 0.0 },
      WINTER: { SUNNY: 0.4, CLOUDY: 0.3, RAINY: 0.3, SNOWY: 0.0, FREEZING: 0.0 }
    },
    x: 300,
    y: -500
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'Spain',
    visitorMultiplier: 1.4,
    travelCost: 4200,
    description: 'A vibrant capital with world-class art and culture.',
    mapWidth: 45,
    mapHeight: 35,
    terrain: 'ASPHALT',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      SUMMER: { SUNNY: 0.9, CLOUDY: 0.05, RAINY: 0.05, STORMY: 0.0 }
    },
    x: 0,
    y: -500
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    visitorMultiplier: 1.3,
    travelCost: 3800,
    description: 'A city of canals, bicycles, and artistic heritage.',
    mapWidth: 35,
    mapHeight: 45,
    terrain: 'GRASS',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      AUTUMN: { SUNNY: 0.2, CLOUDY: 0.4, RAINY: 0.3, STORMY: 0.1 }
    },
    x: 150,
    y: -50
  },
  {
    id: 'vienna',
    name: 'Vienna',
    country: 'Austria',
    visitorMultiplier: 1.4,
    travelCost: 4800,
    description: 'The city of music and imperial grandeur.',
    mapWidth: 40,
    mapHeight: 40,
    terrain: 'GRAVEL',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.2, CLOUDY: 0.3, RAINY: 0.2, SNOWY: 0.2, FREEZING: 0.1 }
    },
    x: 350,
    y: -250
  },
  {
    id: 'prague',
    name: 'Prague',
    country: 'Czech Republic',
    visitorMultiplier: 1.3,
    travelCost: 4000,
    description: 'The City of a Hundred Spires, magical and historic.',
    mapWidth: 35,
    mapHeight: 40,
    terrain: 'GRAVEL',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.2, CLOUDY: 0.3, RAINY: 0.1, SNOWY: 0.3, FREEZING: 0.1 }
    },
    x: 320,
    y: -180
  },
  {
    id: 'warsaw',
    name: 'Warsaw',
    country: 'Poland',
    visitorMultiplier: 1.2,
    travelCost: 3500,
    description: 'A resilient city with a mix of modern and historic charm.',
    mapWidth: 45,
    mapHeight: 35,
    terrain: 'ASPHALT',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.2, CLOUDY: 0.2, RAINY: 0.1, SNOWY: 0.4, FREEZING: 0.1 }
    },
    x: 450,
    y: -100
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    country: 'Sweden',
    visitorMultiplier: 1.3,
    travelCost: 5500,
    description: 'A beautiful city spread across fourteen islands.',
    mapWidth: 40,
    mapHeight: 30,
    terrain: 'GRASS',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.1, CLOUDY: 0.2, RAINY: 0.1, SNOWY: 0.5, FREEZING: 0.1 }
    },
    x: 400,
    y: 200
  },
  {
    id: 'oslo',
    name: 'Oslo',
    country: 'Norway',
    visitorMultiplier: 1.2,
    travelCost: 5800,
    description: 'A city surrounded by fjords and forests.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'GRASS',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.1, CLOUDY: 0.2, RAINY: 0.1, SNOWY: 0.5, FREEZING: 0.1 }
    },
    x: 300,
    y: 300
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    visitorMultiplier: 1.3,
    travelCost: 5200,
    description: 'A cozy capital known for its design and hygge.',
    mapWidth: 35,
    mapHeight: 35,
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 300,
    y: 100
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
    terrain: 'GRAVEL',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.05, CLOUDY: 0.15, RAINY: 0.05, SNOWY: 0.5, FREEZING: 0.25 }
    },
    x: 500,
    y: 300
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
    terrain: 'GRASS',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      SPRING: { SUNNY: 0.3, CLOUDY: 0.3, RAINY: 0.3, STORMY: 0.1 },
      AUTUMN: { SUNNY: 0.2, CLOUDY: 0.4, RAINY: 0.3, STORMY: 0.1 }
    },
    x: -200,
    y: 200
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
    terrain: 'ASPHALT',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.2, CLOUDY: 0.2, RAINY: 0.1, SNOWY: 0.3, FREEZING: 0.2 }
    },
    x: 220,
    y: -250
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
    terrain: 'GRAVEL',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 400,
    y: -250
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
    terrain: 'GRASS',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 550,
    y: -300
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
    terrain: 'ASPHALT',
    weatherProbabilities: { ...DEFAULT_WEATHER_PROBABILITIES },
    x: 250,
    y: -400
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
    terrain: 'ASPHALT',
    weatherProbabilities: {
      ...DEFAULT_WEATHER_PROBABILITIES,
      WINTER: { SUNNY: 0.6, CLOUDY: 0.3, RAINY: 0.1 }
    },
    x: 100,
    y: -500
  }
];

export interface Position {
  x: number;
  y: number;
}

export type RideCategory = 'RIDE' | 'FOOD' | 'FACILITY';

export type RideIntensity = 'GENTLE' | 'THRILL' | 'EXTREME' | 'NONE';

export type RideType = 'TEA_CUPS' | 'CAROUSEL' | 'FERRIS_WHEEL' | 'ROLLERCOASTER' | 'BUMPER_CARS' | 'FOOD_STALL' | 'RESTROOM' | 'BENCH' | 'HAUNTED_HOUSE' | 'LOG_FLUME' | 'DROP_TOWER' | 'SWING_RIDE' | 'PIRATE_SHIP' | 'COTTON_CANDY' | 'ICE_CREAM' | 'BUNGEE_JUMP' | 'SLINGSHOT' | 'TOP_SPIN' | 'ENTERPRISE' | 'WALTZER' | 'HELTER_SKELTER' | 'KIDDIE_COASTER' | 'PONY_TREK' | 'CARAVAN';

export interface RideConfig {
  type: RideType;
  category: RideCategory;
  intensity: RideIntensity;
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
    intensity: 'GENTLE',
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
    intensity: 'GENTLE',
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
    intensity: 'THRILL',
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
    intensity: 'GENTLE',
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
    intensity: 'EXTREME',
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
    intensity: 'NONE',
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
    intensity: 'NONE',
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
    intensity: 'NONE',
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
    intensity: 'THRILL',
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
    intensity: 'THRILL',
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
    intensity: 'EXTREME',
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
    intensity: 'GENTLE',
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
    intensity: 'THRILL',
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
    intensity: 'NONE',
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
    intensity: 'NONE',
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
  },
  BUNGEE_JUMP: {
    type: 'BUNGEE_JUMP',
    category: 'RIDE',
    intensity: 'EXTREME',
    name: 'Bungee Jump',
    cost: 12000,
    baseIncome: 15,
    baseCapacity: 2,
    width: 2,
    height: 2,
    color: '#00FF00',
    icon: '🧗',
    buildTimeHours: 6,
    electricityCost: 5
  },
  SLINGSHOT: {
    type: 'SLINGSHOT',
    category: 'RIDE',
    intensity: 'EXTREME',
    name: 'Slingshot',
    cost: 18000,
    baseIncome: 20,
    baseCapacity: 2,
    width: 2,
    height: 3,
    color: '#FF8C00',
    icon: '🚀',
    buildTimeHours: 10,
    electricityCost: 50
  },
  TOP_SPIN: {
    type: 'TOP_SPIN',
    category: 'RIDE',
    intensity: 'EXTREME',
    name: 'Top Spin',
    cost: 9500,
    baseIncome: 12,
    baseCapacity: 20,
    width: 4,
    height: 3,
    color: '#800080',
    icon: '🔄',
    buildTimeHours: 8,
    electricityCost: 35
  },
  ENTERPRISE: {
    type: 'ENTERPRISE',
    category: 'RIDE',
    intensity: 'THRILL',
    name: 'Enterprise',
    cost: 7500,
    baseIncome: 9,
    baseCapacity: 24,
    width: 4,
    height: 4,
    color: '#4169E1',
    icon: '🎡',
    buildTimeHours: 7,
    electricityCost: 25
  },
  WALTZER: {
    type: 'WALTZER',
    category: 'RIDE',
    intensity: 'THRILL',
    name: 'Waltzer',
    cost: 4500,
    baseIncome: 7,
    baseCapacity: 16,
    width: 3,
    height: 3,
    color: '#DC143C',
    icon: '🌀',
    buildTimeHours: 5,
    electricityCost: 15
  },
  HELTER_SKELTER: {
    type: 'HELTER_SKELTER',
    category: 'RIDE',
    intensity: 'GENTLE',
    name: 'Helter Skelter',
    cost: 2800,
    baseIncome: 5,
    baseCapacity: 10,
    width: 2,
    height: 2,
    color: '#FFD700',
    icon: '🗼',
    buildTimeHours: 4,
    electricityCost: 2
  },
  KIDDIE_COASTER: {
    type: 'KIDDIE_COASTER',
    category: 'RIDE',
    intensity: 'GENTLE',
    name: 'Kiddie Coaster',
    cost: 3500,
    baseIncome: 5,
    baseCapacity: 8,
    width: 4,
    height: 3,
    color: '#90EE90',
    icon: '🎢',
    buildTimeHours: 6,
    electricityCost: 15
  },
  PONY_TREK: {
    type: 'PONY_TREK',
    category: 'RIDE',
    intensity: 'GENTLE',
    name: 'Pony Trek',
    cost: 2200,
    baseIncome: 4,
    baseCapacity: 6,
    width: 5,
    height: 2,
    color: '#DEB887',
    icon: '🐎',
    buildTimeHours: 4,
    electricityCost: 0
  },
  CARAVAN: {
    type: 'CARAVAN',
    category: 'FACILITY',
    intensity: 'NONE',
    name: 'Staff Caravan',
    cost: 1500,
    baseIncome: 0,
    baseCapacity: 4, // 4 staff can rest at once
    width: 3,
    height: 2,
    color: '#F5F5DC',
    icon: '🚐',
    buildTimeHours: 3,
    electricityCost: 5
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
  isStaffResting?: boolean;
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
  preferredIntensity: RideIntensity;
  thoughts: string[];
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
  stamina: number; // 0-100
  state: 'WORKING' | 'RESTING' | 'IDLE';
  restingAtId?: string; // ID of the caravan they are resting in
}
