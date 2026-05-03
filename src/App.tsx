import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './gameEngine';
import { RIDE_CONFIGS, RideType, RideIntensity, GRID_SIZE, STAFF_CONFIGS, StaffType, RideCategory, CITIES, GARAGE_CONFIGS, TRUCK_COST, GameState, Achievement, TravelForm, REGION_OPERATING_MONTHS } from './types';
import { 
  Truck,
  Warehouse,
  Coins, 
  Users, 
  Handshake,
  ArrowRightLeft,
  Plus, 
  TrendingUp, 
  Info, 
  Map as MapIcon,
  Package,
  MousePointer2,
  Settings,
  Globe,
  Building2,
  X,
  Plane,
  Save,
  Trash2,
  Wrench,
  Play,
  Square,
  FastForward,
  ChevronLeft,
  AlertCircle,
  Briefcase,
  GraduationCap,
  DollarSign,
  Smile,
  Frown,
  Meh,
  ShoppingBag,
  Coffee,
  Tent,
  Ticket,
  Layout,
  CreditCard,
  UserPlus,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
  Home,
  CheckCircle,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  List,
  Target,
  Trophy,
  Wallet,
  Gem,
  FlaskConical,
  Lock,
  LayoutDashboard,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  Flag,
  ArrowLeft,
  Palette,
  Edit2,
  Star,
  Factory,
  FileText,
  Check,
  Landmark,
  Shield,
  Utensils,
  Clock,
  ChevronRight,
  PlaneTakeoff,
  Minus,
  Activity,
} from 'lucide-react';
import { RESEARCH_PROJECTS, INITIAL_UNLOCKED_RIDES } from './researchData';
import { MANUFACTURERS } from './manufacturerData';
import { ACHIEVEMENTS } from './achievementData';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

import { audioService } from './audioService';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar',
  'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep',
  'Oct', 'Nov', 'Dec'
];

const ENGLISH_TRANSLATIONS: Record<string, string> = {
  marketplace: 'Marketplace',
  operations_group: 'Operations',
  logistics_group: 'Logistics',
  finance_group: 'Finance',
  career_group: 'Career',
  career_hub: 'Career Hub',
  administration: 'Administration',
  financials_tab: 'Financials',
  management_hub: 'Management Hub',
  active_obligations: 'Active Obligations',
  available_liquidity: 'Available Liquidity',
  system_group: 'System',
  management: 'Management',
  inventory: 'Inventory',
  shop: 'Shop',
  travel: 'Travel',
  staff: 'Staff',
  budget: 'Budget',
  settings: 'Settings',
  open_park: 'Open Park',
  close_park: 'Close Park',
  park_closed: 'Park is Closed',
  park_open: 'Park is Open',
  money: 'Money',
  visitors: 'Visitors',
  happiness: 'Happiness',
  day: 'Day',
  weather: 'Weather',
  travel_to: 'Travel to',
  achievements: 'Achievements',
  total_achievements_unlocked: 'Total achievements unlocked once',
  business_permit: 'Business Permit',
  travel_permit_form: 'Travel Registration',
  target_city: 'Target Destination',
  purpose_of_stay: 'Primary Purpose of Stay',
  insurance_tier: 'Insurance Coverage',
  stay_duration: 'Expected Stay Duration',
  owner_signature: 'Company Owner Signature',
  register_travel: 'Authorize Travel',
  reason_expansion: 'Business Expansion',
  reason_event: 'Temporary Event',
  reason_cultural: 'Cultural Exchange',
  reason_trade: 'Commercial Trade',
  funfair_area_rental: 'Funfair Area Selection',
  tier_community: 'Community Lot',
  tier_prime: 'Prime Lot',
  tier_vip: 'VIP Square',
  days: 'Days',
  sign_here: 'Sign your name here...',
  details_tab: 'Details',
  back_to_territories: 'Back to Territories',
  cities_lower: 'cities',
  explore_territory: 'Explore Territory',
  headquarters: 'Headquarters',
  demand: 'Demand',
  area: 'Area',
  gross_revenue: 'Gross Revenue',
  operating_expenses: 'Operating Expenses',
  payroll: 'Payroll',
  utilities: 'Utilities',
  rent: 'Rent',
  concessions: 'Concessions',
  miscellaneous: 'Miscellaneous',
  total_revenue: 'Total Revenue',
  total_overhead: 'Total Overhead',
  daily_net_income: 'Daily Net Income',
  ARPU: 'ARPU',
  credit_facility: 'Credit Facility',
  days_limit: 'Days Limit',
  interest_short: 'Int.',
  daily_repayment: 'Daily Repayment',
  original_debt: 'Original Debt',
  settle_full_debt: 'Settle Full Debt',
  financial_ledger: 'Financial Ledger',
  daily_accounting: 'Daily Accounting',
  historical_yield: 'Historical Yield',
  audit_recorded: 'Audit Recorded',
  net_daily: 'Net Daily',
  remaining_debt: 'Remaining Debt',
  accept: 'Accept',
  pay_off: 'Pay Off',
  achievements_and_challenges: 'Achievements & Challenges',
  active_milestones: 'Active Milestones',
  unlocked_accolades: 'Unlocked Accolades',
  reward: 'Reward',
  progress: 'Progress',
  wristbands: 'Wristbands',
  season_passes: 'Season Passes',
  achievement_first_stop_name: 'First Stop',
  achievement_first_stop_desc: 'Travel to your first city.',
  achievement_millionaire_name: 'Millionaire',
  achievement_millionaire_desc: 'Reach a total career earnings of $1,000,000.',
  achievement_crowd_magnet_name: 'Crowd Magnet',
  achievement_crowd_magnet_desc: 'Have 500 visitors in the park at once.',
  achievement_research_pioneer_name: 'Research Pioneer',
  achievement_research_pioneer_desc: 'Complete 5 research projects.',
  achievement_safety_first_name: 'Safety First',
  achievement_safety_first_desc: 'Keep all active rides above 90% condition for 5 days.',
  achievement_continental_tour_name: 'Continental Tour',
  achievement_continental_tour_desc: 'Visit 5 different countries.',
  achievement_rollercoaster_tycoon_name: 'Rollercoaster Tycoon',
  achievement_rollercoaster_tycoon_desc: 'Have at least 3 rollercoasters in your park at once.',
  achievement_foodie_paradise_name: 'Foodie Paradise',
  achievement_foodie_paradise_desc: 'Have at least 5 different food stalls in your park.',
  achievement_workaholic_name: 'Workaholic',
  achievement_workaholic_desc: 'Reach 100 days in a single career.',
  achievement_high_roller_name: 'High Roller',
  achievement_high_roller_desc: 'Purchase an expensive high-end attraction.',
  achievement_first_ride_name: 'Small Beginnings',
  achievement_first_ride_desc: 'Purchase your very first attraction.',
  achievement_staff_hero_name: 'Team Leader',
  achievement_staff_hero_desc: 'Hire 10 staff members at once.',
  achievement_unlocked_title: 'Achievement Unlocked!',
  current_location: 'Current Location',
  home_city: 'Home City',
  dismantle_first: 'Dismantle First',
  island_locked: 'Island Locked',
  apply_now: 'Apply Now',
  total_income: 'Total Income',
  total_expenses: 'Total Expenses',
  net_profit: 'Net Profit',
  language: 'Language',
  music_volume: 'Music Volume',
  sfx_volume: 'SFX Volume',
  reset_game: 'Reset Game',
  confirm_reset: 'Are you sure you want to reset? All progress will be lost.',
  cancel: 'Cancel',
  confirm: 'Confirm',
  park_management: 'Park Management',
  launch_company: 'Launch Company',
  continue_game: 'Continue Existing Game',
  reset_game_confirm: 'Reset Game?',
  yes_reset: 'Yes, Reset',
  back_to_travel: 'Back to Travel List',
  city_center_obstacles: 'City Center Obstacles',
  cloudy: 'Cloudy',
  stormy: 'Stormy',
  needs: 'Needs',
  hunger: 'Hunger',
  bladder: 'Bladder',
  stamina: 'Stamina',
  recent_thoughts: 'Recent Thoughts',
  no_thoughts: 'No thoughts yet...',
  sell: 'Sell',
  deselect: 'Deselect',
  park_stats: 'Park Stats',
  warehouse: 'Warehouse',
  balance: 'Balance',
  exit_zoning: 'Exit Zoning',
  zoning_mode: 'Zoning Mode',
  open_ride_shop: 'Open Ride Shop',
  insufficient_funds: 'Insufficient Funds',
  no_truck_available: 'No Truck Available',
  warehouse_full: 'Warehouse Full',
  purchase_item: 'Purchase Item',
  available_balance: 'Available Balance',
  select_item_to_add: 'Select an item to add it to your inventory',
  company_name: 'Company Name',
  loans: 'Loans',
  daily_net_profit: 'Daily Net Profit',
  visitor_insights: 'Visitor Insights',
  avg_happiness: 'Avg. Happiness',
  avg_spend: 'Avg. Spend',
  recent_performance: 'Recent Performance',
  park_operations: 'Park Operations',
  manual_override: 'Manual Override',
  total_visitors: 'Total Visitors',
  operating_hours: 'Operating Hours',
  operating_season: 'Operating Season',
  open_time: 'Open Time',
  close_time: 'Close Time',
  visitor_demand: 'Visitor Demand',
  standard_entry: 'Standard Entry',
  single_ride_ticket: 'Single Ride Ticket',
  ride_bundle: 'Ride Bundle',
  premium_passes: 'Premium Passes',
  all_day_wristband: 'All-Day Wristband',
  season_pass: 'Season Pass',
  pricing_strategy_tip: 'Pricing Strategy Tip',
  warehouse_capacity: 'Warehouse Capacity',
  warehouse_level: 'Warehouse Level',
  total_staff: 'Total Staff',
  employees: 'Employees',
  morale: 'Morale',
  hourly_payroll: 'Hourly Payroll',
  per_hour: 'per hour',
  recruitment_center: 'Recruitment Center',
  base_salary: 'Base Salary',
  hiring_fee: 'Hiring Fee',
  hire_staff: 'Hire Staff',
  your_team: 'Your Team',
  total_hourly_wage: 'Total Hourly Wage',
  no_staff_hired: 'No staff members currently hired',
  risk_of_quitting: 'Risk of Quitting',
  assigned: 'Assigned',
  upgrade_garage: 'Upgrade Garage',
  max_level_reached: 'Max Level Reached',
  buy_new_truck: 'Buy New Truck',
  cost: 'Cost',
  garage_full: 'Garage Full',
  buy_truck: 'Buy Truck',
  your_trucks: 'Your Trucks',
  transporting: 'Transporting',
  idle: 'Idle',
  no_trucks_in_garage: 'No trucks in your garage',
  travel_to_new_cities: 'Travel to New Cities',
  search_placeholder: 'Search...',
  name: 'Name',
  population: 'Population',
  travel_cost: 'Travel Cost',
  multiplier: 'Multiplier',
  visitors_label: 'Visitors',
  travel_label: 'Travel',
  size: 'Size',
  available_loan_offers: 'Available Loan Offers',
  day_term: 'Day Term',
  income_today: 'Income (Today)',
  ride_tickets: 'Ride Tickets',
  wristbands_label: 'Wristbands',
  season_passes_label: 'Season Passes',
  ticket_bundles: 'Ticket Bundles',
  food_drinks: 'Food & Drinks',
  other_label: 'Other',
  expenses_today: 'Expenses (Today)',
  staff_wages: 'Staff Wages',
  electricity: 'Electricity',
  loan_interest: 'Loan Interest',
  loan_principal: 'Loan Principal',
  area_rent: 'Area Rent',
  maintenance_label: 'Maintenance',
  upgrade_label: 'Upgrade',
  stored_attractions: 'Stored Attractions',
  warehouse_empty: 'Your warehouse is empty.',
  items_available: 'items available',
  condition_label: 'Condition',
  place_label: 'Place',
  working_label: 'WORKING',
  resting_label: 'RESTING',
  idle_label: 'IDLE',
  lvl_label: 'LVL',
  travel_button: 'Travel',
  home_city_label: 'Home City',
  sound_effects: 'Sound Effects',
  of_potential: 'of potential',
  price_demand_warning: 'Higher prices reduce visitor spawn rate',
  resume_game: 'Resume Game',
  pause_game: 'Pause Game',
  level_label: 'Level',
  status_label: 'Status',
  wait_time: 'Wait Time',
  ticket_price: 'Ticket Price',
  satisfaction_label: 'Satisfaction',
  staff_resting: 'STAFF RESTING',
  repair_button: 'Repair',
  item_price: 'Item Price',
  service_price: 'Service Price',
  too_expensive_warning: 'Visitors might think this is too expensive!',
  fair_price_label: 'A fair price for everyone.',
  dismantle_button: 'Dismantle',
  visitor_label: 'Visitor',
  no_items_message: 'No {intensity} items',
  place_instruction: 'Click on the grid to place your',
  cancel_button: 'Cancel',
  tutorial_step_label: 'Tutorial Step {step}/20',
  skip_button: 'Skip',
  tutorial_title_0: 'Place your first ride',
  tutorial_title_1: 'Create a Truck Zone',
  tutorial_title_2: 'Hire a Ride Operator',
  tutorial_title_3: 'Open the Park',
  tutorial_title_4: 'Earn your first $500',
  tutorial_title_5: 'Build a Food Stall',
  tutorial_title_6: 'Reach 50 Visitors',
  tutorial_title_7: 'Hire a Janitor',
  tutorial_title_8: 'Take a Loan',
  tutorial_title_9: 'Reach 100 Visitors',
  tutorial_title_10: 'Start Research',
  tutorial_title_11: 'Hire a Mechanic',
  tutorial_title_12: 'Increase Ticket Price',
  tutorial_title_13: 'Upgrade Warehouse',
  tutorial_title_14: 'Customise a Ride',
  tutorial_title_15: 'Hire Security',
  tutorial_title_16: 'Buy a New Truck',
  tutorial_title_17: 'Reach 100 Research Points',
  tutorial_title_18: 'Travel to New City',
  tutorial_title_19: 'Become a Tycoon',
  tutorial_desc_0: 'Open your inventory and place the Tea Cups ride near the entrance.',
  tutorial_desc_1: "Select the Zone Tool, choose 'Truck Zone', and draw an area for your trucks.",
  tutorial_desc_2: 'Click on your Tea Cups ride and hire an operator to start running it.',
  tutorial_desc_3: 'Open the Management Panel and toggle the Park Status to Open.',
  tutorial_desc_4: 'Watch the visitors arrive and earn money until your balance reaches $2,500.',
  tutorial_desc_5: 'Visitors get hungry! Place a Hot Dog Stall from your inventory.',
  tutorial_desc_6: 'Keep your park attractive and wait until you have 50 visitors at once.',
  tutorial_desc_7: 'A clean park is a happy park! Go to Management > Staff and hire a Janitor.',
  tutorial_desc_8: 'Need more cash? Go to Management > Loans and take out a Small Business Loan.',
  tutorial_desc_9: 'Grow your park with more rides and stalls to attract 100 visitors simultaneously.',
  tutorial_desc_10: 'Go to Research and select a project to start researching new attractions.',
  tutorial_desc_11: 'Rides break down! Hire a Mechanic in the Staff panel to keep them running.',
  tutorial_desc_12: 'Maximise profits by increasing the single ride Ticket Price to $7 in Pricing.',
  tutorial_desc_13: 'Need more storage? Upgrade your Warehouse to Level 2 in Management.',
  tutorial_desc_14: 'Select an active ride and give it a custom name or unique color.',
  tutorial_desc_15: 'Keep visitors safe and happy by hiring a Security Guard in the Staff panel.',
  tutorial_desc_16: 'Go to the Garage and purchase an additional truck for faster transport.',
  tutorial_desc_17: 'Collect more Research Points by having active visitors in your park.',
  tutorial_desc_18: 'Ready for a new market? Go to Travel and move your park to another city.',
  tutorial_desc_19: 'The ultimate goal! Reach $10,000 in total career earnings.',
  reset_confirm_desc: 'This will permanently delete your current company and all progress. This action cannot be undone.',
  weather_sunny: 'Sunny',
  weather_cloudy: 'Cloudy',
  weather_rainy: 'Rainy',
  weather_snowy: 'Snowy',
  weather_freezing: 'Freezing',
  weather_stormy: 'Stormy',
  weather_desc_sunny: 'A beautiful sunny day!',
  weather_desc_cloudy: 'A bit cloudy, but fine for a funfair.',
  weather_desc_rainy: 'Rainy day. Some guests might stay home.',
  weather_desc_snowy: 'Heavy snow! The park must remain closed.',
  weather_desc_freezing: 'Freezing cold! Too dangerous to open.',
  weather_desc_stormy: 'Severe storm! Safety first, park is closed.',
  season_spring: 'Spring',
  season_summer: 'Summer',
  season_autumn: 'Autumn',
  season_winter: 'Winter',
  month_0: 'January',
  month_1: 'February',
  month_2: 'March',
  month_3: 'April',
  month_4: 'May',
  month_5: 'June',
  month_6: 'July',
  month_7: 'August',
  month_8: 'September',
  month_9: 'October',
  month_10: 'November',
  month_11: 'December',
  day_0: 'Sunday',
  day_1: 'Monday',
  day_2: 'Tuesday',
  day_3: 'Wednesday',
  day_4: 'Thursday',
  day_5: 'Friday',
  research_tab: 'Research',
  challenges_tab: 'Challenges',
  loyalty_index: 'Loyalty Index',
  status_offline: 'Offline',
  status_linked: 'Linked',
  auto_dispatch: 'Auto Dispatch',
  crew_assignment: 'Crew Assignment',
  operator_unit: 'Operator Unit',
  vendor_unit: 'Vendor Unit',
  primary_hue: 'Primary Hue',
  custom_identifier: 'Custom Identifier',
  spec_customization: 'Spec Customization',
  energy_reserve: 'Energy Reserve',
  bladder_pressure: 'Bladder Pressure',
  metabolic_hunger: 'Metabolic Hunger',
  biometric_readout: 'Biometric Readout',
  current_task: 'Current Task',
  status_active: 'Active',
  entity_id: 'Entity ID',
  day_6: 'Saturday',
  zoning_funfair: 'Funfair',
  zoning_truck: 'Truck',
  zoning_staff: 'Staff',
  status_operational: 'Operational',
  status_constructing: 'Constructing',
  status_dismantling: 'Dismantling',
  status_broken: 'Broken',
  status_repairing: 'Repairing',
  sell_button: 'Sell',
  place_button: 'Place',
  intensity_gentle: 'Gentle',
  intensity_thrill: 'Thrill',
  intensity_extreme: 'Extreme',
  your_inventory_label: 'Your Inventory',
  all_label: 'All',
  inventory_empty_message: 'Inventory Empty',
  tiles_label: 'Tiles',
  no_trucks_available_message: 'No Trucks Available',
  income_label: 'Income',
  capacity_label: 'Capacity',
  category_ride: 'Ride',
  category_food: 'Food',
  category_facility: 'Facility',
  category_infrastructure: 'Infrastructure',
  shop_cat_all: 'All Items',
  shop_cat_rides: 'Rides',
  shop_cat_stalls: 'Stalls',
  shop_cat_facilities: 'Facilities',
  shop_cat_infrastructure: 'Infrastructure',
  shop_intensity_all: 'All Intensities',
  ride_shop_title: 'Ride Shop',
  manufacturer_label: 'Manufacturer',
  build_quality: 'Build Quality',
  base_reliability: 'Base Reliability',
  connections: 'Network',
  connections_desc: 'Build relationships with fellow showmen to rent unique attractions or rent out your own.',
  rent_in: 'Rent Attraction',
  rent_out: 'Rent Out',
  rental_duration: 'Duration (Days)',
  partner: 'Partner',
  daily_rate: 'Daily Rate',
  rent_in_title: 'Rent from {name}',
  rent_out_title: 'Rent out {rideName}',
  transport_included: 'Transport Included',
  no_connections: 'No active business connections yet.',
  active_rentals: 'Active Rental Agreements',
  remaining: 'Remaining',
  rent_out_income: 'Daily Income',
  rent_in_cost: 'Daily Cost',
  thought_not_allowed: "I'm not allowed in there!",
  thought_hungry: "I'm hungry, heading to {rideName}.",
  thought_starving: "I'm starving! Why is there no food in this park?",
  thought_restroom_need: "I really need a restroom...",
  thought_restroom_none: "I can't find a restroom anywhere!",
  thought_tired: "I'm so tired, I need to rest.",
  thought_nowhere_sit: "My feet are killing me, and there's nowhere to sit!",
  thought_price_high: "The price for {rideName} is a bit high...",
  thought_heading_to: "Heading to {rideName}!",
  thought_cant_afford: "I can't afford {rideName}. I need more money.",
  thought_too_expensive: "{rideName} was way too expensive!",
  thought_unsafe: "{rideName} felt unsafe and poorly maintained.",
  thought_no_operator: "There was no one even running {rideName}!",
  thought_fantastic: "That ride on {rideName} was fantastic!",
  thought_out_of_money: "I'm out of money. Time to go home.",
  thought_no_fun: "I'm not having any fun here. I'm leaving.",
  thought_seen_enough: "I've seen enough. Heading out.",
  thought_too_tired_hungry: 'I\'m too tired or hungry to stay any longer.',
  not_set: 'Not Set',
  ride_TEA_CUPS_name: 'Tea Cups',
  ride_FERRIS_WHEEL_name: 'Ferris Wheel',
  ride_BUMPER_CARS_name: 'Bumper Cars',
  ride_CAROUSEL_name: 'Carousel',
  ride_HAUNTED_HOUSE_name: 'Haunted House',
  ride_ROLLERCOASTER_name: 'Roller Coaster',
  ride_LOG_FLUME_name: 'Log Flume',
  ride_PIRATE_SHIP_name: 'Pirate Ship',
  ride_COTTON_CANDY_name: 'Cotton Candy',
  ride_ICE_CREAM_name: 'Ice Cream',
  ride_BUNGEE_JUMP_name: 'Bungee Jump',
  ride_DROP_TOWER_name: 'Drop Tower',
  ride_SWING_RIDE_name: 'Swing Ride',
  ride_FOOD_STALL_name: 'Food Stall',
  ride_RESTROOM_name: 'Restroom',
  ride_BENCH_name: 'Bench',
  ride_TRASH_CAN_name: 'Trash Can',
  ride_CLIMBING_WALL_name: 'Climbing Wall',
  ride_SLINGSHOT_name: 'Slingshot',
  ride_TOP_SPIN_name: 'Top Spin',
  ride_ENTERPRISE_name: 'Enterprise',
  ride_WALTZER_name: 'Waltzer',
  ride_HELTER_SKELTER_name: 'Helter Skelter',
  ride_KIDDIE_COASTER_name: 'Kiddie Coaster',
  ride_DUCK_POND_name: 'Duck Pond',
  ride_SHOOTING_GALLERY_name: 'Shooting Gallery',
  ride_COCONUT_SHY_name: 'Coconut Shy',
  ride_STRENGTH_TEST_name: 'Strength Test',
  ride_PONY_TREK_name: 'Pony Trek',
  ride_CARAVAN_name: 'Staff Caravan',
  ride_QUEUE_PATH_name: 'Queue Path',
  ride_SKY_SWING_name: 'Sky Swing',
  ride_GIANT_WHEEL_name: 'Giant Wheel',
  ride_WOODEN_COASTER_name: 'Wooden Coaster',
  ride_ZIP_LINE_name: 'Zip Line',
  ride_BURGER_JOINT_name: 'Burger Joint',
  ride_PIZZA_PARLOR_name: 'Pizza Parlor',
  ride_TACO_TRUCK_name: 'Taco Truck',
  ride_SODA_FOUNTAIN_name: 'Soda Fountain',
  ride_WHACK_A_MOLE_name: 'Whack-a-Mole',
  ride_BASKETBALL_TOSS_name: 'Basketball Toss',
  ride_CLAW_MACHINE_name: 'Claw Machine',
  ride_FIRST_AID_name: 'First Aid',
  ride_INFO_KIOSK_name: 'Info Kiosk',
  ride_ATM_name: 'ATM',
  ride_SHELTER_name: 'Rain Shelter',
  ride_STAFF_ROOM_name: 'Staff Room',
  ride_MAINTENANCE_DEPOT_name: 'Maintenance Depot',
  ride_PATH_name: 'Brick Path',
  ride_FLOWER_BED_name: 'Flower Bed',
  ride_FENCE_name: 'Safety Fence',
  ride_STREET_LIGHT_name: 'Street Light',
  ride_TEA_CUPS_desc: 'Whirling teacups provide gentle thrills for all ages.',
  ride_FERRIS_WHEEL_desc: 'A classic view from above, perfect for families.',
  ride_BUMPER_CARS_desc: 'Action-packed driving where bumping is the goal.',
  ride_CAROUSEL_desc: 'Timeless wooden horses and calliope music.',
  ride_HAUNTED_HOUSE_desc: 'Spooky surprises await in this dark walk-through.',
  ride_ROLLERCOASTER_desc: 'High-speed twists and turns for maximum excitement.',
  ride_LOG_FLUME_desc: 'Splash down and soak the riders in this water classic.',
  ride_PIRATE_SHIP_desc: 'A massive swinging ship that defies gravity.',
  ride_COTTON_CANDY_desc: 'Sweet spun sugar that everyone loves.',
  ride_ICE_CREAM_desc: 'Refreshing cold treats on a sunny park day.',
  ride_BUNGEE_JUMP_desc: 'The ultimate leap of faith for adrenaline junkies.',
  ride_DROP_TOWER_desc: 'A sudden vertical plunge that takes your breath away.',
  ride_SWING_RIDE_desc: 'Soar through the air on these flying chairs.',
  ride_FOOD_STALL_desc: 'Quick and tasty hot dogs for hungry guests.',
  ride_RESTROOM_desc: 'Essential facilities to keep guests comfortable.',
  ride_BENCH_desc: 'A place to rest tired feet and enjoy the view.',
  ride_TRASH_CAN_desc: 'Helps keep the park clean and tidy.',
  ride_SLINGSHOT_desc: 'Be catapulted into the sky at extreme speeds.',
  ride_TOP_SPIN_desc: 'Multi-axis rotation that turns your world upside down.',
  ride_ENTERPRISE_desc: 'Feel the G-force in this spinning vertical wheel.',
  ride_WALTZER_desc: 'Spinning cars that gain speed with every turn.',
  ride_HELTER_SKELTER_desc: 'A traditional slide that kids adore.',
  ride_KIDDIE_COASTER_desc: 'The perfect first coaster for young adventurers.',
  ride_DUCK_POND_desc: 'Traditional hook-a-duck game for prizes.',
  ride_SHOOTING_GALLERY_desc: 'Test your aim with these classic air rifles.',
  ride_COCONUT_SHY_desc: 'Knock them off to win! A fairground favorite.',
  ride_STRENGTH_TEST_desc: 'Ring the bell and show off your power.',
  ride_CARAVAN_desc: 'Basic rest area for your hard-working staff.',
  ride_QUEUE_PATH_desc: 'Essential for organizing guests at ride entrances.',
  ride_SKY_SWING_desc: 'A massive swing that takes you high above the fair.',
  ride_GIANT_WHEEL_desc: 'A massive landmark visible from across the city.',
  ride_WOODEN_COASTER_desc: 'Classic rattling thrills and airtime hills.',
  ride_ZIP_LINE_desc: 'Glide across the park for a unique perspective.',
  ride_BURGER_JOINT_desc: 'Juicy burgers and fries for a satisfying meal.',
  ride_PIZZA_PARLOR_desc: 'Freshly baked pizzas with various toppings.',
  ride_TACO_TRUCK_desc: 'Spicy and fresh Mexican street food.',
  ride_SODA_FOUNTAIN_desc: 'Ice-cold soft drinks to quench any thirst.',
  ride_WHACK_A_MOLE_desc: 'Fast reflexes are needed for this classic game.',
  ride_BASKETBALL_TOSS_desc: 'Can you sink the shot and win the prize?',
  ride_CLAW_MACHINE_desc: 'The ultimate test of skill and patience.',
  ride_FIRST_AID_desc: 'Handles minor injuries and sickness.',
  ride_INFO_KIOSK_desc: 'Helps guests find their way and learn about prices.',
  ride_ATM_desc: 'Allows guests to withdraw more cash to spend.',
  ride_SHELTER_desc: 'Protects guests from rain, keeping them in the park.',
  ride_STAFF_ROOM_desc: 'Comfortable area for staff to recover stamina faster.',
  ride_MAINTENANCE_DEPOT_desc: 'Base for mechanics, enabling faster repairs.',
  ride_PATH_desc: 'Creates a more durable and attractive walking surface.',
  ride_FLOWER_BED_desc: 'Decorative greenery that boosts park beauty.',
  ride_FENCE_desc: 'Defines boundaries and improves park safety.',
  ride_STREET_LIGHT_desc: 'Keeps the park illuminated and safe at night.',
  staff_OPERATOR_name: 'Ride Operator',
  staff_OPERATOR_desc: 'Required to run rides. Higher level increases ride safety.',
  staff_MECHANIC_name: 'Mechanic',
  staff_MECHANIC_desc: 'Repairs rides and reduces wear and tear.',
  staff_JANITOR_name: 'Janitor',
  staff_JANITOR_desc: 'Keeps the park clean, improving visitor happiness.',
  staff_SECURITY_name: 'Security Guard',
  staff_SECURITY_desc: 'Ensures safety and prevents happiness from dropping too fast.',
  staff_VENDOR_name: 'Vendor',
  staff_VENDOR_desc: 'Increases secondary income from visitors.',
  reason_weather: 'Park is closed due to {weatherType} weather.',
  reason_no_rides: 'No operational rides with operators',
  reason_outside_hours: 'Outside of scheduled hours',
  reason_seasonal_closure: 'Park is closed for the season in {region} (Open months: {startMonth}-{endMonth})',
  skip_to_opening: 'Skip to Opening Season',
  audio_settings: 'Audio Settings',
  legend_current: 'Current',
  legend_home: 'Home',
  legend_available: 'Available',
  back_to_countries: 'Back to Countries',
  cities_label: 'Cities',
  select_country_label: 'Select a country to view available cities',
  country_UK: 'UK',
  country_France: 'France',
  country_Germany: 'Germany',
  country_Spain: 'Spain',
  country_Italy: 'Italy',
  country_Portugal: 'Portugal',
  country_Netherlands: 'Netherlands',
  country_Sweden: 'Sweden',
  country_Norway: 'Norway',
  country_Denmark: 'Denmark',
  country_Finland: 'Finland',
  country_Iceland: 'Iceland',
  country_Poland: 'Poland',
  country_Russia: 'Russia',
  country_Turkey: 'Turkey',
  country_Greece: 'Greece',
  country_Czech_Republic: 'Czech Republic',
  country_Hungary: 'Hungary',
  country_Romania: 'Romania',
  country_Bulgaria: 'Bulgaria',
  country_Croatia: 'Croatia',
  country_Slovakia: 'Slovakia',
  country_Slovenia: 'Slovenia',
  country_Estonia: 'Estonia',
  country_Latvia: 'Latvia',
  country_Lithuania: 'Lithuania',
  country_Malta: 'Malta',
  country_Ireland: 'Ireland',
  country_Cyprus: 'Cyprus',
  country_Albania: 'Albania',
  country_North_Macedonia: 'North Macedonia',
  country_Bosnia_and_Herzegovina: 'Bosnia & Herzegovina',
  country_Montenegro: 'Montenegro',
  country_Serbia: 'Serbia',
  country_Luxembourg: 'Luxembourg',
  country_Belgium: 'Belgium',
  country_Switzerland: 'Switzerland',
  country_Kosovo: 'Kosovo',
  country_Austria: 'Austria',
  start_empire: 'Start Your Empire',
  setup_desc: 'Define your company and choose your first European city.',
  home_country: 'Home Country',
  starting_city_in: 'Starting City in {country}',
  cities_available: '{count} Cities Available',
  population_short: 'pop',
  map_navigation: 'Drag to Pan • Scroll to Zoom',
  potential_destination: 'Potential Destination',
  about: 'About',
  map_size: 'Map Size',
  visitor_multiplier: 'Visitor Multiplier',
  weather_patterns: 'Weather Patterns',
  terrain_GRASS: 'Grass',
  terrain_ASPHALT: 'Asphalt',
  terrain_GRAVEL: 'Gravel',
  terrain_PLAINS: 'Plains',
  terrain_COASTAL: 'Coastal',
  terrain_MOUNTAIN: 'Mountain',
  terrain_FOREST: 'Forest',
  terrain_ISLAND: 'Island',
  terrain_URBAN: 'Urban',
  terrain_RIVER: 'River',
  terrain_DESERT: 'Desert',
  terrain_TROPICAL: 'Tropical',
  terrain_ARCTIC: 'Arctic',
  save: 'Save',
  reset: 'Reset',
  close_panel: 'Close Panel',
  remaining_principal: 'Remaining Principal',
  interest_rate: 'Interest Rate',
  daily_payment: 'Daily Payment',
  original_amount: 'Original Amount',
  repay_amount: 'Repay ${amount}',
  small_business_loan: 'Small Business Loan',
  expansion_credit: 'Expansion Credit',
  venture_capital: 'Venture Capital',
  today: 'today',
  visitor_stats: 'Visitor Stats',
  pre_opening: 'PRE-OPENING',
  force_park_desc: 'Force the park to open or close regardless of schedule.',
  park_is_open: 'Park is Open',
  park_is_closed: 'Park is Closed',
  attractions: 'Attractions',
  auto_assign: 'Auto-Assign',
  busy_label: 'Busy',
  assigned_label: 'Assigned',
  missing_label: 'Missing',
  hire_operator: 'Hire Operator',
  hire_vendor: 'Hire Vendor',
  hire_mechanic: 'Hire Mechanic',
  mechanic_label: 'Mechanic',
  operator_label: 'Operator',
  vendor_label: 'Vendor',
  auto_assigning: 'Auto-Assigning',
  hourly_salary: 'Hourly Salary',
  underpaid_label: 'Underpaid',
  well_paid_label: 'Well Paid',
  min_label: 'Min',
  max_level: 'Max Level',
  train_button: 'Train (${cost})',
  truck_garage: 'Truck Garage',
  garage_level: 'Garage Level',
  capacity_value: 'Capacity: {current} / {max} Trucks',
  buy_truck_button: 'Buy Truck (${cost})',
  travelling_to: 'Travelling to {city}',
  avoid_obstacles: 'Avoid the obstacles! Hits cost money!',
  search_cities: 'Search cities...',
  tutorial_complete_title: 'Tutorial Complete',
  tutorial_complete_subtitle: "You're ready to go!",
  tutorial_complete_desc: "You've mastered the basics. Now expand your park, travel to new cities, and become a Funfair Tycoon!",
  start_managing: 'Start Managing',
};

