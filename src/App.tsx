import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './gameEngine';
import { RIDE_CONFIGS, RideType, RideIntensity, GRID_SIZE, STAFF_CONFIGS, StaffType, RideCategory, CITIES, GARAGE_CONFIGS, TRUCK_COST, GameState } from './types';
import { 
  Truck,
  Warehouse,
  Coins, 
  Users, 
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
  ArrowRight,
  ArrowUp,
  ArrowDown,
  List,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

import { audioService } from './audioService';
import { TRANSLATIONS, LANGUAGES } from './localization';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'Mar', 'Apr', 'May', // Spring
  'Jun', 'Jul', 'Aug', // Summer
  'Sep', 'Oct', 'Nov', // Autumn
  'Dec', 'Jan', 'Feb'  // Winter
];

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

const TruckMinigame = ({ engine, gameState }: { engine: GameEngine, gameState: GameState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = (key: string, replacements?: Record<string, string>) => {
    const lang = gameState.settings.language;
    let text = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.EN[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
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
          {t('travelling_to', { city: targetCity?.name || '' })}
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
  const [setupCity, setSetupCity] = useState('london');
  const [setupSearch, setSetupSearch] = useState('');
  const [travelSearch, setTravelSearch] = useState('');
  const [selectedRideType, setSelectedRideType] = useState<RideType | null>(null);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [placingRideId, setPlacingRideId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory'>('inventory');
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState<RideCategory | 'ALL'>('ALL');
  const [shopIntensity, setShopIntensity] = useState<RideIntensity | 'ALL'>('ALL');
  const [inventoryIntensity, setInventoryIntensity] = useState<RideIntensity | 'ALL'>('ALL');
  const [activeManagementTab, setActiveManagementTab] = useState<'settings' | 'travel' | 'staff' | 'budget' | 'warehouse' | 'pricing' | 'garage' | 'finance'>('settings');
  const [selectedCityInfoId, setSelectedCityInfoId] = useState<string | null>(null);
  const [travelSortBy, setTravelSortBy] = useState<'name' | 'population' | 'cost' | 'multiplier'>('name');
  const [travelSortOrder, setTravelSortOrder] = useState<'asc' | 'desc'>('asc');
  const [travelView, setTravelView] = useState<'list' | 'map'>('list');
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

    const lang = gameState.settings.language || 'EN';
    const langTranslations = TRANSLATIONS[lang] || TRANSLATIONS['EN'];
    let text = langTranslations[key] || TRANSLATIONS['EN'][key] || key;

    if (typeof text !== 'string') {
      text = String(text);
    }

    if (reps) {
      Object.entries(reps).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth - 320;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Sync Audio Settings
  useEffect(() => {
    audioService.updateSettings({
      musicVolume: gameState.settings.musicVolume,
      sfxVolume: gameState.settings.sfxVolume
    });
  }, [gameState.settings.musicVolume, gameState.settings.sfxVolume]);

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
    if (city.terrain === 'GRASS') {
      ctx.fillStyle = '#dcfce7'; // Light green
    } else if (city.terrain === 'ASPHALT') {
      ctx.fillStyle = '#e2e8f0'; // Light slate/gray
    } else {
      ctx.fillStyle = '#fef3c7'; // Light amber/gravel
    }
    ctx.fillRect(0, 0, mapWidth, mapHeight);
    
    // Subtle texture based on terrain
    if (city.terrain === 'GRASS') {
      ctx.strokeStyle = '#bbf7d0';
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
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      for (let i = 0; i < 150; i++) {
        const gx = (i * 137.5) % mapWidth;
        const gy = (i * 271.3) % mapHeight;
        ctx.strokeRect(gx, gy, 2, 2);
      }
    } else {
      ctx.strokeStyle = '#fde68a';
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
    const hours = gameState.time.hours;
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl text-center"
            >
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40">
                <Building2 size={40} />
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Start Your Empire</h1>
              <p className="text-slate-500 font-medium mb-10">Define your company and choose your first European city.</p>
              
              <div className="space-y-6 text-left">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Company Name</label>
                  <input 
                    type="text" 
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-lg font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                    placeholder="e.g. DreamWorld Parks"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Starting City</label>
                  <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={setupSearch}
                      onChange={(e) => setSetupSearch(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 pl-11 pr-4 py-2 text-sm font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                      placeholder="Search cities..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {gameState.cities
                      .filter(city => 
                        city.name.toLowerCase().includes(setupSearch.toLowerCase()) || 
                        city.country.toLowerCase().includes(setupSearch.toLowerCase())
                      )
                      .map(city => (
                      <button
                        key={city.id}
                        onClick={() => setSetupCity(city.id)}
                        className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all
                          ${setupCity === city.id 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-500'}
                        `}
                      >
                        <Globe size={16} />
                        <div className="text-center">
                          <p className="text-sm font-bold leading-tight">{t(city.name)}</p>
                          <p className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{city.country} • {city.population.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
                className={`mt-10 w-full rounded-2xl py-4 text-lg font-black uppercase tracking-widest transition-all
                  ${setupName.trim() 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                `}
              >
                {t('launch_company')}
              </button>

              {GameEngine.hasSave() && (
                <button 
                  onClick={() => setIsSetupOpen(false)}
                  className="mt-4 w-full text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {t('continue_game')}
                </button>
              )}
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
              className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex h-full overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
                  <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                        <Settings size={20} />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">{t('park_management')}</h2>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {[
                      { id: 'settings', label: t('settings'), icon: Settings },
                      { id: 'staff', label: t('staff'), icon: Users, count: gameState.staff.length },
                      { id: 'budget', label: t('budget'), icon: TrendingUp },
                      { id: 'finance', label: t('loans'), icon: Coins },
                      { id: 'pricing', label: t('pricing'), icon: DollarSign },
                      { id: 'travel', label: t('travel'), icon: MapIcon },
                      { id: 'warehouse', label: t('warehouse'), icon: Package },
                      { id: 'garage', label: t('garage'), icon: Truck, count: gameState.trucks.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveManagementTab(tab.id as any)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                          activeManagementTab === tab.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-500 hover:bg-slate-200 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <tab.icon size={16} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.count !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-[8px] ${
                            activeManagementTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'
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
                  <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                      {activeManagementTab === 'settings' ? t('settings') : 
                       activeManagementTab === 'finance' ? t('loans') : 
                       t(activeManagementTab)}
                    </h3>
                    <button 
                      onClick={() => setIsManagementOpen(false)}
                      className="rounded-full p-2 hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8">
                    {activeManagementTab === 'finance' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">{t('active_loans')}</h3>
                      <div className="space-y-4">
                        {gameState.activeLoans.length === 0 ? (
                          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                            <p className="text-slate-400 font-medium">{t('no_active_loans')}</p>
                          </div>
                        ) : (
                          gameState.activeLoans.map(loan => (
                            <div key={loan.id} className="p-6 bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t('remaining_principal')}</p>
                                  <p className="text-2xl font-black text-slate-900">${Math.round(loan.remainingPrincipal).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{t('interest_rate')}</p>
                                  <p className="text-lg font-black text-indigo-600">{(loan.interestRate * 100).toFixed(1)}%</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('daily_payment')}</p>
                                  <p className="font-bold text-slate-700">${Math.round(loan.dailyPayment).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('original_amount')}</p>
                                  <p className="font-bold text-slate-700">${loan.amount.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => engine.repayLoan(loan.id, 1000)}
                                  disabled={gameState.money < 1000}
                                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-lg border-2 border-slate-900 transition-all active:translate-y-1 active:shadow-none"
                                >
                                  {t('repay_amount', { amount: '1,000' })}
                                </button>
                                <button 
                                  onClick={() => engine.repayLoan(loan.id, 5000)}
                                  disabled={gameState.money < 5000}
                                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-lg border-2 border-slate-900 transition-all active:translate-y-1 active:shadow-none"
                                >
                                  {t('repay_amount', { amount: '5,000' })}
                                </button>
                                <button 
                                  onClick={() => engine.repayLoan(loan.id, loan.remainingPrincipal * (1 + loan.interestRate))}
                                  disabled={gameState.money < loan.remainingPrincipal * (1 + loan.interestRate)}
                                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                                >
                                  {t('pay_off')}
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">{t('available_loan_offers')}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { amount: 5000, term: 7, label: t('small_business_loan') },
                          { amount: 20000, term: 14, label: t('expansion_credit') },
                          { amount: 50000, term: 30, label: t('venture_capital') }
                        ].map((offer, i) => (
                          <div key={i} className="p-4 bg-slate-50 border-2 border-slate-900 rounded-xl flex flex-col justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-1">{offer.label}</p>
                              <p className="text-xl font-black text-slate-900">${offer.amount.toLocaleString()}</p>
                              <p className="text-[10px] font-medium text-slate-500 mb-4">{offer.term} {t('day_term')}</p>
                            </div>
                            <button 
                              onClick={() => engine.takeLoan(offer.amount, offer.term)}
                              className="w-full py-2 bg-white hover:bg-indigo-50 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-lg border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                            >
                              {t('apply_now')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeManagementTab === 'budget' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Income Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <ArrowUpRight size={18} />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('income_today')}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t('ride_tickets')}</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.tickets}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t('wristbands_label')}</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.wristbands}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t('season_passes_label')}</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.seasonPasses}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t('ticket_bundles')}</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.bundles}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t('food_drinks')}</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.food}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">{t('other_label')}</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.other}</span>
                          </div>
                          <div className="pt-4 border-top border-slate-50 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900">{t('total_income')}</span>
                            <span className="text-lg font-black text-emerald-600">
                              +${gameState.finances.income.tickets + gameState.finances.income.wristbands + gameState.finances.income.seasonPasses + gameState.finances.income.bundles + gameState.finances.income.food + gameState.finances.income.other}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expenses Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                            <ArrowDownRight size={18} />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('expenses_today')}</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Briefcase size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">{t('staff_wages')}</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.wages}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Zap size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">{t('electricity')}</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.electricity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CreditCard size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">{t('loan_interest')}</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${Math.round(gameState.finances.expenses.loanInterest)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CreditCard size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">{t('loan_principal')}</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${Math.round(gameState.finances.expenses.loanPrincipal)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Home size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">{t('area_rent')}</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.rent}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Settings size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">{t('maintenance_label')}</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.maintenance}</span>
                          </div>
                          <div className="pt-4 border-top border-slate-50 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900">{t('total_expenses')}</span>
                            <span className="text-lg font-black text-rose-600">
                              -${gameState.finances.expenses.wages + gameState.finances.expenses.electricity + gameState.finances.expenses.rent + gameState.finances.expenses.maintenance + gameState.finances.expenses.loanInterest + gameState.finances.expenses.loanPrincipal + gameState.finances.expenses.other}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Profit Summary */}
                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">{t('daily_net_profit')}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">
                            {(gameState.finances.income.tickets + gameState.finances.income.wristbands + gameState.finances.income.seasonPasses + gameState.finances.income.bundles + gameState.finances.income.food + gameState.finances.income.other) - (gameState.finances.expenses.wages + gameState.finances.expenses.electricity + gameState.finances.expenses.rent + gameState.finances.expenses.maintenance + gameState.finances.expenses.other) >= 0 ? '+' : ''}
                            ${(gameState.finances.income.tickets + gameState.finances.income.wristbands + gameState.finances.income.seasonPasses + gameState.finances.income.bundles + gameState.finances.income.food + gameState.finances.income.other) - (gameState.finances.expenses.wages + gameState.finances.expenses.electricity + gameState.finances.expenses.rent + gameState.finances.expenses.maintenance + gameState.finances.expenses.other)}
                          </span>
                          <span className="text-sm font-bold opacity-70">{t('today')}</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <PieChart size={24} />
                      </div>
                    </div>

                    {/* Visitor Stats */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Users size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('visitor_insights')}</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('total_visitors')}</p>
                          <p className="text-2xl font-black text-slate-900">{gameState.finances.visitorStats.totalVisitors}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('avg_happiness')}</p>
                          <p className="text-2xl font-black text-emerald-600">{Math.floor(gameState.finances.visitorStats.avgHappiness)}%</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('avg_spend')}</p>
                          <p className="text-2xl font-black text-indigo-600">${Math.floor(gameState.finances.visitorStats.avgSpend)}</p>
                        </div>
                      </div>
                    </section>

                    {/* Daily History */}
                    {gameState.dailyHistory.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">{t('recent_performance')}</h3>
                        </div>
                        <div className="space-y-3">
                          {gameState.dailyHistory.map((day, idx) => {
                            const dayIncome = day.income.tickets + day.income.wristbands + day.income.seasonPasses + day.income.bundles + day.income.food + day.income.other;
                            const dayExpenses = day.expenses.wages + day.expenses.electricity + day.expenses.rent + day.expenses.maintenance + day.expenses.other;
                            const net = dayIncome - dayExpenses;
                            return (
                              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${net >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {net >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{t('day')} {gameState.time.day - (idx + 1)}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                      {(() => {
                                        const hDay = gameState.time.day - (idx + 1);
                                        if (hDay <= 0) return t('pre_opening');
                                        const hMonth = Math.floor(((hDay - 1) % 120) / 10) + 1;
                                        const hDayOfMonth = ((hDay - 1) % 10) + 1;
                                        return `${t(`month_${hMonth - 1}`)} ${hDayOfMonth}`;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-black ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {net >= 0 ? '+' : ''}${net}
                                  </p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">{t('net_profit')}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
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
                              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700 leading-tight">
                                  {canOpen.reason && t(canOpen.reason.key, canOpen.reason.replacements)}
                                </p>
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
                          {t('home_city')}: {gameState.company.homeCityId ? (CITIES.find(c => c.id === gameState.company.homeCityId)?.name || gameState.company.homeCityId) : t('not_set')}
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
                                  <p className="text-sm font-black text-slate-900">{t(`staff_${config.type}_name`)}</p>
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
                                <div className="grid gap-4">
                                  {staffInCategory.map(staff => {
                                    const minSalary = config.baseSalary * (1 + (staff.level - 1) * 0.5);
                                    const trainingCost = staff.level * 500;
                                    const happinessColor = staff.happiness > 70 ? 'text-emerald-500' : staff.happiness > 40 ? 'text-amber-500' : 'text-rose-500';
                                    const HappinessIcon = staff.happiness > 70 ? Smile : staff.happiness > 40 ? Meh : Frown;
                                    const isUnhappy = staff.happiness < 40;
                                    const salaryRatio = staff.salary / minSalary;

                                    return (
                                      <div key={staff.id} className={`p-5 rounded-3xl border transition-all ${
                                        isUnhappy ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 bg-white'
                                      } shadow-sm hover:shadow-md`}>
                                        <div className="flex items-center justify-between mb-4">
                                          <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 flex items-center justify-center rounded-xl text-xl ${
                                              isUnhappy ? 'bg-rose-100' : 'bg-slate-50'
                                            }`}>
                                              {config.icon}
                                            </div>
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm text-slate-900">ID: {staff.id.slice(0, 6)}</h4>
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-600 text-white uppercase tracking-widest">
                                                  {t('lvl_label')} {staff.level}
                                                </span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                  staff.state === 'WORKING' ? 'bg-emerald-100 text-emerald-700' :
                                                  staff.state === 'RESTING' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-slate-100 text-slate-700'
                                                }`}>
                                                  {staff.state === 'WORKING' ? t('working_label') :
                                                   staff.state === 'RESTING' ? t('resting_label') :
                                                   t('idle_label')}
                                                </span>
                                                {isUnhappy && (
                                                  <span className="animate-pulse text-[8px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-widest">
                                                    {t('risk_of_quitting')}
                                                  </span>
                                                )}
                                              </div>
                                              {staff.assignedRideId && (
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                                                  {t('assigned')}: {t(`ride_${gameState.rides.find(r => r.id === staff.assignedRideId)?.type || 'TEA_CUPS'}_name`)}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                              <div className={`flex items-center gap-1 ${staff.stamina > 70 ? 'text-emerald-500' : staff.stamina > 30 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                <Zap size={14} />
                                                <span className="text-[10px] font-black">{Math.floor(staff.stamina)}%</span>
                                              </div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{t('stamina')}</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                              <div className={`flex items-center gap-1 ${happinessColor}`}>
                                                <HappinessIcon size={14} />
                                                <span className="text-[10px] font-black">{Math.floor(staff.happiness)}%</span>
                                              </div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{t('happiness')}</p>
                                            </div>
                                            <button 
                                              onClick={() => {
                                                engine.fireStaff(staff.id);
                                                setGameState(engine.getState());
                                              }}
                                              className="h-8 w-8 flex items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-1">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('hourly_salary')}</label>
                                                {salaryRatio < 1 && (
                                                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">{t('underpaid_label')}</span>
                                                )}
                                                {salaryRatio >= 1.2 && (
                                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">{t('well_paid_label')}</span>
                                                )}
                                              </div>
                                              <span className="text-[9px] font-bold text-slate-400">{t('min_label')}: ${Math.ceil(minSalary)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <DollarSign size={14} className={salaryRatio < 1 ? 'text-rose-500' : 'text-emerald-500'} />
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
                                                className="flex-1 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                              />
                                              <span className={`text-xs font-black w-8 text-right ${
                                                salaryRatio < 1 ? 'text-rose-600' : 'text-slate-900'
                                              }`}>${staff.salary}</span>
                                            </div>
                                          </div>

                                          <button 
                                            disabled={staff.level >= 5 || gameState.money < trainingCost}
                                            onClick={() => {
                                              if (engine.trainStaff(staff.id)) {
                                                setGameState(engine.getState());
                                              }
                                            }}
                                            className="h-10 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                          >
                                            <GraduationCap size={14} />
                                            {staff.level >= 5 ? t('max_level') : t('train_button', { cost: trainingCost })}
                                          </button>
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
                        <div className="h-full overflow-y-auto pr-2 space-y-4">
                          {gameState.cities
                            .filter(city => 
                              city.name.toLowerCase().includes(travelSearch.toLowerCase()) || 
                              city.country.toLowerCase().includes(travelSearch.toLowerCase())
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
                              
                              return (
                                <div 
                                  key={city.id}
                                  onClick={() => setSelectedCityInfoId(city.id)}
                                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
                                    ${isCurrent ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                                  `}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl
                                      ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}
                                    `}>
                                      <Globe size={24} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-900">{city.name}</h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 uppercase">
                                          {city.country}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500 mt-0.5">{city.description}</p>
                                      <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <span className="text-[10px] font-bold text-indigo-600 uppercase">
                                          x{city.visitorMultiplier} {t('visitors_label')}
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                          {t('travel_label')}: ${engine.getTravelCost(city.id)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                                          {t('size')}: {city.mapWidth}x{city.mapHeight}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                                          {t('terrain')}: {city.terrain}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {!isCurrent && (
                                    <button
                                      disabled={gameState.money < engine.getTravelCost(city.id) || gameState.rides.length > 0 || (gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (engine.travelToCity(city.id)) {
                                          audioService.playSFX('buy');
                                          setGameState(engine.getState());
                                          setIsManagementOpen(false);
                                          confetti({
                                            particleCount: 150,
                                            spread: 100,
                                            origin: { y: 0.6 }
                                          });
                                        }
                                      }}
                                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                                        ${gameState.money >= engine.getTravelCost(city.id) && gameState.rides.length === 0 && !(gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')
                                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                                      `}
                                    >
                                      {gameState.rides.length > 0 
                                        ? t('dismantle_first') 
                                        : (gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')
                                          ? t('island_locked')
                                          : t('travel_button')}
                                    </button>
                                  )}
                                  {isCurrent && (
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{t('current_location')}</span>
                                      {city.id === gameState.company.homeCityId && (
                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                          <Home size={10} /> {t('home_city_label')}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {!isCurrent && city.id === gameState.company.homeCityId && (
                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                      <Home size={10} /> {t('home_city_label')}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          }
                        </div>
                      ) : (
                        <div className="h-full bg-slate-950 rounded-3xl border-2 border-slate-900 relative overflow-hidden flex items-center justify-center group/map">
                          {/* Map Controls */}
                          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                            <button 
                              onClick={() => setTravelMapScale(prev => Math.min(prev + 0.2, 3))}
                              className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 rounded-xl hover:text-white hover:bg-slate-800 transition-all"
                            >
                              <ZoomIn size={18} />
                            </button>
                            <button 
                              onClick={() => setTravelMapScale(prev => Math.max(prev - 0.2, 0.5))}
                              className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 rounded-xl hover:text-white hover:bg-slate-800 transition-all"
                            >
                              <ZoomOut size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setTravelMapScale(1);
                                setTravelMapOffset({ x: 0, y: 0 });
                              }}
                              className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 rounded-xl hover:text-white hover:bg-slate-800 transition-all"
                            >
                              <Maximize size={18} />
                            </button>
                          </div>

                          {/* Interactive Map Surface */}
                          <motion.div 
                            drag
                            dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                            dragElastic={0.1}
                            dragMomentum={false}
                            onWheel={(e) => {
                              const delta = e.deltaY > 0 ? -0.1 : 0.1;
                              setTravelMapScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
                            }}
                            animate={{ scale: travelMapScale, x: travelMapOffset.x, y: travelMapOffset.y }}
                            className="relative w-[2000px] h-[1500px] cursor-grab active:cursor-grabbing"
                          >
                            {/* Radar Scan Line */}
                            <motion.div 
                              animate={{ top: ['0%', '100%'] }}
                              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                              className="absolute left-0 right-0 h-[2px] bg-indigo-500/30 blur-sm pointer-events-none z-[5]"
                            />

                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(30,1fr)] opacity-10 pointer-events-none">
                              {[...Array(1200)].map((_, i) => <div key={i} className="border-[0.5px] border-indigo-400" />)}
                            </div>

                            {/* Abstract Landmasses (Decorative) */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                              <div className="absolute top-[20%] left-[30%] w-[400px] h-[300px] bg-indigo-500 rounded-full blur-[100px]" />
                              <div className="absolute top-[40%] left-[50%] w-[500px] h-[400px] bg-indigo-600 rounded-full blur-[120px]" />
                              <div className="absolute top-[10%] left-[60%] w-[300px] h-[200px] bg-indigo-400 rounded-full blur-[80px]" />
                            </div>

                            {/* City Connections (Lines from current city) */}
                            {(() => {
                              const currentCity = gameState.cities.find(c => c.id === gameState.company.currentCityId);
                              if (!currentCity) return null;
                              const currentX = ((currentCity.x || 0) + 600) / 1200 * 2000;
                              const currentY = (600 - (currentCity.y || 0)) / 1400 * 1500;

                              return gameState.cities
                                .filter(city => city.id !== currentCity.id && (
                                  city.name.toLowerCase().includes(travelSearch.toLowerCase()) || 
                                  city.country.toLowerCase().includes(travelSearch.toLowerCase())
                                ))
                                .map(city => {
                                  const targetX = ((city.x || 0) + 600) / 1200 * 2000;
                                  const targetY = (600 - (city.y || 0)) / 1400 * 1500;
                                  
                                  return (
                                    <svg key={`line-${city.id}`} className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                                      <line 
                                        x1={currentX} y1={currentY} 
                                        x2={targetX} y2={targetY} 
                                        stroke="white" strokeWidth="1" strokeDasharray="4 4"
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
                                const mapX = ((city.x || 0) + 600) / 1200 * 2000;
                                const mapY = (600 - (city.y || 0)) / 1400 * 1500;

                                return (
                                  <motion.button
                                    key={city.id}
                                    whileHover={{ scale: 1.5, zIndex: 20 }}
                                    onClick={() => setSelectedCityInfoId(city.id)}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                    style={{ left: mapX, top: mapY }}
                                  >
                                    <div className="relative flex items-center justify-center">
                                      {/* Pulse Effect for Current City */}
                                      {isCurrent && (
                                        <div className="absolute inset-0 h-8 w-8 -translate-x-1/4 -translate-y-1/4 rounded-full bg-indigo-500/20 animate-ping" />
                                      )}
                                      
                                      {/* Marker Dot */}
                                      <div className={`h-4 w-4 rounded-full border-2 border-slate-900 shadow-2xl transition-all
                                        ${isCurrent ? 'bg-indigo-500 scale-125' : isHome ? 'bg-amber-500' : 'bg-slate-400 group-hover:bg-white'}
                                      `} />
                                      
                                      {/* Label */}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                                        <div className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-2xl border border-slate-700 flex items-center gap-2">
                                          {isHome && <Home size={10} className="text-amber-400" />}
                                          {city.name}
                                          <span className="opacity-50 text-[8px]">{t(`country_${city.country}`)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })
                            }
                          </motion.div>
                          
                          {/* Map Overlay HUD */}
                          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                                <span>{t('legend_current')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <span>{t('legend_home')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-slate-400" />
                                <span>{t('legend_available')}</span>
                              </div>
                            </div>
                            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              {t('map_navigation')}
                            </div>
                          </div>
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
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t(`country_${city.country}`)}</p>
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
      <div className="z-10 w-80 border-r border-slate-200 bg-white p-5 shadow-xl flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                <Building2 size={24} />
              </div>
              <h1 className="text-lg font-black tracking-tight truncate max-w-[140px] uppercase">{gameState.company.name}</h1>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  engine.togglePause();
                  setGameState(engine.getState());
                  audioService.playSFX('click');
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none
                  ${gameState.settings.isPaused 
                    ? 'bg-amber-400 text-slate-900' 
                    : 'bg-white text-slate-900 hover:bg-slate-50'}
                `}
                title={gameState.settings.isPaused ? t('resume_game') : t('pause_game')}
              >
                {gameState.settings.isPaused ? <Play size={14} fill="currentColor" /> : <Square size={14} fill="currentColor" />}
              </button>
              <button 
                onClick={() => setIsManagementOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none hover:bg-slate-50 transition-all"
              >
                <Settings size={14} />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <div className="flex items-center gap-1.5">
                <Globe size={10} className="text-indigo-500" />
                <span>{CITIES.find(c => c.id === gameState.company.currentCityId)?.name || gameState.company.currentCityId}</span>
              </div>
              <span className="text-indigo-600">
                {t(`month_${gameState.time.month - 1}`)} {gameState.time.dayOfMonth}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${getWeatherColor(gameState.currentWeather.type)}`}>
                  {getWeatherIcon(gameState.currentWeather.type)}
                  <span>{t(`weather_${gameState.currentWeather.type.toLowerCase()}`)}</span>
                </div>
                <span className="text-[10px] font-black text-slate-900">{gameState.currentWeather.temperature}°C</span>
              </div>
              <div className="text-[10px] font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                {gameState.time.hours.toString().padStart(2, '0')}:{gameState.time.minutes.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setIsShopOpen(true)}
              className="group relative flex flex-col items-center justify-center gap-1 rounded-2xl bg-indigo-600 py-3 text-[10px] font-black text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <ShoppingBag size={18} />
              {t('open_ride_shop')}
            </button>

            <button 
              onClick={() => setIsZoningMode(!isZoningMode)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[10px] font-black transition-all border-2
                ${isZoningMode 
                  ? 'bg-amber-400 border-slate-900 text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                  : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}
              `}
            >
              <MapIcon size={18} />
              {isZoningMode ? t('exit_zoning') : t('zoning_mode')}
            </button>
          </div>

          <AnimatePresence>
            {isZoningMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {(['FUNFAIR', 'TRUCK', 'STAFF'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setZoningType(type)}
                      className={`py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all
                        ${zoningType === type 
                          ? 'bg-white text-amber-600 shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-200'}
                      `}
                    >
                      {t(`zoning_${type.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              <Package size={14} />
              {t('inventory')} ({gameState.inventory.length})
            </button>
            <button 
              onClick={() => {
                if (selectedRideId) setActiveTab('details');
              }}
              disabled={!selectedRideId}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2
                ${activeTab === 'details' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                ${!selectedRideId ? 'opacity-30 cursor-not-allowed' : ''}
              `}
            >
              <Info size={14} />
              {t('details_tab')}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedRideId ? (
              <motion.section
                key="selected-ride"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {(() => {
                  const ride = gameState.rides.find(r => r.id === selectedRideId);
                  if (!ride) return null;
                  const config = RIDE_CONFIGS[ride.type];
                  return (
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">{t(`ride_${config.type}_name`)}</h3>
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{t('level_label')} {ride.level}</p>
                          </div>
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600">
                            {config.icon}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t('status_label')}</p>
                            <div className="flex items-center gap-1.5">
                              <div className={`h-1.5 w-1.5 rounded-full ${ride.status === 'OPERATING' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              <span className={`text-[10px] font-black uppercase ${ride.status === 'OPERATING' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {t(`status_${ride.status.toLowerCase()}`)}
                              </span>
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t('condition_label')}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-500 ${ride.condition < 30 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${ride.condition}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-900">{Math.round(ride.condition)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Operator/Mechanic Section */}
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase">{config.category === 'FOOD' ? t('vendor_label') : t('operator_label')}</span>
                            <span className={`text-[9px] font-black uppercase ${ride.operatorId ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {ride.operatorId ? t('assigned_label') : t('missing_label')}
                            </span>
                          </div>
                          <select 
                            value={ride.operatorId || ''}
                            onChange={(e) => {
                              const staffId = e.target.value || null;
                              if (engine.assignOperator(ride.id, staffId)) {
                                setGameState(engine.getState());
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">{t('auto_assign')}</option>
                            {gameState.staff
                              .filter(s => s.type === (config.category === 'FOOD' ? 'VENDOR' : 'OPERATOR'))
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.type === 'VENDOR' ? t('vendor_label') : t('operator_label')} {s.id.slice(0, 4)} {s.assignedRideId && s.assignedRideId !== ride.id ? `(${t('busy_label')})` : ''}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase">{t('mechanic_label')}</span>
                            <span className={`text-[9px] font-black uppercase ${ride.mechanicId ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {ride.mechanicId ? t('assigned_label') : t('auto_assigning')}
                            </span>
                          </div>
                          <select 
                            value={ride.mechanicId || ''}
                            onChange={(e) => {
                              const staffId = e.target.value || null;
                              if (engine.assignMechanic(ride.id, staffId)) {
                                setGameState(engine.getState());
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">{t('auto_assign')}</option>
                            {gameState.staff
                              .filter(s => s.type === 'MECHANIC')
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  {t('mechanic_label')} {s.id.slice(0, 4)} {s.assignedRideId && s.assignedRideId !== ride.id ? `(${t('busy_label')})` : ''}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            if (engine.repairRide(ride.id)) {
                              audioService.playSFX('repair');
                              setGameState(engine.getState());
                            }
                          }}
                          disabled={gameState.money < 100 || ride.condition >= 100}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
                        >
                          <Wrench size={14} />
                          {t('repair_button', { cost: 100 })}
                        </button>
                        <div className="bg-white p-2 rounded-xl border border-slate-100 flex flex-col justify-center">
                          <p className="text-[8px] font-black text-slate-400 uppercase mb-1">
                            {config.category === 'FOOD' ? t('item_price') : t('ticket_price')}
                          </p>
                          <div className="flex items-center gap-2">
                            <DollarSign size={12} className="text-emerald-500" />
                            <input 
                              type="number"
                              value={ride.ticketPrice}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                engine.updateRidePrice(ride.id, val);
                                setGameState(engine.getState());
                              }}
                              className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => {
                            engine.dismantleRide(ride.id);
                            audioService.playSFX('sell');
                            setGameState(engine.getState());
                          }}
                          disabled={ride.status === 'DISMANTLING' || ride.status === 'CONSTRUCTING'}
                          className="rounded-xl bg-indigo-50 border border-indigo-100 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        >
                          {t('dismantle_button')}
                        </button>
                        <button 
                          onClick={() => {
                            engine.sellRide(ride.id);
                            audioService.playSFX('sell');
                            setSelectedRideId(null);
                            setGameState(engine.getState());
                          }}
                          className="rounded-xl bg-rose-50 border border-rose-100 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          {t('sell')}
                        </button>
                      </div>
                      <button 
                        onClick={() => setSelectedRideId(null)}
                        className="w-full rounded-xl bg-white border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {t('deselect')}
                      </button>
                    </div>
                  );
                })()}
              </motion.section>
            ) : selectedVisitorId ? (
              <motion.section
                key="selected-visitor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {(() => {
                  const visitor = gameState.visitors.find(v => v.id === selectedVisitorId);
                  if (!visitor) return null;
                  return (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm" style={{ color: visitor.color }}>
                            👤
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">{t('visitor_label')} {visitor.id.slice(0, 4)}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{visitor.state}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-xl border border-blue-50">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t('happiness')}</p>
                            <p className={`text-[10px] font-black ${visitor.happiness > 70 ? 'text-emerald-600' : visitor.happiness > 30 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {Math.floor(visitor.happiness)}%
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-blue-50">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{t('money')}</p>
                            <p className="text-[10px] font-black text-blue-600">${Math.floor(visitor.money)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('needs')}</p>
                        <div className="space-y-2">
                          {[
                            { label: t('hunger'), value: visitor.hunger, color: 'bg-orange-400' },
                            { label: t('bladder'), value: visitor.bladder, color: 'bg-blue-400' },
                            { label: t('stamina'), value: visitor.stamina, color: 'bg-emerald-400' }
                          ].map((need, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tight">
                                <span>{need.label}</span>
                                <span>{Math.floor(need.value)}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                <div className={`h-full ${need.color} transition-all duration-500`} style={{ width: `${need.value}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t('recent_thoughts')}</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                          {visitor.thoughts.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic text-center py-2">{t('no_thoughts')}</p>
                          ) : (
                            visitor.thoughts.map((thought, i) => (
                              <div key={i} className="bg-slate-50 p-2 rounded-lg text-[10px] font-medium text-slate-600 flex gap-2 leading-relaxed">
                                <span className="text-blue-400 shrink-0">💭</span>
                                <span>{typeof thought === 'string' ? thought : t(thought.key, thought.replacements)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedVisitorId(null)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                      >
                        {t('deselect')}
                      </button>
                    </div>
                  );
                })()}
              </motion.section>
            ) : (
              <motion.section
                key="inventory-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('your_inventory_label')}</h2>
                  <div className="flex gap-1">
                    {['ALL', 'GENTLE', 'THRILL', 'EXTREME'].map(intensity => (
                      <button
                        key={intensity}
                        onClick={() => setInventoryIntensity(intensity as any)}
                        className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-all
                          ${inventoryIntensity === intensity 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                        `}
                      >
                        {intensity === 'ALL' ? t('all_label') : t(`intensity_${intensity.toLowerCase()}`)[0]}
                      </button>
                    ))}
                  </div>
                </div>
                {gameState.inventory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-3 shadow-sm">
                      <Package size={24} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('inventory_empty_message')}</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {gameState.inventory
                      .filter(ride => {
                        const config = RIDE_CONFIGS[ride.type];
                        return inventoryIntensity === 'ALL' || config.intensity === inventoryIntensity;
                      })
                      .map(ride => {
                        const config = RIDE_CONFIGS[ride.type];
                        const isPlacing = placingRideId === ride.id;

                        return (
                          <div key={ride.id} className={`group bg-white p-3 rounded-2xl border transition-all ${isPlacing ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 shadow-sm hover:border-indigo-200'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                  {config.icon}
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-900">{t(`ride_${config.type.toLowerCase()}_name`)}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{config.width}x{config.height}</span>
                                    {config.intensity && (
                                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">• {t(`intensity_${config.intensity.toLowerCase()}`)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => {
                                    if (engine.sellInventoryRide(ride.id)) {
                                      audioService.playSFX('sell');
                                      setGameState(engine.getState());
                                    }
                                  }}
                                  className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                                  title={t('sell_button')}
                                >
                                  <Trash2 size={14} />
                                </button>
                                <button
                                  onClick={() => setPlacingRideId(isPlacing ? null : ride.id)}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md
                                    ${isPlacing ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-100'}
                                  `}
                                >
                                  {isPlacing ? t('cancel_button') : t('place_button')}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {gameState.inventory.filter(ride => {
                      const config = RIDE_CONFIGS[ride.type];
                      return inventoryIntensity === 'ALL' || config.intensity === inventoryIntensity;
                    }).length === 0 && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{t('no_items_message', { intensity: inventoryIntensity.toLowerCase() })}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          <section className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest opacity-60">{t('park_stats')}</h2>
              <Info size={14} className="opacity-40" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium opacity-80">{t('visitors')}</span>
                </div>
                <span className="text-lg font-bold">{gameState.visitors.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium opacity-80">{t('warehouse')}</span>
                </div>
                <span className="text-lg font-bold">{gameState.rides.length + gameState.inventory.length} / {engine.getWarehouseCapacity()}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                <Coins size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{t('balance')}</p>
                <p className="text-xl font-black text-emerald-900">${Math.floor(gameState.money)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game View */}
      <div className="relative flex-1 bg-slate-200">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          className="cursor-crosshair w-full h-full"
        />

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
        {isShopOpen && (
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
              className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="bg-indigo-600 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                      <ShoppingBag size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{t('ride_shop_title')}</h2>
                      <p className="text-indigo-100 text-sm font-medium">
                        {t('warehouse')}: {gameState.rides.length + gameState.inventory.length} / {engine.getWarehouseCapacity()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsShopOpen(false)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    {[
                      { id: 'ALL', label: t('shop_cat_all'), icon: <ShoppingBag size={14} /> },
                      { id: 'RIDE', label: t('shop_cat_rides'), icon: <Ticket size={14} /> },
                      { id: 'FOOD', label: t('shop_cat_food'), icon: <Coffee size={14} /> },
                      { id: 'FACILITY', label: t('shop_cat_facilities'), icon: <Tent size={14} /> },
                      { id: 'INFRASTRUCTURE', label: t('shop_cat_infrastructure'), icon: <Layout size={14} /> }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setShopCategory(cat.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                          ${shopCategory === cat.id 
                            ? 'bg-white text-indigo-600 shadow-lg' 
                            : 'bg-indigo-500/50 text-white hover:bg-indigo-500'}
                        `}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {shopCategory === 'RIDE' && (
                    <div className="flex gap-2">
                      {[
                        { id: 'ALL', label: t('shop_intensity_all') },
                        { id: 'GENTLE', label: t('intensity_gentle') },
                        { id: 'THRILL', label: t('intensity_thrill') },
                        { id: 'EXTREME', label: t('intensity_extreme') }
                      ].map(intensity => (
                        <button
                          key={intensity.id}
                          onClick={() => setShopIntensity(intensity.id as any)}
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                            ${shopIntensity === intensity.id 
                              ? 'bg-white/20 text-white border-white' 
                              : 'bg-transparent text-indigo-200 border-indigo-400/30 hover:text-white hover:border-white/50'}
                            border
                          `}
                        >
                          {intensity.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(Object.keys(RIDE_CONFIGS) as RideType[])
                    .filter(type => {
                      const config = RIDE_CONFIGS[type];
                      const categoryMatch = shopCategory === 'ALL' || config.category === shopCategory;
                      const intensityMatch = shopIntensity === 'ALL' || config.intensity === shopIntensity || config.category !== 'RIDE';
                      return categoryMatch && intensityMatch;
                    })
                    .map(type => {
                      const config = RIDE_CONFIGS[type];
                      const canAfford = gameState.money >= config.cost;
                      const truckAvailable = gameState.trucks.some(t => !t.assignedRideId);
                      const warehouseCapacity = config.category === 'INFRASTRUCTURE' || (gameState.rides.length + gameState.inventory.length < engine.getWarehouseCapacity());

                      return (
                        <div 
                          key={type}
                          className={`group relative flex flex-col rounded-3xl border-2 p-6 transition-all duration-300
                            ${canAfford && truckAvailable && warehouseCapacity
                              ? 'border-white bg-white shadow-sm hover:shadow-xl hover:-translate-y-1' 
                              : 'border-slate-100 bg-slate-50/50 opacity-75'}
                          `}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div 
                              className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-inner relative"
                              style={{ backgroundColor: config.color + '15' }}
                            >
                              {config.icon}
                              {type === 'QUEUE_PATH' && (
                                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">
                                  x20
                                </span>
                              )}
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                              ${canAfford ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                            `}>
                              ${config.cost}
                            </div>
                          </div>

                          <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-900 mb-1">{t(`ride_${config.type}_name`)}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span className="px-2 py-0.5 rounded bg-slate-100">{t(`category_${config.category.toLowerCase()}`)}</span>
                              {config.category === 'RIDE' && (
                                <span className={`px-2 py-0.5 rounded ${
                                  config.intensity === 'GENTLE' ? 'bg-emerald-50 text-emerald-600' :
                                  config.intensity === 'THRILL' ? 'bg-orange-50 text-orange-600' :
                                  'bg-rose-50 text-rose-600'
                                }`}>
                                  {t(`intensity_${config.intensity.toLowerCase()}`)}
                                </span>
                              )}
                              <span>•</span>
                              <span>{config.width}x{config.height} {t('tiles_label')}</span>
                            </div>
                            {!truckAvailable && (
                              <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase tracking-widest">{t('no_trucks_available_message')}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-3">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('income_label')}</p>
                              <p className="text-sm font-black text-indigo-600">${config.baseIncome}</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{t('capacity_label')}</p>
                              <p className="text-sm font-black text-indigo-600">{config.baseCapacity}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (engine.buyRide(type)) {
                                audioService.playSFX('buy');
                                setGameState(engine.getState());
                                setIsShopOpen(false);
                                setActiveTab('inventory');
                                confetti({
                                  particleCount: 150,
                                  spread: 100,
                                  origin: { y: 0.5 }
                                });
                              }
                            }}
                            disabled={!canAfford || !truckAvailable || !warehouseCapacity}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                              ${canAfford && truckAvailable && warehouseCapacity
                                ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                            `}
                          >
                            {!canAfford ? t('insufficient_funds') : !truckAvailable ? t('no_truck_available') : !warehouseCapacity ? t('warehouse_full') : t('purchase_item')}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-slate-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{t('available_balance')}</p>
                    <p className="text-xl font-black text-slate-900">${gameState.money.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-400 italic">
                  {t('select_item_to_add')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
