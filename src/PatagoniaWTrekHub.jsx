```react
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import {
  Mountain,
  Compass,
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  TrendingUp,
  Award,
  Activity,
  Dumbbell,
  Footprints,
  Backpack,
  Trash2,
  Edit3,
  ChevronRight,
  Info,
  Flame,
  Shield,
  Sliders,
  X,
  Check
} from 'lucide-react';

// ============================================================================
// STANDALONE FIREBASE CONFIGURATION (VITE + VERCEL READY)
// ============================================================================
// Set these values in your Vercel Dashboard (Settings -> Environment Variables)
// or in a local `.env` file, OR paste your Firebase Web App keys directly below.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID'
};

// Namespace ID for this expedition's Firestore collections
const EXPEDITION_ID = import.meta.env.VITE_EXPEDITION_ID || 'patagonia-w-trek-2027';

// Detect whether real Firebase credentials have been configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID'
);

// Initialize Firebase only when valid keys are provided
let auth = null;
let db = null;
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('Firebase initialization failed:', err);
  }
}

// ============================================================================
// INITIAL SEED DATA & DOMAIN CONSTANTS
// ============================================================================
const INITIAL_MEMBERS = [
  {
    id: 'david',
    name: 'David',
    gender: 'Male',
    age: 45,
    avatarBg: 'bg-sky-700',
    privacyMode: 'full', // 'full' | 'traffic_light'
    weeklyOverride: null, // null = auto-calculated, or 'green' | 'yellow' | 'red'
    bio: 'Focusing on incline treadmill endurance and weekend bluff climbs.'
  },
  {
    id: 'hirman',
    name: 'Hirman',
    gender: 'Male',
    age: 46,
    avatarBg: 'bg-emerald-700',
    privacyMode: 'full',
    weeklyOverride: null,
    bio: 'Building knee resilience for the Base of the Towers descent.'
  },
  {
    id: 'nora',
    name: 'Nora',
    gender: 'Female',
    age: 43,
    avatarBg: 'bg-teal-700',
    privacyMode: 'full',
    weeklyOverride: null,
    bio: 'Consistency is key—dialing in 15 lb daypack comfort.'
  },
  {
    id: 'meegan',
    name: 'Meegan',
    gender: 'Female',
    age: 47,
    avatarBg: 'bg-indigo-700',
    privacyMode: 'traffic_light',
    weeklyOverride: null,
    bio: 'Preferring simple green/yellow/red accountability check-ins!'
  },
  {
    id: 'q',
    name: 'Q',
    gender: 'Female',
    age: 49,
    avatarBg: 'bg-amber-700',
    privacyMode: 'full',
    weeklyOverride: null,
    bio: 'Targeting Devil’s Lake and Swallow Cliff stair repeats.'
  },
  {
    id: 'colin',
    name: 'Colin',
    gender: 'Male',
    age: 45,
    avatarBg: 'bg-cyan-700',
    privacyMode: 'full',
    weeklyOverride: null,
    bio: 'Dialing in steep treadmill climbs and Palos trail endurance.'
  }
];

const INITIAL_WORKOUTS = [
  {
    id: 'seed-1',
    memberId: 'david',
    date: '2026-11-17',
    type: 'Incline Treadmill',
    title: 'Week 1 Baseline Incline Climb',
    durationMins: 40,
    distanceMiles: 2.3,
    elevationFt: 720,
    packWeightLbs: 10,
    rpe: 6,
    status: 'Yes',
    notes: '8% incline at 3.2 mph. Felt steady with 10 lb pack.'
  },
  {
    id: 'seed-2',
    memberId: 'hirman',
    date: '2026-11-17',
    type: 'Incline Treadmill',
    title: 'Treadmill Hill Walk + Step-Ups',
    durationMins: 45,
    distanceMiles: 2.4,
    elevationFt: 800,
    packWeightLbs: 12,
    rpe: 7,
    status: 'Yes',
    notes: '9% grade + 3 sets of weighted box step-ups afterward.'
  },
  {
    id: 'seed-3',
    memberId: 'nora',
    date: '2026-11-16',
    type: 'Weekend Outdoor Hike',
    title: 'Waterfall Glen Perimeter Loop',
    durationMins: 165,
    distanceMiles: 9.5,
    elevationFt: 420,
    packWeightLbs: 12,
    rpe: 6,
    status: 'Yes',
    notes: 'Crisp Chicago morning! Testing new trail runners and trekking poles.'
  },
  {
    id: 'seed-4',
    memberId: 'meegan',
    date: '2026-11-17',
    type: 'Incline Treadmill',
    title: 'Weekday Gym Incline Session',
    durationMins: 35,
    distanceMiles: 2.0,
    elevationFt: 550,
    packWeightLbs: 8,
    rpe: 6,
    status: 'Yes',
    notes: 'Solid start to Week 1.'
  },
  {
    id: 'seed-5',
    memberId: 'q',
    date: '2026-11-15',
    type: 'Stair / Hill Repeats',
    title: 'Swallow Cliff 8x Stair Repeats',
    durationMins: 55,
    distanceMiles: 2.8,
    elevationFt: 820,
    packWeightLbs: 10,
    rpe: 7,
    status: 'Partial',
    notes: 'Did 8 climbs out of planned 10—calves definitely felt it!'
  },
  {
    id: 'seed-6',
    memberId: 'david',
    date: '2026-11-15',
    type: 'Weekend Outdoor Hike',
    title: 'Indiana Dunes 3 Dune Challenge',
    durationMins: 130,
    distanceMiles: 5.8,
    elevationFt: 650,
    packWeightLbs: 14,
    rpe: 8,
    status: 'Yes',
    notes: 'Steep sand climbs mimic Patagonian moraine scree surprisingly well.'
  },
  {
    id: 'seed-7',
    memberId: 'nora',
    date: '2026-11-17',
    type: 'Strength & Mobility',
    title: 'Patellar Eccentric Squats & Core',
    durationMins: 35,
    distanceMiles: 0,
    elevationFt: 0,
    packWeightLbs: 0,
    rpe: 5,
    status: 'Yes',
    notes: 'Decline squats, calf raises, and planks.'
  },
  {
    id: 'seed-8',
    memberId: 'colin',
    date: '2026-11-17',
    type: 'Incline Treadmill',
    title: 'Morning Incline Interval Climb',
    durationMins: 40,
    distanceMiles: 2.2,
    elevationFt: 680,
    packWeightLbs: 12,
    rpe: 7,
    status: 'Yes',
    notes: '8–10% incline with 12 lb pack before work.'
  },
  {
    id: 'seed-9',
    memberId: 'colin',
    date: '2026-11-15',
    type: 'Weekend Outdoor Hike',
    title: 'Palos Trail Bullfrog Lake Loop',
    durationMins: 125,
    distanceMiles: 6.4,
    elevationFt: 560,
    packWeightLbs: 12,
    rpe: 6,
    status: 'Yes',
    notes: 'Great rolling singletrack to break in hiking boots.'
  }
];

const TRAINING_PHASES = [
  {
    week: 1,
    dates: 'Nov 17 – Nov 22, 2026',
    phase: 'Foundation & Pack Acclimation',
    focus: 'Establish aerobic base on incline treadmill & introduce 8–10 lb daypack.',
    targetMiles: 10,
    targetVert: 1400,
    sessions: [
      { id: 'w1-s1', day: 'Tue', title: 'Gym Incline Walk #1', detail: '35–40 min @ 6–8% incline (2.8–3.2 mph) with 8–10 lb pack.' },
      { id: 'w1-s2', day: 'Thu', title: 'Gym Incline + Legs', detail: '35 min @ 8% incline + 3x12 step-ups, calf raises & planks.' },
      { id: 'w1-s3', day: 'Sat/Sun', title: 'Weekend Outdoor Hike', detail: '5–6 miles on rolling trail (400–600 ft gain) with 10 lb daypack.' }
    ]
  },
  {
    week: 2,
    dates: 'Nov 23 – Nov 29, 2026',
    phase: 'Vertical Volume Build',
    focus: 'Increase treadmill pitch to 10% and introduce stair/bluff repeats.',
    targetMiles: 13,
    targetVert: 2100,
    sessions: [
      { id: 'w2-s1', day: 'Tue', title: 'Gym Incline Walk #1', detail: '45 min @ 8–10% incline with 12 lb daypack.' },
      { id: 'w2-s2', day: 'Thu', title: 'Interval Climbs + Eccentric Quads', detail: '40 min alternating 6% & 11% incline + eccentric decline squats.' },
      { id: 'w2-s3', day: 'Sat/Sun', title: 'Weekend Outdoor Hike / Stairs', detail: '7–8 miles OR Swallow Cliff / Indiana Dunes (700–1,000 ft gain).' }
    ]
  },
  {
    week: 3,
    dates: 'Nov 30 – Dec 6, 2026',
    phase: 'Sustained Grade & Pole Technique',
    focus: 'Simulate long sustained climbs with full 14–15 lb W Trek daypack weight.',
    targetMiles: 16,
    targetVert: 2800,
    sessions: [
      { id: 'w3-s1', day: 'Tue', title: 'Sustained Grade Treadmill', detail: '50 min @ 10–12% incline carrying 14 lb daypack.' },
      { id: 'w3-s2', day: 'Thu', title: 'Gym Climb + Core Stability', detail: '45 min @ 10% incline + weighted lunges, single-leg balance.' },
      { id: 'w3-s3', day: 'Sat/Sun', title: 'Weekend Bluff / Canyon Hike', detail: '8–10 miles (Starved Rock or Mississippi Palisades, 1,000+ ft gain).' }
    ]
  },
  {
    week: 4,
    dates: 'Dec 7 – Dec 13, 2026',
    phase: 'Peak Simulation Week',
    focus: 'Dress rehearsal for Base of the Towers & French Valley (15–16 lb pack).',
    targetMiles: 19,
    targetVert: 3500,
    sessions: [
      { id: 'w4-s1', day: 'Tue', title: 'Peak Incline Endurance', detail: '55–60 min @ 12–14% incline with 15 lb daypack.' },
      { id: 'w4-s2', day: 'Thu', title: 'Steep Descent Prep + Conditioning', detail: '45 min @ 12% incline + eccentric quad/glute durability circuit.' },
      { id: 'w4-s3', day: 'Sat/Sun', title: 'Key Benchmark Long Hike', detail: '10–12 miles + 1,200–1,500 ft climb (Devil’s Lake WI or 15x Swallow Cliff).' }
    ]
  },
  {
    week: 5,
    dates: 'Dec 14 – Dec 23, 2026',
    phase: 'Taper & Final Readiness Lock-In',
    focus: 'Maintain steep incline intensity while trimming volume before Dec 23 cutoff.',
    targetMiles: 12,
    targetVert: 2000,
    sessions: [
      { id: 'w5-s1', day: 'Tue Dec 15', title: 'Crisp Incline Session', detail: '45 min @ 12% incline with 15 lb pack (keep legs fresh).' },
      { id: 'w5-s2', day: 'Sat Dec 19', title: 'Final Group Shakedown Hike', detail: '6–8 mile brisk hike in full Patagonia boots, layers & trekking poles.' },
      { id: 'w5-s3', day: 'Tue Dec 22', title: 'Pre-Holiday Flush & Mobility', detail: '30 min light incline + foam rolling. Formal training ends Dec 23!' }
    ]
  },
  {
    week: 6,
    dates: 'Dec 24 – Dec 26, 2026',
    phase: 'Christmas Break & Departure',
    focus: 'Complete formal training rest, enjoy Christmas, pack gear & fly Dec 25!',
    targetMiles: 0,
    targetVert: 0,
    sessions: [
      { id: 'w6-s1', day: 'Dec 24', title: 'Rest & Gear Check', detail: 'Verify rain shell, broken-in boots, trekking poles & daypack fit.' },
      { id: 'w6-s2', day: 'Dec 25–26', title: 'Fly Chicago → Patagonia', detail: 'Hydrate heavily on flights, compression socks, ankle circles in seat.' }
    ]
  },
  {
    week: 7,
    dates: 'Dec 27, 2026 – Jan 28, 2027',
    phase: 'Patagonia Maintenance & Acclimatization',
    focus: 'Keep legs primed on arrival in Patagonia without over-fatiguing before Jan 29.',
    targetMiles: 10,
    targetVert: 1200,
    sessions: [
      { id: 'w7-s1', day: 'Weekly 2x', title: 'Patellar & Ankle Primer', detail: '20 min eccentric decline squats, calf raises & hip mobility.' },
      { id: 'w7-s2', day: 'Weekly 2x', title: 'Acclimatization Day Walks', detail: '4–6 mile brisk scenic walks with light pack + wind-layer testing.' },
      { id: 'w7-s3', day: 'Jan 26–28', title: 'Pre-Trek Taper & Carb Load', detail: 'Easy 30-min shakeout walk, hydrate, prep refugio daypack for Jan 29!' }
    ]
  }
];

const WEEKEND_DESTINATIONS = [
  {
    id: 'swallow-cliff',
    name: 'Swallow Cliff Stairs (Palos Preserves)',
    location: 'Palos Park, IL',
    driveCategory: '< 1 hr',
    driveTime: '35 mins from Chicago',
    distance: '2.5 – 4.0 mi (10–15 repeats)',
    elevation: '1,000 – 1,500 ft',
    difficulty: 'High Vertical Density',
    wTrekSim: 'Best local simulation for the final 45-min rocky staircase climb to Mirador Las Torres.',
    routeTip: '280 limestone stairs (~100 ft rise per climb). Start with 8 laps in Week 1 and build to 15 laps with a 15 lb pack.'
  },
  {
    id: 'waterfall-glen',
    name: 'Waterfall Glen Forest Preserve',
    location: 'Darien, IL',
    driveCategory: '< 1 hr',
    driveTime: '35 mins from Chicago',
    distance: '9.5 miles (Main Loop)',
    elevation: '420 ft rolling',
    difficulty: 'Endurance / Pacing',
    wTrekSim: 'Ideal for practicing sustained 3+ hour walking pace, footwork, and hydration cadence.',
    routeTip: 'Combine the 9.5-mile crushed limestone loop with Rocky Glen waterfall spur for ~10.5 miles.'
  },
  {
    id: 'palos-trail',
    name: 'Palos Trail System (Bullfrog Lake)',
    location: 'Willow Springs, IL',
    driveCategory: '< 1 hr',
    driveTime: '35 mins from Chicago',
    distance: '6.0 – 9.0 miles',
    elevation: '550 – 750 ft',
    difficulty: 'Rolling Singletrack',
    wTrekSim: 'Uneven roots, dirt descents, and short punchy hills great for ankle stability.',
    routeTip: 'Park at Bullfrog Lake and link Yellow and Orange trails for continuous rolling elevation.'
  },
  {
    id: 'indiana-dunes',
    name: 'Indiana Dunes: 3 Dune Challenge + Trail 9/10',
    location: 'Chesterton, IN',
    driveCategory: '1 – 2 hrs',
    driveTime: '50 mins from Chicago',
    distance: '6.2 miles combined',
    elevation: '780 ft',
    difficulty: 'Steep Sand / Moraine Sim',
    wTrekSim: 'Climbing Mt. Jackson, Mt. Holden, and Mt. Tom in loose sand mimics Patagonian glacial moraine scree.',
    routeTip: 'Do the 1.5-mile 3 Dune Challenge loop twice, then cool down along Trail 9 overlooking Lake Michigan.'
  },
  {
    id: 'starved-rock',
    name: 'Starved Rock & Matthiessen Canyons',
    location: 'Oglesby, IL',
    driveCategory: '1 – 2 hrs',
    driveTime: '1 hr 45 mins from Chicago',
    distance: '8.5 miles',
    elevation: '680 ft',
    difficulty: 'Stairs & Bluff Trails',
    wTrekSim: 'Wooden canyon staircases and slick rock steps build quad resilience for steep descents.',
    routeTip: 'Hike from Visitor Center east to St. Louis, French, Wildcat, and Ottawa Canyons.'
  },
  {
    id: 'kettle-moraine',
    name: 'Kettle Moraine Southern Unit (Ice Age Trail)',
    location: 'Eagle, WI',
    driveCategory: '1 – 2 hrs',
    driveTime: '1 hr 55 mins from Chicago',
    distance: '9.0 – 12.0 miles',
    elevation: '950 ft',
    difficulty: 'Glacial Ridge Hikes',
    wTrekSim: 'True glacial ridges and kettles carved by ice—mirrors Patagonian valley approaches.',
    routeTip: 'Start at Scuppernong Trailhead or Emma Carlin trails for punchy glacial ridge climbs.'
  },
  {
    id: 'mississippi-palisades',
    name: 'Mississippi Palisades State Park',
    location: 'Savanna, IL',
    driveCategory: '2.5 – 4.5 hrs',
    driveTime: '2 hrs 45 mins from Chicago',
    distance: '6.5 miles (Double Loop)',
    elevation: '1,150 ft',
    difficulty: 'Steep River Bluffs',
    wTrekSim: 'Sustained steep bluff climbs overlooking the Mississippi River—great Week 3–4 test.',
    routeTip: 'Link Sentinel, Sunset, and Pine trails, then repeat the South Bluff climb for 1,100+ ft gain.'
  },
  {
    id: 'devils-lake',
    name: "Devil's Lake State Park (East & West Bluffs)",
    location: 'Baraboo, WI',
    driveCategory: '2.5 – 4.5 hrs',
    driveTime: '3 hrs 00 mins from Chicago',
    distance: '8.0 – 10.5 miles',
    elevation: '1,450 ft',
    difficulty: 'Top W Trek Dress Rehearsal',
    wTrekSim: 'Closest terrain match to Base of the Towers! Steep quartzite boulder stairs and exposed bluff ridges.',
    routeTip: 'Climb Balanced Rock Trail up East Bluff, traverse to West Bluff, and add Roznos Meadow for a 10-mile peak test.'
  },
  {
    id: 'wyalusing-pikes-peak',
    name: 'Wyalusing (WI) & Pikes Peak (IA) Twin Bluffs',
    location: 'Bagley, WI / McGregor, IA',
    driveCategory: '2.5 – 4.5 hrs',
    driveTime: '4 hrs 10 mins from Chicago',
    distance: '9.0 miles total',
    elevation: '1,460 ft combined',
    difficulty: 'Back-to-Back Bluff Weekend',
    wTrekSim: 'Great overnight weekend trip to simulate multi-day consecutive W Trek hiking.',
    routeTip: 'Hike Wyalusing’s Bluff & Sentinel Ridge (840 ft) Saturday, then cross the river to Pikes Peak (620 ft) Sunday.'
  }
];

const WTREK_STAGES = [
  {
    day: 'Stage 1',
    name: 'Base of the Towers (Mirador Las Torres)',
    distanceMiles: 12.4,
    elevationFt: 3770,
    estHours: '7.5 – 8.5 hrs',
    terrain: 'Ascencio Valley climb, windy Paso de los Vientos, and steep 45-min granite boulder moraine.',
    keyMetric: 'Hardest climb & descent of the trip. Requires strong quads and 15 lb pack endurance.'
  },
  {
    day: 'Stage 2',
    name: 'Los Cuernos / Nordenskjöld Shore Traverse',
    distanceMiles: 7.5,
    elevationFt: 885,
    estHours: '4.5 – 5.5 hrs',
    terrain: 'Undulating lakeside trail beneath dramatic granite horns; exposed to fierce Patagonian crosswinds.',
    keyMetric: 'Active recovery & wind-stability day. Trekking poles essential.'
  },
  {
    day: 'Stage 3',
    name: 'French Valley & Mirador Británico',
    distanceMiles: 14.9,
    elevationFt: 2690,
    estHours: '8.5 – 9.5 hrs',
    terrain: 'Longest mileage day! Forested river scramble alongside hanging glaciers to 360° granite amphitheater.',
    keyMetric: 'Tests all-day aerobic stamina and foot durability.'
  },
  {
    day: 'Stage 4',
    name: 'Paine Grande to Glacier Grey Lookout',
    distanceMiles: 13.6,
    elevationFt: 1650,
    estHours: '6.5 – 7.5 hrs',
    terrain: 'Rolling rocky ridges overlooking iceberg-filled Lago Grey and Southern Patagonian Ice Field.',
    keyMetric: 'Final endurance push before catamaran/transfer out.'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function calculateDaysUntil(targetDateStr) {
  const now = new Date();
  const target = new Date(targetDateStr + 'T00:00:00');
  const diffMs = target - now;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function getTrafficLightBadge(status) {
  switch (status) {
    case 'green':
      return {
        label: 'Yes • On Track',
        short: 'On Track',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        icon: CheckCircle2
      };
    case 'yellow':
      return {
        label: 'Partial • Catching Up',
        short: 'Partial',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        icon: AlertTriangle
      };
    case 'red':
    default:
      return {
        label: 'No • Needs Push',
        short: 'Needs Push',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
        icon: XCircle
      };
  }
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeMemberId, setActiveMemberId] = useState('david');
  const [dismissedDemoBanner, setDismissedDemoBanner] = useState(false);

  // Persisted State (Firestore when configured, or browser fallback in Demo Mode)
  const [members, setMembers] = useState(() => {
    if (!isFirebaseConfigured && typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(EXPEDITION_ID + '_members');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_MEMBERS;
  });

  const [workouts, setWorkouts] = useState(() => {
    if (!isFirebaseConfigured && typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(EXPEDITION_ID + '_workouts');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_WORKOUTS;
  });

  const [checkedSessions, setCheckedSessions] = useState(() => {
    if (!isFirebaseConfigured && typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('${EXPEDITION_ID}_checklists');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return {};
  });

  const [isSynced, setIsSynced] = useState(!isFirebaseConfigured);

  // UI Modals & Filters
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedProfileMember, setSelectedProfileMember] = useState(null);
  const [driveFilter, setDriveFilter] = useState('All');
  const [logMemberFilter, setLogMemberFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  // Workout Form State
  const [formState, setFormState] = useState({
    memberId: 'david',
    date: new Date().toISOString().split('T')[0],
    type: 'Incline Treadmill',
    title: '',
    durationMins: 45,
    distanceMiles: 2.5,
    elevationFt: 750,
    packWeightLbs: 12,
    rpe: 7,
    status: 'Yes',
    notes: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --------------------------------------------------------------------------
  // 1. FIREBASE AUTHENTICATION (WITH DEMO/LOCAL FALLBACK)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return;

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Anonymous auth error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Persist demo/local state when running without Firebase keys
  useEffect(() => {
    if (isFirebaseConfigured || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(`${EXPEDITION_ID}_members`, JSON.stringify(members));
      window.localStorage.setItem(`${EXPEDITION_ID}_workouts`, JSON.stringify(workouts));
      window.localStorage.setItem(`${EXPEDITION_ID}_checklists`, JSON.stringify(checkedSessions));
    } catch (_) {}
  }, [members, workouts, checkedSessions]);

  // --------------------------------------------------------------------------
  // 2. FIRESTORE REAL-TIME LISTENERS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isFirebaseConfigured || !db || !user) return;

    // Sync Group Members Profiles & Privacy Settings
    const membersCol = collection(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'members');
    const unsubMembers = onSnapshot(
      membersCol,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const m of INITIAL_MEMBERS) {
            await setDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'members', m.id), m);
          }
        } else {
          const loaded = [];
          snapshot.forEach((docSnap) => loaded.push({ id: docSnap.id, ...docSnap.data() }));
          const existingIds = new Set(loaded.map((m) => m.id));
          for (const seedMember of INITIAL_MEMBERS) {
            if (!existingIds.has(seedMember.id)) {
              await setDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'members', seedMember.id), seedMember);
              loaded.push(seedMember);
            }
          }
          const order = ['david', 'hirman', 'nora', 'meegan', 'q', 'colin'];
          loaded.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
          setMembers(loaded);
        }
        setIsSynced(true);
      },
      (err) => console.error('Members snapshot error:', err)
    );

    // Sync Workouts Log
    const workoutsCol = collection(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'workouts');
    const unsubWorkouts = onSnapshot(
      workoutsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          for (const w of INITIAL_WORKOUTS) {
            await setDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'workouts', w.id), w);
          }
        } else {
          const loaded = [];
          snapshot.forEach((docSnap) => loaded.push({ id: docSnap.id, ...docSnap.data() }));
          const hasColinWorkouts = loaded.some((w) => w.memberId === 'colin');
          if (!hasColinWorkouts) {
            const colinSeeds = INITIAL_WORKOUTS.filter((w) => w.memberId === 'colin');
            for (const cw of colinSeeds) {
              await setDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'workouts', cw.id), cw);
              loaded.push(cw);
            }
          }
          loaded.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setWorkouts(loaded);
        }
      },
      (err) => console.error('Workouts snapshot error:', err)
    );

    // Sync Weekly Plan Checklist State
    const checklistCol = collection(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'checklists');
    const unsubChecklists = onSnapshot(
      checklistCol,
      (snapshot) => {
        const map = {};
        snapshot.forEach((docSnap) => {
          map[docSnap.id] = docSnap.data();
        });
        setCheckedSessions(map);
      },
      (err) => console.error('Checklists snapshot error:', err)
    );

    return () => {
      unsubMembers();
      unsubWorkouts();
      unsubChecklists();
    };
  }, [user]);

  // --------------------------------------------------------------------------
  // COMPUTED METRICS & READINESS ENGINE
  // --------------------------------------------------------------------------
  // HANDLERS (WRITE TO FIRESTORE OR DEMO LOCAL STATE)
  // --------------------------------------------------------------------------
  const handleOpenLogModal = (prefill = {}) => {
    setFormState({
      memberId: activeMemberId,
      date: new Date().toISOString().split('T')[0],
      type: prefill.type || 'Incline Treadmill',
      title: prefill.title || '',
      durationMins: prefill.durationMins ?? 45,
      distanceMiles: prefill.distanceMiles ?? 2.5,
      elevationFt: prefill.elevationFt ?? 750,
      packWeightLbs: prefill.packWeightLbs ?? 12,
      rpe: prefill.rpe ?? 7,
      status: 'Yes',
      notes: prefill.notes || ''
    });
    setShowLogModal(true);
  };

  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    const payload = {
      ...formState,
      title: formState.title.trim() || `${formState.type} Session`,
      durationMins: Number(formState.durationMins) || 0,
      distanceMiles: Number(formState.distanceMiles) || 0,
      elevationFt: Number(formState.elevationFt) || 0,
      packWeightLbs: Number(formState.packWeightLbs) || 0,
      rpe: Number(formState.rpe) || 5,
      createdAt: new Date().toISOString()
    };

    if (!isFirebaseConfigured || !db || !user) {
      setWorkouts((prev) => [{ id: `local-${Date.now()}`, ...payload }, ...prev]);
      setShowLogModal(false);
      showToast('Workout saved locally (Demo Mode)!');
      return;
    }

    try {
      const workoutsCol = collection(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'workouts');
      await addDoc(workoutsCol, payload);
      setShowLogModal(false);
      showToast('Workout logged & group readiness updated!');
    } catch (err) {
      console.error('Failed to save workout:', err);
      showToast('Error saving workout. Please try again.');
    }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (!isFirebaseConfigured || !db || !user) {
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      showToast('Workout removed.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'workouts', workoutId));
      showToast('Workout removed.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleUpdateMemberSettings = async (memberId, updates) => {
    const existing = members.find((m) => m.id === memberId);
    if (!existing) return;

    if (!isFirebaseConfigured || !db || !user) {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, ...updates } : m))
      );
      showToast('Profile & privacy preferences updated!');
      return;
    }

    try {
      await setDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'members', memberId), {
        ...existing,
        ...updates
      });
      showToast('Profile & privacy preferences updated!');
    } catch (err) {
      console.error('Member update error:', err);
    }
  };

  const handleCycleSessionCheck = async (sessionId) => {
    const currentMemberChecks = checkedSessions[activeMemberId] || {};
    const currentVal = currentMemberChecks[sessionId] || 'No';
    const nextVal = currentVal === 'No' ? 'Yes' : currentVal === 'Yes' ? 'Partial' : 'No';
    const updatedChecks = { ...currentMemberChecks, [sessionId]: nextVal };

    if (!isFirebaseConfigured || !db || !user) {
      setCheckedSessions((prev) => ({ ...prev, [activeMemberId]: updatedChecks }));
      return;
    }

    try {
      await setDoc(doc(db, 'artifacts', EXPEDITION_ID, 'public', 'data', 'checklists', activeMemberId), updatedChecks);
    } catch (err) {
      console.error('Checklist update error:', err);
    }
  };

  // Countdown Calculations
  const daysToCutoff = calculateDaysUntil('2026-12-23');
  const daysToDeparture = calculateDaysUntil('2026-12-25');
  const daysToTrek = calculateDaysUntil('2027-01-29');

  // Privacy check helper: Can the currently active viewer see full logs of `targetMember`?
  const canViewFullDetails = (targetMember) => {
    if (targetMember.id === activeMemberId) return true; // Always see your own full details
    return targetMember.privacyMode === 'full';
  };

  const filteredDestinations = useMemo(() => {
    if (driveFilter === 'All') return WEEKEND_DESTINATIONS;
    return WEEKEND_DESTINATIONS.filter((d) => d.driveCategory === driveFilter);
  }, [driveFilter]);

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const owner = members.find((m) => m.id === w.memberId);
      if (!owner) return false;
      // Hide detailed workout rows for members who enabled Traffic Light privacy (unless viewing own)
      if (!canViewFullDetails(owner)) return false;
      if (logMemberFilter !== 'all' && w.memberId !== logMemberFilter) return false;
      return true;
    });
  }, [workouts, members, activeMemberId, logMemberFilter]);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* DEMO / LOCAL MODE BANNER WHEN FIREBASE KEYS ARE PLACEHOLDERS */}
      {!isFirebaseConfigured && !dismissedDemoBanner && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 mx-auto">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Demo/Local Mode — add your Firebase keys in <code className="bg-amber-600/20 px-1.5 py-0.5 rounded">.env</code> or Vercel Environment Variables to sync live across everyone&apos;s devices.
            </span>
          </div>
          <button
            onClick={() => setDismissedDemoBanner(true)}
            aria-label="Dismiss banner"
            className="p-1 hover:bg-amber-600/20 rounded-lg cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP EXPEDITION HEADER */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/20 border border-teal-400/30 rounded-xl">
                <Mountain className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                    Patagonia W Trek Readiness Hub
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    Torres del Paine
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Chicago Crew • Refugio Daypack Expedition • Cutoff Dec 23 • Trek Starts Jan 29
                </p>
              </div>
            </div>

            {/* Active User Switcher & Quick Log Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5">
                <span className="text-xs text-slate-400 font-medium">Acting as:</span>
                <select
                  value={activeMemberId}
                  onChange={(e) => setActiveMemberId(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-teal-300 focus:outline-none cursor-pointer"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.name} ({m.age})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  title="Privacy & Status Settings"
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => handleOpenLogModal()}
                className="inline-flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Log Workout</span>
              </button>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <nav className="flex items-center gap-1.5 mt-3.5 pt-2.5 border-t border-slate-700/70 overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', label: 'Group Dashboard', icon: Users },
              { id: 'plan', label: 'Training Plan', icon: Calendar },
              { id: 'log', label: 'Workout Log', icon: Activity },
              { id: 'hikes', label: 'Midwest Hikes', icon: Compass },
              { id: 'benchmarks', label: 'W Trek Stages', icon: Mountain }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* EXPEDITION TIMELINE & COUNTDOWN BANNER */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Formal Training Cutoff
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {daysToCutoff} <span className="text-sm font-medium text-slate-500">days left</span>
              </p>
              <p className="text-xs text-teal-700 font-medium mt-1">Ends Dec 23 • Christmas Break</p>
            </div>
            <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chicago Departure
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {daysToDeparture} <span className="text-sm font-medium text-slate-500">days</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Fly Dec 25 • Arrive Dec 27</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl">
              <Compass className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                W Trek Step-Off
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {daysToTrek} <span className="text-sm font-medium text-slate-500">days</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Jan 29, 2027 • Torres del Paine</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
              <Mountain className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-300">
                Crew Readiness Avg
              </p>
              <p className="text-2xl font-extrabold mt-0.5">
                {groupSummary.avgReadiness}%{' '}
                <span className="text-xs font-normal text-slate-300">
                  ({groupSummary.greenCount}/{members.length} Green)
                </span>
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {groupSummary.totalGroupMiles} mi • {groupSummary.totalGroupVert.toLocaleString()} ft
              </p>
            </div>
            <div className="p-3 bg-teal-500/20 text-teal-300 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* ====================================================================
            TAB 1: GROUP ACCOUNTABILITY & READINESS DASHBOARD
            ==================================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Active User Quick Privacy & Status Control Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${activeMember.avatarBg} text-white font-bold flex items-center justify-center shrink-0`}>
                  {activeMember.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-slate-900">
                      Welcome back, {activeMember.name}!
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {activeMember.privacyMode === 'full'
                        ? 'Sharing Full Log Details'
                        : 'Traffic Light Privacy Mode Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toggle how the crew sees your progress or set your weekly check-in status directly.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    handleUpdateMemberSettings(activeMember.id, {
                      privacyMode: activeMember.privacyMode === 'full' ? 'traffic_light' : 'full'
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                >
                  {activeMember.privacyMode === 'full' ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      <span>Visibility: Full Details</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                      <span>Visibility: Traffic Light Only</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit Profile / Status</span>
                </button>
              </div>
            </div>

            {/* GROUP READINESS MATRIX CARDS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" />
                  <span>Expedition Crew Accountability Board</span>
                </h2>
                <span className="text-xs text-slate-500">
                  Click any member card to inspect logs or check-in status
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => {
                  const st = memberStats[member.id] || {
                    readinessScore: 0,
                    status: 'red',
                    totalMiles: 0,
                    totalVert: 0,
                    completedCount: 0,
                    maxPackWeight: 0
                  };
                  const badge = getTrafficLightBadge(st.status);
                  const BadgeIcon = badge.icon;
                  const showDetails = canViewFullDetails(member);

                  return (
                    <div
                      key={member.id}
                      onClick={() => setSelectedProfileMember(member)}
                      className={`bg-white rounded-2xl p-4 border transition cursor-pointer hover:shadow-md flex flex-col justify-between ${
                        member.id === activeMemberId
                          ? 'border-teal-500 ring-2 ring-teal-500/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Header: Avatar + Name + Privacy Icon */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-10 h-10 rounded-full ${member.avatarBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
                            >
                              {member.name[0]}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 leading-tight flex items-center gap-1">
                                {member.name}
                                {member.id === activeMemberId && (
                                  <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">
                                    You
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {member.gender} • {member.age} yrs
                              </p>
                            </div>
                          </div>

                          <span
                            title={
                              member.privacyMode === 'full'
                                ? 'Full training metrics visible'
                                : 'Traffic light / readiness status only'
                            }
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-500"
                          >
                            {member.privacyMode === 'full' ? (
                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            )}
                          </span>
                        </div>

                        {/* Traffic Light Accountability Badge */}
                        <div className="mt-3.5">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
                          >
                            <BadgeIcon className="w-3.5 h-3.5" />
                            <span>{badge.label}</span>
                          </div>
                        </div>

                        {/* Readiness Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-medium text-slate-600">W Trek Readiness</span>
                            <span className="font-bold text-slate-900">{st.readinessScore}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                st.readinessScore >= 75
                                  ? 'bg-emerald-500'
                                  : st.readinessScore >= 40
                                  ? 'bg-teal-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${st.readinessScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Metrics Section (Respects Privacy Mode) */}
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          {showDetails ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-slate-400 block text-[11px]">Elevation</span>
                                <span className="font-bold text-slate-800">
                                  {st.totalVert.toLocaleString()} ft
                                </span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-slate-400 block text-[11px]">Distance</span>
                                <span className="font-bold text-slate-800">{st.totalMiles} mi</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-slate-400 block text-[11px]">Sessions</span>
                                <span className="font-bold text-slate-800">
                                  {st.completedCount} done
                                </span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-slate-400 block text-[11px]">Max Pack</span>
                                <span className="font-bold text-slate-800">
                                  {st.maxPackWeight} lbs
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                              <Shield className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                              <p className="text-xs font-semibold text-amber-900">
                                Status-Only Privacy Mode
                              </p>
                              <p className="text-[11px] text-amber-700 mt-0.5">
                                {member.name} shares Traffic Light status & Readiness % only.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 flex items-center justify-between text-xs text-teal-700 font-semibold">
                        <span>{showDetails ? 'View workout details' : 'View status summary'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT GROUP ACTIVITY FEED */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>Recent Crew Activity & Check-Ins</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Detailed logs shown for members sharing full details; traffic-light members appear via status badges.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('log')}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  Open Full Log →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {workouts.slice(0, 6).map((w) => {
                  const owner = members.find((m) => m.id === w.memberId);
                  if (!owner) return null;
                  const visible = canViewFullDetails(owner);

                  return (
                    <div key={w.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${owner.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                        >
                          {owner.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{owner.name}</span>
                            <span className="text-xs text-slate-400">• {w.date}</span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                w.status === 'Yes'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : w.status === 'Partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {w.status === 'Yes' ? 'Completed' : w.status}
                            </span>
                          </div>

                          {visible ? (
                            <p className="text-xs text-slate-600 mt-0.5">
                              <span className="font-semibold text-slate-800">{w.title}</span> ({w.type}) —{' '}
                              {w.durationMins} min • {w.distanceMiles} mi • +{w.elevationFt} ft •{' '}
                              {w.packWeightLbs} lb pack
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              Logged a training check-in (detailed metrics hidden by privacy setting).
                            </p>
                          )}
                        </div>
                      </div>

                      {visible && w.notes && (
                        <p className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg max-w-md">
                          “{w.notes}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 2: 5-WEEK PROGRESSIVE TRAINING PLAN + PATAGONIA MAINTENANCE
            ==================================================================== */}
        {activeTab === 'plan' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Nov 17 – Dec 23 Training Roadmap & Patagonia Maintenance
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Tailored for a basic gym baseline building up to a 15 lb daypack on steep Torres del Paine climbs.
                  Click any session checkbox below to update <span className="font-bold text-teal-700">{activeMember.name}’s</span> checklist (cycles No → Yes → Partial).
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> Partial
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                  <XCircle className="w-3.5 h-3.5" /> No
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {TRAINING_PHASES.map((wk) => {
                const isHoliday = wk.week === 6;
                const isMaintenance = wk.week === 7;
                const memberChecks = checkedSessions[activeMemberId] || {};

                return (
                  <div
                    key={wk.week}
                    className={`rounded-2xl border p-5 shadow-sm ${
                      isHoliday
                        ? 'bg-amber-50/50 border-amber-200'
                        : isMaintenance
                        ? 'bg-sky-50/50 border-sky-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                            {wk.week <= 5 ? `Week ${wk.week}` : wk.week === 6 ? 'Holiday & Travel' : 'In Patagonia'}
                          </span>
                          <span className="text-sm font-bold text-teal-800">{wk.dates}</span>
                          <span className="text-sm font-bold text-slate-900">— {wk.phase}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{wk.focus}</p>
                      </div>

                      {wk.targetMiles > 0 && (
                        <div className="flex items-center gap-3 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-xl shrink-0">
                          <span>Target: {wk.targetMiles} mi</span>
                          <span className="text-slate-300">|</span>
                          <span>+{wk.targetVert.toLocaleString()} ft vert</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                      {wk.sessions.map((sess) => {
                        const status = memberChecks[sess.id] || 'No';
                        return (
                          <div
                            key={sess.id}
                            className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                              status === 'Yes'
                                ? 'bg-emerald-50/70 border-emerald-300'
                                : status === 'Partial'
                                ? 'bg-amber-50/70 border-amber-300'
                                : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                                  {sess.day}
                                </span>
                                <button
                                  onClick={() => handleCycleSessionCheck(sess.id)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                    status === 'Yes'
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : status === 'Partial'
                                      ? 'bg-amber-500 text-white border-amber-500'
                                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {status === 'Yes' && <Check className="w-3.5 h-3.5" />}
                                  <span>{status}</span>
                                </button>
                              </div>
                              <h4 className="font-bold text-sm text-slate-900 mt-1.5">{sess.title}</h4>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sess.detail}</p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-end">
                              <button
                                onClick={() =>
                                  handleOpenLogModal({
                                    title: sess.title,
                                    type: sess.title.toLowerCase().includes('hike')
                                      ? 'Weekend Outdoor Hike'
                                      : sess.title.toLowerCase().includes('incline') ||
                                        sess.title.toLowerCase().includes('treadmill')
                                      ? 'Incline Treadmill'
                                      : 'Strength & Mobility',
                                    notes: sess.detail
                                  })
                                }
                                className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                              >
                                + Log detailed metrics
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
          </div>
        )}

        {/* ====================================================================
            TAB 3: WORKOUT LOG (PRIVACY-AWARE)
            ==================================================================== */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Crew Workout Log</h2>
                <p className="text-xs text-slate-500">
                  Showing detailed workouts for crew members with Full Log visibility enabled (plus all of your own logs).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={logMemberFilter}
                  onChange={(e) => setLogMemberFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-700"
                >
                  <option value="all">All Visible Members</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.privacyMode === 'traffic_light' && m.id !== activeMemberId ? '(Private)' : ''}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleOpenLogModal()}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Entry</span>
                </button>
              </div>
            </div>

            {filteredWorkouts.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No detailed logs visible for this filter.</p>
                <p className="text-xs text-slate-500 mt-1">
                  This member may have Traffic Light Privacy Mode enabled, or no workouts logged yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWorkouts.map((w) => {
                  const owner = members.find((m) => m.id === w.memberId) || members[0];
                  return (
                    <div
                      key={w.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-full ${owner.avatarBg} text-white font-bold text-xs flex items-center justify-center`}
                            >
                              {owner.name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{owner.name}</span>
                                <span className="text-xs text-slate-400">{w.date}</span>
                              </div>
                              <span className="text-xs font-semibold text-teal-700">{w.type}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                w.status === 'Yes'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : w.status === 'Partial'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {w.status}
                            </span>
                            {w.memberId === activeMemberId && (
                              <button
                                onClick={() => handleDeleteWorkout(w.id)}
                                title="Delete workout"
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-slate-900 mt-3">{w.title}</h4>

                        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                          <div className="bg-slate-50 rounded-lg p-2">
                            <span className="text-[10px] uppercase text-slate-400 block">Time</span>
                            <span className="text-xs font-bold text-slate-800">{w.durationMins}m</span>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2">
                            <span className="text-[10px] uppercase text-slate-400 block">Dist</span>
                            <span className="text-xs font-bold text-slate-800">{w.distanceMiles} mi</span>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2">
                            <span className="text-[10px] uppercase text-slate-400 block">Climb</span>
                            <span className="text-xs font-bold text-slate-800">+{w.elevationFt} ft</span>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2">
                            <span className="text-[10px] uppercase text-slate-400 block">Pack</span>
                            <span className="text-xs font-bold text-slate-800">{w.packWeightLbs} lb</span>
                          </div>
                        </div>
                      </div>

                      {w.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 mt-3 border border-slate-100">
                          {w.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 4: CHICAGO & MIDWEST WEEKEND HIKE FINDER (WITHIN 4-5 HRS)
            ==================================================================== */}
        {activeTab === 'hikes' && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                  <span>Chicagoland & Midwest Weekend Hike Destinations</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Curated trails within 4.5 hours of Chicago designed to replicate Patagonian stairs, glacial moraines, and river bluffs.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['All', '< 1 hr', '1 – 2 hrs', '2.5 – 4.5 hrs'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDriveFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      driveFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-teal-400 transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {dest.driveTime}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">{dest.location}</span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mt-2.5">{dest.name}</h3>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase">Distance</span>
                        <span className="font-bold text-slate-800">{dest.distance}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-400 block text-[10px] uppercase">Elevation Gain</span>
                        <span className="font-bold text-emerald-700">+{dest.elevation}</span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2.5 text-sky-950">
                        <span className="font-bold block text-sky-800 mb-0.5">
                          Why it preps you for Patagonia:
                        </span>
                        {dest.wTrekSim}
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800">Route Tip: </span>
                        {dest.routeTip}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleOpenLogModal({
                        type: 'Weekend Outdoor Hike',
                        title: dest.name,
                        distanceMiles: parseFloat(dest.distance) || 6.5,
                        elevationFt: parseInt(dest.elevation.replace(/[^0-9]/g, ''), 10) || 800,
                        durationMins: 150,
                        packWeightLbs: 14,
                        notes: `Completed ${dest.name} (${dest.location}).`
                      })
                    }
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>Log This Weekend Hike</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 5: W TREK STAGE BENCHMARKS & READINESS COMPARISON
            ==================================================================== */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Torres del Paine W Trek Stage Benchmarks (Refugio Daypack Itinerary)
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Total W Trek distance: ~48.4 miles (78 km) and ~9,000 ft cumulative climb across 4 core hiking days starting Jan 29, 2027.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {WTREK_STAGES.map((st) => (
                  <div
                    key={st.day}
                    className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-600 text-white">
                          {st.day}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">Est. {st.estHours}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 mt-2">{st.name}</h3>

                      <div className="flex items-center gap-4 mt-2.5 text-xs font-bold">
                        <span className="text-slate-800">{st.distanceMiles} miles</span>
                        <span className="text-emerald-700">+{st.elevationFt.toLocaleString()} ft gain</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{st.terrain}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-700">
                      <span className="font-bold text-slate-900">Coach Note: </span>
                      {st.keyMetric}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CREW PEAK BENCHMARK MATRIX */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Crew Peak Conditioning vs. W Trek Target Thresholds
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Target before Dec 23 cutoff: 10+ mile single hike, 1,200+ ft single-session climb, and 15 lb loaded daypack.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                      <th className="py-2.5 px-3">Member</th>
                      <th className="py-2.5 px-3">Weekly Status</th>
                      <th className="py-2.5 px-3">Readiness</th>
                      <th className="py-2.5 px-3">Longest Hike (Goal: 10 mi)</th>
                      <th className="py-2.5 px-3">Peak Climb (Goal: 1,200 ft)</th>
                      <th className="py-2.5 px-3">Max Pack (Goal: 15 lb)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.map((m) => {
                      const st = memberStats[m.id] || {};
                      const badge = getTrafficLightBadge(st.status);
                      const visible = canViewFullDetails(m);

                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {m.name} ({m.age})
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                            >
                              {badge.short}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-teal-800">{st.readinessScore}%</td>
                          <td className="py-3 px-3">
                            {visible ? (
                              <span className="font-semibold text-slate-800">
                                {st.longestHikeMiles} mi
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Private</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {visible ? (
                              <span className="font-semibold text-slate-800">
                                +{st.biggestSingleClimb} ft
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Private</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {visible ? (
                              <span className="font-semibold text-slate-800">
                                {st.maxPackWeight} lbs
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Private</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================================
          MODAL 1: LOG WORKOUT DRAWER / DIALOG
          ====================================================================== */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-teal-600" />
                <span>Log Training Session</span>
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkout} className="space-y-4 mt-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crew Member</label>
                  <select
                    value={formState.memberId}
                    onChange={(e) => setFormState({ ...formState, memberId: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 font-semibold"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formState.date}
                    onChange={(e) => setFormState({ ...formState, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Workout Type</label>
                  <select
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2"
                  >
                    <option value="Incline Treadmill">Incline Treadmill (Gym)</option>
                    <option value="Weekend Outdoor Hike">Weekend Outdoor Hike</option>
                    <option value="Stair / Hill Repeats">Stair / Hill Repeats</option>
                    <option value="Strength & Mobility">Strength & Knee Mobility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Completion Check-In</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 font-semibold"
                  >
                    <option value="Yes">Yes (Full Session)</option>
                    <option value="Partial">Partial (Modified/Short)</option>
                    <option value="No">No (Missed / Rest)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g., 10% Treadmill Climb or Swallow Cliff 10x"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mins</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.durationMins}
                    onChange={(e) => setFormState({ ...formState, durationMins: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Miles</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formState.distanceMiles}
                    onChange={(e) => setFormState({ ...formState, distanceMiles: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Elev (ft)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.elevationFt}
                    onChange={(e) => setFormState({ ...formState, elevationFt: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pack (lbs)</label>
                  <input
                    type="number"
                    min="0"
                    value={formState.packWeightLbs}
                    onChange={(e) => setFormState({ ...formState, packWeightLbs: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes (Incline %, Gear, Boots, Knee Feel)
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional notes for the crew..."
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-md cursor-pointer"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 2: PRIVACY & PROFILE PREFERENCES FOR ACTIVE MEMBER
          ====================================================================== */}
      {showPrivacyModal && activeMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {activeMember.name}’s Accountability & Privacy Settings
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Group Visibility Preference
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateMemberSettings(activeMember.id, { privacyMode: 'full' })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      activeMember.privacyMode === 'full'
                        ? 'border-teal-600 bg-teal-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-teal-600" /> Full Training Log Details
                      </span>
                      {activeMember.privacyMode === 'full' && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      David, Hirman, Nora, Meegan, Q, and Colin can view your exact mileage, elevation gain, pack weight, and notes.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateMemberSettings(activeMember.id, { privacyMode: 'traffic_light' })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      activeMember.privacyMode === 'traffic_light'
                        ? 'border-amber-600 bg-amber-50/70'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <EyeOff className="w-4 h-4 text-amber-600" /> Traffic Light / Status Only
                      </span>
                      {activeMember.privacyMode === 'traffic_light' && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Others only see your Red/Yellow/Green status badge, Yes/Partial/No weekly check-in, and Readiness %—hiding exact workout numbers.
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Manual Weekly Traffic Light Override
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: null, label: 'Auto' },
                    { val: 'green', label: 'Green (Yes)' },
                    { val: 'yellow', label: 'Yellow (Partial)' },
                    { val: 'red', label: 'Red (No)' }
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() =>
                        handleUpdateMemberSettings(activeMember.id, { weeklyOverride: opt.val })
                      }
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border cursor-pointer ${
                        activeMember.weeklyOverride === opt.val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={activeMember.age}
                  onChange={(e) =>
                    handleUpdateMemberSettings(activeMember.id, {
                      age: Number(e.target.value) || activeMember.age
                    })
                  }
                  className="w-28 border border-slate-300 rounded-xl px-3 py-1.5"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MODAL 3: MEMBER DETAIL INSPECTOR MODAL
          ====================================================================== */}
      {selectedProfileMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            {(() => {
              const m = members.find((x) => x.id === selectedProfileMember.id) || selectedProfileMember;
              const st = memberStats[m.id] || {};
              const badge = getTrafficLightBadge(st.status);
              const visible = canViewFullDetails(m);

              return (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full ${m.avatarBg} text-white font-bold text-lg flex items-center justify-center`}
                      >
                        {m.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {m.name} ({m.gender}, {m.age})
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${badge.bg}`}
                        >
                          {badge.label} • {st.readinessScore}% Ready
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProfileMember(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 italic">“{m.bio}”</p>

                  {visible ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] uppercase text-slate-400 block">Total Miles</span>
                          <span className="font-bold text-sm text-slate-900">{st.totalMiles} mi</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] uppercase text-slate-400 block">Total Climb</span>
                          <span className="font-bold text-sm text-emerald-700">
                            +{st.totalVert?.toLocaleString()} ft
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl">
                          <span className="text-[10px] uppercase text-slate-400 block">Max Pack</span>
                          <span className="font-bold text-sm text-slate-900">{st.maxPackWeight} lbs</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
                        Logged Workouts ({st.workouts?.length || 0})
                      </h4>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {(st.workouts || []).map((w) => (
                          <div key={w.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{w.title}</span>
                              <span className="text-teal-700">{w.date}</span>
                            </div>
                            <p className="text-slate-600 mt-0.5">
                              {w.type} • {w.durationMins}m • {w.distanceMiles} mi • +{w.elevationFt} ft • {w.packWeightLbs} lb pack
                            </p>
                            {w.notes && <p className="text-slate-500 mt-1">“{w.notes}”</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                      <Shield className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <h4 className="font-bold text-sm text-amber-950">
                        Traffic Light Privacy Enabled
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        {m.name} has chosen to share only their overall Readiness Score ({st.readinessScore}%) and Red/Yellow/Green accountability status with the group.
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button
                      onClick={() => setSelectedProfileMember(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
```