const getWeatherIcon = (type: string) => {
  switch (type) {
    case 'SUNNY': return <Sun size={10} />;
    case 'CLOUDY': return <Cloud size={10} />;
    case 'RAINY': return <CloudRain size={10} />;
    case 'SNOWY': return <Snowflake size={10} />;
    case 'FREEZING': return <Thermometer size={10} />;
    case 'STORMY': return <Zap size={10} />;
    default: return <Sun size={10} />;
  }
};

const getWeatherColor = (type: string) => {
  switch (type) {
    case 'SUNNY': return 'bg-amber-100 text-amber-600';
    case 'CLOUDY': return 'bg-slate-100 text-slate-600';
    case 'RAINY': return 'bg-blue-100 text-blue-600';
    case 'SNOWY': return 'bg-indigo-100 text-indigo-600';
    case 'FREEZING': return 'bg-cyan-100 text-cyan-600';
    case 'STORMY': return 'bg-purple-100 text-purple-600';
    default: return 'bg-amber-100 text-amber-600';
  }
};

const getTimeTheme = (hours: number) => {
  if (hours >= 5 && hours < 8) return { bg: 'bg-indigo-200', overlay: 'bg-orange-500/10', vignette: 'opacity-20' };
  if (hours >= 8 && hours < 17) return { bg: 'bg-slate-200', overlay: 'bg-transparent', vignette: 'opacity-0' };
  if (hours >= 17 && hours < 20) return { bg: 'bg-amber-100', overlay: 'bg-rose-500/20', vignette: 'opacity-30' };
  return { bg: 'bg-slate-950', overlay: 'bg-indigo-900/40', vignette: 'opacity-60' };
};

