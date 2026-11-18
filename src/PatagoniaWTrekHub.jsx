import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  Mountain,
  Users,
  Plus,
  CheckCircle2,
  Circle,
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  MapPin,
  Dumbbell,
  Footprints,
  Trash2,
  Shield,
  Flame,
  X,
} from 'lucide-react';

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (err) {
    console.error('Firebase init failed:', err);
  }
}

const EXPEDITION_ID = 'patagonia_w_trek_jan_2027';

// --- Roster & Training Blueprint ---
const INITIAL_MEMBERS = [
  {
    id: 'david',
    name: 'David',
    age: 45,
    role: 'Expedition Lead',
    avatarColor: 'bg-teal-600',
    privateMode: false,
    targetMiles: 110,
    targetVertFt: 24000,
    targetSessions: 24,
  },
  {
    id: 'hirman',
    name: 'Hirman',
    age: 46,
    role: 'Trail Navigator',
    avatarColor: 'bg-emerald-600',
    privateMode: false,
    targetMiles: 110,
    targetVertFt: 24000,
    targetSessions: 24,
  },
  {
    id: 'nora',
    name: 'Nora',
    age: 4,
    role: 'Junior Explorer',
    avatarColor: 'bg-amber-500',
    privateMode: false,
    targetMiles: 25,
    targetVertFt: 3500,
    targetSessions: 14,
  },
  {
    id: 'meegan',
    name: 'Meegan',
    age: 47,
    role: 'Summit Pacer',
    avatarColor: 'bg-indigo-600',
    privateMode: false,
    targetMiles: 110,
    targetVertFt: 24000,
    targetSessions: 24,
  },
  {
    id: 'q',
    name: 'Q',
    age: 49,
    role: 'Gear & Logistics',
    avatarColor: 'bg-cyan-700',
    privateMode: false,
    targetMiles: 110,
    targetVertFt: 24000,
    targetSessions: 24,
  },
  {
    id: 'colin',
    name: 'Colin',
    age: 45,
    role: 'Endurance Captain',
    avatarColor: 'bg-slate-700',
    privateMode: false,
    targetMiles: 110,
    targetVertFt: 24000,
    targetSessions: 24,
  },
];

const TRAINING_PHASES = [
  {
    id: 'phase1',
    title: 'Phase 1: Base & Pack Adaptation',
    dates: 'Now – Dec 4',
    focus: 'Build aerobic engine and introduce 12–18 lb daypack on inclines.',
    sessions: [
      {
        id: 'p1_s1',
        label: 'Treadmill Incline Climb: 45 min @ 10–12% grade (15 lb pack)',
        tag: 'Gym',
      },
      {
        id: 'p1_s2',
        label: 'Midwest Trail Hike: Waterfall Glen or Palos Preserves (6–8 mi)',
        tag: 'Outdoor',
      },
      {
        id: 'p1_s3',
        label: 'StairMaster / Step-Ups: 35 min steady cadence + single-leg strength',
        tag: 'Gym',
      },
      {
        id: 'p1_s4',
        label: 'Family Trail Walk with Nora: 2.5–3 mi uneven terrain + fun snack breaks',
        tag: 'Family',
      },
    ],
  },
  {
    id: 'phase2',
    title: 'Phase 2: Peak Vert & Back-to-Back Days',
    dates: 'Dec 5 – Dec 17',
    focus: 'Simulate consecutive W Trek days (Base Las Torres & French Valley).',
    sessions: [
      {
        id: 'p2_s1',
        label: 'Treadmill Max Grade Simulation: 60 min @ 12–15% grade (20 lb pack)',
        tag: 'Gym',
      },
      {
        id: 'p2_s2',
        label: 'Weekend Destination Hike: Starved Rock, Kettle Moraine, or Devil’s Lake (9–11 mi)',
        tag: 'Outdoor',
      },
      {
        id: 'p2_s3',
        label: 'Back-to-Back Day 2: 60 min brisk incline walk on tired legs',
        tag: 'Gym',
      },
      {
        id: 'p2_s4',
        label: 'Downhill Eccentric Conditioning: 40 min decline/step-down focus (knee armor)',
        tag: 'Gym',
      },
    ],
  },
  {
    id: 'phase3',
    title: 'Phase 3: Taper & Departure Prep',
    dates: 'Dec 18 – Dec 23',
    focus: 'Reduce volume by 40%, break in boots completely, zero injuries before Dec 25 flight.',
    sessions: [
      {
        id: 'p3_s1',
        label: 'Shakeout Hike: 4 mi in exact Patagonia boots, socks, and trekking poles',
        tag: 'Outdoor',
      },
      {
        id: 'p3_s2',
        label: 'Light Treadmill Flush: 30 min @ 6–8% grade, easy conversational pace',
        tag: 'Gym',
      },
      {
        id: 'p3_s3',
        label: 'Full Pack Shakedown & Layer Test (wind shell, rain cover, water filter)',
        tag: 'Gear',
      },
    ],
  },
];

