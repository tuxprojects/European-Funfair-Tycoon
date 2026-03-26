import { RideInstance, Visitor, Position, RIDE_CONFIGS, GameTime, ParkSettings, GameState, CompanyInfo, CITIES, StaffInstance, StaffType, STAFF_CONFIGS, RideType, FinanceStats } from './types';

export class GameEngine {
  rides: RideInstance[] = [];
  inventory: RideInstance[] = [];
  staff: StaffInstance[] = [];
  visitors: Visitor[] = [];
  money: number = 2000;
  lastUpdate: number = Date.now();
  time: GameTime = { hours: 8, minutes: 0, day: 1, dayOfWeek: 0 };
  settings: ParkSettings = { 
    openTime: 8, 
    closeTime: 22, 
    isManuallyClosed: false,
    pricing: {
      ticketPrice: 5,
      wristbandPrice: 25,
      seasonPassPrice: 100,
      bundlePrice: 20,
      bundleSize: 5
    }
  };
  company: CompanyInfo = { name: 'My Funfair', currentCityId: 'london', warehouseLevel: 1 };
  cities = CITIES;
  finances: FinanceStats = this.getEmptyFinances();
  dailyHistory: FinanceStats[] = [];
  tutorialStep: number = 0;
  showTutorial: boolean = true;
  private timeAccumulator: number = 0;
  private lastSalaryPaymentHour: number = -1;
  private lastSpawnTime: number = 0;
  
  constructor(saveData?: any) {
    if (saveData) {
      this.loadFromData(saveData);
    }
  }