const TruckMinigame = ({ engine, gameState }: { engine: GameEngine, gameState: GameState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = (key: string, replacements?: Record<string, string | number>) => {
    // Handle city names and descriptions by defaulting to English from CITIES array
    if (key.startsWith('city_name_')) {
      const cityId = key.replace('city_name_', '');
      const city = CITIES.find(c => c.id === cityId);
      if (city) return city.name;
    }
    if (key.startsWith('city_desc_')) {
      const cityId = key.replace('city_desc_', '');
      const city = CITIES.find(c => c.id === cityId);
      if (city) return city.description;
    }

    if (key.startsWith('country_')) {
      const countryRaw = key.replace('country_', '').replace(/_/g, ' ');
      return ENGLISH_TRANSLATIONS[key] || countryRaw;
    }

    let text = ENGLISH_TRANSLATIONS[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      engine.moveTruckMinigame(relativeY);
    }
  };

  const targetCity = CITIES.find(c => c.id === gameState.travelingToCityId);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-10 left-10 right-10 flex flex-col items-center">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
          {t('travelling_to', { city: t('city_name_' + gameState.travelingToCityId) })}
        </h2>
        <div className="w-full max-w-2xl h-4 bg-slate-800 rounded-full overflow-hidden border-2 border-slate-700">
          <motion.div 
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${gameState.travelProgress}%` }}
          />
        </div>
        <p className="text-slate-400 mt-2 font-mono uppercase text-sm tracking-widest">
          {t('avoid_obstacles')}
        </p>
      </div>

      <div className="relative w-full h-[600px] bg-slate-800 border-y-4 border-slate-700 overflow-hidden">
        {/* Road lines */}
        <div className="absolute inset-0 flex flex-col justify-around opacity-20">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-1 bg-white w-full border-t-2 border-dashed border-white" />
          ))}
        </div>

        {/* Truck */}
        <motion.div 
          className="absolute left-20 z-10"
          animate={{ y: gameState.truckMinigameX - 40 }}
          transition={{ type: 'spring', damping: 20, stiffness: 150 }}
        >
          <div className="relative">
            <Truck size={80} className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-12 bg-amber-600 rounded-l-md" />
          </div>
        </motion.div>

        {/* Obstacles */}
        {gameState.truckMinigameObstacles.map(obs => (
          <div 
            key={obs.id}
            className="absolute"
            style={{ left: obs.x, top: obs.y - 20 }}
          >
            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-red-700 animate-pulse">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-slate-500 font-mono text-xs uppercase tracking-[0.2em]">
        Use your mouse to steer the truck
      </div>
    </div>
  );
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine] = useState(() => new GameEngine(GameEngine.getSaveData()));
  const [gameState, setGameState] = useState(() => engine.update());
  const [isSetupOpen, setIsSetupOpen] = useState(!GameEngine.hasSave());
  const [setupName, setSetupName] = useState('');
  const [setupCountry, setSetupCountry] = useState('UK');
  const [setupCity, setSetupCity] = useState('london');
  const [setupSearch, setSetupSearch] = useState('');
  const [travelSearch, setTravelSearch] = useState('');
  const [selectedRideType, setSelectedRideType] = useState<RideType | null>(null);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [unlockedAchievementIds, setUnlockedAchievementIds] = useState<string[]>([]);
  const [showAchievementToast, setShowAchievementToast] = useState<Achievement | null>(null);
  const [placingRideId, setPlacingRideId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'overview' | 'inventory' | 'management' | 'zoning'>('overview');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false); // We'll keep this for the rail toggle logic
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<RideCategory | 'ALL'>('ALL');
  const [inventoryIntensity, setInventoryIntensity] = useState<RideIntensity | 'ALL'>('ALL');
  const [activeManagementTab, setActiveManagementTab] = useState<'settings' | 'travel' | 'staff' | 'budget' | 'warehouse' | 'pricing' | 'garage' | 'finance' | 'achievements' | 'connections' | 'research' | 'challenges' | 'marketplace'>('settings');
  const [selectedCityInfoId, setSelectedCityInfoId] = useState<string | null>(null);
  const [isPermitFormOpen, setIsPermitFormOpen] = useState(false);
  const [pendingTravelCityId, setPendingTravelCityId] = useState<string | null>(null);
  const [draftPermit, setDraftPermit] = useState<TravelForm>({
    reason: 'BUSINESS',
    days: 14,
    signature: '',
    insuranceLevel: 'BASIC',
    rentTier: 'COMMUNITY'
  });
  const [travelSortBy, setTravelSortBy] = useState<'name' | 'population' | 'cost' | 'multiplier'>('name');
  const [travelSortOrder, setTravelSortOrder] = useState<'asc' | 'desc'>('asc');
  const [travelView, setTravelView] = useState<'list' | 'map'>('list');
  const [selectedTravelCountry, setSelectedTravelCountry] = useState<string | null>(null);
  const [travelMapScale, setTravelMapScale] = useState(1);
  const [travelMapOffset, setTravelMapOffset] = useState({ x: 0, y: 0 });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isZoningMode, setIsZoningMode] = useState(false);
  const [zoningStart, setZoningStart] = useState<{ x: number, y: number } | null>(null);
  const [zoningType, setZoningType] = useState<'FUNFAIR' | 'TRUCK' | 'STAFF'>('FUNFAIR');
  const [camera, setCamera] = useState({ x: 100, y: -400, zoom: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  const renderRef = useRef<() => void>(() => {});

  const t = (keyOrObj: string | { key: string; replacements?: Record<string, string | number> }, replacements?: Record<string, string | number>) => {
    let key: string;
    let reps: Record<string, string | number> | undefined = replacements;

    if (typeof keyOrObj === 'object' && keyOrObj !== null) {
      key = keyOrObj.key;
      reps = keyOrObj.replacements || replacements;
    } else {
      key = keyOrObj as string;
    }

    // Handle city names and descriptions by defaulting to English from CITIES array
    if (key.startsWith('city_name_')) {
      const cityId = key.replace('city_name_', '');
      const city = CITIES.find(c => c.id === cityId);
      if (city) return city.name;
    }
    if (key.startsWith('city_desc_')) {
      const cityId = key.replace('city_desc_', '');
      const city = CITIES.find(c => c.id === cityId);
      if (city) return city.description;
    }

    if (key.startsWith('country_')) {
      const countryRaw = key.replace('country_', '').replace(/_/g, ' ');
      return ENGLISH_TRANSLATIONS[key] || countryRaw;
    }

    let text = ENGLISH_TRANSLATIONS[key] || key;

    if (typeof text !== 'string') {
      text = String(text);
    }

    if (reps) {
      Object.entries(reps).forEach(([k, k_val]) => {
        // Try to translate the value itself if it looks like a translation key
        const val = typeof k_val === 'string' && ENGLISH_TRANSLATIONS[k_val] ? ENGLISH_TRANSLATIONS[k_val] : String(k_val);
        text = text.replace(`{${k}}`, val);
      });
    }
    return text;
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const sidebarOffset = isSidebarOpen ? 332 : 0;
        canvas.width = window.innerWidth - sidebarOffset;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Update render ref
  useEffect(() => {
    renderRef.current = render;
  });

  // Game Loop
  useEffect(() => {
    if (isSetupOpen) return;
    let animationFrameId: number;
    const loop = () => {
      const newState = engine.update();
      setGameState(newState);
      renderRef.current();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [engine, isSetupOpen]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (isSetupOpen) return;
    const interval = setInterval(() => {
      engine.saveGame();
    }, 30000);
    return () => clearInterval(interval);
  }, [engine, isSetupOpen]);

  // Manage achievement notifications
  useEffect(() => {
    // Already handled via game engine state, but we need to ensure we clear items after some time
    // if the user doesn't dismiss them manually.
    if (gameState.newAchievements.length > 0) {
      gameState.newAchievements.forEach(achievement => {
        const timer = setTimeout(() => {
          engine.clearNewAchievement(achievement.id);
          setGameState(engine.getState());
        }, 6000);
        return () => clearTimeout(timer);
      });
    }
  }, [gameState.newAchievements.length, engine]);

  // Sync Audio Settings
  useEffect(() => {
    audioService.updateSettings({
      musicVolume: gameState.settings.musicVolume,
      sfxVolume: gameState.settings.sfxVolume
    });
  }, [gameState.settings.musicVolume, gameState.settings.sfxVolume]);

  // Achievement Auto-dismiss
  useEffect(() => {
    if (gameState.newAchievements.length > 0) {
      const timer = setTimeout(() => {
        engine.clearNewAchievement(gameState.newAchievements[0].id);
        setGameState(engine.getState());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState.newAchievements, engine]);

  // Tutorial Progress Check
  useEffect(() => {
    if (!gameState.showTutorial) return;

    let advanced = false;
    if (gameState.tutorialStep === 0 && gameState.rides.length > 0) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 1 && gameState.zones.some(z => z.type === 'TRUCK')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 2 && gameState.staff.some(s => s.type === 'OPERATOR')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 3 && !gameState.settings.isManuallyClosed) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 4 && gameState.money >= 2500) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 5 && gameState.rides.some(r => RIDE_CONFIGS[r.type].category === 'FOOD')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 6 && gameState.visitors.length >= 50) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 7 && gameState.staff.some(s => s.type === 'JANITOR')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 8 && gameState.activeLoans.length > 0) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 9 && gameState.visitors.length >= 100) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 10 && (gameState.activeResearchId !== null || gameState.completedResearchIds.length > 0)) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 11 && gameState.staff.some(s => s.type === 'MECHANIC')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 12 && gameState.settings.pricing.ticketPrice >= 7) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 13 && gameState.company.warehouseLevel > 1) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 14 && gameState.rides.some(r => r.customName || r.customColor)) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 15 && gameState.staff.some(s => s.type === 'SECURITY')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 16 && gameState.trucks.length > 2) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 17 && gameState.researchPoints >= 100) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 18 && gameState.totalCitiesVisited.length > 1) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 19 && gameState.totalMoneyEarned >= 10000) {
      engine.advanceTutorial();
      advanced = true;
    }

    if (advanced) {
      setGameState(engine.getState());
      confetti({ particleCount: 50, spread: 60 });
    }
  }, [gameState.tutorialStep, gameState.rides.length, gameState.staff.length, gameState.settings.isManuallyClosed, gameState.money, gameState.visitors.length, gameState.showTutorial, engine]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now() / 1000;

    const city = gameState.cities.find(c => c.id === gameState.company.currentCityId) || gameState.cities[0];
    const mapWidth = gameState.currentMapSize.width * GRID_SIZE;
    const mapHeight = gameState.currentMapSize.height * GRID_SIZE;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Draw Terrain Background
    const hours = gameState.time.hours;
    const isNight = hours < 6 || hours >= 20;
    const isSunrise = hours >= 6 && hours < 8;
    const isSunset = hours >= 18 && hours < 20;

    if (city.terrain === 'GRASS') {
      if (isNight) ctx.fillStyle = '#064e3b'; // Very dark green
      else if (isSunrise) ctx.fillStyle = '#14532d'; // Darker green
      else if (isSunset) ctx.fillStyle = '#166534'; // Mid green
      else ctx.fillStyle = '#dcfce7'; // Light green
    } else if (city.terrain === 'ASPHALT') {
      if (isNight) ctx.fillStyle = '#0f172a'; // Very dark slate
      else if (isSunrise) ctx.fillStyle = '#1e293b'; // Darker slate
      else if (isSunset) ctx.fillStyle = '#334155'; // Mid slate
      else ctx.fillStyle = '#e2e8f0'; // Light slate/gray
    } else {
      if (isNight) ctx.fillStyle = '#451a03'; // Darker amber/brown
      else if (isSunrise) ctx.fillStyle = '#78350f'; // Darker amber
      else if (isSunset) ctx.fillStyle = '#92400e'; // Mid amber
      else ctx.fillStyle = '#fef3c7'; // Light amber/gravel
    }
    ctx.fillRect(0, 0, mapWidth, mapHeight);
    
    // Subtle texture based on terrain
    const textureOpacity = isNight ? 0.3 : 1;
    if (city.terrain === 'GRASS') {
      ctx.strokeStyle = isNight ? 'rgba(187, 247, 208, 0.2)' : '#bbf7d0';
      ctx.lineWidth = 1;
      for (let i = 0; i < 200; i++) {
        const gx = (i * 137.5) % mapWidth;
        const gy = (i * 271.3) % mapHeight;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + 2, gy - 4);
        ctx.stroke();
      }
    } else if (city.terrain === 'ASPHALT') {
      ctx.strokeStyle = isNight ? 'rgba(203, 213, 225, 0.2)' : '#cbd5e1';
      ctx.lineWidth = 1;
      for (let i = 0; i < 150; i++) {
        const gx = (i * 137.5) % mapWidth;
        const gy = (i * 271.3) % mapHeight;
        ctx.strokeRect(gx, gy, 2, 2);
      }
    } else {
      ctx.strokeStyle = isNight ? 'rgba(253, 230, 138, 0.2)' : '#fde68a';
      ctx.lineWidth = 1;
      for (let i = 0; i < 300; i++) {
        const gx = (i * 137.5) % mapWidth;
        const gy = (i * 271.3) % mapHeight;
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw Zones
    ctx.lineWidth = 2;
    gameState.zones.forEach(zone => {
      const px = zone.x * GRID_SIZE;
      const py = zone.y * GRID_SIZE;
      const width = zone.width * GRID_SIZE;
      const height = zone.height * GRID_SIZE;
      
      let color = '251, 191, 36'; // Amber for funfair
      let label = 'FUNFAIR ZONE';
      
      if (zone.type === 'TRUCK') {
        color = '59, 130, 246'; // Blue for truck
        label = 'TRUCK AREA';
      } else if (zone.type === 'STAFF') {
        color = '16, 185, 129'; // Green for staff
        label = 'STAFF AREA';
      }
      
      ctx.strokeStyle = `rgba(${color}, 0.6)`;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(px, py, width, height);
      ctx.fillStyle = `rgba(${color}, 0.1)`;
      ctx.fillRect(px, py, width, height);
      ctx.setLineDash([]);
      
      // Label
      ctx.fillStyle = `rgba(${color}, 0.8)`;
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(label, px + 5, py + 15);
      
      // Delete button (only in zoning mode)
      if (isZoningMode) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px + width - 10, py + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('×', px + width - 10, py + 14);
        ctx.textAlign = 'left';
      }
    });

    // Draw Current Zoning Selection
    if (isZoningMode && zoningStart && hoveredCell) {
      const startX = Math.min(zoningStart.x, hoveredCell.x);
      const startY = Math.min(zoningStart.y, hoveredCell.y);
      const width = Math.abs(zoningStart.x - hoveredCell.x) + 1;
      const height = Math.abs(zoningStart.y - hoveredCell.y) + 1;
      
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.fillRect(startX * GRID_SIZE, startY * GRID_SIZE, width * GRID_SIZE, height * GRID_SIZE);
      ctx.strokeRect(startX * GRID_SIZE, startY * GRID_SIZE, width * GRID_SIZE, height * GRID_SIZE);
    }

    // Draw Grid
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= mapWidth; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= mapHeight; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mapWidth, y);
      ctx.stroke();
    }

    // Draw Entrance Path
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, mapHeight / 2 - 60, 100, 120);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(0, mapHeight / 2 - 100, 20, 200);
    
    // Draw Buildings (City Center Challenge)
    if (city.buildings) {
      city.buildings.forEach(building => {
        const bx = building.x * GRID_SIZE;
        const by = building.y * GRID_SIZE;
        const bw = building.width * GRID_SIZE;
        const bh = building.height * GRID_SIZE;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(bx + 8, by + 8, bw, bh);

        // Building Base
        let buildingColor = '#475569'; // Default Slate-600
        let accentColor = '#1e293b'; // Default Slate-800
        
        if (building.type === 'SKYSCRAPER') {
          buildingColor = '#334155';
          accentColor = '#0f172a';
        } else if (building.type === 'OFFICE') {
          buildingColor = '#64748b';
          accentColor = '#334155';
        } else if (building.type === 'APARTMENT') {
          buildingColor = '#94a3b8';
          accentColor = '#475569';
        } else if (building.type === 'HISTORIC') {
          buildingColor = '#8b4513'; // Saddle Brown
          accentColor = '#5d2e0c';
        }

        ctx.fillStyle = buildingColor;
        ctx.fillRect(bx, by, bw, bh);
        
        // Windows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        const winSize = 3;
        const gap = 6;
        for (let wx = bx + gap; wx < bx + bw - gap; wx += gap + winSize) {
          for (let wy = by + gap; wy < by + bh - gap; wy += gap + winSize) {
            ctx.fillRect(wx, wy, winSize, winSize);
          }
        }

        // Roof/Details
        ctx.fillStyle = accentColor;
        ctx.fillRect(bx, by, bw, 6); // Top detail
        
        // Name Label
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.font = 'bold 9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(building.name.toUpperCase(), bx + bw / 2, by + bh + 12);
      });
    }

    // Draw Rides
    gameState.rides.forEach(ride => {
      const config = RIDE_CONFIGS[ride.type];
      const px = ride.x * GRID_SIZE;
      const py = ride.y * GRID_SIZE;
      const width = config.width * GRID_SIZE;
      const height = config.height * GRID_SIZE;
      const centerX = px + width / 2;
      const centerY = py + height / 2;

      if (ride.type === 'QUEUE_PATH') {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 2, width - 4, height - 4, 4);
        ctx.fill();
        
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 4, py + 4, width - 8, height - 8);

        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👣', centerX, centerY);
        return;
      }

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(centerX + 5, centerY + 5, width / 2, height / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Base Platform
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.roundRect(px, py, width, height, 8);
      ctx.fill();
      
      // Main Ride Body
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.roundRect(px + 4, py + 4, width - 8, height - 8, 12);
      ctx.fill();

      // Animation Logic
      ctx.save();
      ctx.translate(centerX, centerY);
      
      if (ride.type === 'FERRIS_WHEEL') {
        const rotation = time * 0.2;
        // Draw Wheel
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, width * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        
        // Spokes and Cars
        for (let i = 0; i < 8; i++) {
          const angle = rotation + (i * Math.PI * 2) / 8;
          const rx = Math.cos(angle) * width * 0.35;
          const ry = Math.sin(angle) * width * 0.35;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(rx, ry);
          ctx.stroke();
          
          // Car
          ctx.fillStyle = config.color;
          ctx.fillRect(rx - 4, ry - 4, 8, 8);
        }
      } else if (ride.type === 'CAROUSEL') {
        const rotation = time * 0.5;
        // Draw Base
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(0, 0, width * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Poles and Horses
        for (let i = 0; i < 6; i++) {
          const angle = rotation + (i * Math.PI * 2) / 6;
          const rx = Math.cos(angle) * width * 0.3;
          const ry = Math.sin(angle) * width * 0.3;
          const bounce = Math.sin(time * 4 + i) * 5;
          
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx, ry - 10);
          ctx.lineTo(rx, ry + 10);
          ctx.stroke();
          
          ctx.fillStyle = config.color;
          ctx.fillRect(rx - 4, ry - 4 + bounce, 8, 8);
        }
      } else if (ride.type === 'TEA_CUPS') {
        const rotation = time * 1.5;
        // Draw Large Platform
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(0, 0, width * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Cups
        for (let i = 0; i < 3; i++) {
          const angle = rotation + (i * Math.PI * 2) / 3;
          const rx = Math.cos(angle) * width * 0.25;
          const ry = Math.sin(angle) * width * 0.25;
          
          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate(time * 3);
          ctx.fillStyle = config.color;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      } else if (ride.type === 'BUMPER_CARS') {
        // Arena
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(-width * 0.4, -height * 0.4, width * 0.8, height * 0.8);
        
        // Cars
        for (let i = 0; i < 4; i++) {
          const ox = Math.sin(time * 2 + i) * width * 0.2;
          const oy = Math.cos(time * 1.5 + i) * height * 0.2;
          ctx.fillStyle = config.color;
          ctx.beginPath();
          ctx.roundRect(ox - 5, oy - 3, 10, 6, 2);
          ctx.fill();
        }
      } else if (ride.type === 'ROLLERCOASTER') {
        // Track
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, width * 0.4, height * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Train
        const angle = time * 1.2;
        const tx = Math.cos(angle) * width * 0.4;
        const ty = Math.sin(angle) * height * 0.3;
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.roundRect(tx - 8, ty - 4, 16, 8, 2);
        ctx.fill();
      } else if (ride.type === 'HAUNTED_HOUSE') {
        // Dark Building
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-width * 0.4, -height * 0.4, width * 0.8, height * 0.8);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-width * 0.2, -height * 0.4, width * 0.4, height * 0.2); // Roof part
        ctx.font = `${width * 0.4}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.icon, 0, 0);
      } else if (ride.type === 'LOG_FLUME') {
        // Water Track
        ctx.strokeStyle = '#0ea5e9';
        ctx.lineWidth = 8;
        ctx.strokeRect(-width * 0.35, -height * 0.25, width * 0.7, height * 0.5);
        // Log
        const logPos = (time * 0.3) % 1;
        let lx, ly;
        if (logPos < 0.25) { lx = -width * 0.35 + (logPos / 0.25) * width * 0.7; ly = -height * 0.25; }
        else if (logPos < 0.5) { lx = width * 0.35; ly = -height * 0.25 + ((logPos - 0.25) / 0.25) * height * 0.5; }
        else if (logPos < 0.75) { lx = width * 0.35 - ((logPos - 0.5) / 0.25) * width * 0.7; ly = height * 0.25; }
        else { lx = -width * 0.35; ly = height * 0.25 - ((logPos - 0.75) / 0.25) * height * 0.5; }
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(lx - 5, ly - 3, 10, 6);
      } else if (ride.type === 'DROP_TOWER') {
        // Tower
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-3, -height * 0.45, 6, height * 0.9);
        // Seat
        const seatY = Math.sin(time * 3) > 0 ? -height * 0.4 + Math.pow(Math.sin(time * 3), 4) * height * 0.7 : -height * 0.4;
        ctx.fillStyle = config.color;
        ctx.fillRect(-10, seatY, 20, 5);
      } else if (ride.type === 'DUCK_POND') {
        // Pond
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(0, 0, width * 0.35, height * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ducks
        for (let i = 0; i < 5; i++) {
          const angle = time * 0.5 + (i * Math.PI * 2) / 5;
          const dx = Math.cos(angle) * width * 0.25;
          const dy = Math.sin(angle) * height * 0.2;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(dx, dy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (ride.type === 'SHOOTING_GALLERY') {
        // Targets
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-width * 0.4, -height * 0.3, width * 0.8, height * 0.6);
        for (let i = 0; i < 4; i++) {
          const tx = -width * 0.3 + (i * width * 0.2);
          const ty = Math.sin(time * 3 + i) * 10;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(tx, ty, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(tx, ty, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (ride.type === 'COCONUT_SHY') {
        // Stand
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-width * 0.4, 0, width * 0.8, 10);
        // Coconuts
        for (let i = 0; i < 5; i++) {
          const cx = -width * 0.3 + (i * width * 0.15);
          const wobble = Math.sin(time * 5 + i) * 2;
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.arc(cx, -10 + wobble, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (ride.type === 'STRENGTH_TEST') {
        // Tower
        ctx.fillStyle = '#475569';
        ctx.fillRect(-5, -height * 0.4, 10, height * 0.8);
        // Bell
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -height * 0.4, 6, 0, Math.PI * 2);
        ctx.fill();
        // Puck
        const puckY = Math.abs(Math.sin(time * 2)) * height * 0.7;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, height * 0.35 - puckY, 16, 4);
      } else if (ride.type === 'SWING_RIDE') {
        // Pole
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-2, -height * 0.4, 4, height * 0.8);
        // Swings
        const rot = time * 2;
        for (let i = 0; i < 6; i++) {
          const a = rot + (i * Math.PI * 2) / 6;
          const sx = Math.cos(a) * width * 0.3;
          const sy = Math.sin(a) * width * 0.1;
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -height * 0.3);
          ctx.lineTo(sx, sy);
          ctx.stroke();
          ctx.fillStyle = config.color;
          ctx.fillRect(sx - 2, sy - 2, 4, 4);
        }
      } else if (ride.type === 'PIRATE_SHIP') {
        // Supports
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-width * 0.3, height * 0.3);
        ctx.lineTo(0, -height * 0.2);
        ctx.lineTo(width * 0.3, height * 0.3);
        ctx.stroke();
        // Ship
        const swing = Math.sin(time * 1.5) * 0.7;
        ctx.save();
        ctx.translate(0, -height * 0.2);
        ctx.rotate(swing);
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, height * 0.4, width * 0.35, 0, Math.PI, false);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('☠️', 0, height * 0.5);
        ctx.restore();
      } else if (ride.type === 'FOOD_STALL' || ride.type === 'COTTON_CANDY' || ride.type === 'ICE_CREAM') {
        // Stand
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-width * 0.35, -height * 0.2, width * 0.7, height * 0.4);
        ctx.fillStyle = config.color;
        ctx.fillRect(-width * 0.4, -height * 0.4, width * 0.8, height * 0.2);
        ctx.font = `${width * 0.4}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(config.icon, 0, 0);
      }
      ctx.restore();

      // Name & Price Tag
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(config.name, centerX, py + height + 15);
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px Inter';
      ctx.fillText(`$${ride.price}`, centerX, py + height + 26);

      // Capacity Bar
      const capacity = config.baseCapacity * ride.level;
      const ratio = ride.currentVisitors / capacity;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(px + 10, py + height - 15, width - 20, 6);
      ctx.fillStyle = ratio > 0.8 ? '#ef4444' : '#10b981';
      ctx.fillRect(px + 10, py + height - 15, (width - 20) * ratio, 6);

      // Condition Bar
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(px + 10, py + height - 25, width - 20, 4);
      ctx.fillStyle = ride.condition > 50 ? '#10b981' : ride.condition > 20 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(px + 10, py + height - 25, (width - 20) * (ride.condition / 100), 4);

      // Status Indicators
      if (ride.status === 'CONSTRUCTING' || ride.status === 'DISMANTLING') {
        // Draw Truck/Construction Site
        ctx.fillStyle = '#475569'; // Slate-600
        ctx.fillRect(px + width * 0.2, py + height * 0.4, width * 0.6, height * 0.4);
        ctx.fillStyle = '#1e293b'; // Slate-800
        ctx.fillRect(px + width * 0.6, py + height * 0.3, width * 0.25, height * 0.3);
        
        // Progress Bar
        const barWidth = width * 0.8;
        const barHeight = 6;
        const bx = px + (width - barWidth) / 2;
        const by = py + height - 15;
        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(bx, by, barWidth, barHeight);
        ctx.fillStyle = ride.status === 'CONSTRUCTING' ? '#3b82f6' : '#f59e0b';
        ctx.fillRect(bx, by, barWidth * (ride.buildProgress / 100), barHeight);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(ride.status === 'CONSTRUCTING' ? 'BUILDING...' : 'DISMANTLING...', centerX, py + 20);
      } else if (ride.status === 'BROKEN') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fillRect(px, py, width, height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ BROKEN', centerX, centerY);
      } else if (ride.status === 'MAINTENANCE') {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.fillRect(px, py, width, height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('🛠️ REPAIRING', centerX, centerY);
      } else if (ride.isStaffResting) {
        ctx.fillStyle = 'rgba(124, 58, 237, 0.8)';
        ctx.fillRect(px, py, width, height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('💤 STAFF RESTING', centerX, centerY);
      } else if (ride.currentVisitors >= capacity) {
        ctx.fillStyle = 'rgba(79, 70, 229, 0.6)';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('FULL', centerX, py + 10);
      }

      // Missing Operator Indicator
      if (ride.status === 'OPERATIONAL' && !ride.operatorId) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.beginPath();
        ctx.roundRect(px + 5, py + 5, width - 10, 20, 4);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('👤 NO OPERATOR', centerX, py + 18);
      }

      // Selection Highlight
      if (selectedRideId === ride.id) {
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(px - 2, py - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      }
    });

    // Draw Placement Ghost
    if (placingRideId && hoveredCell) {
      const ride = gameState.inventory.find(r => r.id === placingRideId);
      if (ride) {
        const config = RIDE_CONFIGS[ride.type];
        const px = hoveredCell.x * GRID_SIZE;
        const py = hoveredCell.y * GRID_SIZE;
        const width = config.width * GRID_SIZE;
        const height = config.height * GRID_SIZE;
        
        const canPlace = engine.canPlaceRide(ride.type, hoveredCell.x, hoveredCell.y);
        
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = canPlace ? config.color : '#ef4444'; // Red if cannot place
        ctx.fillRect(px, py, width, height);
        
        if (!canPlace) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(px, py, width, height);
          
          // Draw X
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + width, py + height);
          ctx.moveTo(px + width, py);
          ctx.lineTo(px, py + height);
          ctx.stroke();
        }
        
        ctx.globalAlpha = 1.0;
      }
    }

    // Draw Visitors
    gameState.visitors.forEach(v => {
      const bob = Math.abs(Math.sin(time * 10 + parseInt(v.id, 36))) * 3;
      // Add a small visual offset based on ID to prevent perfect piling
      const visualX = v.x + (parseInt(v.id.slice(-1), 36) % 7 - 3);
      const visualY = v.y + (parseInt(v.id.slice(-2, -1), 36) % 7 - 3);
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(visualX, visualY + 2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(visualX, visualY - bob, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Happiness bar
      const barWidth = 12;
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(visualX - barWidth / 2, visualY - 12 - bob, barWidth, 3);
      ctx.fillStyle = v.happiness > 50 ? '#10b981' : v.happiness > 20 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(visualX - barWidth / 2, visualY - 12 - bob, barWidth * (v.happiness / 100), 3);

      // Need indicators
      if (v.hunger > 70 || v.bladder > 70 || v.stamina < 30) {
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        let needIcon = '';
        if (v.hunger > 70) needIcon = '🌭';
        else if (v.bladder > 70) needIcon = '🚻';
        else if (v.stamina < 30) needIcon = '😴';
        
        if (needIcon) {
          ctx.fillText(needIcon, visualX, visualY - 20 - bob);
        }
      }

      // State indicators
      if (v.state === 'EATING') {
        ctx.font = '10px Arial';
        ctx.fillText('😋', visualX + 8, visualY - bob);
      } else if (v.state === 'RESTING') {
        ctx.font = '10px Arial';
        ctx.fillText('💤', visualX + 8, visualY - bob);
      }

      // Little head highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(v.x - 2, v.y - 2 - bob, 2, 0, Math.PI * 2);
      ctx.fill();

      if (selectedVisitorId === v.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(v.x, v.y - bob, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw Staff
    gameState.staff.forEach(s => {
      const config = STAFF_CONFIGS[s.type];
      const bob = Math.abs(Math.sin(time * 8 + parseInt(s.id, 36))) * 2;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(s.x, s.y + 2, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y - bob, 7, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon/Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, s.x, s.y - bob);
      
      // Energy bar
      const barWidth = 14;
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(s.x - barWidth / 2, s.y - 14 - bob, barWidth, 3);
      ctx.fillStyle = s.stamina > 50 ? '#8b5cf6' : s.stamina > 20 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(s.x - barWidth / 2, s.y - 14 - bob, barWidth * (s.stamina / 100), 3);
    });

    // Draw Trucks
    gameState.trucks.forEach(t => {
      const isMoving = t.targetX !== undefined && t.targetY !== undefined && (t.x !== t.targetX || t.y !== t.targetY);
      const bob = isMoving ? Math.abs(Math.sin(time * 12)) * 2 : 0;
      
      ctx.save();
      ctx.translate(t.x, t.y - bob);
      
      // Truck Body
      ctx.fillStyle = '#475569'; // Slate-600
      ctx.beginPath();
      ctx.roundRect(-15, -10, 30, 20, 4);
      ctx.fill();
      
      // Cab
      ctx.fillStyle = '#1e293b'; // Slate-800
      ctx.beginPath();
      ctx.roundRect(5, -8, 12, 16, 2);
      ctx.fill();
      
      // Wheels
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(-10, 10, 4, 0, Math.PI * 2);
      ctx.arc(10, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 8px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('TRUCK', 0, 2);
      
      ctx.restore();
    });

    // Day/Night Overlay
    let overlayAlpha = 0;
    if (hours >= 20 || hours < 5) {
      overlayAlpha = 0.4; // Night
    } else if (hours >= 18) {
      overlayAlpha = (hours - 18) * 0.2; // Sunset
    } else if (hours < 7) {
      overlayAlpha = (7 - hours) * 0.2; // Sunrise
    }

    if (overlayAlpha > 0) {
      ctx.fillStyle = `rgba(15, 23, 42, ${overlayAlpha})`;
      ctx.fillRect(0, 0, mapWidth, mapHeight);
      
      // Ride lights at night
      gameState.rides.forEach(ride => {
        const config = RIDE_CONFIGS[ride.type];
        const px = ride.x * GRID_SIZE;
        const py = ride.y * GRID_SIZE;
        const width = config.width * GRID_SIZE;
        const height = config.height * GRID_SIZE;
        
        const gradient = ctx.createRadialGradient(
          px + width / 2, py + height / 2, 0,
          px + width / 2, py + height / 2, width
        );
        gradient.addColorStop(0, `${config.color}44`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(px - width / 2, py - height / 2, width * 2, height * 2);
      });
    }

    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left - camera.x) / camera.zoom;
    const my = (e.clientY - rect.top - camera.y) / camera.zoom;

    if (isZoningMode && hoveredCell) {
      // Check if clicked a delete button
      const clickedZone = gameState.zones.find(zone => {
        const px = zone.x * GRID_SIZE;
        const py = zone.y * GRID_SIZE;
        const width = zone.width * GRID_SIZE;
        const dx = mx - (px + width - 10);
        const dy = my - (py + 10);
        return Math.sqrt(dx*dx + dy*dy) < 8;
      });

      if (clickedZone) {
        setGameState(engine.removeZone(clickedZone.id));
        audioService.playSFX('click');
        return;
      }

      setZoningStart({ x: hoveredCell.x, y: hoveredCell.y });
      return;
    }

    if (e.button === 1 || (e.button === 0 && !placingRideId)) {
      // Check if clicked a ride
      const clickedRide = gameState.rides.find(r => {
        const config = RIDE_CONFIGS[r.type];
        const px = r.x * GRID_SIZE;
        const py = r.y * GRID_SIZE;
        const width = config.width * GRID_SIZE;
        const height = config.height * GRID_SIZE;
        return mx >= px && mx <= px + width && my >= py && my <= py + height;
      });

      if (clickedRide) {
        setSelectedRideId(clickedRide.id);
        setSelectedVisitorId(null);
      } else {
        // Check if clicked a visitor
        const clickedVisitor = gameState.visitors.find(v => {
          const dx = mx - v.x;
          const dy = my - v.y;
          return Math.sqrt(dx*dx + dy*dy) < 10;
        });

        if (clickedVisitor) {
          setSelectedVisitorId(clickedVisitor.id);
          setSelectedRideId(null);
        } else {
          setSelectedRideId(null);
          setSelectedVisitorId(null);
          setIsDragging(true);
          setLastMousePos({ x: e.clientX, y: e.clientY });
        }
      }
    } else if (e.button === 0 && placingRideId && hoveredCell) {
      const rideToPlace = gameState.inventory.find(r => r.id === placingRideId);
      const success = engine.placeRide(placingRideId, hoveredCell.x, hoveredCell.y);
      if (success) {
        audioService.playSFX('place');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Continuous placement for infrastructure
        if (rideToPlace && RIDE_CONFIGS[rideToPlace.type].category === 'INFRASTRUCTURE') {
          const nextItem = engine.getState().inventory.find(r => r.type === rideToPlace.type);
          if (nextItem) {
            setPlacingRideId(nextItem.id);
          } else {
            setPlacingRideId(null);
          }
        } else {
          setPlacingRideId(null);
        }
      } else {
        audioService.playSFX('error');
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setCamera(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }

    // Update hovered cell
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = (e.clientX - rect.left - camera.x) / camera.zoom;
      const my = (e.clientY - rect.top - camera.y) / camera.zoom;
      setHoveredCell({
        x: Math.floor(mx / GRID_SIZE),
        y: Math.floor(my / GRID_SIZE)
      });
    }
  };

  const handleMouseUp = () => {
    if (isZoningMode && zoningStart && hoveredCell) {
      const startX = Math.min(zoningStart.x, hoveredCell.x);
      const startY = Math.min(zoningStart.y, hoveredCell.y);
      const width = Math.abs(zoningStart.x - hoveredCell.x) + 1;
      const height = Math.abs(zoningStart.y - hoveredCell.y) + 1;
      
      if (width > 0 && height > 0) {
        setGameState(engine.addZone(startX, startY, width, height, zoningType));
        audioService.playSFX('place');
      }
      setZoningStart(null);
      return;
    }
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    const newZoom = Math.min(Math.max(camera.zoom - e.deltaY * zoomSpeed, 0.2), 2);
    setCamera(prev => ({ ...prev, zoom: newZoom }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Truck Minigame Overlay */}
      <AnimatePresence>
        {gameState.travelingToCityId && (
          <TruckMinigame engine={engine} gameState={gameState} />
        )}
      </AnimatePresence>

      {/* Setup Screen */}
      <AnimatePresence>
        {isSetupOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 p-0 md:p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full h-full md:h-[90vh] md:max-w-7xl rounded-none md:rounded-[3rem] bg-white p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex flex-col lg:flex-row gap-10 h-full overflow-hidden">
                <div className="w-full lg:w-[400px] flex flex-col justify-center shrink-0">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30">
                    <Building2 size={32} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{t('start_empire')}</h1>
                  <p className="text-slate-500 font-medium mb-8 text-sm">{t('setup_desc')}</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t('company_name')}</label>
                      <input 
                        type="text" 
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-lg font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                        placeholder="e.g. DreamWorld Parks"
                      />
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{t('home_country')}</label>
                      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {Array.from(new Set(CITIES.map(c => c.country))).sort().map(country => (
                          <button
                            key={country}
                            onClick={() => {
                              setSetupCountry(country);
                              const firstCity = CITIES.find(c => c.country === country);
                              if (firstCity) setSetupCity(firstCity.id);
                            }}
                            className={`px-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border-2
                              ${setupCountry === country 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' 
                                : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}
                            `}
                          >
                            {t('country_' + country.replace(/\s+/g, '_'))}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <button 
                      disabled={!setupName.trim()}
                      onClick={() => {
                        engine.initNewGame(setupName, setupCity);
                        setGameState(engine.update());
                        setIsSetupOpen(false);
                        confetti({
                          particleCount: 200,
                          spread: 100,
                          origin: { y: 0.6 }
                        });
                      }}
                      className={`w-full rounded-xl py-4 text-base font-black uppercase tracking-widest transition-all
                        ${setupName.trim() 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                      `}
                    >
                      {t('launch_company')}
                    </button>

                    {GameEngine.hasSave() && (
                      <button 
                        onClick={() => setIsSetupOpen(false)}
                        className="mt-4 w-full text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        {t('continue_game')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                      {t('starting_city_in', { country: t('country_' + setupCountry.replace(/\s+/g, '_')) })}
                    </label>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {t('cities_available', { count: CITIES.filter(c => c.country === setupCountry).length })}
                    </span>
                  </div>
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={setupSearch}
                      onChange={(e) => setSetupSearch(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 bg-white pl-12 pr-4 py-3 text-sm font-bold focus:border-indigo-500 focus:ring-0 transition-all shadow-sm"
                      placeholder={t('search_cities')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {CITIES
                      .filter(city => city.country === setupCountry)
                      .filter(city => 
                        city.name.toLowerCase().includes(setupSearch.toLowerCase())
                      )
                      .map(city => (
                      <button
                        key={city.id}
                        onClick={() => setSetupCity(city.id)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all
                          ${setupCity === city.id 
                            ? 'border-indigo-600 bg-white text-indigo-600 shadow-lg' 
                            : 'border-white bg-white/50 hover:border-slate-200 text-slate-500'}
                        `}
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${setupCity === city.id ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                          <Globe size={20} />
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black leading-tight mb-0.5">{t('city_name_' + city.id)}</p>
                          <p className="text-[9px] font-black uppercase opacity-60 tracking-widest mb-1">{city.population.toLocaleString()} {t('population_short')}</p>
                          <div className="flex items-center gap-1 justify-center">
                            <Clock size={10} className="opacity-60" />
                            <p className="text-[9px] font-black uppercase opacity-60 tracking-widest">
                              {REGION_OPERATING_MONTHS[city.region].startMonth}-{REGION_OPERATING_MONTHS[city.region].endMonth}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Management Modal */}
      <AnimatePresence>
        {isManagementOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
              <div className="flex h-full overflow-hidden">
                {/* Sidebar */}
                <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
                  <div className="p-8 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
                        <Settings size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">{t('management')}</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('park_operations')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
                    {[
                      { id: 'marketplace', label: t('marketplace'), icon: ShoppingBag, group: 'operations' },
                      { id: 'travel', label: t('travel'), icon: MapIcon, group: 'operations' },
                      { id: 'pricing', label: t('pricing'), icon: DollarSign, group: 'operations' },
                      { id: 'research', label: t('research_tab'), icon: FlaskConical, group: 'operations' },
                      { id: 'warehouse', label: t('warehouse'), icon: Package, group: 'logistics' },
                      { id: 'garage', label: t('garage'), icon: Truck, count: gameState.trucks.length, group: 'logistics' },
                      { id: 'staff', label: t('staff'), icon: Users, count: gameState.staff.length, group: 'logistics' },
                      { id: 'connections', label: t('connections'), icon: Handshake, count: gameState.connections.length, group: 'logistics' },
                      { id: 'finance', label: t('financials_tab') || 'Financials', icon: Coins, group: 'finance' },
                      { id: 'challenges', label: t('career_hub') || 'Career Hub', icon: Trophy, count: gameState.challenges.filter(c => !c.isCompleted).length, group: 'career' },
                      { id: 'settings', label: t('administration') || 'Administration', icon: Settings, group: 'system' },
                    ].reduce((acc: any[], tab) => {
                      const groupLabels = {
                        operations: t('operations_group'),
                        logistics: t('logistics_group'),
                        finance: t('finance_group'),
                        career: t('career_group'),
                        system: t('system_group') || 'System'
                      };
                      
                      const lastTab = acc[acc.length - 1];
                      if (!lastTab || lastTab.group !== tab.group) {
                        acc.push({ isHeader: true, label: groupLabels[tab.group as keyof typeof groupLabels] || tab.group, group: tab.group });
                      }
                      acc.push(tab);
                      return acc;
                    }, []).map((tab, idx) => tab.isHeader ? (
                      <div key={`header-${idx}`} className="px-4 pt-6 pb-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{tab.label}</span>
                      </div>
                    ) : (
                      <button
                        key={tab.id}
                        onClick={() => setActiveManagementTab(tab.id as any)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-200 group ${
                          activeManagementTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 translate-x-1' 
                            : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon size={16} className={activeManagementTab === tab.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-lg text-[8px] min-w-[1.2rem] text-center font-bold ${
                            activeManagementTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 border-t border-slate-200 space-y-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          engine.saveGame();
                          audioService.playSFX('buy');
                        }}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[8px] uppercase tracking-widest rounded-lg border-2 border-slate-900 transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-1"
                      >
                        <Save size={10} />
                        {t('save')}
                      </button>
                      <button 
                        onClick={() => setIsResetConfirmOpen(true)}
                        className="flex-1 py-2 bg-rose-100 hover:bg-rose-200 text-rose-600 font-black text-[8px] uppercase tracking-widest rounded-lg border-2 border-slate-900 transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-1"
                      >
                        <Trash2 size={10} />
                        {t('reset')}
                      </button>
                    </div>
                    <button 
                      onClick={() => setIsManagementOpen(false)}
                      className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                    >
                      {t('close_panel')}
                    </button>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-white">
                  <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                      {activeManagementTab === 'settings' ? t('administration') : 
                       activeManagementTab === 'finance' ? t('financials_tab') : 
                       activeManagementTab === 'challenges' ? t('career_hub') :
                       t(activeManagementTab)}
                    </h3>
                    <button 
                      onClick={() => setIsManagementOpen(false)}
                      className="rounded-full p-2 hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                  {activeManagementTab === 'marketplace' && (
                    <div className="space-y-8">
                       <div className="flex items-center gap-4 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('marketplace')}</h2>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('select_item_to_add')}</p>
                        </div>
                      </div>

                      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
                        {(['ALL', 'RIDE', 'FOOD', 'FACILITY', 'INFRASTRUCTURE'] as const).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setShopCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                              ${shopCategory === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}
                            `}
                          >
                            {t(`category_${cat.toLowerCase()}`)}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(Object.keys(RIDE_CONFIGS) as RideType[])
                          .filter(type => {
                            const config = RIDE_CONFIGS[type];
                            if (shopCategory !== 'ALL' && config.category !== shopCategory) return false;
                            return true;
                          })
                          .map(type => {
                            const config = RIDE_CONFIGS[type];
                            const manufacturer = config.manufacturerId ? MANUFACTURERS.find(m => m.id === config.manufacturerId) : null;
                            const finalCost = Math.floor(config.cost * (manufacturer?.costMultiplier || 1.0));
                            const projectForRide = RESEARCH_PROJECTS.find(p => p.unlocksRides.includes(type));
                            const isLocked = !gameState.completedResearchIds.includes(projectForRide?.id as any) && !Object.values(INITIAL_UNLOCKED_RIDES).flat().includes(type) && projectForRide !== undefined;
                            const canAfford = gameState.money >= finalCost;
                            const truckAvailable = gameState.trucks.some(t => !t.assignedRideId);
                            const warehouseCapacity = config.category === 'INFRASTRUCTURE' || (gameState.rides.length + gameState.inventory.length < engine.getWarehouseCapacity());

                            return (
                              <div key={type} className={`group relative flex flex-col rounded-[2.5rem] border bg-white transition-all duration-300 overflow-hidden ${
                                canAfford && truckAvailable && warehouseCapacity && !isLocked
                                  ? 'border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-400' 
                                  : 'border-slate-100 bg-slate-50/50 opacity-80'
                              }`}>
                                <div className={`p-4 border-b font-mono text-[9px] flex items-center justify-between ${
                                  isLocked ? 'bg-slate-200 text-slate-500' : 'bg-slate-50 text-slate-400'
                                }`}>
                                  <span className="uppercase">{config.category}</span>
                                  <span className="font-bold uppercase tracking-widest">{config.intensity}</span>
                                </div>

                                <div className="p-8">
                                  <div className="flex items-start justify-between mb-6">
                                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-colors ${
                                       isLocked ? 'bg-slate-200 text-slate-400' : 'bg-slate-50 text-indigo-600'
                                     }`}>
                                       {config.icon}
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">{t('cost')}</p>
                                        <p className={`text-2xl font-black tracking-tight ${canAfford ? 'text-slate-900' : 'text-rose-500'}`}>${finalCost.toLocaleString()}</p>
                                     </div>
                                  </div>

                                  <div className="mb-6">
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-2 uppercase">{t(`ride_${config.type}_name`)}</h3>
                                    <p className="text-[10px] text-slate-500 leading-relaxed min-h-[3em]">{t(`ride_${config.type}_desc`)}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 mb-6">
                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('size')}</p>
                                      <p className="text-[10px] font-black text-slate-900">{config.width}x{config.height}</p>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t('reliability_label') || 'Reliability'}</p>
                                      <p className="text-[10px] font-black text-slate-900">{manufacturer ? `${(manufacturer.reliabilityBonus * 100).toFixed(0)}%` : '100%'}</p>
                                    </div>
                                  </div>

                                  {!isLocked ? (
                                    <button
                                      disabled={!canAfford || !truckAvailable || !warehouseCapacity}
                                      onClick={() => {
                                        if (engine.buyRide(type)) {
                                          audioService.playSFX('buy');
                                          setGameState(engine.getState());
                                          confetti({ particleCount: 50, spread: 60 });
                                        }
                                      }}
                                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        canAfford && truckAvailable && warehouseCapacity 
                                          ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-xl shadow-indigo-100' 
                                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {canAfford ? t('buy_button') : t('insufficient_funds')}
                                    </button>
                                  ) : (
                                    <div className="flex flex-col items-center gap-2 py-2 bg-slate-100 rounded-2xl border border-slate-200">
                                      <Lock size={14} className="text-slate-400" />
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight px-4">
                                        {t('requires_research')}:<br/>
                                        <span className="text-indigo-600">{projectForRide?.name}</span>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                  {activeManagementTab === 'connections' && (
                  <section className="space-y-12">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
                        <Handshake size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('connections')}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('connections_desc')}</p>
                      </div>
                    </div>

                    {/* Active Rentals Summary */}
                    {gameState.activeRentals.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('active_rentals')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {gameState.activeRentals.map(rental => {
                            const config = RIDE_CONFIGS[gameState.rides.find(r => r.id === rental.rideId)?.type || gameState.inventory.find(r => r.id === rental.rideId)?.type || 'TEA_CUPS'];
                            const partner = gameState.connections.find(c => c.id === rental.partnerId);
                            
                            return (
                              <div key={rental.id} className="bg-white p-4 rounded-[2rem] border-2 border-slate-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${rental.type === 'RENT_IN' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    <ArrowRightLeft size={20} />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase">
                                      {rental.type === 'RENT_IN' ? t('rent_in') : t('rent_out')}: {t(`ride_${config.type}_name`)}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{partner?.name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-slate-900 tracking-tighter">{rental.remainingDays} {t('days')}</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('remaining')}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Showmen Network */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('showmen_network')}</h3>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                      
                      {gameState.connections.length === 0 ? (
                        <div className="py-16 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('no_connections')}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {gameState.connections.map(conn => (
                            <div key={conn.id} className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                              <div className="p-8 flex items-center justify-between bg-slate-50 border-b border-slate-100">
                                <div className="flex items-center gap-4">
                                  <div className="h-14 w-14 flex items-center justify-center bg-indigo-600 rounded-2xl text-2xl text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                                    {conn.specialty === 'RIDE' ? '🎢' : '🌭'}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{conn.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{CITIES.find(c => c.id === conn.location)?.name}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1.5 justify-end mb-1">
                                    <TrendingUp size={14} className="text-emerald-500" />
                                    <span className="text-lg font-black text-slate-900 tracking-tighter">{conn.reputation}%</span>
                                  </div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('reputation')}</p>
                                </div>
                              </div>
                              
                              <div className="p-8 space-y-8">
                                {/* Available for Rent In */}
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('rent_in_market')}</h5>
                                  <div className="grid grid-cols-1 gap-3">
                                    {conn.availableRides.map(rideType => {
                                      const config = RIDE_CONFIGS[rideType];
                                      const dailyRate = Math.floor(config.cost * 0.02);
                                      const alreadyRented = gameState.activeRentals.some(r => r.partnerId === conn.id && gameState.inventory.find(i => i.id === r.rideId)?.type === rideType);
                                      
                                      return (
                                        <div key={rideType} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                          <div className="flex items-center gap-3">
                                            <span className="text-xl">{config.icon}</span>
                                            <div>
                                              <span className="text-xs font-bold text-slate-900 block">{t(`ride_${config.type}_name`)}</span>
                                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">${dailyRate}/{t('day_label')}</span>
                                            </div>
                                          </div>
                                          <button
                                            disabled={alreadyRented || gameState.money < dailyRate}
                                            onClick={() => {
                                              if (engine.rentRideIn(conn.id, rideType, 10)) {
                                                audioService.playSFX('build');
                                                setGameState(engine.getState());
                                              }
                                            }}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                                              ${alreadyRented ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-50 active:scale-95'}
                                            `}
                                          >
                                            {alreadyRented ? t('rented') : t('rent_button')}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Rent Out Options */}
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('rent_out_inventory')}</h5>
                                  {gameState.inventory.length === 0 ? (
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-100 italic">No spare rides to rent out.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                      {gameState.inventory.slice(0, 3).map(ride => {
                                        const config = RIDE_CONFIGS[ride.type];
                                        const dailyIncome = Math.floor(config.cost * 0.015);
                                        
                                        return (
                                          <div key={ride.id} className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100/50">
                                            <div className="flex items-center gap-3">
                                              <span className="text-xl">{config.icon}</span>
                                              <div>
                                                <span className="text-xs font-bold text-slate-900 block">{t(`ride_${config.type}_name`)}</span>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">+${dailyIncome}/{t('day_label')}</span>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => {
                                                if (engine.rentRideOut(ride.id, conn.id, 10)) {
                                                  audioService.playSFX('coins');
                                                  setGameState(engine.getState());
                                                }
                                              }}
                                              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-50 active:scale-95 transition-all"
                                            >
                                              {t('rent_out')}
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}
                {activeManagementTab === 'finance' && (
                  <div className="space-y-12 max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-100">
                        <Wallet size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('financial_ledger')}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('daily_accounting')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Income Statement */}
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <ArrowUpRight size={20} />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{t('gross_revenue')}</h3>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: t('ride_tickets'), value: gameState.finances.income.tickets },
                            { label: t('wristbands'), value: gameState.finances.income.wristbands },
                            { label: t('concessions'), value: gameState.finances.income.food },
                            { label: t('miscellaneous'), value: gameState.finances.income.other }
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between items-center group/row px-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/row:text-slate-600 transition-colors">{row.label}</span>
                              <span className="text-[11px] font-black text-emerald-600">+${row.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center px-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{t('total_revenue')}</span>
                          <span className="text-xl font-black text-emerald-600">
                            +${(Object.values(gameState.finances.income) as number[]).reduce((a, b) => a + b, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Expense Report */}
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <ArrowDownRight size={20} />
                          </div>
                          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{t('operating_expenses')}</h3>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: t('payroll'), value: gameState.finances.expenses.wages },
                            { label: t('utilities'), value: gameState.finances.expenses.electricity },
                            { label: t('rent'), value: gameState.finances.expenses.rent },
                            { label: t('maintenance_label'), value: gameState.finances.expenses.maintenance }
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between items-center group/row px-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover/row:text-slate-600 transition-colors">{row.label}</span>
                              <span className="text-[11px] font-black text-rose-500">-${row.value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-6 border-t border-slate-50 flex justify-between items-center px-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{t('total_overhead')}</span>
                          <span className="text-xl font-black text-rose-500">
                            -${(Object.values(gameState.finances.expenses) as number[]).reduce((a, b) => a + b, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Credit Facility & Loans Integration */}
                    <div className="space-y-10">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">{t('credit_facility')}</h3>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Active Loans List */}
                        <div className="space-y-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">{t('active_obligations') || 'ACTIVE OBLIGATIONS'}</p>
                          {gameState.activeLoans.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px]">
                              <Coins size={24} className="text-slate-300 mb-3" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('no_active_loans')}</p>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                              {gameState.activeLoans.map(loan => (
                                <div key={loan.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-start mb-6">
                                    <div>
                                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{t('remaining_debt') || 'DEBT'}</p>
                                      <p className="text-2xl font-black text-slate-900 tracking-tight">${Math.round(loan.remainingPrincipal).toLocaleString()}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black">
                                      {(loan.interestRate * 100).toFixed(1)}% {t('interest_short')}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => engine.repayLoan(loan.id, Math.min(gameState.money, 5000))}
                                      disabled={gameState.money < 100}
                                      className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[9px] uppercase tracking-widest rounded-1.5xl transition-all"
                                    >
                                      $5,000
                                    </button>
                                    <button 
                                      onClick={() => engine.repayLoan(loan.id, Math.min(gameState.money, loan.remainingPrincipal))}
                                      disabled={gameState.money < 100}
                                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[9px] uppercase tracking-widest rounded-1.5xl shadow-lg transition-all"
                                    >
                                      {t('pay_off') || 'SETTLE'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Credit Marketplace */}
                        <div className="space-y-4">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2">{t('available_liquidity') || 'AVAILABLE LIQUIDITY'}</p>
                          <div className="grid grid-cols-1 gap-4">
                            {[
                              { amount: 10000, term: 14, label: t('expansion_credit'), icon: <Zap size={18} /> },
                              { amount: 50000, term: 30, label: t('venture_capital'), icon: <Gem size={18} /> }
                            ].map((offer, i) => (
                              <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] shadow-sm hover:border-indigo-200 transition-all group flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-white rounded-xl text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    {offer.icon}
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase text-indigo-500 mb-0.5">{offer.label}</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tight">${offer.amount.toLocaleString()}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => engine.takeLoan(offer.amount, offer.term)}
                                  className="px-6 py-3 bg-white border-2 border-slate-900 text-slate-900 font-black text-[9px] uppercase tracking-widest rounded-1.5xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:translate-x-0.5 hover:shadow-none transition-all"
                                >
                                  {t('accept') || 'ACCEPT'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeManagementTab === 'challenges' && (
                  <div className="space-y-12 max-w-5xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-100">
                        <Trophy size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{t('career_hub')}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('achievements_and_challenges') || 'GOALS & REWARDS'}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('active_milestones') || 'ACTIVE MILESTONES'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gameState.challenges.filter(c => !c.isCompleted).map(challenge => (
                          <div key={challenge.id} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                <Target size={20} />
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{t('reward') || 'REWARD'}</p>
                                <p className="text-xs font-black text-emerald-600">+${challenge.rewardMoney.toLocaleString()}</p>
                              </div>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 uppercase mb-1">{challenge.title}</h4>
                            <p className="text-[10px] text-slate-400 leading-tight mb-4">{challenge.description}</p>
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
                                <span>{t('progress')}</span>
                                <span>{challenge.current} / {challenge.target}</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(challenge.current/challenge.target)*100}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('unlocked_accolades') || 'UNLOCKED ACCOLADES'}</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {gameState.achievements.map((achievement) => (
                          <div key={achievement.id} className={`aspect-square rounded-[1.5rem] border relative group transition-all ${
                            achievement.isUnlocked ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50/50 border-slate-100/50 opacity-40 grayscale'
                          }`}>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                              <span className={`text-2xl mb-1 ${achievement.isUnlocked ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {achievement.isUnlocked ? '🏆' : '🔒'}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-tight text-slate-900 line-clamp-2">{achievement.title}</span>
                            </div>
                            {achievement.isUnlocked && (
                              <div className="absolute inset-0 bg-slate-900/95 opacity-0 group-hover:opacity-100 transition-all rounded-[1.5rem] flex items-center justify-center p-4">
                                <p className="text-[8px] font-bold text-white leading-tight uppercase tracking-tight">{achievement.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeManagementTab === 'research' && (
                  <div className="space-y-8">
                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Research Points</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">{Math.floor(gameState.researchPoints)} RP</span>
                          <span className="text-sm font-bold opacity-70">available</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 mt-2 uppercase tracking-widest">
                          Generate RP based on park visitor count
                        </p>
                      </div>
                      
                      {gameState.activeResearchId && (
                        <div className="flex-1 max-w-xs space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Researching: {RESEARCH_PROJECTS.find(p => p.id === gameState.activeResearchId)?.name}</span>
                            <span className="text-xs font-black">{Math.floor(gameState.researchProgress)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500"
                              style={{ width: `${gameState.researchProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {RESEARCH_PROJECTS.map(project => {
                        const isCompleted = gameState.completedResearchIds.includes(project.id);
                        const isActive = gameState.activeResearchId === project.id;
                        const canStart = !isCompleted && !isActive && !gameState.activeResearchId && gameState.researchPoints >= project.cost;
                        const isLocked = !isCompleted && project.prerequisiteIds.some(preId => !gameState.completedResearchIds.includes(preId));
                        
                        return (
                          <div key={project.id} className={`p-6 rounded-3xl border-2 transition-all ${
                            isCompleted ? 'bg-emerald-50 border-emerald-100' : 
                            isActive ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500 ring-offset-2' :
                            isLocked ? 'bg-slate-50 border-slate-100 opacity-60' :
                            'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md'
                          }`}>
                            <div className="flex justify-between items-start mb-4">
                              <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                <FlaskConical size={20} />
                              </div>
                              {isCompleted ? (
                                <span className="text-emerald-600"><CheckCircle2 size={24} /></span>
                              ) : isLocked ? (
                                <Lock size={20} className="text-slate-400" />
                              ) : (
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{project.cost} RP</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">Requirement</p>
                                </div>
                              )}
                            </div>

                            <h4 className="font-black text-slate-900 uppercase tracking-tight">{project.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">{project.description}</p>
                            
                            <div className="mt-4 pt-4 border-t border-white/50 space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unlocks:</p>
                              <div className="flex flex-wrap gap-2">
                                {project.unlocksRides.map(rideType => (
                                  <span key={rideType} className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-600 uppercase">
                                    {RIDE_CONFIGS[rideType].name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {!isCompleted && (
                              <button
                                disabled={!canStart || isLocked}
                                onClick={() => {
                                  engine.startResearch(project.id);
                                  setGameState(engine.getState());
                                  audioService.playSFX('select');
                                }}
                                className={`w-full mt-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  isActive ? 'bg-indigo-100 text-indigo-600 cursor-default' :
                                  canStart ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100' :
                                  'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                {isActive ? 'Researching...' : isLocked ? 'Prerequisites Required' : 'Start Research'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {activeManagementTab === 'settings' && (
                  <>
                    {/* Park Status Control */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Play size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('park_operations')}</h3>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        {!engine.canParkOpen().canOpen && (
                          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle size={14} />
                            <span>{engine.canParkOpen().reason && t(engine.canParkOpen().reason!)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{t('manual_override')}</p>
                            <p className="text-[10px] text-slate-500">{t('force_park_desc')}</p>
                          </div>
                          {(() => {
                            const canOpen = engine.canParkOpen();
                            const isActuallyOpen = !gameState.settings.isManuallyClosed && canOpen.canOpen;
                            return (
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                ${isActuallyOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                              `}>
                                <div className={`h-2 w-2 rounded-full ${isActuallyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                {isActuallyOpen ? t('park_is_open') : t('park_is_closed')}
                              </div>
                            );
                          })()}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              if (engine.openPark()) {
                                setGameState(engine.getState());
                              }
                            }}
                            disabled={!gameState.settings.isManuallyClosed && engine.canParkOpen().canOpen}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                              ${(!gameState.settings.isManuallyClosed && engine.canParkOpen().canOpen)
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100'}
                            `}
                          >
                            <Play size={16} fill="currentColor" />
                            {t('open_park')}
                          </button>
                          <button
                            onClick={() => {
                              engine.closePark();
                              setGameState(engine.getState());
                            }}
                            disabled={gameState.settings.isManuallyClosed}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                              ${gameState.settings.isManuallyClosed
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100'}
                            `}
                          >
                            <Square size={16} fill="currentColor" />
                            {t('close_park')}
                          </button>
                        </div>

                        {(() => {
                          const canOpen = engine.canParkOpen();
                          if (!canOpen.canOpen && !gameState.settings.isManuallyClosed) {
                            return (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                  <p className="text-xs font-medium text-amber-700 leading-tight">
                                    {canOpen.reason && t(canOpen.reason.key, canOpen.reason.replacements)}
                                  </p>
                                </div>
                                {canOpen.reason?.key === 'reason_seasonal_closure' && (
                                  <button 
                                    onClick={() => {
                                      if (engine.skipToNextOpening()) {
                                        setGameState(engine.getState());
                                      }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 transition-colors"
                                  >
                                    <FastForward size={14} />
                                    {t('skip_to_opening')}
                                  </button>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </section>

                    {/* Company Settings */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('company_name')}</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t('company_name')}</label>
                          <input 
                            type="text" 
                            value={gameState.company.name}
                            onChange={(e) => {
                              engine.updateCompanyName(e.target.value);
                              setGameState(engine.getState());
                            }}
                            className="w-full mt-1 rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder={t('company_name')}
                          />
                        </div>
                      </div>
                    </section>

                    {/* Audio Settings */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('audio_settings')}</h3>
                      </div>
                      <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('music_volume')}</label>
                            <span className="text-xs font-bold text-slate-600">{Math.round(gameState.settings.musicVolume * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01"
                            value={gameState.settings.musicVolume}
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value);
                              engine.setAudioSettings(vol, gameState.settings.sfxVolume);
                              setGameState(engine.getState());
                            }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('sound_effects')}</label>
                            <span className="text-xs font-bold text-slate-600">{Math.round(gameState.settings.sfxVolume * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01"
                            value={gameState.settings.sfxVolume}
                            onChange={(e) => {
                              const vol = parseFloat(e.target.value);
                              engine.setAudioSettings(gameState.settings.musicVolume, vol);
                              setGameState(engine.getState());
                            }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </section>

                    {/* Park Hours */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <MousePointer2 size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('operating_hours')}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t('open_time')}</label>
                          <select 
                            value={gameState.settings.openTime}
                            onChange={(e) => {
                              engine.updateSettings({ openTime: parseInt(e.target.value) });
                              setGameState(engine.getState());
                            }}
                            className="w-full mt-1 rounded-xl border-slate-200 bg-white p-3 text-sm font-bold"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i}>{i}:00</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t('close_time')}</label>
                          <select 
                            value={gameState.settings.closeTime}
                            onChange={(e) => {
                              engine.updateSettings({ closeTime: parseInt(e.target.value) });
                              setGameState(engine.getState());
                            }}
                            className="w-full mt-1 rounded-xl border-slate-200 bg-white p-3 text-sm font-bold"
                          >
                            {Array.from({ length: 24 }).map((_, i) => (
                              <option key={i} value={i}>{i}:00</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {activeManagementTab === 'pricing' && (
                  <div className="space-y-10">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">{t('visitor_demand')}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">{Math.floor(engine.getVisitorDemandMultiplier() * 100)}%</span>
                          <span className="text-sm font-bold opacity-70">{t('of_potential')}</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 mt-2 uppercase tracking-widest">
                          {t('price_demand_warning')}
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <TrendingUp size={24} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('standard_entry')}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('single_ride_ticket')}</label>
                              <span className="text-sm font-black text-slate-900">${gameState.settings.pricing.ticketPrice}</span>
                            </div>
                            <input 
                              type="range" min="1" max="20" step="1"
                              value={gameState.settings.pricing.ticketPrice}
                              onChange={(e) => {
                                  engine.updateSettings({ pricing: { ...gameState.settings.pricing, ticketPrice: parseInt(e.target.value) } });
                                  setGameState(engine.getState());
                                }}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('ride_bundle')} ({gameState.settings.pricing.bundleSize} rides)</label>
                              <span className="text-sm font-black text-slate-900">${gameState.settings.pricing.bundlePrice}</span>
                            </div>
                            <input 
                              type="range" min="5" max="50" step="1"
                              value={gameState.settings.pricing.bundlePrice}
                              onChange={(e) => {
                                  engine.updateSettings({ pricing: { ...gameState.settings.pricing, bundlePrice: parseInt(e.target.value) } });
                                  setGameState(engine.getState());
                                }}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('premium_passes')}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('all_day_wristband')}</label>
                              <span className="text-sm font-black text-slate-900">${gameState.settings.pricing.wristbandPrice}</span>
                            </div>
                            <input 
                              type="range" min="10" max="100" step="1"
                              value={gameState.settings.pricing.wristbandPrice}
                              onChange={(e) => {
                                  engine.updateSettings({ pricing: { ...gameState.settings.pricing, wristbandPrice: parseInt(e.target.value) } });
                                  setGameState(engine.getState());
                                }}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('season_pass')}</label>
                              <span className="text-sm font-black text-slate-900">${gameState.settings.pricing.seasonPassPrice}</span>
                            </div>
                            <input 
                              type="range" min="50" max="500" step="1"
                              value={gameState.settings.pricing.seasonPassPrice}
                              onChange={(e) => {
                                  engine.updateSettings({ pricing: { ...gameState.settings.pricing, seasonPassPrice: parseInt(e.target.value) } });
                                  setGameState(engine.getState());
                                }}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-widest text-amber-900 mb-1">{t('pricing_strategy_tip')}</h4>
                          <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                            Wristbands and Season Passes provide immediate cash flow but reduce per-ride income. 
                            High ticket prices will discourage visitors from staying long and reduce overall park attendance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeManagementTab === 'warehouse' && (
                  <div className="space-y-10">
                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">{t('warehouse_capacity')}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">{gameState.rides.length + gameState.inventory.length} / {engine.getWarehouseCapacity()}</span>
                          <span className="text-sm font-bold opacity-70">{t('attractions')}</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 mt-2 uppercase tracking-widest">
                          {t('home_city')}: {gameState.company.homeCityId ? t('city_name_' + gameState.company.homeCityId) : t('not_set')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{t('warehouse_level')}</p>
                          <p className="text-2xl font-black">{gameState.company.warehouseLevel}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (engine.upgradeWarehouse()) {
                              audioService.playSFX('buy');
                              setGameState(engine.getState());
                              confetti({ particleCount: 50, spread: 60 });
                            }
                          }}
                          disabled={gameState.money < engine.getWarehouseUpgradeCost()}
                          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                            ${gameState.money >= engine.getWarehouseUpgradeCost() 
                              ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg' 
                              : 'bg-white/20 text-white/40 cursor-not-allowed'}
                          `}
                        >
                          {t('upgrade_label')} (${engine.getWarehouseUpgradeCost()})
                        </button>
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('stored_attractions')}</h3>
                      </div>
                      {gameState.inventory.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                            <ShoppingBag size={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-500">{t('warehouse_empty')}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(Array.from(new Set(gameState.inventory.map(r => r.type))) as RideType[]).map(type => {
                            const config = RIDE_CONFIGS[type];
                            const itemsOfType = gameState.inventory.filter(r => r.type === type);
                            const firstItem = itemsOfType[0];
                            
                            return (
                              <div key={type} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl relative">
                                  {config.icon}
                                  {itemsOfType.length > 1 && (
                                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                      x{itemsOfType.length}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-black text-slate-900">{t(`ride_${config.type}_name`)}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    {itemsOfType.length > 1 ? `${itemsOfType.length} ${t('items_available')}` : `${t('condition_label')}: ${firstItem.condition}%`}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setPlacingRideId(firstItem.id);
                                    setIsManagementOpen(false);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                >
                                  {t('place_label')}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                )}
                {activeManagementTab === 'staff' && (
                  <div className="space-y-10">
                    {/* Staff Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('total_staff')}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">{gameState.staff.length}</span>
                          <span className="text-[10px] font-bold text-slate-400">{t('employees')}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('avg_happiness')}</p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-black ${
                            gameState.staff.length === 0 ? 'text-slate-300' :
                            (gameState.staff.reduce((acc, s) => acc + s.happiness, 0) / gameState.staff.length) > 70 ? 'text-emerald-600' :
                            (gameState.staff.reduce((acc, s) => acc + s.happiness, 0) / gameState.staff.length) > 40 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {gameState.staff.length === 0 ? '0' : Math.floor(gameState.staff.reduce((acc, s) => acc + s.happiness, 0) / gameState.staff.length)}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{t('morale')}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('hourly_payroll')}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">${gameState.staff.reduce((acc, s) => acc + s.salary, 0)}</span>
                          <span className="text-[10px] font-bold text-slate-400">{t('per_hour')}</span>
                        </div>
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('recruitment_center')}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Object.keys(STAFF_CONFIGS) as StaffType[]).map(type => {
                          const config = STAFF_CONFIGS[type];
                          const hiringFee = config.baseSalary * 10;
                          const canAfford = gameState.money >= hiringFee;
                          return (
                            <button
                              key={type}
                              disabled={!canAfford}
                              onClick={() => {
                                engine.hireStaff(type);
                                setGameState(engine.getState());
                              }}
                              className={`group relative flex flex-col gap-3 p-5 rounded-3xl border transition-all text-left overflow-hidden ${
                                canAfford 
                                  ? "border-slate-100 bg-white hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1" 
                                  : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                              }`}
                            >
                              <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                <span className="text-6xl">{config.icon}</span>
                              </div>
                              <div className="flex items-center justify-between relative z-10">
                                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-50 text-2xl group-hover:bg-indigo-50 transition-colors">
                                  {config.icon}
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">${config.baseSalary}/hr</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">{t('base_salary')}</p>
                                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">${hiringFee}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">{t('hiring_fee')}</p>
                                </div>
                              </div>
                              <div className="relative z-10">
                                <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{t(`staff_${config.type}_name`)}</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1 line-clamp-2">{t(`staff_${config.type}_desc`)}</p>
                              </div>
                              <div className="mt-2 pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{t('hire_staff')}</span>
                                <Plus size={14} className="text-indigo-600 group-hover:rotate-90 transition-transform" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('your_team')}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {t('total_hourly_wage')}: ${gameState.staff.reduce((acc, s) => acc + s.salary, 0)}
                        </span>
                      </div>

                      {gameState.staff.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('no_staff_hired')}</p>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          {(Object.keys(STAFF_CONFIGS) as StaffType[]).map(type => {
                            const staffInCategory = gameState.staff.filter(s => s.type === type);
                            if (staffInCategory.length === 0) return null;
                            const config = STAFF_CONFIGS[type];

                            return (
                              <div key={type} className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                  <span className="text-lg">{config.icon}</span>
                                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t(`staff_${config.type}_name`)}s ({staffInCategory.length})</h4>
                                  <div className="flex-1 h-px bg-slate-100"></div>
                                </div>
                                <div className="grid gap-3">
                                  {staffInCategory.map(staff => {
                                    const minSalary = config.baseSalary * (1 + (staff.level - 1) * 0.5);
                                    const trainingCost = staff.level * 500;
                                    const happinessColor = staff.happiness > 70 ? 'text-emerald-500' : staff.happiness > 40 ? 'text-amber-500' : 'text-rose-500';
                                    const HappinessIcon = staff.happiness > 70 ? Smile : staff.happiness > 40 ? Meh : Frown;
                                    const isUnhappy = staff.happiness < 40;
                                    const salaryRatio = staff.salary / minSalary;

                                    return (
                                      <div key={staff.id} className={`p-4 rounded-2xl border transition-all ${
                                        isUnhappy ? 'border-rose-100 bg-rose-50/50 shadow-sm' : 'border-slate-100 bg-white shadow-sm'
                                      } hover:border-indigo-100 hover:shadow-md group/card`}>
                                        <div className="flex items-center justify-between gap-6">
                                          {/* Left Info Section */}
                                          <div className="flex items-center gap-4 flex-1">
                                            <div className={`h-12 w-12 flex items-center justify-center rounded-xl text-xl shrink-0 ${
                                              isUnhappy ? 'bg-rose-100 shadow-inner' : 'bg-slate-50 shadow-sm group-hover/card:bg-indigo-50 transition-colors'
                                            }`}>
                                              {config.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1 overflow-x-auto no-scrollbar">
                                                <h4 className="font-bold text-xs text-slate-900 shrink-0">ID: {staff.id.slice(0, 6)}</h4>
                                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-widest shrink-0">
                                                  {t('lvl_label')} {staff.level}
                                                </span>
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-widest shrink-0 border ${
                                                  staff.state === 'WORKING' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                  staff.state === 'RESTING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                  'bg-slate-50 text-slate-500 border-slate-100'
                                                }`}>
                                                  {staff.state === 'WORKING' ? t('working_label') :
                                                   staff.state === 'RESTING' ? t('resting_label') :
                                                   t('idle_label')}
                                                </span>
                                              </div>
                                              {staff.assignedRideId ? (
                                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest truncate">
                                                  {t('assigned')}: {t(`ride_${gameState.rides.find(r => r.id === staff.assignedRideId)?.type || 'TEA_CUPS'}_name`)}
                                                </p>
                                              ) : (
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{t('unassigned')}</p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Middle Stats Section */}
                                          <div className="flex items-center gap-6 shrink-0">
                                            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                              <div className={`flex items-center gap-1 ${staff.stamina > 70 ? 'text-emerald-500' : staff.stamina > 30 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                <Zap size={12} fill="currentColor" />
                                                <span className="text-[10px] font-black">{Math.floor(staff.stamina)}%</span>
                                              </div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">{t('stamina')}</p>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                              <div className={`flex items-center gap-1 ${happinessColor}`}>
                                                <HappinessIcon size={12} fill="currentColor" />
                                                <span className="text-[10px] font-black">{Math.floor(staff.happiness)}%</span>
                                              </div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">{t('happiness')}</p>
                                            </div>
                                          </div>

                                          {/* Right Slider Section */}
                                          <div className="w-56 shrink-0 flex items-center gap-4 border-l border-slate-100 pl-4">
                                            <div className="flex-1">
                                              <div className="flex justify-between items-center mb-1">
                                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">${staff.salary}/hr</span>
                                                {salaryRatio < 1 && <span className="text-[7px] font-black text-rose-500 uppercase">Underpaid</span>}
                                              </div>
                                              <input 
                                                type="range"
                                                min={Math.ceil(minSalary * 0.5)}
                                                max={Math.ceil(minSalary * 3)}
                                                value={staff.salary}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value);
                                                  engine.updateStaffSalary(staff.id, val);
                                                  setGameState(engine.getState());
                                                }}
                                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-600 transition-all"
                                              />
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                              <button 
                                                disabled={staff.level >= 5 || gameState.money < trainingCost}
                                                onClick={() => {
                                                  if (engine.trainStaff(staff.id)) {
                                                    setGameState(engine.getState());
                                                  }
                                                }}
                                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all"
                                                title={t('train_button', { cost: trainingCost })}
                                              >
                                                <GraduationCap size={16} />
                                              </button>
                                              <button 
                                                onClick={() => {
                                                  engine.fireStaff(staff.id);
                                                  setGameState(engine.getState());
                                                }}
                                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                                title={t('fire_staff')}
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  </div>
                )}

                {activeManagementTab === 'garage' && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Truck size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('truck_garage')}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="font-black text-slate-900">{t('garage_level')} {gameState.company.garageLevel}</h4>
                            <p className="text-xs text-slate-500">{t('capacity_value', { current: gameState.trucks.length, max: GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel)?.capacity || 0 })}</p>
                          </div>
                          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Warehouse size={24} />
                          </div>
                        </div>
                        
                        {gameState.company.garageLevel < 5 ? (
                          <button
                            onClick={() => {
                              if (engine.upgradeGarage()) {
                                audioService.playSFX('buy');
                                setGameState(engine.getState());
                              }
                            }}
                            disabled={gameState.money < (GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel + 1)?.upgradeCost || 0)}
                            className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                              ${gameState.money >= (GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel + 1)?.upgradeCost || 0)
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                            `}
                          >
                            {t('upgrade_garage')} (${GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel + 1)?.upgradeCost || 0})
                          </button>
                        ) : (
                          <div className="text-center py-3 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {t('max_level_reached')}
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h4 className="font-black text-slate-900">{t('buy_new_truck')}</h4>
                            <p className="text-xs text-slate-500">{t('cost')}: ${TRUCK_COST}</p>
                          </div>
                          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Truck size={24} />
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (engine.buyTruck()) {
                              audioService.playSFX('buy');
                              setGameState(engine.getState());
                            }
                          }}
                          disabled={gameState.money < TRUCK_COST || gameState.trucks.length >= (GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel)?.capacity || 0)}
                          className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                            ${gameState.money >= TRUCK_COST && gameState.trucks.length < (GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel)?.capacity || 0)
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                          `}
                        >
                          {gameState.trucks.length >= (GARAGE_CONFIGS.find((c: any) => c.level === gameState.company.garageLevel)?.capacity || 0)
                            ? t('garage_full')
                            : t('buy_truck_button', { cost: TRUCK_COST.toLocaleString() })}
                        </button>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('your_trucks')}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {gameState.trucks.map(truck => (
                          <div key={truck.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${truck.assignedRideId ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                              <Truck size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{truck.name}</p>
                              <p className="text-[10px] font-medium text-slate-500">
                                {truck.assignedRideId ? t('transporting') : t('idle')}
                              </p>
                            </div>
                          </div>
                        ))}
                        {gameState.trucks.length === 0 && (
                          <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-xs font-bold text-slate-400">{t('no_trucks_in_garage')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                )}

                {activeManagementTab === 'travel' && (
                  <section className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Plane size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('travel_to_new_cities')}</h3>
                        </div>
                        
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                          <button 
                            onClick={() => setTravelView('list')}
                            className={`p-1.5 rounded-lg transition-all ${travelView === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <List size={16} />
                          </button>
                          <button 
                            onClick={() => setTravelView('map')}
                            className={`p-1.5 rounded-lg transition-all ${travelView === 'map' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            <MapIcon size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative w-48">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input 
                            type="text" 
                            value={travelSearch}
                            onChange={(e) => setTravelSearch(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                            placeholder={t('search_placeholder')}
                          />
                        </div>

                        {/* Sort Controls */}
                        {travelView === 'list' && (
                          <div className="flex items-center gap-2">
                            <select 
                              value={travelSortBy}
                              onChange={(e) => setTravelSortBy(e.target.value as any)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                            >
                              <option value="name">{t('name')}</option>
                              <option value="population">{t('population')}</option>
                              <option value="cost">{t('travel_cost')}</option>
                              <option value="multiplier">{t('multiplier')}</option>
                            </select>
                            <button 
                              onClick={() => setTravelSortOrder(travelSortOrder === 'asc' ? 'desc' : 'asc')}
                              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all"
                            >
                              {travelSortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {travelView === 'list' ? (
                        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                          <div className="space-y-4 pb-12">
                            {travelSearch || selectedTravelCountry ? (
                              <div className="space-y-6">
                                {selectedTravelCountry && !travelSearch && (
                                  <button 
                                    onClick={() => setSelectedTravelCountry(null)}
                                    className="flex items-center gap-2 text-indigo-600 hover:gap-3 transition-all font-black uppercase tracking-widest text-[10px] mb-4 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100"
                                  >
                                    <ArrowLeft size={14} /> {t('back_to_territories')}
                                  </button>
                                )}
                                
                                <div className="grid grid-cols-1 gap-4">
                                  {(travelSearch ? 
                                    gameState.cities.filter(city => 
                                      city.name.toLowerCase().includes(travelSearch.toLowerCase()) || 
                                      city.country.toLowerCase().includes(travelSearch.toLowerCase())
                                    ) :
                                    gameState.cities.filter(city => city.country === selectedTravelCountry)
                                  )
                                  .sort((a, b) => {
                                    let valA: any, valB: any;
                                    switch (travelSortBy) {
                                      case 'name': valA = a.name; valB = b.name; break;
                                      case 'population': valA = a.population; valB = b.population; break;
                                      case 'cost': valA = engine.getTravelCost(a.id); valB = engine.getTravelCost(b.id); break;
                                      case 'multiplier': valA = a.visitorMultiplier; valB = b.visitorMultiplier; break;
                                    }
                                    const modifier = travelSortOrder === 'asc' ? 1 : -1;
                                    if (valA < valB) return -1 * modifier;
                                    if (valA > valB) return 1 * modifier;
                                    return 0;
                                  })
                                  .map(city => {
                                    const isCurrent = city.id === gameState.company.currentCityId;
                                    const cost = engine.getTravelCost(city.id);
                                    const canAfford = gameState.money >= cost;
                                    const isClean = gameState.rides.length === 0;
                                    
                                    return (
                                      <div 
                                        key={city.id}
                                        onClick={() => setSelectedCityInfoId(city.id)}
                                        className={`group relative flex flex-col sm:flex-row items-center gap-6 p-6 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden ${
                                          isCurrent 
                                            ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                                            : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md'
                                        }`}
                                      >
                                        {/* Ticket Pattern Edge */}
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-6 border-r-2 border-slate-100 rounded-r-full bg-slate-50 -ml-3 group-hover:border-indigo-200 transition-colors" />
                                        
                                        <div className="flex items-center gap-6 flex-1 w-full pl-4">
                                          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner transition-colors ${
                                            isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                          }`}>
                                            <PlaneTakeoff size={32} />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                              <h4 className="font-black text-lg text-slate-900 tracking-tight">{t('city_name_' + city.id)}</h4>
                                              <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 uppercase tracking-widest">
                                                {t('country_' + city.country.replace(/\s+/g, '_'))}
                                              </span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                <TrendingUp size={12} /> x{city.visitorMultiplier} {t('demand')}
                                              </span>
                                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                                                <MapIcon size={12} /> {city.mapWidth}x{city.mapHeight} {t('area')}
                                              </span>
                                              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Users size={12} /> {(city.population / 1000000).toFixed(1)}M {t('pop')}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 sm:pl-6 sm:border-l border-slate-100">
                                          {!isCurrent ? (
                                            <>
                                              <p className={`text-xl font-black ${canAfford ? 'text-slate-900' : 'text-rose-400'}`}>
                                                ${cost.toLocaleString()}
                                              </p>
                                              <button
                                                disabled={!canAfford || !isClean || (gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPendingTravelCityId(city.id);
                                                  setDraftPermit(prev => ({ ...prev, signature: gameState.company.name }));
                                                  setIsPermitFormOpen(true);
                                                }}
                                                className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                                                  canAfford && isClean && !(gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')
                                                    ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-100 hover:shadow-slate-100' 
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                                }`}
                                              >
                                                {gameState.rides.length > 0 ? t('park_full') : t('buy_permit')}
                                              </button>
                                            </>
                                          ) : (
                                            <div className="flex flex-col items-end">
                                              <span className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                                                {t('active_site')}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from(new Set(gameState.cities.map(c => c.country as string))).sort().map((country: string) => {
                                  const citiesInCountry = gameState.cities.filter(c => c.country === country);
                                  const isCurrentCountry = gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === country;
                                  
                                  return (
                                    <button
                                      key={country}
                                      onClick={() => setSelectedTravelCountry(country)}
                                      className={`group flex flex-col items-start p-8 rounded-[2.5rem] border-2 transition-all hover:-translate-y-1 active:translate-y-0 ${
                                        isCurrentCountry ? 'border-indigo-600 bg-indigo-50 shadow-xl shadow-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200 shadow-sm'
                                      }`}
                                    >
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all ${
                                        isCurrentCountry ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                      }`}>
                                        <Flag size={28} />
                                      </div>
                                      <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-2">{t(`country_${country.replace(/\s+/g, '_')}`) || country}</h4>
                                      <p className="text-2xl font-black text-slate-900 tracking-tight mb-4">{citiesInCountry.length} {t('cities_lower')}</p>
                                      {isCurrentCountry ? (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                                          {t('headquarters')}
                                        </div>
                                      ) : (
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">
                                          {t('explore_territory')} &rarr;
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full bg-slate-950 rounded-[2.5rem] border border-slate-900 relative overflow-hidden flex items-center justify-center group/map shadow-2xl">
                          {/* Map Controls */}
                          <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                            <button 
                              onClick={() => setTravelMapScale(prev => Math.min(prev + 0.2, 3))}
                              className="p-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white/50 rounded-2xl hover:text-white hover:bg-slate-800 transition-all shadow-xl"
                            >
                              <Plus size={20} />
                            </button>
                            <button 
                              onClick={() => setTravelMapScale(prev => Math.max(prev - 0.2, 0.5))}
                              className="p-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white/50 rounded-2xl hover:text-white hover:bg-slate-800 transition-all shadow-xl"
                            >
                              <Minus size={20} />
                            </button>
                            <button 
                              onClick={() => {
                                setTravelMapScale(1);
                                setTravelMapOffset({ x: 0, y: 0 });
                              }}
                              className="p-3 bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white/50 rounded-2xl hover:text-white hover:bg-slate-800 transition-all shadow-xl"
                            >
                              <Maximize size={20} />
                            </button>
                          </div>

                          {/* Interactive Map Surface */}
                          <motion.div 
                            drag
                            dragConstraints={{ left: -1500, right: 1500, top: -1125, bottom: 1125 }}
                            dragElastic={0.1}
                            dragMomentum={true}
                            onWheel={(e) => {
                              const delta = e.deltaY > 0 ? -0.1 : 0.1;
                              setTravelMapScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
                            }}
                            animate={{ scale: travelMapScale, x: travelMapOffset.x, y: travelMapOffset.y }}
                            className="relative w-[3000px] h-[2250px] cursor-grab active:cursor-grabbing flex items-center justify-center"
                          >
                            {/* Scanning HUD Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-10">
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-indigo-500/10" />
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-indigo-500/10" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-indigo-500/10 rounded-full" />
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1600px] h-[1600px] border border-indigo-500/5 rounded-full" />
                            </div>

                            {/* Radar Scan Light */}
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                              className="absolute inset-0 pointer-events-none z-0"
                            >
                               <div className="absolute top-1/2 left-1/2 w-[1500px] h-[1500px] -translate-x-1/2 -translate-y-1/2 bg-conic-gradient from-indigo-500/20 via-transparent to-transparent origin-center opacity-30" />
                            </motion.div>

                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-[repeat(60,1fr)] grid-rows-[repeat(45,1fr)] opacity-[0.03] pointer-events-none">
                              {[...Array(2700)].map((_, i) => <div key={i} className="border-[0.5px] border-indigo-400" />)}
                            </div>

                            {/* City Connections (Lines from current city) */}
                            {(() => {
                              const currentCity = gameState.cities.find(c => c.id === gameState.company.currentCityId);
                              if (!currentCity) return null;
                              const currentX = ((currentCity.x || 0) + 600) / 1200 * 3000;
                              const currentY = (600 - (currentCity.y || 0)) / 1400 * 2250;

                              return gameState.cities
                                .filter(city => city.id !== currentCity.id && (
                                  city.name.toLowerCase().includes(travelSearch.toLowerCase()) || 
                                  city.country.toLowerCase().includes(travelSearch.toLowerCase())
                                ))
                                .map(city => {
                                  const targetX = ((city.x || 0) + 600) / 1200 * 3000;
                                  const targetY = (600 - (city.y || 0)) / 1400 * 2250;
                                  
                                  return (
                                    <svg key={`line-${city.id}`} className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
                                      <motion.line 
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 1 }}
                                        x1={currentX} y1={currentY} 
                                        x2={targetX} y2={targetY} 
                                        stroke="rgba(99, 102, 241, 0.15)" strokeWidth="1" strokeDasharray="8 8"
                                      />
                                    </svg>
                                  );
                                });
                            })()}

                            {/* City Markers */}
                            {gameState.cities
                              .filter(city => 
                                city.name.toLowerCase().includes(travelSearch.toLowerCase()) || 
                                city.country.toLowerCase().includes(travelSearch.toLowerCase())
                              )
                              .map(city => {
                                const isCurrent = city.id === gameState.company.currentCityId;
                                const isHome = city.id === gameState.company.homeCityId;
                                const mapX = ((city.x || 0) + 600) / 1200 * 3000;
                                const mapY = (600 - (city.y || 0)) / 1400 * 2250;

                                return (
                                  <motion.button
                                    key={city.id}
                                    whileHover={{ scale: 1.4, zIndex: 50 }}
                                    onClick={() => setSelectedCityInfoId(city.id)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 z-[2]"
                                    style={{ left: mapX, top: mapY }}
                                  >
                                    <div className="relative group">
                                      {/* Radar Circle */}
                                      <div className={`absolute -inset-4 rounded-full border border-white/5 transition-all group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 ${isCurrent ? 'border-indigo-500/20' : ''}`} />
                                      
                                      {/* Beacon Effect for Current City */}
                                      {isCurrent && (
                                        <div className="absolute inset-0 h-4 w-4 -translate-x-0 -translate-y-0 rounded-full bg-indigo-500/40 animate-ping" />
                                      )}
                                      
                                      {/* Core Marker */}
                                      <div className={`relative h-3 w-3 rounded-sm rotate-45 border-2 shadow-lg transition-all ${
                                        isCurrent ? 'bg-indigo-500 border-white scale-125' : 
                                        isHome ? 'bg-amber-400 border-white' : 
                                        'bg-slate-700 border-slate-500 group-hover:bg-white group-hover:border-indigo-500'
                                      }`} />
                                      
                                      {/* Label Backdrop */}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                                        <div className="bg-slate-900/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-1">
                                          <span className="text-[10px] font-black tracking-widest text-white uppercase">{t('city_name_' + city.id)}</span>
                                          <div className="h-px w-8 bg-indigo-500/30" />
                                          <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{t(`country_${city.country.replace(/\s+/g, '_')}`)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })
                            }
                          </motion.div>
                          
                          {/* Map Overlay HUD */}
                          <div className="absolute bottom-10 left-10 right-10 flex items-end justify-between pointer-events-none">
                            <div className="space-y-4">
                              <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-2xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <Activity size={20} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">{t('global_radar')}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('scanning_active_sites')}</p>
                                  </div>
                                </div>
                                <div className="h-px bg-white/5" />
                                <div className="space-y-2">
                                  {[
                                    { color: 'bg-indigo-500', label: t('active_operations') },
                                    { color: 'bg-amber-400', label: t('registered_hq') },
                                    { color: 'bg-slate-500', label: t('market_prospects') }
                                  ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                      <div className={`h-2 w-2 rounded-sm rotate-45 ${item.color} shadow-sm`} />
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-4">
                               <div className="bg-slate-900/60 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/5 text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] shadow-2xl">
                                {t('system_ready')} // COORDINATES: {Math.round(travelMapOffset.x)}, {Math.round(travelMapOffset.y)}
                              </div>
                            </div>
                          </div>

                          {/* Outer Map Vignette */}
                          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

              {/* City Info Overlay */}
              <AnimatePresence>
                {selectedCityInfoId && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute inset-0 z-[60] bg-white flex flex-col"
                  >
                    {(() => {
                      const city = gameState.cities.find(c => c.id === selectedCityInfoId);
                      if (!city) return null;
                      return (
                        <>
                          <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => setSelectedCityInfoId(null)}
                                className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                              >
                                <ArrowRight className="rotate-180" size={20} />
                              </button>
                              <div>
                                <h3 className="text-xl font-black text-slate-900">{city.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t(`country_${city.country.replace(/\s+/g, '_')}`)}</p>
                              </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                              ${city.id === gameState.company.currentCityId ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}
                            `}>
                              {city.id === gameState.company.currentCityId ? t('current_location') : t('potential_destination')}
                            </div>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <section>
                              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t('about')}</h4>
                              <p className="text-sm text-slate-600 leading-relaxed">{city.description}</p>
                            </section>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('terrain')}</p>
                                <div className="flex items-center gap-2">
                                  <MapIcon size={14} className="text-indigo-600" />
                                  <span className="text-sm font-bold text-slate-900">{t(`terrain_${city.terrain}`)}</span>
                                </div>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('map_size')}</p>
                                <div className="flex items-center gap-2">
                                  <Layout size={14} className="text-indigo-600" />
                                  <span className="text-sm font-bold text-slate-900">{city.mapWidth}x{city.mapHeight}</span>
                                </div>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('visitor_multiplier')}</p>
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-indigo-600" />
                                  <span className="text-sm font-bold text-slate-900">x{city.visitorMultiplier}</span>
                                </div>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('population')}</p>
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-indigo-600" />
                                  <span className="text-sm font-bold text-slate-900">{city.population.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('travel_cost')}</p>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-emerald-600" />
                                  <span className="text-sm font-bold text-slate-900">${engine.getTravelCost(city.id)}</span>
                                </div>
                              </div>
                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('operating_season')}</p>
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-indigo-600" />
                                  <span className="text-sm font-bold text-slate-900">
                                    {t(`month_${REGION_OPERATING_MONTHS[city.region].startMonth - 1}`)} - {t(`month_${REGION_OPERATING_MONTHS[city.region].endMonth - 1}`)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <section>
                              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t('weather_patterns')}</h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="flex flex-col items-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                                  <Sun size={16} className="text-amber-500 mb-1" />
                                  <span className="text-[10px] font-black text-amber-900">{Math.round(city.weatherProbabilities.SUMMER.SUNNY * 100)}%</span>
                                  <span className="text-[8px] font-bold text-amber-700 uppercase">{t('weather_sunny')}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                                  <CloudRain size={16} className="text-blue-500 mb-1" />
                                  <span className="text-[10px] font-black text-blue-900">{Math.round(city.weatherProbabilities.SUMMER.RAINY * 100)}%</span>
                                  <span className="text-[8px] font-bold text-blue-700 uppercase">{t('weather_rainy')}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                                  <Cloud size={16} className="text-slate-500 mb-1" />
                                  <span className="text-[10px] font-black text-slate-900">{Math.round(city.weatherProbabilities.SUMMER.CLOUDY * 100)}%</span>
                                  <span className="text-[8px] font-bold text-slate-700 uppercase">{t('cloudy')}</span>
                                </div>
                                <div className="flex flex-col items-center p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                                  <Zap size={16} className="text-indigo-500 mb-1" />
                                  <span className="text-[10px] font-black text-indigo-900">{Math.round(city.weatherProbabilities.SUMMER.STORMY * 100)}%</span>
                                  <span className="text-[8px] font-bold text-indigo-700 uppercase">{t('stormy')}</span>
                                </div>
                              </div>
                            </section>

                            {city.buildings && city.buildings.length > 0 && (
                              <section>
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">{t('city_center_obstacles')}</h4>
                                <div className="space-y-2">
                                  {city.buildings.map(b => (
                                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                      <div className="flex items-center gap-3">
                                        <Building2 size={14} className="text-slate-400" />
                                        <span className="text-xs font-bold text-slate-700">{b.name}</span>
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{b.type}</span>
                                    </div>
                                  ))}
                                </div>
                              </section>
                            )}
                          </div>

                          <div className="p-6 bg-slate-50 border-t border-slate-200">
                            <button 
                              onClick={() => setSelectedCityInfoId(null)}
                              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                            >
                              {t('back_to_travel')}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{t('reset_game_confirm')}</h3>
              <p className="text-slate-500 font-medium mb-8">{t('reset_confirm_desc')}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => {
                    GameEngine.clearSave();
                    window.location.reload();
                  }}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                >
                  {t('yes_reset')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <div className="flex h-full z-10 shrink-0">
            {/* Navigation Rail */}
            <div className="w-[72px] bg-slate-900 flex flex-col items-center py-8 gap-4 border-r border-white/5 h-full">
              <div className="flex-1 flex flex-col items-center gap-4">
                {[
                  { id: 'overview' as const, icon: <Layout size={20} />, label: t('overview') },
                  { id: 'inventory' as const, icon: <Package size={20} />, label: t('inventory') },
                  { id: 'management' as const, icon: <LayoutDashboard size={20} />, label: t('management') },
                  { id: 'zoning' as const, icon: <MapIcon size={20} />, label: t('zoning') },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSidebarTab(tab.id);
                      audioService.playSFX('click');
                    }}
                    className={`relative group flex h-12 w-12 items-center justify-center rounded-2xl transition-all
                      ${sidebarTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}
                    `}
                    title={tab.label}
                  >
                    {tab.icon}
                    {sidebarTab === tab.id && (
                      <motion.div 
                        layoutId="sidebarActiveRailIndicator"
                        className="absolute -left-1 w-1.5 h-6 bg-indigo-500 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Close Button at bottom of rail */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="h-12 w-12 flex items-center justify-center rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all mb-4"
                title={t('hide_sidebar')}
              >
                <ChevronLeft size={24} />
              </button>
            </div>

            {/* Content Panel */}
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white p-6 shadow-2xl flex flex-col overflow-hidden border-r border-slate-200"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  {sidebarTab.toUpperCase()}
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      engine.togglePause();
                      setGameState(engine.getState());
                      audioService.playSFX('click');
                    }}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                      gameState.settings.isPaused ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {gameState.settings.isPaused ? <Play size={14} fill="currentColor" /> : <Square size={14} fill="currentColor" />}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {sidebarTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                       <div>
                          <h1 className="text-xl font-black text-slate-900 truncate">{gameState.company.name}</h1>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('city_name_' + gameState.company.currentCityId)}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-300 uppercase mb-0.5">Rating</p>
                          <p className="text-lg font-black text-amber-500">{gameState.parkRating.toFixed(1)}</p>
                       </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedRideId ? (
                        <motion.section
                          key="nav-rail-ride-details"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-4"
                        >
                          {(() => {
                            const ride = gameState.rides.find(r => r.id === selectedRideId);
                            if (!ride) return null;
                            const config = RIDE_CONFIGS[ride.type];
                            return (
                              <div className="space-y-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="min-w-0">
                                      <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 truncate">{ride.customName || t(`ride_${config.type}_name`)}</h3>
                                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Lvl {ride.level}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600 shrink-0">
                                      {config.icon}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Status</p>
                                      <div className="flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${ride.status === 'OPERATING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        <span className={`text-[9px] font-black uppercase truncate ${ride.status === 'OPERATING' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          {t(`status_${ride.status.toLowerCase()}`)}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl border border-slate-100 text-right">
                                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">HP</p>
                                      <p className="text-[10px] font-black text-slate-900">{Math.round(ride.condition)}%</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                   <button 
                                      onClick={() => { if (engine.toggleRideStatus(ride.id)) { audioService.playSFX('click'); setGameState(engine.getState()); } }}
                                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                                         ${ride.status === 'OPERATING' ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-emerald-500 text-white shadow-emerald-100'}
                                      `}
                                   >
                                      {ride.status === 'OPERATING' ? t('close_ride') : t('open_ride')}
                                   </button>
                                   <div className="grid grid-cols-2 gap-2">
                                      <button 
                                         onClick={() => { if (engine.repairRide(ride.id)) { audioService.playSFX('repair'); setGameState(engine.getState()); } }}
                                         disabled={gameState.money < 100 || ride.condition >= 100}
                                         className="py-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                                      >
                                         Rep ($100)
                                      </button>
                                      <button 
                                         onClick={() => setSelectedRideId(null)}
                                         className="py-4 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest"
                                      >
                                         Deselect
                                      </button>
                                   </div>
                                </div>

                                <button 
                                   onClick={() => { if (engine.sellRide(ride.id)) { audioService.playSFX('sell'); setSelectedRideId(null); setGameState(engine.getState()); } }}
                                   className="w-full py-3 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest"
                                >
                                   Sell Ride
                                </button>
                              </div>
                            );
                          })()}
                        </motion.section>
                      ) : selectedVisitorId ? (
                        <motion.section
                          key="nav-rail-visitor-details"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="space-y-6"
                        >
                          {(() => {
                            const visitor = gameState.visitors.find(v => v.id === selectedVisitorId);
                            if (!visitor) return null;
                            return (
                              <div className="space-y-6">
                                <div className="bg-slate-900 p-6 rounded-[2.5rem] text-center shadow-xl">
                                  <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Visitor</p>
                                  <h3 className="text-sm font-black text-white uppercase truncate">ID-{visitor.id.slice(0, 8)}</h3>
                                </div>
                                <div className="space-y-4">
                                   {[
                                     { label: 'Happiness', value: visitor.happiness, color: 'bg-emerald-500' },
                                     { label: 'Hunger', value: visitor.hunger, color: 'bg-orange-500' }
                                   ].map(stat => (
                                     <div key={stat.label}>
                                        <div className="flex justify-between mb-1">
                                          <span className="text-[9px] font-black text-slate-400 uppercase">{stat.label}</span>
                                          <span className="text-[10px] font-black text-slate-900">{Math.round(stat.value)}%</span>
                                        </div>
                                        <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                                           <div className={`h-full ${stat.color}`} style={{ width: `${stat.value}%` }} />
                                        </div>
                                     </div>
                                   ))}
                                </div>
                                <button onClick={() => setSelectedVisitorId(null)} className="w-full py-4 bg-slate-100 text-slate-400 text-[9px] font-black uppercase rounded-2xl">Close</button>
                              </div>
                            );
                          })()}
                        </motion.section>
                      ) : (
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-24 leading-relaxed">
                           Touch a ride or guest<br/>to see details
                        </p>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {sidebarTab === 'inventory' && (
                  <div className="space-y-3">
                    {gameState.inventory.map(ride => (
                      <div key={ride.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase">{ride.type}</span>
                         <button onClick={() => setPlacingRideId(ride.id === placingRideId ? null : ride.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${placingRideId === ride.id ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}>
                            {placingRideId === ride.id ? 'Cancel' : 'Place'}
                         </button>
                      </div>
                    ))}
                  </div>
                )}
                {sidebarTab === 'management' && (
                  <div className="space-y-4">
                     <button onClick={() => setIsManagementOpen(true)} className="w-full p-6 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        Management Console
                     </button>
                  </div>
                )}
                {sidebarTab === 'zoning' && (
                  <div className="space-y-4">
                    {(['FUNFAIR', 'TRUCK', 'STAFF'] as const).map(type => (
                      <button key={type} onClick={() => { setIsZoningMode(true); setZoningType(type); }} className={`w-full p-5 rounded-[2rem] border-2 transition-all ${zoningType === type ? 'bg-slate-950 border-slate-950 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400'}`}>
                         <span className="text-[10px] font-black uppercase tracking-widest">{type} ZONE</span>
                      </button>
                    ))}
                    <button onClick={() => setIsZoningMode(false)} className="w-full py-4 text-[10px] font-black uppercase text-indigo-600 mt-4">Exit Zoning</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


  {/* Game View */}
  <div className={`relative flex-1 transition-colors duration-[3000ms] ${getTimeTheme(gameState.time.hours).bg}`}>
    {/* Floating Top Bar for Stats */}
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[40] flex items-center gap-2">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-6 px-7 py-3 bg-white/95 backdrop-blur-md rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 ring-1 ring-slate-900/5 group"
      >
        <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">
            <Coins size={18} />
          </div>
          <div className="flex flex-col justify-center min-w-[90px]">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none mb-1">{t('balance')}</p>
            <p className="text-lg font-black text-slate-900 leading-none tabular-nums">${Math.floor(gameState.money).toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-r border-slate-100 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-100 transition-transform group-hover:scale-110">
            <Users size={18} />
          </div>
          <div className="flex flex-col justify-center min-w-[60px]">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none mb-1">{t('visitors')}</p>
            <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{gameState.visitors.length.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-lg shadow-amber-100 transition-transform group-hover:scale-110">
            <Star size={18} fill="currentColor" />
          </div>
          <div className="flex flex-col justify-center min-w-[50px]">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none mb-1">{t('park_rating') || 'RATING'}</p>
            <p className="text-lg font-black text-slate-900 leading-none tabular-nums">{gameState.parkRating.toFixed(1)}</p>
          </div>
        </div>

        {/* Time Overlay inside Top Bar */}
        <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
          <div className="text-right min-w-[70px]">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none mb-1">
              {t(`month_${gameState.time.month - 1}`)} {gameState.time.dayOfMonth}
            </p>
            <p className="text-lg font-black text-slate-900 leading-none tabular-nums">
              {gameState.time.hours.toString().padStart(2, '0')}:{gameState.time.minutes.toString().padStart(2, '0')}
            </p>
          </div>
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm ${getWeatherColor(gameState.currentWeather.type)} text-white`}>
            {getWeatherIcon(gameState.currentWeather.type)}
          </div>
        </div>
      </motion.div>
    </div>

    {/* Sidebar Toggle (Only visible when closed) */}
    {!isSidebarOpen && (
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-8 left-8 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl hover:bg-slate-50 transition-all border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
        title={t('show_sidebar')}
      >
        <Layout size={24} />
      </button>
    )}
        {/* Right Inventory - Removed in favor of Nav Rail */}

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="cursor-crosshair w-full h-full"
        />

        {/* Daylight Cycle Overlays (Moved here to cover canvas) */}
        <div className={`absolute inset-0 pointer-events-none z-[30] transition-all duration-[3000ms] mix-blend-multiply ${getTimeTheme(gameState.time.hours).overlay}`} />
        <div className={`absolute inset-0 pointer-events-none z-[31] transition-all duration-[3000ms] bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] ${getTimeTheme(gameState.time.hours).vignette}`} />

        {/* Controls Overlay */}
        <div className="absolute bottom-8 right-8 flex flex-col gap-3">
          <button 
            onClick={() => setCamera(p => ({ ...p, zoom: Math.min(p.zoom + 0.1, 2) }))}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
          <button 
            onClick={() => setCamera(p => ({ ...p, zoom: Math.max(p.zoom - 0.1, 0.2) }))}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className="h-1 w-4 bg-slate-900 rounded-full" />
          </button>
          <button 
            onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <MousePointer2 size={24} />
          </button>
        </div>

        {/* Instruction Overlay */}
        <AnimatePresence>
          {placingRideId && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-6 py-3 text-white backdrop-blur-md shadow-2xl flex items-center gap-3"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold">1</div>
              <span className="text-sm font-medium">{t('place_instruction')} <span className="text-indigo-400 font-bold">{t(`ride_${gameState.inventory.find(r => r.id === placingRideId)?.type || 'TEA_CUPS'}_name`)}</span></span>
              <button 
                onClick={() => setPlacingRideId(null)}
                className="ml-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                {t('cancel_button')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {gameState.showTutorial && gameState.tutorialStep < 10 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-8 right-8 w-80 rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 overflow-hidden"
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 h-1 bg-indigo-100 w-full">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(gameState.tutorialStep / 10) * 100}%` }}
                />
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  {gameState.tutorialStep === 0 && <MapIcon size={24} />}
                  {gameState.tutorialStep === 1 && <Truck size={24} />}
                  {gameState.tutorialStep === 2 && <UserPlus size={24} />}
                  {gameState.tutorialStep === 3 && <Play size={24} />}
                  {gameState.tutorialStep === 4 && <DollarSign size={24} />}
                  {gameState.tutorialStep === 5 && <Coffee size={24} />}
                  {gameState.tutorialStep === 6 && <Users size={24} />}
                  {gameState.tutorialStep === 7 && <Briefcase size={24} />}
                  {gameState.tutorialStep === 8 && <Coins size={24} />}
                  {gameState.tutorialStep === 9 && <TrendingUp size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('tutorial_step_label', { step: (gameState.tutorialStep + 1).toString() })}</h3>
                    <button 
                      onClick={() => {
                        engine.skipTutorial();
                        setGameState(engine.getState());
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      {t('skip_button')}
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {t(`tutorial_title_${gameState.tutorialStep}`)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {t(`tutorial_desc_${gameState.tutorialStep}`)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                    <div 
                      key={s}
                      className={`h-1 w-3 rounded-full transition-all ${s <= gameState.tutorialStep ? 'bg-indigo-600' : 'bg-slate-100'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {gameState.showTutorial && gameState.tutorialStep === 10 && (
             <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-8 right-8 w-80 rounded-3xl bg-emerald-600 p-6 shadow-2xl text-white"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-70">{t('tutorial_complete_title')}</h3>
                  <h4 className="text-lg font-black leading-tight">{t('tutorial_complete_subtitle')}</h4>
                </div>
              </div>
              <p className="text-xs opacity-90 leading-relaxed mb-6">
                {t('tutorial_complete_desc')}
              </p>
              <button 
                onClick={() => {
                  engine.skipTutorial();
                  setGameState(engine.getState());
                }}
                className="w-full py-3 rounded-xl bg-white text-emerald-600 text-xs font-black uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-all"
              >
                {t('start_managing')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      <AnimatePresence>
        {isPermitFormOpen && pendingTravelCityId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-xl bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50"
            >
              <div className="bg-indigo-600 p-8 text-white relative">
                <button 
                  onClick={() => setIsPermitFormOpen(false)}
                  className="absolute top-8 right-8 h-10 w-10 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">{t('business_permit')}</h3>
                    <h2 className="text-2xl font-black">{t('travel_permit_form')}</h2>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('target_city')}</label>
                    <div className="px-4 py-3 bg-slate-100 rounded-xl font-bold text-slate-900 border border-slate-200">
                      {t('city_name_' + pendingTravelCityId)}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('travel_cost')}</label>
                    <div className="px-4 py-3 bg-emerald-50 rounded-xl font-black text-emerald-600 border border-emerald-100">
                      ${engine.getTravelCost(pendingTravelCityId).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('purpose_of_stay')}</label>
                  <select 
                    value={draftPermit.reason}
                    onChange={(e) => setDraftPermit({...draftPermit, reason: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="BUSINESS">{t('reason_expansion')}</option>
                    <option value="EVENT">{t('reason_event')}</option>
                    <option value="TOURISM">{t('reason_cultural')}</option>
                    <option value="TRADE">{t('reason_trade')}</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('funfair_area_rental')}</label>
                  <div className="flex gap-2">
                    {(['COMMUNITY', 'PRIME', 'VIP'] as const).map(tier => (
                      <button
                        key={tier}
                        onClick={() => setDraftPermit({...draftPermit, rentTier: tier})}
                        className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all
                          ${draftPermit.rentTier === tier 
                            ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                            : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'}
                        `}
                      >
                        <span className={`text-[10px] font-black uppercase tracking-widest ${draftPermit.rentTier === tier ? 'text-indigo-600' : ''}`}>{t(`tier_${tier.toLowerCase()}`)}</span>
                        <span className="text-[8px] font-bold opacity-60">
                          {tier === 'COMMUNITY' ? '-20% Rent' : tier === 'VIP' ? '+50% Rent' : 'Standard'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('insurance_tier')}</label>
                    <div className="flex gap-2">
                      {(['BASIC', 'PREMIUM', 'FULL', 'NONE'] as const).map(tier => (
                        <button
                          key={tier}
                          onClick={() => setDraftPermit({...draftPermit, insuranceLevel: tier})}
                          className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border-2
                            ${draftPermit.insuranceLevel === tier 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                              : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}
                          `}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('stay_duration')}</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="7" max="30" step="1"
                        value={draftPermit.days}
                        onChange={(e) => setDraftPermit({...draftPermit, days: parseInt(e.target.value)})}
                        className="flex-1 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-xs font-black text-slate-900 w-12 text-right">{draftPermit.days} {t('days')}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{t('owner_signature')}</label>
                  <input 
                    type="text"
                    value={draftPermit.signature}
                    onChange={(e) => setDraftPermit({...draftPermit, signature: e.target.value})}
                    placeholder={t('sign_here')}
                    className="w-full px-4 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 font-serif italic text-lg text-slate-900 focus:border-indigo-600 focus:bg-white outline-none transition-all placeholder:text-slate-300 placeholder:italic"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setIsPermitFormOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    disabled={!draftPermit.signature || gameState.money < engine.getTravelCost(pendingTravelCityId)}
                    onClick={() => {
                      if (engine.confirmTravel(pendingTravelCityId, draftPermit)) {
                        audioService.playSFX('buy');
                        setGameState(engine.getState());
                        setIsPermitFormOpen(false);
                        setIsManagementOpen(false);
                        confetti({
                          particleCount: 200,
                          spread: 120,
                          origin: { y: 0.5 }
                        });
                      }
                    }}
                    className={`flex-[2] py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-200
                      ${draftPermit.signature && gameState.money >= engine.getTravelCost(pendingTravelCityId)
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                    `}
                  >
                    {t('register_travel')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Overlay - moved to bottom-left to avoid overlaps */}
      <div className="absolute bottom-8 left-8 z-[200] flex flex-col-reverse gap-4 pointer-events-none">
        <AnimatePresence>
          {gameState.newAchievements.map((achievement) => {
            const Icon = ({ 
              Flag, DollarSign, Users, FlaskConical, Shield, Globe, Zap, Utensils, Clock, TrendingUp, Package, UserPlus, Star, Wallet, Wrench, Target 
            } as any)[achievement.icon] || Target;

            return (
              <motion.div
                key={achievement.id}
                initial={{ x: -100, opacity: 0, scale: 0.8 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -100, opacity: 0, scale: 0.8 }}
                className="pointer-events-auto w-84 bg-slate-900 rounded-[1.5rem] p-5 shadow-2xl border border-white/10 ring-1 ring-white/10 relative overflow-hidden group"
              >
                {/* Background particle effect */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-shimmer" />
                <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-500/10 rounded-full blur-[40px]" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-4xl shadow-xl shadow-indigo-900/50 shrink-0 group-hover:rotate-6 transition-transform">
                    <Icon size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-1">{t('milestone_reached') || 'MILESTONE UNLOCKED'}</h3>
                    <h4 className="text-sm font-black text-white uppercase tracking-tight truncate leading-tight">{achievement.title}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-2 leading-relaxed opacity-80">{achievement.description}</p>
                  </div>
                  <button 
                    onClick={() => {
                      engine.clearNewAchievement(achievement.id);
                      setGameState(engine.getState());
                    }}
                    className="p-2 text-slate-500 hover:text-white transition-colors self-start -mt-2 -mr-2"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Progress countdown bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-400 w-full animate-progress-extended origin-left" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