const MIDWEST_TRAIL_IDEAS = [
  {
    name: 'Swallow Cliff Stairs & Palos Trail System (Willow Springs, IL)',
    drive: '35 min from Chicago',
    stats: '290 limestone stairs + rolling singletrack (up to 1,200 ft gain)',
  },
  {
    name: 'Waterfall Glen Forest Preserve Loop (Darien, IL)',
    drive: '35 min from Chicago',
    stats: '9.5-mile crushed limestone loop with steady rolling hills',
  },
  {
    name: 'Starved Rock & Matthiessen State Park (Oglesby, IL)',
    drive: '1 hr 40 min from Chicago',
    stats: 'Canyon staircases & bluff climbs — best boot-break-in terrain nearby',
  },
  {
    name: 'Kettle Moraine State Forest – Southern Unit (Eagle, WI)',
    drive: '1 hr 45 min from Chicago',
    stats: 'Glacial moraine ridges on the Ice Age Trail (1,500+ ft elevation gain)',
  },
  {
    name: 'Devil’s Lake State Park – East & West Bluffs (Baraboo, WI)',
    drive: '3 hrs from Chicago',
    stats: '500-ft quartzite talus climbs — closest feel to Mirador Base Las Torres',
  },
];

const SEED_WORKOUTS = [
  {
    id: 'seed_1',
    memberId: 'david',
    type: 'Treadmill Incline',
    title: '12% Grade Pack Climb',
    date: '2026-11-14',
    durationMins: 50,
    distanceMiles: 3.1,
    elevationFt: 1960,
    packWeightLbs: 18,
    notes: '12% incline steady @ 3.7 mph. Calves felt strong.',
    isPrivate: false,
  },
  {
    id: 'seed_2',
    memberId: 'hirman',
    type: 'Outdoor Hike',
    title: 'Waterfall Glen Full Loop',
    date: '2026-11-15',
    durationMins: 155,
    distanceMiles: 9.5,
    elevationFt: 820,
    packWeightLbs: 15,
    notes: 'Crisp morning pace, tested new waterproof trail boots.',
    isPrivate: false,
  },
  {
    id: 'seed_3',
    memberId: 'nora',
    type: 'Family Trail Walk',
    title: 'Lakefront & Ridge Trail Adventure',
    date: '2026-11-15',
    durationMins: 65,
    distanceMiles: 2.6,
    elevationFt: 240,
    packWeightLbs: 2,
    notes: 'Carried her own mini backpack with snacks and binoculars!',
    isPrivate: false,
  },
];