  private loadFromData(data: any) {
    this.rides = data.rides || [];
    this.inventory = data.inventory || [];
    this.staff = data.staff || [];
    this.money = data.money ?? 2000;
    this.time = data.time || { hours: 8, minutes: 0, day: 1, dayOfWeek: 0 };
    if (this.time.dayOfWeek === undefined) {
      this.time.dayOfWeek = (this.time.day - 1) % 7;
    }
    this.settings = data.settings || { 
      openTime: 8, 
      closeTime: 22, 
      isManuallyClosed: false,
      pricing: {
        ticketPrice: 5,
        wristbandPrice: 25,
        seasonPassPrice: 100,
        bundlePrice: 20,
        bundleSize: 5
      }
    };
    if (!this.settings.pricing) {
      this.settings.pricing = {
        ticketPrice: 5,
        wristbandPrice: 25,
        seasonPassPrice: 100,
        bundlePrice: 20,
        bundleSize: 5
      };
    }
    this.company = data.company || { name: 'My Funfair', currentCityId: 'london', warehouseLevel: 1 };
    if (this.company.warehouseLevel === undefined) {
      this.company.warehouseLevel = 1;
    }
    if (!this.company.homeCityId) {
      this.company.homeCityId = this.company.currentCityId;
    }
    this.finances = data.finances || this.getEmptyFinances();
    
    // Ensure income categories exist
    this.finances.income = {
      tickets: 0,
      wristbands: 0,
      seasonPasses: 0,
      bundles: 0,
      food: 0,
      other: 0,
      ...(this.finances.income || {})
    };

    // Ensure expenses exist
    this.finances.expenses = {
      wages: 0,
      electricity: 0,
      rent: 0,
      maintenance: 0,
      other: 0,
      ...(this.finances.expenses || {})
    };

    // Ensure visitorStats exist
    this.finances.visitorStats = {
      totalVisitors: 0,
      avgHappiness: 0,
      avgSpend: 0,
      ...(this.finances.visitorStats || {})
    };
    this.dailyHistory = (data.dailyHistory || []).map((day: any) => ({
      ...day,
      income: {
        tickets: 0,
        wristbands: 0,
        seasonPasses: 0,
        bundles: 0,
        food: 0,
        other: 0,
        ...(day.income || {})
      },
      expenses: {
        wages: 0,
        electricity: 0,
        rent: 0,
        maintenance: 0,
        other: 0,
        ...(day.expenses || {})
      },
      visitorStats: {
        totalVisitors: 0,
        avgHappiness: 0,
        avgSpend: 0,
        ...(day.visitorStats || {})
      }
    }));
    this.lastSalaryPaymentHour = data.lastSalaryPaymentHour ?? -1;
    this.tutorialStep = data.tutorialStep ?? 0;
    this.showTutorial = data.showTutorial ?? true;
    this.lastUpdate = Date.now();
    this.visitors = []; // Don't save visitors, they are transient

    // Ensure tutorial rides are available if needed
    if (this.showTutorial && this.tutorialStep === 0 && this.rides.length === 0 && !this.inventory.some(r => r.type === 'TEA_CUPS')) {
      this.inventory.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'TEA_CUPS',
        x: 0,
        y: 0,
        level: 1,
        price: RIDE_CONFIGS['TEA_CUPS'].baseIncome,
        currentVisitors: 0,
        lastIncomeTime: Date.now(),
        status: 'OPERATIONAL',
        condition: 100,
        isPlaced: false,
        buildProgress: 0,
        avgWaitTime: 0,
        satisfaction: 100,
        totalVisitorsServed: 0,
        totalHappinessGained: 0
      });
    }
    
    if (this.showTutorial && this.tutorialStep <= 4 && !this.rides.some(r => r.type === 'FOOD_STALL') && !this.inventory.some(r => r.type === 'FOOD_STALL')) {
      this.inventory.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'FOOD_STALL',
        x: 0,
        y: 0,
        level: 1,
        price: RIDE_CONFIGS['FOOD_STALL'].baseIncome,
        currentVisitors: 0,
        lastIncomeTime: Date.now(),
        status: 'OPERATIONAL',
        condition: 100,
        isPlaced: false,
        buildProgress: 0,
        avgWaitTime: 0,
        satisfaction: 100,
        totalVisitorsServed: 0,
        totalHappinessGained: 0
      });
    }
  }

  saveGame() {
    const data = {
      rides: this.rides,
      inventory: this.inventory,
      staff: this.staff,
      money: this.money,
      time: this.time,
      settings: this.settings,
      company: this.company,
      finances: this.finances,
      dailyHistory: this.dailyHistory,
      lastSalaryPaymentHour: this.lastSalaryPaymentHour,
      tutorialStep: this.tutorialStep,
      showTutorial: this.showTutorial
    };
    localStorage.setItem('funfair_tycoon_save', JSON.stringify(data));
  }

  static hasSave(): boolean {
    return !!localStorage.getItem('funfair_tycoon_save');
  }

  static getSaveData(): any {
    const data = localStorage.getItem('funfair_tycoon_save');
    return data ? JSON.parse(data) : null;
  }

  static clearSave() {
    localStorage.removeItem('funfair_tycoon_save');
  }

  initNewGame(name: string, cityId: string) {
    this.company.name = name;
    this.company.currentCityId = cityId;
    this.company.homeCityId = cityId;
    this.company.warehouseLevel = 1;
    this.money = 2000;
    this.rides = [];
    this.inventory = [];
    this.visitors = [];
    this.time = { hours: 8, minutes: 0, day: 1, dayOfWeek: 0 };
    this.finances = this.getEmptyFinances();
    this.dailyHistory = [];
    this.tutorialStep = 0;
    this.showTutorial = true;
    
    // Give initial rides
    this.inventory = [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'TEA_CUPS',
        x: 0,
        y: 0,
        level: 1,
        price: RIDE_CONFIGS['TEA_CUPS'].baseIncome,
        currentVisitors: 0,
        lastIncomeTime: Date.now(),
        status: 'OPERATIONAL',
        condition: 100,
        isPlaced: false,
        buildProgress: 0,
        avgWaitTime: 0,
        satisfaction: 100,
        totalVisitorsServed: 0,
        totalHappinessGained: 0
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'FOOD_STALL',
        x: 0,
        y: 0,
        level: 1,
        price: RIDE_CONFIGS['FOOD_STALL'].baseIncome,
        currentVisitors: 0,
        lastIncomeTime: Date.now(),
        status: 'OPERATIONAL',
        condition: 100,
        isPlaced: false,
        buildProgress: 0,
        avgWaitTime: 0,
        satisfaction: 100,
        totalVisitorsServed: 0,
        totalHappinessGained: 0
      }
    ];
    
    this.saveGame();
  }

  skipTutorial() {
    this.showTutorial = false;
    this.saveGame();
  }

  advanceTutorial() {
    this.tutorialStep++;
    this.saveGame();
  }

  private getEmptyFinances(): FinanceStats {
    return {
      income: { 
        tickets: 0, 
        wristbands: 0, 
        seasonPasses: 0, 
        bundles: 0, 
        food: 0, 
        other: 0 
      },
      expenses: { wages: 0, electricity: 0, rent: 0, maintenance: 0, other: 0 },
      visitorStats: {
        totalVisitors: 0,
        avgHappiness: 0,
        avgSpend: 0
      }
    };
  }

  spawnVisitor() {
    const city = CITIES.find(c => c.id === this.company.currentCityId) || CITIES[0];
    const id = Math.random().toString(36).substr(2, 9);
    
    // Randomly select 2-3 preferred ride types
    const allRideTypes: RideType[] = ['TEA_CUPS', 'CAROUSEL', 'FERRIS_WHEEL', 'ROLLERCOASTER', 'BUMPER_CARS', 'HAUNTED_HOUSE', 'LOG_FLUME', 'DROP_TOWER', 'SWING_RIDE', 'PIRATE_SHIP'];
    const preferredRideTypes = allRideTypes
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2));

    const visitor: Visitor = {
      id,
      x: 50, // Entrance
      y: (city.mapHeight * 40) / 2,
      targetX: 100 + Math.random() * 200,
      targetY: (city.mapHeight * 40) / 2 + (Math.random() - 0.5) * 200,
      state: 'WANDERING',
      happiness: 100,
      money: (100 + Math.random() * 200) * city.visitorMultiplier,
      stamina: 80 + Math.random() * 20, // Start with high stamina
      hunger: Math.random() * 20, // Start with low hunger
      bladder: Math.random() * 20, // Start with low bladder
      timeEntered: Date.now(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      preferredRideTypes,
      hasWristband: false,
      hasSeasonPass: false,
      remainingBundleRides: 0
    };

    // Decide on entry purchase
    const pricing = this.settings.pricing;
    const roll = Math.random();
    if (roll < 0.05 && visitor.money >= pricing.seasonPassPrice) {
      visitor.hasSeasonPass = true;
      visitor.money -= pricing.seasonPassPrice;
      this.money += pricing.seasonPassPrice;
      this.finances.income.seasonPasses += pricing.seasonPassPrice;
    } else if (roll < 0.2 && visitor.money >= pricing.wristbandPrice) {
      visitor.hasWristband = true;
      visitor.money -= pricing.wristbandPrice;
      this.money += pricing.wristbandPrice;
      this.finances.income.wristbands += pricing.wristbandPrice;
    } else if (roll < 0.4 && visitor.money >= pricing.bundlePrice) {
      visitor.remainingBundleRides = pricing.bundleSize;
      visitor.money -= pricing.bundlePrice;
      this.money += pricing.bundlePrice;
      this.finances.income.bundles += pricing.bundlePrice;
    }

    this.finances.visitorStats.totalVisitors++;
    this.visitors.push(visitor);
  }

  getParkRating(): number {
    if (this.rides.length === 0) return 0;
    
    const rideQuality = this.rides.reduce((acc, r) => acc + r.condition, 0) / this.rides.length;
    const staffHappiness = this.staff.length > 0 
      ? this.staff.reduce((acc, s) => acc + s.happiness, 0) / this.staff.length 
      : 50;
    const varietyBonus = Math.min(20, new Set(this.rides.map(r => r.type)).size * 5);
    
    return (rideQuality * 0.4 + staffHappiness * 0.4 + varietyBonus);
  }

  getVisitorDemandMultiplier(): number {
    const pricing = this.settings.pricing;
    // Base ticket price is 5. If it's 10, demand drops.
    const ticketFactor = Math.max(0.1, 1 - (pricing.ticketPrice - 5) / 15);
    const wristbandFactor = Math.max(0.1, 1 - (pricing.wristbandPrice - 25) / 50);
    const seasonFactor = Math.max(0.1, 1 - (pricing.seasonPassPrice - 100) / 200);
    
    const parkRating = this.getParkRating();
    const ratingFactor = 0.5 + (parkRating / 100);
    
    return ticketFactor * 0.4 + wristbandFactor * 0.3 + seasonFactor * 0.3 + ratingFactor * 0.5;
  }

  getState(): GameState {
    const city = CITIES.find(c => c.id === this.company.currentCityId) || CITIES[0];
    return {
      money: this.money,
      rides: [...this.rides],
      inventory: [...this.inventory],
      staff: [...this.staff],
      visitors: [...this.visitors],
      time: { ...this.time },
      settings: { ...this.settings },
      company: { ...this.company },
      cities: [...CITIES],
      currentMapSize: { width: city.mapWidth, height: city.mapHeight },
      finances: { ...this.finances },
      dailyHistory: [...this.dailyHistory],
      tutorialStep: this.tutorialStep,
      showTutorial: this.showTutorial
    };
  }

  update(): GameState {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    const city = CITIES.find(c => c.id === this.company.currentCityId) || CITIES[0];
    const mapWidthPx = city.mapWidth * 40;
    const mapHeightPx = city.mapHeight * 40;

    // Update Time (1 real second = 1 game minute)
    this.timeAccumulator += dt;
    if (this.timeAccumulator >= 1) {
      this.time.minutes += Math.floor(this.timeAccumulator);
      this.timeAccumulator %= 1;
      
      if (this.time.minutes >= 60) {
        this.time.hours += Math.floor(this.time.minutes / 60);
        this.time.minutes %= 60;
        
        if (this.time.hours >= 24) {
          const daysPassed = Math.floor(this.time.hours / 24);
          this.time.day += daysPassed;
          this.time.hours %= 24;
          this.time.dayOfWeek = (this.time.dayOfWeek + daysPassed) % 7;

          // Day transition: Save finances to history and reset
          this.dailyHistory.unshift({ ...this.finances });
          if (this.dailyHistory.length > 7) {
            this.dailyHistory.pop();
          }
          this.finances = this.getEmptyFinances();
        }
      }
    }

    const isParkOpen = this.isParkOpen();

    // Staff Effects
    const staffByType = (type: StaffType) => this.staff.filter(s => s.type === type);
    const avgLevel = (type: StaffType) => {
      const s = staffByType(type);
      return s.length > 0 ? s.reduce((acc, curr) => acc + curr.level, 0) / s.length : 0;
    };

    const numMechanics = staffByType('MECHANIC').length;
    const avgMechanicLevel = avgLevel('MECHANIC');
    const wearReduction = Math.max(0.2, 1 - (numMechanics * 0.05 * avgMechanicLevel));
    const repairSpeedMult = 1 + (numMechanics * 0.1 * avgMechanicLevel);

    const numJanitors = staffByType('JANITOR').length;
    const avgJanitorLevel = avgLevel('JANITOR');
    const numSecurity = staffByType('SECURITY').length;
    const avgSecurityLevel = avgLevel('SECURITY');
    const happinessDecayReduction = Math.max(0.1, 1 - (numJanitors * 0.03 * avgJanitorLevel + numSecurity * 0.02 * avgSecurityLevel));

    const numVendors = staffByType('VENDOR').length;
    const avgVendorLevel = avgLevel('VENDOR');
    const incomeMult = 1 + (numVendors * 0.05 * avgVendorLevel);

    // Auto-assign operators if needed
    const unassignedOperators = this.staff.filter(s => s.type === 'OPERATOR' && !s.assignedRideId);
    const ridesNeedingOperators = this.rides.filter(r => 
      (r.status === 'OPERATIONAL' || r.status === 'BROKEN' || r.status === 'CONSTRUCTING') && 
      !r.operatorId
    );

    for (let i = 0; i < Math.min(unassignedOperators.length, ridesNeedingOperators.length); i++) {
      const operator = unassignedOperators[i];
      const ride = ridesNeedingOperators[i];
      ride.operatorId = operator.id;
      operator.assignedRideId = ride.id;
    }

    // Auto-assign mechanics for maintenance/repairs
    const unassignedMechanics = this.staff.filter(s => s.type === 'MECHANIC' && !s.assignedRideId);
    const ridesNeedingMechanics = this.rides.filter(r => 
      (r.status === 'MAINTENANCE' || r.status === 'BROKEN' || (r.status === 'OPERATIONAL' && r.condition < 70)) && 
      !r.mechanicId
    );

    // Sort by priority: BROKEN > MAINTENANCE > condition < 70
    ridesNeedingMechanics.sort((a, b) => {
      if (a.status === 'BROKEN' && b.status !== 'BROKEN') return -1;
      if (a.status !== 'BROKEN' && b.status === 'BROKEN') return 1;
      return a.condition - b.condition;
    });

    for (let i = 0; i < Math.min(unassignedMechanics.length, ridesNeedingMechanics.length); i++) {
      const mechanic = unassignedMechanics[i];
      const ride = ridesNeedingMechanics[i];
      
      // If it's a preventative check, set to MAINTENANCE
      if (ride.status === 'OPERATIONAL' && ride.condition < 70) {
        ride.status = 'MAINTENANCE';
      }
      
      ride.mechanicId = mechanic.id;
      mechanic.assignedRideId = ride.id;
    }

    // Update Salaries, Electricity, and Rent (every game hour)
    if (this.time.hours !== this.lastSalaryPaymentHour) {
      // Wages
      const totalSalary = this.staff.reduce((acc, s) => acc + s.salary, 0);
      this.money -= totalSalary;
      this.finances.expenses.wages += totalSalary;

      // Electricity
      const totalElectricity = this.rides
        .filter(r => r.status === 'OPERATIONAL')
        .reduce((acc, r) => acc + RIDE_CONFIGS[r.type].electricityCost, 0);
      this.money -= totalElectricity;
      this.finances.expenses.electricity += totalElectricity;

      // Rent (based on city size)
      const rent = Math.floor((city.mapWidth * city.mapHeight) / 5);
      this.money -= rent;
      this.finances.expenses.rent += rent;

      // Maintenance (based on ride count)
      const maintenanceCost = this.rides.length * 5;
      this.money -= maintenanceCost;
      this.finances.expenses.maintenance += maintenanceCost;

      this.lastSalaryPaymentHour = this.time.hours;
    }

    // Update Staff Happiness and Quitting
    for (let i = this.staff.length - 1; i >= 0; i--) {
      const staff = this.staff[i];
      const config = STAFF_CONFIGS[staff.type];
      const minSalary = config.baseSalary * (1 + (staff.level - 1) * 0.5);
      
      // Happiness change based on salary
      const salaryRatio = staff.salary / minSalary;
      if (salaryRatio >= 1.2) {
        staff.happiness = Math.min(100, staff.happiness + 0.5 * dt);
      } else if (salaryRatio >= 1.0) {
        staff.happiness = Math.min(100, staff.happiness + 0.1 * dt);
      } else {
        staff.happiness = Math.max(0, staff.happiness - 0.5 * dt);
      }

      // Chance to quit if unhappy
      if (staff.happiness < 40) {
        const quitChance = (40 - staff.happiness) / 10000; // Very small chance per update
        if (Math.random() < quitChance * dt) {
          console.log(`Staff ${staff.id} quit due to unhappiness!`);
          this.fireStaff(staff.id);
        }
      }
    }

    // Update Rides (Maintenance, Construction, Dismantling & Condition)
    this.rides.forEach(ride => {
      const config = RIDE_CONFIGS[ride.type];
      
      // Calculate Wait Time
      const queuingVisitors = this.visitors.filter(v => v.targetRideId === ride.id && v.state === 'QUEUING').length;
      const capacity = config.baseCapacity * ride.level;
      // Assume average ride duration is 4 game minutes
      ride.avgWaitTime = Math.round((queuingVisitors / capacity) * 4);
      
      if (ride.status === 'OPERATIONAL') {
        // Check if it has an operator
        const operator = this.staff.find(s => s.id === ride.operatorId && s.type === 'OPERATOR');
        if (operator) {
          // Condition drops faster if more visitors are on it
          const wearRate = (0.05 + (ride.currentVisitors * 0.01)) * wearReduction;
          ride.condition = Math.max(0, ride.condition - wearRate * dt);
          
          if (ride.condition <= 0) {
            ride.status = 'BROKEN';
            ride.currentVisitors = 0; // Everyone gets off
            // Unassign operator if broken
            if (operator) {
              operator.assignedRideId = undefined;
              ride.operatorId = undefined;
            }
          }
        } else {
          // No operator assigned, ride can't operate
          ride.currentVisitors = 0;
        }
      } else if (ride.status === 'MAINTENANCE' || ride.status === 'BROKEN') {
        const mechanic = this.staff.find(s => s.id === ride.mechanicId && s.type === 'MECHANIC');
        if (mechanic) {
          // Repair speed depends on mechanic level and overall efficiency
          const baseRepairRate = 8;
          const mechanicBonus = 1 + (mechanic.level * 0.2);
          ride.condition = Math.min(100, ride.condition + baseRepairRate * repairSpeedMult * mechanicBonus * dt);
          
          if (ride.condition >= 100) {
            ride.status = 'OPERATIONAL';
            // Unassign mechanic so they can go elsewhere
            mechanic.assignedRideId = undefined;
            ride.mechanicId = undefined;
          }
        }
      } else if (ride.status === 'CONSTRUCTING') {
        // buildTimeHours is in game hours. 1 game hour = 60 game minutes = 60 real seconds.
        // So progress per second = 100 / (buildTimeHours * 60)
        const progressPerSecond = 100 / (config.buildTimeHours * 60);
        ride.buildProgress = Math.min(100, ride.buildProgress + progressPerSecond * dt);
        if (ride.buildProgress >= 100) {
          ride.status = 'OPERATIONAL';
        }
      } else if (ride.status === 'DISMANTLING') {
        // Dismantling takes half the build time
        const progressPerSecond = 100 / (config.buildTimeHours * 30);
        ride.buildProgress = Math.max(0, ride.buildProgress - progressPerSecond * dt);
        if (ride.buildProgress <= 0) {
          // Move to inventory
          ride.isPlaced = false;
          this.inventory.push(ride);
          this.rides = this.rides.filter(r => r.id !== ride.id);
          this.saveGame();
        }
      }
    });

    // Update Visitors
    for (let i = this.visitors.length - 1; i >= 0; i--) {
      const v = this.visitors[i];
      
      // Move towards target
      const dx = v.targetX - v.x;
      const dy = v.targetY - v.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 5) {
        const speed = 120 * dt;
        v.x += (dx / dist) * speed;
        v.y += (dy / dist) * speed;
      } else {
        // Reached target
        if (v.state === 'WANDERING') {
          // Increase needs
          v.hunger = Math.min(100, v.hunger + 2 * dt);
          v.bladder = Math.min(100, v.bladder + 1.5 * dt);
          v.stamina -= 0.5 * dt;
          v.happiness -= 0.5 * happinessDecayReduction * dt;
          
          // Penalty for broken rides in the park
          const brokenRides = this.rides.filter(r => r.status === 'BROKEN').length;
          if (brokenRides > 0) {
            v.happiness -= 0.5 * brokenRides * dt; // Significant penalty for broken rides
          }
          
          // Penalty for poorly maintained operational rides
          const poorlyMaintained = this.rides.filter(r => r.status === 'OPERATIONAL' && r.condition < 50).length;
          if (poorlyMaintained > 0) {
            v.happiness -= 0.2 * poorlyMaintained * dt;
          }

          // If park is closed, visitors should leave
          if (!isParkOpen) {
            v.state = 'LEAVING';
            v.targetX = 0;
            v.targetY = mapHeightPx / 2;
            continue;
          }

          // Decide what to do next based on needs
          if (v.hunger > 70) {
            // Seek food
            const foodStalls = this.rides.filter(r => r.status === 'OPERATIONAL' && RIDE_CONFIGS[r.type].category === 'FOOD');
            if (foodStalls.length > 0) {
              const stall = foodStalls[Math.floor(Math.random() * foodStalls.length)];
              v.state = 'EATING';
              v.targetRideId = stall.id;
              v.targetX = stall.x * 40 + (RIDE_CONFIGS[stall.type].width * 20);
              v.targetY = stall.y * 40 + (RIDE_CONFIGS[stall.type].height * 20);
            } else {
              v.happiness -= 2 * dt; // Unhappy because no food
              this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
            }
          } else if (v.bladder > 70) {
            // Seek facility
            const facilities = this.rides.filter(r => r.status === 'OPERATIONAL' && RIDE_CONFIGS[r.type].category === 'FACILITY' && r.type === 'RESTROOM');
            if (facilities.length > 0) {
              const facility = facilities[Math.floor(Math.random() * facilities.length)];
              v.state = 'USING_FACILITY';
              v.targetRideId = facility.id;
              v.targetX = facility.x * 40 + (RIDE_CONFIGS[facility.type].width * 20);
              v.targetY = facility.y * 40 + (RIDE_CONFIGS[facility.type].height * 20);
            } else {
              v.happiness -= 2 * dt; // Unhappy because no restroom
              this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
            }
          } else if (v.stamina < 40) {
            // Seek bench
            const benches = this.rides.filter(r => r.status === 'OPERATIONAL' && r.type === 'BENCH' && r.currentVisitors < RIDE_CONFIGS[r.type].baseCapacity);
            if (benches.length > 0) {
              const bench = benches[Math.floor(Math.random() * benches.length)];
              v.state = 'RESTING';
              v.targetRideId = bench.id;
              v.targetX = bench.x * 40 + (RIDE_CONFIGS[bench.type].width * 20);
              v.targetY = bench.y * 40 + (RIDE_CONFIGS[bench.type].height * 20);
            } else {
              v.happiness -= 1 * dt; // Unhappy because no bench
              this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
            }
          } else {
            // Look for a ride
            const availableRides = this.rides.filter(r => 
              r.status === 'OPERATIONAL' && 
              RIDE_CONFIGS[r.type].category === 'RIDE' &&
              r.currentVisitors < RIDE_CONFIGS[r.type].baseCapacity * r.level
            );
            
            if (availableRides.length > 0) {
              // Prefer preferred types
              const preferred = availableRides.filter(r => v.preferredRideTypes.includes(r.type));
              const pool = preferred.length > 0 ? preferred : availableRides;
              const ride = pool[Math.floor(Math.random() * pool.length)];
              
              const basePrice = RIDE_CONFIGS[ride.type].baseIncome;
              if (ride.price > basePrice * 1.5) {
                v.happiness -= 5;
              }

              if (v.money >= ride.price) {
                v.state = 'QUEUING';
                v.targetRideId = ride.id;
                v.targetX = ride.x * 40 + (RIDE_CONFIGS[ride.type].width * 20);
                v.targetY = ride.y * 40 + (RIDE_CONFIGS[ride.type].height * 20);
              } else {
                v.happiness -= 5;
                this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
              }
            } else {
              this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
            }
          }
        } else if (v.state === 'QUEUING') {
          // Lose happiness and stamina while waiting in line
          v.happiness -= 5 * happinessDecayReduction * dt;
          v.stamina -= 0.3 * dt;
          v.hunger += 0.5 * dt;
          v.bladder += 0.4 * dt;

          const ride = this.rides.find(r => r.id === v.targetRideId);
          if (v.state === 'QUEUING') {
            v.state = 'RIDING';
            ride.currentVisitors++;
            
            let finalPrice = 0;
            if (v.hasSeasonPass || v.hasWristband) {
              finalPrice = 0;
            } else if (v.remainingBundleRides > 0) {
              v.remainingBundleRides--;
              finalPrice = 0;
            } else {
              finalPrice = this.settings.pricing.ticketPrice * incomeMult;
              v.money -= finalPrice;
              this.money += finalPrice;
              this.finances.income.tickets += finalPrice;
            }
            
            // Stay for a bit
            setTimeout(() => {
              if (v.state === 'RIDING') {
                v.state = 'WANDERING';
                if (ride) {
                  ride.currentVisitors--;
                  const happinessGained = 40;
                  
                  // Update Ride Satisfaction
                  ride.totalVisitorsServed++;
                  
                  // Happiness gained depends on price and condition
                  // Base happiness is 40. 
                  // If price is higher than baseIncome, satisfaction drops.
                  // If condition is low, satisfaction drops significantly.
                  const config = RIDE_CONFIGS[ride.type];
                  const priceFactor = Math.max(0.5, 1 - (ride.price - config.baseIncome) / (config.baseIncome * 2));
                  
                  // Poor maintenance reduces happiness a lot (squared factor)
                  const conditionFactor = Math.pow(ride.condition / 100, 2);
                  
                  const actualHappinessGained = Math.round(happinessGained * priceFactor * conditionFactor);
                  
                  v.happiness = Math.min(100, v.happiness + actualHappinessGained);
                  v.stamina -= 10; // Riding is tiring
                  
                  ride.totalHappinessGained += actualHappinessGained;
                  ride.satisfaction = Math.round((ride.totalHappinessGained / (ride.totalVisitorsServed * 40)) * 100);
                }
                this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
              }
            }, 3000 + Math.random() * 2000);
          } else if (!ride || ride.status !== 'OPERATIONAL') {
            v.state = 'WANDERING';
            this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
          }
        } else if (v.state === 'EATING' || v.state === 'USING_FACILITY' || v.state === 'RESTING') {
          const ride = this.rides.find(r => r.id === v.targetRideId);
          if (ride && ride.status === 'OPERATIONAL') {
            const finalPrice = ride.price * incomeMult;
            if (v.money >= finalPrice) {
              v.money -= finalPrice;
              this.money += finalPrice;
              
              // Track income
              if (RIDE_CONFIGS[ride.type].category === 'FOOD') {
                this.finances.income.food += finalPrice;
              } else {
                this.finances.income.tickets += finalPrice;
              }
              
              // Add a duration for these activities
              const prevState = v.state;
              if (prevState === 'RESTING') ride.currentVisitors++;
              
              setTimeout(() => {
                if (v.state === prevState) {
                  if (prevState === 'EATING') {
                    v.hunger = 0;
                    v.happiness = Math.min(100, v.happiness + 20);
                    v.stamina = Math.min(100, v.stamina + 5);
                  } else if (prevState === 'USING_FACILITY') {
                    v.bladder = 0;
                    v.happiness = Math.min(100, v.happiness + 10);
                  } else if (prevState === 'RESTING') {
                    v.stamina = Math.min(100, v.stamina + 40);
                    v.happiness = Math.min(100, v.happiness + 5);
                    ride.currentVisitors--;
                  }
                  v.state = 'WANDERING';
                  this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
                }
              }, 2000 + Math.random() * 2000);
            } else {
              v.state = 'WANDERING';
              this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
            }
          } else {
            v.state = 'WANDERING';
            this.setWanderTargetNearRide(v, mapWidthPx, mapHeightPx);
          }
        } else if (v.state === 'LEAVING') {
          // Remove visitor when they reach the entrance
          this.visitors.splice(i, 1);
          continue;
        }
      }

      // Check if visitor should leave
      const timeInPark = (now - v.timeEntered) / 1000; // seconds
      const isBored = timeInPark > (600 + Math.random() * 600); // Leave after 10-20 mins regardless

      if (v.happiness < 20 || v.money <= 0 || v.stamina < 10 || v.hunger > 95 || v.bladder > 95 || isBored) {
        if (v.state !== 'LEAVING' && v.state !== 'RIDING') {
          v.state = 'LEAVING';
          v.targetX = 0;
          v.targetY = mapHeightPx / 2;
        }
      }
    }

    // Spawn more visitors if needed
    if (isParkOpen) {
      // Realistic guest mechanics based on time of day and day of week
      const { hours, dayOfWeek } = this.time;
      const isWeekend = dayOfWeek >= 5; // Sat (5), Sun (6)
      
      let spawnRate = 0.03;
      
      if (isWeekend) {
        // Saturday and Sunday: Much more guests at all times except night
        if (hours >= 22 || hours < 8) {
          spawnRate = 0.02; // Night
        } else {
          spawnRate = 0.15; // Busy all day
        }
      } else {
        // Monday to Friday: Quiet early hours and nights, busier in the evenings
        if (hours >= 22 || hours < 8) {
          spawnRate = 0.01; // Night/Early morning
        } else if (hours >= 8 && hours < 16) {
          spawnRate = 0.04; // Work/School hours
        } else {
          spawnRate = 0.12; // Evening peak (16:00 - 22:00)
        }
      }

      // Max visitors also varies by time/day and park rating
      const parkRating = this.getParkRating();
      const demandMult = this.getVisitorDemandMultiplier();
      const ratingMult = 0.5 + (parkRating / 100); // 0.5 to 1.5 multiplier
      
      const maxVisitorsBase = isWeekend ? 150 : 100; // Increased base to make it less of a hard cap
      // Add some hourly variance to max visitors
      const hourlyVariance = 1 + (Math.sin(this.time.hours * 0.5) * 0.2);
      const maxVisitors = Math.floor(maxVisitorsBase * city.visitorMultiplier * ratingMult * hourlyVariance * demandMult);

      // Enforce a minimum delay between spawns (at least 1-3 seconds)
      const spawnCooldown = (1000 + Math.random() * 2000) / demandMult;
      const canSpawn = (now - this.lastSpawnTime) > spawnCooldown;

      if (this.visitors.length < maxVisitors && canSpawn && Math.random() < spawnRate * city.visitorMultiplier * ratingMult * demandMult) {
        // Sometimes spawn a group (1-3 people)
        const groupSize = Math.random() > 0.8 ? (Math.random() > 0.5 ? 3 : 2) : 1;
        for (let j = 0; j < groupSize; j++) {
          if (this.visitors.length < maxVisitors) {
            this.spawnVisitor();
          }
        }
        this.lastSpawnTime = now;
      }
    }

    // Update visitor stats periodically (e.g., every game hour)
    if (this.time.minutes === 0) {
      const totalHappiness = this.visitors.reduce((acc, v) => acc + v.happiness, 0);
      const totalIncome = (this.finances.income.tickets + this.finances.income.wristbands + this.finances.income.seasonPasses + this.finances.income.bundles + this.finances.income.food + this.finances.income.other);
      
      this.finances.visitorStats.avgHappiness = this.visitors.length > 0 ? totalHappiness / this.visitors.length : 100;
      this.finances.visitorStats.avgSpend = this.finances.visitorStats.totalVisitors > 0 ? totalIncome / this.finances.visitorStats.totalVisitors : 0;
    }

    return {
      money: this.money,
      rides: [...this.rides],
      inventory: [...this.inventory],
      staff: [...this.staff],
      visitors: [...this.visitors],
      time: { ...this.time },
      settings: { ...this.settings },
      company: { ...this.company },
      cities: [...CITIES],
      currentMapSize: { width: city.mapWidth, height: city.mapHeight },
      finances: { ...this.finances },
      dailyHistory: [...this.dailyHistory],
      tutorialStep: this.tutorialStep,
      showTutorial: this.showTutorial
    };
  }

  hireStaff(type: StaffType): StaffInstance | null {
    const config = STAFF_CONFIGS[type];
    const hiringFee = config.baseSalary * 10;
    if (this.money < hiringFee) return null;

    this.money -= hiringFee;
    const id = Math.random().toString(36).substr(2, 9);
    const staff: StaffInstance = {
      id,
      type,
      level: 1,
      salary: config.baseSalary,
      hiredTime: Date.now(),
      lastPaidTime: Date.now(),
      happiness: 100
    };
    this.staff.push(staff);
    this.saveGame();
    return staff;
  }

  hireRideOperator(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) return false;

    // Check if ride already has an operator
    const currentOp = this.staff.find(s => s.assignedRideId === rideId && s.type === 'OPERATOR');
    if (currentOp) return false;

    const staff = this.hireStaff('OPERATOR');
    if (staff) {
      staff.assignedRideId = rideId;
      ride.operatorId = staff.id;
      this.saveGame();
      return true;
    }
    return false;
  }

  hireRideMechanic(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) return false;

    // Check if ride already has a mechanic
    const currentMech = this.staff.find(s => s.assignedRideId === rideId && s.type === 'MECHANIC');
    if (currentMech) return false;

    const staff = this.hireStaff('MECHANIC');
    if (staff) {
      staff.assignedRideId = rideId;
      ride.mechanicId = staff.id;
      this.saveGame();
      return true;
    }
    return false;
  }

  fireStaff(id: string) {
    const staff = this.staff.find(s => s.id === id);
    if (staff && staff.assignedRideId) {
      const ride = this.rides.find(r => r.id === staff.assignedRideId);
      if (ride) {
        if (staff.type === 'OPERATOR') ride.operatorId = undefined;
        if (staff.type === 'MECHANIC') ride.mechanicId = undefined;
      }
    }
    this.staff = this.staff.filter(s => s.id !== id);
    this.saveGame();
  }

  assignOperator(rideId: string, staffId: string | null) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) return false;

    // Unassign current operator if any
    if (ride.operatorId) {
      const currentOp = this.staff.find(s => s.id === ride.operatorId);
      if (currentOp) {
        currentOp.assignedRideId = undefined;
      }
      ride.operatorId = undefined;
    }

    if (staffId) {
      const newOp = this.staff.find(s => s.id === staffId && s.type === 'OPERATOR');
      if (newOp) {
        // If they were assigned elsewhere, unassign them from there
        if (newOp.assignedRideId) {
          const oldRide = this.rides.find(r => r.id === newOp.assignedRideId);
          if (oldRide) {
            oldRide.operatorId = undefined;
          }
        }
        newOp.assignedRideId = rideId;
        ride.operatorId = staffId;
      }
    }
    this.saveGame();
    return true;
  }

  assignMechanic(rideId: string, staffId: string | null) {
    const ride = this.rides.find(r => r.id === rideId);
    if (!ride) return false;

    // Unassign current mechanic if any
    if (ride.mechanicId) {
      const currentMech = this.staff.find(s => s.id === ride.mechanicId);
      if (currentMech) {
        currentMech.assignedRideId = undefined;
      }
      ride.mechanicId = undefined;
    }

    if (staffId) {
      const newMech = this.staff.find(s => s.id === staffId && s.type === 'MECHANIC');
      if (newMech) {
        // If they were assigned elsewhere, unassign them from there
        if (newMech.assignedRideId) {
          const oldRide = this.rides.find(r => r.id === newMech.assignedRideId);
          if (oldRide) {
            oldRide.mechanicId = undefined;
          }
        }
        newMech.assignedRideId = rideId;
        ride.mechanicId = staffId;
      }
    }
    this.saveGame();
    return true;
  }

  trainStaff(id: string) {
    const staff = this.staff.find(s => s.id === id);
    if (staff && staff.level < 5) {
      const trainingCost = staff.level * 500;
      if (this.money >= trainingCost) {
        this.money -= trainingCost;
        staff.level++;
        // Higher level requires higher minimum salary
        const minSalary = STAFF_CONFIGS[staff.type].baseSalary * (1 + (staff.level - 1) * 0.5);
        if (staff.salary < minSalary) {
          staff.salary = Math.ceil(minSalary);
        }
        this.saveGame();
        return true;
      }
    }
    return false;
  }

  updateStaffSalary(id: string, newSalary: number) {
    const staff = this.staff.find(s => s.id === id);
    if (staff) {
      const minSalary = STAFF_CONFIGS[staff.type].baseSalary * (1 + (staff.level - 1) * 0.5);
      if (newSalary >= minSalary) {
        staff.salary = newSalary;
        this.saveGame();
        return true;
      }
    }
    return false;
  }

  private isParkOpen(): boolean {
    if (this.settings.isManuallyClosed) return false;
    return this.canParkOpen().canOpen;
  }

  canParkOpen(): { canOpen: boolean; reason?: string } {
    const hasOperationalRides = this.rides.some(r => 
      r.status === 'OPERATIONAL' && r.isPlaced && r.operatorId
    );
    if (!hasOperationalRides) {
      return { canOpen: false, reason: 'No operational rides with operators' };
    }

    const { hours } = this.time;
    const { openTime, closeTime } = this.settings;
    let withinSchedule = false;
    if (openTime < closeTime) {
      withinSchedule = hours >= openTime && hours < closeTime;
    } else {
      withinSchedule = hours >= openTime || hours < closeTime;
    }

    if (!withinSchedule) {
      return { canOpen: false, reason: 'Outside of scheduled hours' };
    }

    return { canOpen: true };
  }

  openPark() {
    const { canOpen } = this.canParkOpen();
    if (canOpen) {
      this.settings.isManuallyClosed = false;
      this.saveGame();
      return true;
    }
    return false;
  }

  closePark() {
    this.settings.isManuallyClosed = true;
    this.saveGame();
    return true;
  }

  skipNight() {
    const { openTime } = this.settings;
    this.time.hours = openTime;
    this.time.minutes = 0;
    this.time.day++;
    this.timeAccumulator = 0;
  }

  updateSettings(newSettings: Partial<ParkSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  updateCompanyName(name: string) {
    this.company.name = name;
  }

  travelToCity(cityId: string) {
    if (this.rides.length > 0) {
      return false; // Must dismantle all rides first
    }
    const city = CITIES.find(c => c.id === cityId);
    if (city && this.money >= city.travelCost) {
      this.money -= city.travelCost;
      this.company.currentCityId = cityId;
      // Clear current visitors when moving
      this.visitors = [];
      return true;
    }
    return false;
  }

  buyRide(type: import('./types').RideType) {
    const config = RIDE_CONFIGS[type];
    const capacity = this.getWarehouseCapacity();
    if (this.inventory.length >= capacity) {
      return false; // Warehouse full
    }
    if (this.money >= config.cost) {
      this.money -= config.cost;
      const ride: RideInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        x: 0,
        y: 0,
        level: 1,
        price: config.baseIncome,
        currentVisitors: 0,
        lastIncomeTime: Date.now(),
        status: 'OPERATIONAL',
        condition: 100,
        isPlaced: false,
        buildProgress: 0,
        avgWaitTime: 0,
        satisfaction: 100,
        totalVisitorsServed: 0,
        totalHappinessGained: 0
      };
      this.inventory.push(ride);
      this.saveGame();
      return true;
    }
    return false;
  }

  getWarehouseCapacity() {
    return 3 + (this.company.warehouseLevel - 1) * 2;
  }

  getWarehouseUpgradeCost() {
    return Math.floor(1000 * Math.pow(1.5, this.company.warehouseLevel - 1));
  }

  upgradeWarehouse() {
    const cost = this.getWarehouseUpgradeCost();
    if (this.money >= cost) {
      this.money -= cost;
      this.company.warehouseLevel++;
      this.saveGame();
      return true;
    }
    return false;
  }

  setHomeCity(cityId: string) {
    if (!this.company.homeCityId) {
      this.company.homeCityId = cityId;
      this.saveGame();
      return true;
    }
    return false;
  }

  placeRide(rideId: string, x: number, y: number) {
    const rideIndex = this.inventory.findIndex(r => r.id === rideId);
    if (rideIndex === -1) return false;

    const ride = this.inventory[rideIndex];
    const city = CITIES.find(c => c.id === this.company.currentCityId) || CITIES[0];
    const config = RIDE_CONFIGS[ride.type];

    // Boundary check
    if (x < 0 || x + config.width > city.mapWidth || y < 0 || y + config.height > city.mapHeight) {
      return false;
    }

    // Overlap check
    const isOverlapping = this.rides.some(r => {
      const rConfig = RIDE_CONFIGS[r.type];
      return !(x + config.width <= r.x || 
               x >= r.x + rConfig.width || 
               y + config.height <= r.y || 
               y >= r.y + rConfig.height);
    });

    if (isOverlapping) return false;

    ride.x = x;
    ride.y = y;
    ride.isPlaced = true;
    ride.status = 'CONSTRUCTING';
    ride.buildProgress = 0;
    this.rides.push(ride);
    this.inventory.splice(rideIndex, 1);
    this.saveGame();
    return true;
  }

  dismantleRide(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (ride && ride.status !== 'DISMANTLING' && ride.status !== 'CONSTRUCTING') {
      ride.status = 'DISMANTLING';
      ride.buildProgress = 100;
      ride.currentVisitors = 0;
      this.saveGame();
      return true;
    }
    return false;
  }

  repairRide(rideId: string) {
    const ride = this.rides.find(r => r.id === rideId);
    if (ride && ride.status !== 'MAINTENANCE') {
      const repairCost = Math.floor((100 - ride.condition) * 5);
      if (this.money >= repairCost) {
        this.money -= repairCost;
        ride.status = 'MAINTENANCE';
        this.saveGame();
        return true;
      }
    }
    return false;
  }

  sellRide(rideId: string) {
    const rideIndex = this.rides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      const ride = this.rides[rideIndex];
      const config = RIDE_CONFIGS[ride.type];
      this.money += Math.floor(config.cost * 0.5 * (ride.condition / 100));
      this.rides.splice(rideIndex, 1);
      this.saveGame();
      return true;
    }
    return false;
  }

  private setWanderTargetNearRide(v: Visitor, mapWidthPx: number, mapHeightPx: number) {
    if (this.rides.length > 0) {
      const randomRide = this.rides[Math.floor(Math.random() * this.rides.length)];
      const config = RIDE_CONFIGS[randomRide.type];
      const offsetX = (Math.random() - 0.5) * 200;
      const offsetY = (Math.random() - 0.5) * 200;
      v.targetX = Math.max(0, Math.min(mapWidthPx, randomRide.x * 40 + (config.width * 20) + offsetX));
      v.targetY = Math.max(0, Math.min(mapHeightPx, randomRide.y * 40 + (config.height * 20) + offsetY));
    } else {
      v.targetX = Math.random() * mapWidthPx;
      v.targetY = Math.random() * mapHeightPx;
    }
  }
}
