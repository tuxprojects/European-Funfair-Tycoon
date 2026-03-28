import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './gameEngine';
import { RIDE_CONFIGS, RideType, RideIntensity, GRID_SIZE, STAFF_CONFIGS, StaffType, RideCategory, CITIES } from './types';
import { 
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
  CreditCard,
  UserPlus,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  Zap,
  Home,
  CheckCircle,
  ArrowRight,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';

import { audioService } from './audioService';

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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine] = useState(() => new GameEngine(GameEngine.getSaveData()));
  const [gameState, setGameState] = useState(() => engine.update());
  const [isSetupOpen, setIsSetupOpen] = useState(!GameEngine.hasSave());
  const [setupName, setSetupName] = useState('');
  const [setupCity, setSetupCity] = useState('london');
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
  const [activeManagementTab, setActiveManagementTab] = useState<'settings' | 'travel' | 'staff' | 'budget' | 'warehouse' | 'pricing'>('settings');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [camera, setCamera] = useState({ x: 100, y: -400, zoom: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  const renderRef = useRef<() => void>(() => {});

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
    } else if (gameState.tutorialStep === 1 && gameState.staff.some(s => s.type === 'OPERATOR')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 2 && !gameState.settings.isManuallyClosed) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 3 && gameState.money >= 2500) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 4 && gameState.rides.some(r => RIDE_CONFIGS[r.type].category === 'FOOD')) {
      engine.advanceTutorial();
      advanced = true;
    } else if (gameState.tutorialStep === 5 && gameState.visitors.length >= 50) {
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
    
    // Draw Rides
    gameState.rides.forEach(ride => {
      const config = RIDE_CONFIGS[ride.type];
      const px = ride.x * GRID_SIZE;
      const py = ride.y * GRID_SIZE;
      const width = config.width * GRID_SIZE;
      const height = config.height * GRID_SIZE;
      const centerX = px + width / 2;
      const centerY = py + height / 2;

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
        
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = config.color;
        ctx.fillRect(px, py, width, height);
        ctx.globalAlpha = 1.0;
      }
    }

    // Draw Visitors
    gameState.visitors.forEach(v => {
      const bob = Math.abs(Math.sin(time * 10 + parseInt(v.id, 36))) * 3;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(v.x, v.y + 2, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = v.color;
      ctx.beginPath();
      ctx.arc(v.x, v.y - bob, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Happiness bar
      const barWidth = 12;
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(v.x - barWidth / 2, v.y - 12 - bob, barWidth, 3);
      ctx.fillStyle = v.happiness > 50 ? '#10b981' : v.happiness > 20 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(v.x - barWidth / 2, v.y - 12 - bob, barWidth * (v.happiness / 100), 3);

      // Need indicators
      if (v.hunger > 70 || v.bladder > 70 || v.stamina < 30) {
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        let needIcon = '';
        if (v.hunger > 70) needIcon = '🌭';
        else if (v.bladder > 70) needIcon = '🚻';
        else if (v.stamina < 30) needIcon = '😴';
        
        if (needIcon) {
          ctx.fillText(needIcon, v.x, v.y - 20 - bob);
        }
      }

      // State indicators
      if (v.state === 'EATING') {
        ctx.font = '10px Arial';
        ctx.fillText('😋', v.x + 8, v.y - bob);
      } else if (v.state === 'RESTING') {
        ctx.font = '10px Arial';
        ctx.fillText('💤', v.x + 8, v.y - bob);
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
      const success = engine.placeRide(placingRideId, hoveredCell.x, hoveredCell.y);
      if (success) {
        audioService.playSFX('place');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setPlacingRideId(null);
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

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    const newZoom = Math.min(Math.max(camera.zoom - e.deltaY * zoomSpeed, 0.2), 2);
    setCamera(prev => ({ ...prev, zoom: newZoom }));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
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
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {gameState.cities.map(city => (
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
                          <p className="text-sm font-bold leading-tight">{city.name}</p>
                          <p className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{city.country}</p>
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
                Launch Company
              </button>

              {GameEngine.hasSave() && (
                <button 
                  onClick={() => setIsSetupOpen(false)}
                  className="mt-4 w-full text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  Continue Existing Game
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
              className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between bg-slate-50 p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                    <Settings size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Park Management</h2>
                    <div className="flex gap-4 mt-1">
                      <button 
                        onClick={() => setActiveManagementTab('settings')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'settings' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Settings
                      </button>
                      <button 
                        onClick={() => setActiveManagementTab('staff')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'staff' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Staff ({gameState.staff.length})
                      </button>
                      <button 
                        onClick={() => setActiveManagementTab('budget')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'budget' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Budget
                      </button>
                      <button 
                        onClick={() => setActiveManagementTab('pricing')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'pricing' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Pricing
                      </button>
                      <button 
                        onClick={() => setActiveManagementTab('travel')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'travel' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Travel
                      </button>
                      <button 
                        onClick={() => setActiveManagementTab('warehouse')}
                        className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeManagementTab === 'warehouse' ? 'text-indigo-600 underline underline-offset-4' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Warehouse
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsManagementOpen(false)}
                  className="rounded-full p-2 hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                {activeManagementTab === 'budget' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Income Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <ArrowUpRight size={18} />
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Income (Today)</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Ride Tickets</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.tickets}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Wristbands</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.wristbands}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Season Passes</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.seasonPasses}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Ticket Bundles</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.bundles}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Food & Drinks</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.food}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">Other</span>
                            <span className="text-sm font-black text-emerald-600">+${gameState.finances.income.other}</span>
                          </div>
                          <div className="pt-4 border-top border-slate-50 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900">Total Income</span>
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
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Expenses (Today)</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Briefcase size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">Staff Wages</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.wages}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Zap size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">Electricity</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.electricity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Home size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">Area Rent</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.rent}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Settings size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-500">Maintenance</span>
                            </div>
                            <span className="text-sm font-black text-rose-600">-${gameState.finances.expenses.maintenance}</span>
                          </div>
                          <div className="pt-4 border-top border-slate-50 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900">Total Expenses</span>
                            <span className="text-lg font-black text-rose-600">
                              -${gameState.finances.expenses.wages + gameState.finances.expenses.electricity + gameState.finances.expenses.rent + gameState.finances.expenses.maintenance + gameState.finances.expenses.other}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Profit Summary */}
                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Daily Net Profit</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">
                            {(gameState.finances.income.tickets + gameState.finances.income.wristbands + gameState.finances.income.seasonPasses + gameState.finances.income.bundles + gameState.finances.income.food + gameState.finances.income.other) - (gameState.finances.expenses.wages + gameState.finances.expenses.electricity + gameState.finances.expenses.rent + gameState.finances.expenses.maintenance + gameState.finances.expenses.other) >= 0 ? '+' : ''}
                            ${(gameState.finances.income.tickets + gameState.finances.income.wristbands + gameState.finances.income.seasonPasses + gameState.finances.income.bundles + gameState.finances.income.food + gameState.finances.income.other) - (gameState.finances.expenses.wages + gameState.finances.expenses.electricity + gameState.finances.expenses.rent + gameState.finances.expenses.maintenance + gameState.finances.expenses.other)}
                          </span>
                          <span className="text-sm font-bold opacity-70">today</span>
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Visitor Insights</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Visitors</p>
                          <p className="text-2xl font-black text-slate-900">{gameState.finances.visitorStats.totalVisitors}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Happiness</p>
                          <p className="text-2xl font-black text-emerald-600">{Math.floor(gameState.finances.visitorStats.avgHappiness)}%</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Spend</p>
                          <p className="text-2xl font-black text-indigo-600">${Math.floor(gameState.finances.visitorStats.avgSpend)}</p>
                        </div>
                      </div>
                    </section>

                    {/* Daily History */}
                    {gameState.dailyHistory.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp size={18} className="text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recent Performance</h3>
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
                                    <span className="text-xs font-bold text-slate-700">Day {gameState.time.day - (idx + 1)}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                      {(() => {
                                        const hDay = gameState.time.day - (idx + 1);
                                        if (hDay <= 0) return 'PRE-OPENING';
                                        const hMonth = Math.floor(((hDay - 1) % 120) / 10) + 1;
                                        const hDayOfMonth = ((hDay - 1) % 10) + 1;
                                        return `${MONTH_NAMES[hMonth - 1]} ${hDayOfMonth}`;
                                      })()}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-sm font-black ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {net >= 0 ? '+' : ''}${net}
                                  </p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase">Net Profit</p>
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Park Operations</h3>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                        {!engine.canParkOpen().canOpen && (
                          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle size={14} />
                            <span>{engine.canParkOpen().reason}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-900">Manual Override</p>
                            <p className="text-[10px] text-slate-500">Force the park to open or close regardless of schedule.</p>
                          </div>
                          {(() => {
                            const canOpen = engine.canParkOpen();
                            const isActuallyOpen = !gameState.settings.isManuallyClosed && canOpen.canOpen;
                            return (
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                ${isActuallyOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                              `}>
                                <div className={`h-2 w-2 rounded-full ${isActuallyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                {isActuallyOpen ? 'Park is Open' : 'Park is Closed'}
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
                            Open Park
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
                            Close Park
                          </button>
                        </div>

                        {(() => {
                          const canOpen = engine.canParkOpen();
                          if (!canOpen.canOpen && !gameState.settings.isManuallyClosed) {
                            return (
                              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700 leading-tight">
                                  {canOpen.reason}
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Company Identity</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                          <input 
                            type="text" 
                            value={gameState.company.name}
                            onChange={(e) => {
                              engine.updateCompanyName(e.target.value);
                              setGameState(engine.getState());
                            }}
                            className="w-full mt-1 rounded-xl border-slate-200 bg-slate-50 p-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Enter company name..."
                          />
                        </div>
                      </div>
                    </section>

                    {/* Audio Settings */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Zap size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Audio Settings</h3>
                      </div>
                      <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Music Volume</label>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Sound Effects</label>
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
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Operating Hours</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Open Time</label>
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
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Close Time</label>
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
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Visitor Demand</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">{Math.floor(engine.getVisitorDemandMultiplier() * 100)}%</span>
                          <span className="text-sm font-bold opacity-70">of potential</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 mt-2 uppercase tracking-widest">
                          Higher prices reduce visitor spawn rate
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
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Standard Entry</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Single Ride Ticket</label>
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
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ride Bundle ({gameState.settings.pricing.bundleSize} rides)</label>
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
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Premium Passes</h3>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">All-Day Wristband</label>
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
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Season Pass</label>
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
                          <h4 className="text-xs font-black uppercase tracking-widest text-amber-900 mb-1">Pricing Strategy Tip</h4>
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
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 mb-1">Warehouse Capacity</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">{gameState.rides.length + gameState.inventory.length} / {engine.getWarehouseCapacity()}</span>
                          <span className="text-sm font-bold opacity-70">Attractions</span>
                        </div>
                        <p className="text-[10px] font-bold opacity-60 mt-2 uppercase tracking-widest">
                          Home City: {CITIES.find(c => c.id === gameState.company.homeCityId)?.name || 'Not Set'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Warehouse Level</p>
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
                          Upgrade (${engine.getWarehouseUpgradeCost()})
                        </button>
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <ShoppingBag size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Stored Attractions</h3>
                      </div>
                      {gameState.inventory.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                          <div className="mx-auto w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                            <ShoppingBag size={24} />
                          </div>
                          <p className="text-sm font-bold text-slate-500">Your warehouse is empty.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {gameState.inventory.map(ride => {
                            const config = RIDE_CONFIGS[ride.type];
                            return (
                              <div key={ride.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                                  {config.icon}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-black text-slate-900">{config.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Condition: {ride.condition}%</p>
                                </div>
                                <button
                                  onClick={() => {
                                    setPlacingRideId(ride.id);
                                    setIsManagementOpen(false);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                >
                                  Place
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
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Staff</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">{gameState.staff.length}</span>
                          <span className="text-[10px] font-bold text-slate-400">Employees</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg. Happiness</p>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-black ${
                            gameState.staff.length === 0 ? 'text-slate-300' :
                            (gameState.staff.reduce((acc, s) => acc + s.happiness, 0) / gameState.staff.length) > 70 ? 'text-emerald-600' :
                            (gameState.staff.reduce((acc, s) => acc + s.happiness, 0) / gameState.staff.length) > 40 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {gameState.staff.length === 0 ? '0' : Math.floor(gameState.staff.reduce((acc, s) => acc + s.happiness, 0) / gameState.staff.length)}%
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">Morale</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Hourly Payroll</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">${gameState.staff.reduce((acc, s) => acc + s.salary, 0)}</span>
                          <span className="text-[10px] font-bold text-slate-400">per hour</span>
                        </div>
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={18} className="text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Recruitment Center</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(Object.keys(STAFF_CONFIGS) as StaffType[]).map(type => {
                          const config = STAFF_CONFIGS[type];
                          return (
                            <button
                              key={type}
                              onClick={() => {
                                engine.hireStaff(type);
                                setGameState(engine.getState());
                              }}
                              className="group relative flex flex-col gap-3 p-5 rounded-3xl border border-slate-100 bg-white hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
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
                                  <p className="text-[8px] font-bold text-slate-400 uppercase">Base Salary</p>
                                </div>
                              </div>
                              <div className="relative z-10">
                                <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">{config.name}</h4>
                                <p className="text-[10px] text-slate-500 leading-relaxed mt-1 line-clamp-2">{config.description}</p>
                              </div>
                              <div className="mt-2 pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Hire Staff</span>
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
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Your Team</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Total Hourly Wage: ${gameState.staff.reduce((acc, s) => acc + s.salary, 0)}
                        </span>
                      </div>

                      {gameState.staff.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No staff members currently hired</p>
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
                                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{config.name}s ({staffInCategory.length})</h4>
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
                                                  LVL {staff.level}
                                                </span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                                  staff.state === 'WORKING' ? 'bg-emerald-100 text-emerald-700' :
                                                  staff.state === 'RESTING' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-slate-100 text-slate-700'
                                                }`}>
                                                  {staff.state}
                                                </span>
                                                {isUnhappy && (
                                                  <span className="animate-pulse text-[8px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-widest">
                                                    Risk of Quitting
                                                  </span>
                                                )}
                                              </div>
                                              {staff.assignedRideId && (
                                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">
                                                  Assigned: {RIDE_CONFIGS[gameState.rides.find(r => r.id === staff.assignedRideId)?.type || 'TEA_CUPS'].name}
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
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Stamina</p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                              <div className={`flex items-center gap-1 ${happinessColor}`}>
                                                <HappinessIcon size={14} />
                                                <span className="text-[10px] font-black">{Math.floor(staff.happiness)}%</span>
                                              </div>
                                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Happiness</p>
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
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hourly Salary</label>
                                                {salaryRatio < 1 && (
                                                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">(Underpaid)</span>
                                                )}
                                                {salaryRatio >= 1.2 && (
                                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">(Well Paid)</span>
                                                )}
                                              </div>
                                              <span className="text-[9px] font-bold text-slate-400">Min: ${Math.ceil(minSalary)}</span>
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
                                            {staff.level >= 5 ? 'Max Level' : `Train ($${trainingCost})`}
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

                {activeManagementTab === 'travel' && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Plane size={18} className="text-indigo-600" />
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Travel to New Cities</h3>
                    </div>
                    <div className="grid gap-4">
                      {gameState.cities.map(city => {
                        const isCurrent = city.id === gameState.company.currentCityId;
                        const canAfford = gameState.money >= city.travelCost;
                        
                        return (
                          <div 
                            key={city.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all
                              ${isCurrent ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}
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
                                    x{city.visitorMultiplier} Visitors
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase">
                                    Travel: ${engine.getTravelCost(city.id)}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    Size: {city.mapWidth}x{city.mapHeight}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                                    Terrain: {city.terrain}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {!isCurrent && (
                              <button
                                disabled={gameState.money < engine.getTravelCost(city.id) || gameState.rides.length > 0 || (gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')}
                                onClick={() => {
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
                                  ? 'Dismantle First' 
                                  : (gameState.cities.find(c => c.id === gameState.company.currentCityId)?.country === 'UK' && city.country !== 'UK')
                                    ? 'Island Locked'
                                    : 'Travel'}
                              </button>
                            )}
                            {isCurrent && (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Current Location</span>
                                {city.id === gameState.company.homeCityId && (
                                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                    <Home size={10} /> Home City
                                  </span>
                                )}
                              </div>
                            )}
                            {!isCurrent && city.id === gameState.company.homeCityId && (
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                                <Home size={10} /> Home City
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      engine.saveGame();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    <Save size={16} />
                    Save Game
                  </button>
                  <button 
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-200 transition-all"
                  >
                    <Trash2 size={16} />
                    Reset Game
                  </button>
                </div>
                <button 
                  onClick={() => setIsManagementOpen(false)}
                  className="px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all"
                >
                  Close Management
                </button>
              </div>
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
              <h3 className="text-2xl font-black text-slate-900 mb-2">Reset Game?</h3>
              <p className="text-slate-500 font-medium mb-8">This will permanently delete your current company and all progress. This action cannot be undone.</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    GameEngine.clearSave();
                    window.location.reload();
                  }}
                  className="flex-1 rounded-2xl py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="z-10 w-80 border-r border-slate-200 bg-white p-6 shadow-xl flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight truncate max-w-[140px]">{gameState.company.name}</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <Globe size={10} className="text-indigo-500" />
                <span>{gameState.cities.find(c => c.id === gameState.company.currentCityId)?.name}</span>
                <span>•</span>
                <span className="text-indigo-600 font-black">
                  {MONTH_NAMES[gameState.time.month - 1]} {gameState.time.dayOfMonth}, {DAY_NAMES[gameState.time.dayOfWeek]} {gameState.time.hours.toString().padStart(2, '0')}:{gameState.time.minutes.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${getWeatherColor(gameState.currentWeather.type)}`}>
                  {getWeatherIcon(gameState.currentWeather.type)}
                  <span>{gameState.currentWeather.type}</span>
                  <span>•</span>
                  <span>{gameState.currentWeather.temperature}°C</span>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  {gameState.time.season}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                engine.togglePause();
                setGameState(engine.getState());
                audioService.playSFX('click');
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all
                ${gameState.settings.isPaused 
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'}
              `}
              title={gameState.settings.isPaused ? "Resume Game" : "Pause Game"}
            >
              {gameState.settings.isPaused ? <Play size={20} fill="currentColor" /> : <Square size={20} fill="currentColor" />}
            </button>
            <button 
              onClick={() => setIsManagementOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-all"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <button 
            onClick={() => setIsShopOpen(true)}
            className="w-full group relative flex items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <ShoppingBag size={20} />
            OPEN RIDE SHOP
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
                ${activeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
              `}
            >
              Inventory ({gameState.inventory.length})
            </button>
          </div>

          <AnimatePresence mode="wait">
            {selectedRideId ? (
              <motion.section
                key="selected-ride"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border-2 border-indigo-600 bg-indigo-50/50 p-4"
              >
                {(() => {
                  const ride = gameState.rides.find(r => r.id === selectedRideId);
                  if (!ride) return null;
                  const config = RIDE_CONFIGS[ride.type];
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="font-bold">{config.name}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Level {ride.level}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Condition</p>
                            <p className={`text-sm font-black ${ride.condition > 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {Math.floor(ride.condition)}%
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Status</p>
                            <p className={`text-sm font-black ${ride.isStaffResting ? 'text-violet-600' : 'text-indigo-600'}`}>
                              {ride.isStaffResting ? `STAFF RESTING (${ride.status})` : ride.status}
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Wait Time</p>
                            <p className="text-sm font-black text-slate-900">{ride.avgWaitTime}m</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Ticket Price</p>
                            <p className="text-sm font-black text-indigo-600">
                              {config.category === 'RIDE' ? `$${gameState.settings.pricing.ticketPrice}` : `$${ride.price}`}
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Satisfaction</p>
                            <p className={`text-sm font-black ${ride.satisfaction > 70 ? 'text-emerald-600' : ride.satisfaction > 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {ride.satisfaction}%
                            </p>
                          </div>
                        </div>

                        {/* Operator Assignment */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Operator</p>
                            {ride.operatorId ? (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">Assigned</span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-600 uppercase">Missing</span>
                            )}
                          </div>
                          <select 
                            value={ride.operatorId || ''}
                            onChange={(e) => {
                              const staffId = e.target.value || null;
                              if (engine.assignOperator(ride.id, staffId)) {
                                setGameState(engine.getState());
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Auto-Assign</option>
                            {gameState.staff
                              .filter(s => s.type === 'OPERATOR')
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  Operator {s.id.slice(0, 4)} {s.assignedRideId && s.assignedRideId !== ride.id ? '(Busy)' : ''}
                                </option>
                              ))}
                          </select>
                          
                          {!ride.operatorId && (
                            <button
                              onClick={() => {
                                if (engine.hireRideOperator(ride.id)) {
                                  setGameState(engine.getState());
                                }
                              }}
                              className="w-full mt-2 py-2 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                              <UserPlus size={14} />
                              Hire Operator
                            </button>
                          )}
                        </div>

                        {/* Mechanic Assignment */}
                        <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Mechanic</p>
                            {ride.mechanicId ? (
                              <span className="text-[10px] font-bold text-emerald-600 uppercase">Assigned</span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Auto-Assigning</span>
                            )}
                          </div>
                          <select 
                            value={ride.mechanicId || ''}
                            onChange={(e) => {
                              const staffId = e.target.value || null;
                              if (engine.assignMechanic(ride.id, staffId)) {
                                setGameState(engine.getState());
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Auto-Assign</option>
                            {gameState.staff
                              .filter(s => s.type === 'MECHANIC')
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  Mechanic {s.id.slice(0, 4)} {s.assignedRideId && s.assignedRideId !== ride.id ? '(Busy)' : ''}
                                </option>
                              ))}
                          </select>
                          
                          {!ride.mechanicId && (
                            <button
                              onClick={() => {
                                if (engine.hireRideMechanic(ride.id)) {
                                  setGameState(engine.getState());
                                }
                              }}
                              className="w-full mt-2 py-2 rounded-lg bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                              <UserPlus size={14} />
                              Hire Mechanic
                            </button>
                          )}
                        </div>

                        {ride.status !== 'OPERATIONAL' && (
                          <button 
                            onClick={() => {
                              if (engine.repairRide(ride.id)) {
                                setGameState(engine.getState());
                              }
                            }}
                            className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-black text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                          >
                            <Settings size={14} />
                            Repair (${Math.floor((100 - ride.condition) * 5)})
                          </button>
                        )}

                        {config.category !== 'RIDE' && (
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              {config.category === 'FOOD' ? 'Item Price' : 'Service Price'}
                            </label>
                            <div className="flex items-center gap-3 mt-1">
                              <input 
                                type="range" 
                                min="1" 
                                max={config.baseIncome * 3} 
                                value={ride.price}
                                onChange={(e) => {
                                  ride.price = parseInt(e.target.value);
                                  setGameState(engine.getState());
                                }}
                                className="flex-1 accent-indigo-600"
                              />
                              <span className="font-bold text-indigo-900">${ride.price}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 mt-1 italic">
                              {ride.price > config.baseIncome * 1.5 ? "Visitors might think this is too expensive!" : "A fair price for everyone."}
                            </p>
                          </div>
                        )}
                        
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
                            Dismantle
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
                            Sell
                          </button>
                        </div>
                        <button 
                          onClick={() => setSelectedRideId(null)}
                          className="w-full rounded-xl bg-white border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Deselect
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.section>
            ) : selectedVisitorId ? (
              <motion.section
                key="selected-visitor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border-2 border-blue-600 bg-blue-50/50 p-4"
              >
                {(() => {
                  const visitor = gameState.visitors.find(v => v.id === selectedVisitorId);
                  if (!visitor) return null;
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm" style={{ color: visitor.color }}>
                          👤
                        </div>
                        <div>
                          <h3 className="font-bold">Visitor {visitor.id.slice(0, 4)}</h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{visitor.state}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Happiness</p>
                            <p className={`text-sm font-black ${visitor.happiness > 70 ? 'text-emerald-600' : visitor.happiness > 30 ? 'text-amber-600' : 'text-rose-600'}`}>
                              {Math.floor(visitor.happiness)}%
                            </p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Money</p>
                            <p className="text-sm font-black text-blue-600">${Math.floor(visitor.money)}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Needs</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>Hunger</span>
                              <span>{Math.floor(visitor.hunger)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-400" style={{ width: `${visitor.hunger}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>Bladder</span>
                              <span>{Math.floor(visitor.bladder)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400" style={{ width: `${visitor.bladder}%` }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>Stamina</span>
                              <span>{Math.floor(visitor.stamina)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400" style={{ width: `${visitor.stamina}%` }} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent Thoughts</p>
                          <div className="space-y-2">
                            {visitor.thoughts.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic">No thoughts yet...</p>
                            ) : (
                              visitor.thoughts.map((thought, i) => (
                                <div key={i} className="bg-white p-2 rounded-lg border border-slate-100 text-[10px] font-medium text-slate-600 flex gap-2">
                                  <span className="text-blue-400">💭</span>
                                  {thought}
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => setSelectedVisitorId(null)}
                          className="w-full rounded-xl bg-white border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Deselect
                        </button>
                      </div>
                    </>
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
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Inventory</h2>
                  <div className="flex gap-1">
                    {['ALL', 'GENTLE', 'THRILL', 'EXTREME'].map(intensity => (
                      <button
                        key={intensity}
                        onClick={() => setInventoryIntensity(intensity as any)}
                        className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter transition-all
                          ${inventoryIntensity === intensity 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
                        `}
                      >
                        {intensity === 'ALL' ? 'All' : intensity[0]}
                      </button>
                    ))}
                  </div>
                </div>
                {gameState.inventory.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase">Inventory Empty</p>
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
                          <div
                            key={ride.id}
                            className={`flex items-center gap-4 rounded-xl border p-3 transition-all duration-200
                              ${isPlacing ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}
                            `}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xl">
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate">{config.name}</p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-[9px] text-slate-400 uppercase">{config.width}x{config.height}</p>
                                {config.category === 'RIDE' && (
                                  <span className={`text-[8px] font-bold px-1 rounded ${
                                    config.intensity === 'GENTLE' ? 'bg-emerald-50 text-emerald-600' :
                                    config.intensity === 'THRILL' ? 'bg-orange-50 text-orange-600' :
                                    'bg-rose-50 text-rose-600'
                                  }`}>
                                    {config.intensity[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (engine.sellInventoryRide(ride.id)) {
                                    audioService.playSFX('sell');
                                    setGameState(engine.getState());
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all"
                              >
                                Sell
                              </button>
                              <button
                                onClick={() => setPlacingRideId(isPlacing ? null : ride.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                  ${isPlacing ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}
                                `}
                              >
                                {isPlacing ? 'Cancel' : 'Place'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    {gameState.inventory.filter(ride => {
                      const config = RIDE_CONFIGS[ride.type];
                      return inventoryIntensity === 'ALL' || config.intensity === inventoryIntensity;
                    }).length === 0 && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">No {inventoryIntensity.toLowerCase()} items</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          <section className="rounded-2xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest opacity-60">Park Stats</h2>
              <Info size={14} className="opacity-40" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium opacity-80">Visitors</span>
                </div>
                <span className="text-lg font-bold">{gameState.visitors.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-indigo-400" />
                  <span className="text-sm font-medium opacity-80">Warehouse</span>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Balance</p>
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
              <span className="text-sm font-medium">Click on the grid to place your <span className="text-indigo-400 font-bold">{RIDE_CONFIGS[gameState.inventory.find(r => r.id === placingRideId)?.type || 'TEA_CUPS'].name}</span></span>
              <button 
                onClick={() => setPlacingRideId(null)}
                className="ml-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {gameState.showTutorial && gameState.tutorialStep < 6 && (
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
                  animate={{ width: `${(gameState.tutorialStep / 6) * 100}%` }}
                />
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  {gameState.tutorialStep === 0 && <MapIcon size={24} />}
                  {gameState.tutorialStep === 1 && <UserPlus size={24} />}
                  {gameState.tutorialStep === 2 && <Play size={24} />}
                  {gameState.tutorialStep === 3 && <DollarSign size={24} />}
                  {gameState.tutorialStep === 4 && <Coffee size={24} />}
                  {gameState.tutorialStep === 5 && <Users size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Tutorial Step {gameState.tutorialStep + 1}/6</h3>
                    <button 
                      onClick={() => {
                        engine.skipTutorial();
                        setGameState(engine.getState());
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    {gameState.tutorialStep === 0 && "Place your first ride"}
                    {gameState.tutorialStep === 1 && "Hire a Ride Operator"}
                    {gameState.tutorialStep === 2 && "Open the Park"}
                    {gameState.tutorialStep === 3 && "Earn your first $500"}
                    {gameState.tutorialStep === 4 && "Build a Food Stall"}
                    {gameState.tutorialStep === 5 && "Reach 50 Visitors"}
                  </h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {gameState.tutorialStep === 0 && "Open your inventory and place the Tea Cups ride near the entrance."}
                    {gameState.tutorialStep === 1 && "Click on your Tea Cups ride and hire an operator to start running it."}
                    {gameState.tutorialStep === 2 && "Open the Management Panel and toggle the Park Status to Open."}
                    {gameState.tutorialStep === 3 && "Watch the visitors arrive and earn money until your balance reaches $2,500."}
                    {gameState.tutorialStep === 4 && "Visitors get hungry! Place a Hot Dog Stall from your inventory."}
                    {gameState.tutorialStep === 5 && "Keep your park attractive and wait until you have 50 visitors at once."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map(s => (
                    <div 
                      key={s}
                      className={`h-1 w-3 rounded-full transition-all ${s <= gameState.tutorialStep ? 'bg-indigo-600' : 'bg-slate-100'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {gameState.showTutorial && gameState.tutorialStep === 6 && (
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
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Tutorial Complete</h3>
                  <h4 className="text-lg font-black leading-tight">You're ready to go!</h4>
                </div>
              </div>
              <p className="text-xs opacity-90 leading-relaxed mb-6">
                You've mastered the basics. Now expand your park, travel to new cities, and become a Funfair Tycoon!
              </p>
              <button 
                onClick={() => {
                  engine.skipTutorial();
                  setGameState(engine.getState());
                }}
                className="w-full py-3 rounded-xl bg-white text-emerald-600 text-xs font-black uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-all"
              >
                Start Managing
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
                      <h2 className="text-3xl font-black tracking-tight">Ride Shop</h2>
                      <p className="text-indigo-100 text-sm font-medium">
                        Warehouse: {gameState.rides.length + gameState.inventory.length} / {engine.getWarehouseCapacity()}
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
                      { id: 'ALL', label: 'All Items', icon: <ShoppingBag size={14} /> },
                      { id: 'RIDE', label: 'Rides', icon: <Ticket size={14} /> },
                      { id: 'FOOD', label: 'Food & Drink', icon: <Coffee size={14} /> },
                      { id: 'FACILITY', label: 'Facilities', icon: <Tent size={14} /> }
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
                        { id: 'ALL', label: 'All Intensities' },
                        { id: 'GENTLE', label: 'Gentle' },
                        { id: 'THRILL', label: 'Thrill' },
                        { id: 'EXTREME', label: 'Extreme' }
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

                      return (
                        <div 
                          key={type}
                          className={`group relative flex flex-col rounded-3xl border-2 p-6 transition-all duration-300
                            ${canAfford 
                              ? 'border-white bg-white shadow-sm hover:shadow-xl hover:-translate-y-1' 
                              : 'border-slate-100 bg-slate-50/50 opacity-75'}
                          `}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div 
                              className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-inner"
                              style={{ backgroundColor: config.color + '15' }}
                            >
                              {config.icon}
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                              ${canAfford ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}
                            `}>
                              ${config.cost}
                            </div>
                          </div>

                          <div className="mb-6">
                            <h3 className="text-lg font-black text-slate-900 mb-1">{config.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span className="px-2 py-0.5 rounded bg-slate-100">{config.category}</span>
                              {config.category === 'RIDE' && (
                                <span className={`px-2 py-0.5 rounded ${
                                  config.intensity === 'GENTLE' ? 'bg-emerald-50 text-emerald-600' :
                                  config.intensity === 'THRILL' ? 'bg-orange-50 text-orange-600' :
                                  'bg-rose-50 text-rose-600'
                                }`}>
                                  {config.intensity}
                                </span>
                              )}
                              <span>•</span>
                              <span>{config.width}x{config.height} Tiles</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 rounded-2xl p-3">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Income</p>
                              <p className="text-sm font-black text-indigo-600">${config.baseIncome}</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-3">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Capacity</p>
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
                            disabled={!canAfford || (gameState.rides.length + gameState.inventory.length >= engine.getWarehouseCapacity())}
                            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all
                              ${canAfford && (gameState.rides.length + gameState.inventory.length < engine.getWarehouseCapacity())
                                ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-200' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                            `}
                          >
                            {!canAfford ? 'Insufficient Funds' : (gameState.rides.length + gameState.inventory.length >= engine.getWarehouseCapacity()) ? 'Warehouse Full' : 'Purchase Item'}
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Available Balance</p>
                    <p className="text-xl font-black text-slate-900">${gameState.money.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-400 italic">
                  Select an item to add it to your inventory
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