// --- Helper Functions ---
function getDaysUntil(targetDateStr) {
  const now = new Date();
  const target = new Date(targetDateStr + 'T00:00:00');
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function calculateReadiness(member, memberWorkouts) {
  const totalMiles = memberWorkouts.reduce(
    (sum, w) => sum + (Number(w.distanceMiles) || 0),
    0
  );
  const totalVert = memberWorkouts.reduce(
    (sum, w) => sum + (Number(w.elevationFt) || 0),
    0
  );
  const sessionCount = memberWorkouts.length;

  const milePct = Math.min(100, (totalMiles / (member.targetMiles || 100)) * 100);
  const vertPct = Math.min(100, (totalVert / (member.targetVertFt || 20000)) * 100);
  const sessPct = Math.min(100, (sessionCount / (member.targetSessions || 20)) * 100);

  const score = Math.round(milePct * 0.4 + vertPct * 0.4 + sessPct * 0.2);
  return {
    score: Math.min(100, score),
    totalMiles: Math.round(totalMiles * 10) / 10,
    totalVert: Math.round(totalVert),
    sessionCount,
  };
}

export default function PatagoniaWTrekHub() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMemberId, setSelectedMemberId] = useState('david');
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [workouts, setWorkouts] = useState(SEED_WORKOUTS);
  const [checkedSessions, setCheckedSessions] = useState({});
  const [isSynced, setIsSynced] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showTrailGuide, setShowTrailGuide] = useState(false);

  // Workout form state
  const [formState, setFormState] = useState({
    memberId: 'david',
    type: 'Treadmill Incline',
    title: '',
    date: new Date().toISOString().split('T')[0],
    durationMins: '45',
    distanceMiles: '3.0',
    elevationFt: '1500',
    packWeightLbs: '15',
    notes: '',
    isPrivate: false,
  });

  // --- Firebase Auth & Real-Time Listeners ---
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      try {
        const savedMembers = window.localStorage.getItem(EXPEDITION_ID + '_members');
        const savedWorkouts = window.localStorage.getItem(EXPEDITION_ID + '_workouts');
        const savedChecks = window.localStorage.getItem(EXPEDITION_ID + '_checklists');
        if (savedMembers) setMembers(JSON.parse(savedMembers));
        if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));
        if (savedChecks) setCheckedSessions(JSON.parse(savedChecks));
      } catch (_) {}
      return;
    }

    let unsubMembers = () => {};
    let unsubWorkouts = () => {};
    let unsubChecklists = () => {};

    signInAnonymously(auth).catch((err) =>
      console.error('Anonymous sign-in error:', err)
    );

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      setIsSynced(true);

      const baseRef = doc(db, 'expeditions', EXPEDITION_ID);

      unsubMembers = onSnapshot(collection(baseRef, 'members'), (snap) => {
        if (snap.empty) {
          INITIAL_MEMBERS.forEach((m) => {
            setDoc(doc(baseRef, 'members', m.id), m, { merge: true }).catch(() => {});
          });
        } else {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          const order = INITIAL_MEMBERS.map((m) => m.id);
          loaded.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
          setMembers(loaded);
        }
      });

      unsubWorkouts = onSnapshot(collection(baseRef, 'workouts'), (snap) => {
        if (snap.empty) {
          SEED_WORKOUTS.forEach((w) => {
            setDoc(doc(baseRef, 'workouts', w.id), w, { merge: true }).catch(() => {});
          });
        } else {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          loaded.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
          setWorkouts(loaded);
        }
      });

      unsubChecklists = onSnapshot(collection(baseRef, 'checklists'), (snap) => {
        const map = {};
        snap.docs.forEach((d) => {
          map[d.id] = d.data().completed || {};
        });
        setCheckedSessions(map);
      });
    });

    return () => {
      unsubAuth();
      unsubMembers();
      unsubWorkouts();
      unsubChecklists();
    };
  }, []);

  // Local fallback persistence when running without Firebase env vars
  useEffect(() => {
    if (isFirebaseConfigured || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(EXPEDITION_ID + '_members', JSON.stringify(members));
      window.localStorage.setItem(EXPEDITION_ID + '_workouts', JSON.stringify(workouts));
      window.localStorage.setItem(EXPEDITION_ID + '_checklists', JSON.stringify(checkedSessions));
    } catch (_) {}
  }, [members, workouts, checkedSessions]);

  const activeMember = useMemo(
    () => members.find((m) => m.id === selectedMemberId) || members[0],
    [members, selectedMemberId]
  );

  // --- Handlers ---
  const handleOpenLogModal = (memberIdOverride) => {
    const targetId = memberIdOverride || selectedMemberId;
    const memberObj = members.find((m) => m.id === targetId);
    setFormState((prev) => ({
      ...prev,
      memberId: targetId,
      type: targetId === 'nora' ? 'Family Trail Walk' : 'Treadmill Incline',
      packWeightLbs: targetId === 'nora' ? '2' : '15',
      isPrivate: Boolean(memberObj && memberObj.privateMode),
    }));
    setShowLogModal(true);
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    const payload = {
      ...formState,
      title: formState.title.trim() || formState.type + ' Session',
      durationMins: Number(formState.durationMins) || 0,
      distanceMiles: Number(formState.distanceMiles) || 0,
      elevationFt: Number(formState.elevationFt) || 0,
      packWeightLbs: Number(formState.packWeightLbs) || 0,
    };

    if (isFirebaseConfigured && db) {
      try {
        const baseRef = doc(db, 'expeditions', EXPEDITION_ID);
        await addDoc(collection(baseRef, 'workouts'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to add workout:', err);
      }
    } else {
      setWorkouts((prev) => [
        { id: 'local_' + Date.now(), ...payload },
        ...prev,
      ]);
    }

    setFormState((prev) => ({ ...prev, title: '', notes: '' }));
    setShowLogModal(false);
  };

  const handleDeleteWorkout = async (workoutId) => {
    if (isFirebaseConfigured && db) {
      try {
        const baseRef = doc(db, 'expeditions', EXPEDITION_ID);
        await deleteDoc(doc(baseRef, 'workouts', workoutId));
      } catch (err) {
        console.error('Failed to delete workout:', err);
      }
    } else {
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
    }
  };

  const handleToggleMemberPrivacy = async (member) => {
    const nextPrivate = !member.privateMode;
    if (isFirebaseConfigured && db) {
      try {
        const baseRef = doc(db, 'expeditions', EXPEDITION_ID);
        await updateDoc(doc(baseRef, 'members', member.id), {
          privateMode: nextPrivate,
        });
      } catch (err) {
        console.error('Privacy update error:', err);
      }
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, privateMode: nextPrivate } : m
        )
      );
    }
  };

  const handleToggleChecklistSession = async (memberId, sessionId) => {
    const currentMemberChecks = checkedSessions[memberId] || {};
    const nextVal = !currentMemberChecks[sessionId];
    const updated = { ...currentMemberChecks, [sessionId]: nextVal };

    if (isFirebaseConfigured && db) {
      try {
        const baseRef = doc(db, 'expeditions', EXPEDITION_ID);
        await setDoc(
          doc(baseRef, 'checklists', memberId),
          { completed: updated },
          { merge: true }
        );
      } catch (err) {
        console.error('Checklist update error:', err);
      }
    } else {
      setCheckedSessions((prev) => ({
        ...prev,
        [memberId]: updated,
      }));
    }
  };

  // --- Computed Metrics ---
  const daysToTrainingEnd = getDaysUntil('2026-12-23');
  const daysToDeparture = getDaysUntil('2026-12-25');
  const daysToTrekStart = getDaysUntil('2027-01-29');

  const groupTotals = useMemo(() => {
    const publicWorkouts = workouts.filter((w) => {
      const owner = members.find((m) => m.id === w.memberId);
      return !w.isPrivate && !(owner && owner.privateMode);
    });
    return {
      miles:
        Math.round(
          publicWorkouts.reduce((s, w) => s + (Number(w.distanceMiles) || 0), 0) *
            10
        ) / 10,
      vert: Math.round(
        publicWorkouts.reduce((s, w) => s + (Number(w.elevationFt) || 0), 0)
      ),
      sessions: publicWorkouts.length,
    };
  }, [workouts, members]);

  const visibleFeedWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      if (w.memberId === selectedMemberId) return true;
      const owner = members.find((m) => m.id === w.memberId);
      if (owner && owner.privateMode) return false;
      if (w.isPrivate) return false;
      return true;
    });
  }, [workouts, members, selectedMemberId]);

  const activeMemberWorkouts = useMemo(
    () => workouts.filter((w) => w.memberId === activeMember.id),
    [workouts, activeMember]
  );

  const activeMemberStats = useMemo(
    () => calculateReadiness(activeMember, activeMemberWorkouts),
    [activeMember, activeMemberWorkouts]
  );
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Expedition Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-sm">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight">
                  Patagonia W Trek Readiness
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  <span
                    className={
                      'w-1.5 h-1.5 rounded-full ' +
                      (isSynced ? 'bg-emerald-400' : 'bg-amber-400')
                    }
                  />
                  {isSynced ? 'Live Group Sync' : 'Local Demo Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Training Ends Dec 23 • Depart Dec 25 • W Trek Starts Jan 29
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenLogModal()}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-sm font-semibold px-3.5 py-2 rounded-xl shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout</span>
            </button>
          </div>
        </div>

        {/* Countdown Strip */}
        <div className="bg-slate-800/80 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 py-2 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block sm:inline">
                Training Window:{' '}
              </span>
              <span className="font-bold text-amber-300">
                {daysToTrainingEnd}d left
              </span>
            </div>
            <div className="border-x border-slate-700">
              <span className="text-slate-400 block sm:inline">
                Patagonia Flight:{' '}
              </span>
              <span className="font-bold text-teal-300">
                {daysToDeparture}d away
              </span>
            </div>
            <div>
              <span className="text-slate-400 block sm:inline">
                W Trek Step-Off:{' '}
              </span>
              <span className="font-bold text-emerald-300">
                {daysToTrekStart}d away
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Active Profile Switcher Bar */}
        <section className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Viewing & Logging As:
            </span>
            <button
              onClick={() => handleToggleMemberPrivacy(activeMember)}
              className={
                'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ' +
                (activeMember.privateMode
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100')
              }
            >
              {activeMember.privateMode ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{activeMember.name}’s Stats: Private to Group</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{activeMember.name}’s Stats: Shared with Group</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {members.map((m) => {
              const isSelected = m.id === selectedMemberId;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={
                    'flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ' +
                    (isSelected
                      ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white')
                  }
                >
                  <div
                    className={
                      'w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 ' +
                      m.avatarColor
                    }
                  >
                    {m.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                      <span>{m.name}</span>
                      {m.privateMode && (
                        <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500">Age {m.age}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="grid grid-cols-3 gap-2 bg-slate-200/70 p-1 rounded-xl">
          {[
            { id: 'dashboard', label: 'Group Readiness', icon: Users },
            { id: 'plan', label: 'Training Plan', icon: Calendar },
            { id: 'logs', label: 'Workout Feed', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={
                  'flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ' +
                  (active
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900')
                }
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: GROUP READINESS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Group Summary Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <Footprints className="w-3.5 h-3.5 text-teal-600" />
                  <span>Shared Miles</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {groupTotals.miles}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    mi
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Shared Vert</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {groupTotals.vert.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ft
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sessions Logged</span>
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {groupTotals.sessions}
                </div>
              </div>
            </div>

            {/* 6-Member Expedition Roster Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const mWorkouts = workouts.filter(
                  (w) => w.memberId === member.id
                );
                const stats = calculateReadiness(member, mWorkouts);
                const isPrivateToViewer =
                  member.privateMode && member.id !== selectedMemberId;

                return (
                  <div
                    key={member.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={
                              'w-10 h-10 rounded-full text-white font-bold flex items-center justify-center ' +
                              member.avatarColor
                            }
                          >
                            {member.name.slice(0, 1)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{member.name}</span>
                              <span className="text-xs font-normal text-slate-400">
                                ({member.age})
                              </span>
                            </h3>
                            <p className="text-xs text-slate-500">
                              {member.role}
                            </p>
                          </div>
                        </div>

                        {isPrivateToViewer ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        ) : (
                          <span className="text-sm font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                            {stats.score}%
                          </span>
                        )}
                      </div>

                      {isPrivateToViewer ? (
                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center my-2">
                          <Shield className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-500">
                            {member.name} has enabled Private Training Mode.
                            Switch profile above if this is you.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Progress Bar */}
                          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full bg-teal-600 rounded-full transition-all duration-500"
                              style={{ width: stats.score + '%' }}
                            />
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-2.5 mb-3">
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {stats.totalMiles} / {member.targetMiles}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Miles
                              </div>
                            </div>
                            <div className="border-x border-slate-200">
                              <div className="text-xs font-bold text-slate-900">
                                {stats.totalVert.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Vert (ft)
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {stats.sessionCount} / {member.targetSessions}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                Sessions
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenLogModal(member.id)}
                      className="w-full py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition cursor-pointer"
                    >
                      + Log for {member.name}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Midwest Weekend Hike Inspiration Drawer */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Chicago / Midwest Weekend Training Hikes
                  </h3>
                </div>
                <button
                  onClick={() => setShowTrailGuide(!showTrailGuide)}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  {showTrailGuide ? 'Hide Trails' : 'View 5 Trail Ideas'}
                </button>
              </div>

              {showTrailGuide && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MIDWEST_TRAIL_IDEAS.map((trail, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="font-semibold text-xs text-slate-900">
                        {trail.name}
                      </div>
                      <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                        {trail.drive}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        {trail.stats}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PHASED TRAINING PLAN & CHECKLIST */}
        {activeTab === 'plan' && (
          <div className="space-y-4">
            <div className="bg-teal-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-base">
                  {activeMember.name}’s W Trek Blueprint Checklist
                </h2>
                <p className="text-xs text-teal-200 mt-0.5">
                  Check off milestone workouts as you complete them. All
                  sessions wrap by Dec 23 before your Dec 25 departure.
                </p>
              </div>
              <div className="text-xs bg-teal-800 px-3 py-2 rounded-xl shrink-0">
                Current Readiness:{' '}
                <span className="font-bold text-emerald-300">
                  {activeMemberStats.score}%
                </span>
              </div>
            </div>

            {TRAINING_PHASES.map((phase) => {
              const memberChecks = checkedSessions[activeMember.id] || {};
              return (
                <div
                  key={phase.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {phase.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {phase.focus}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {phase.dates}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {phase.sessions.map((sess) => {
                      const done = Boolean(memberChecks[sess.id]);
                      return (
                        <button
                          key={sess.id}
                          onClick={() =>
                            handleToggleChecklistSession(
                              activeMember.id,
                              sess.id
                            )
                          }
                          className={
                            'w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition cursor-pointer ' +
                            (done
                              ? 'bg-emerald-50/70 border-emerald-200 text-slate-600'
                              : 'bg-white border-slate-200 hover:border-teal-300')
                          }
                        >
                          <div className="flex items-center gap-2.5">
                            {done ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                            )}
                            <span
                              className={
                                'text-xs sm:text-sm font-medium ' +
                                (done ? 'line-through text-slate-400' : '')
                              }
                            >
                              {sess.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                            {sess.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: WORKOUT ACTIVITY FEED */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-700">
                Expedition Workout Log ({visibleFeedWorkouts.length})
              </h2>
              <button
                onClick={() => handleOpenLogModal()}
                className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                + Add Entry
              </button>
            </div>

            {visibleFeedWorkouts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  No workouts logged yet.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tap “Log Workout” at the top to record your first incline or
                  trail session.
                </p>
              </div>
            ) : (
              visibleFeedWorkouts.map((w) => {
                const owner =
                  members.find((m) => m.id === w.memberId) || members[0];
                const canDelete = w.memberId === selectedMemberId;

                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={
                          'w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ' +
                          owner.avatarColor
                        }
                      >
                        {owner.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">
                            {owner.name}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-teal-700">
                            {w.title}
                          </span>
                          {(w.isPrivate || owner.privateMode) && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              <Lock className="w-2.5 h-2.5" />
                              Private
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1.5">
                          <span>{w.date}</span>
                          <span>•</span>
                          <span className="font-medium">
                            {w.distanceMiles} mi
                          </span>
                          <span>•</span>
                          <span className="font-medium">
                            +{w.elevationFt} ft
                          </span>
                          <span>•</span>
                          <span>{w.durationMins} min</span>
                          {Number(w.packWeightLbs) > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-slate-500">
                                {w.packWeightLbs} lb pack
                              </span>
                            </>
                          )}
                        </div>

                        {w.notes && (
                          <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            {w.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDeleteWorkout(w.id)}
                        title="Delete workout"
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Log Workout Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-4 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Log Training Session</h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorkout} className="p-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hiker
                  </label>
                  <select
                    value={formState.memberId}
                    onChange={(e) =>
                      setFormState({ ...formState, memberId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.age})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session Type
                  </label>
                  <select
                    value={formState.type}
                    onChange={(e) =>
                      setFormState({ ...formState, type: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="Treadmill Incline">Treadmill Incline</option>
                    <option value="Outdoor Hike">Outdoor Hike</option>
                    <option value="StairMaster / Steps">
                      StairMaster / Steps
                    </option>
                    <option value="Strength & Core">Strength & Core</option>
                    <option value="Family Trail Walk">Family Trail Walk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 12% Incline Climb"
                    value={formState.title}
                    onChange={(e) =>
                      setFormState({ ...formState, title: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formState.date}
                    onChange={(e) =>
                      setFormState({ ...formState, date: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Miles
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formState.distanceMiles}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        distanceMiles: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Vert (ft)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={formState.elevationFt}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        elevationFt: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.durationMins}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        durationMins: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Pack (lb)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formState.packWeightLbs}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        packWeightLbs: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Incline %, Trail, Boots, How Legs Felt)
                </label>
                <input
                  type="text"
                  placeholder="Optional notes..."
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState({ ...formState, notes: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.isPrivate}
                  onChange={(e) =>
                    setFormState({ ...formState, isPrivate: e.target.checked })
                  }
                  className="rounded border-slate-300 text-teal-600"
                />
                <span>Keep this individual workout private from the group</span>
              </label>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-sm transition cursor-pointer"
              >
                Save Workout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
