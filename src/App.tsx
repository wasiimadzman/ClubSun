import { useState } from 'react';
import LoginPage from './components/LoginPage';
import StudentProfilePage from './components/StudentProfilePage';
import ExploreClubsPage from './components/ExploreClubsPage';
import LeaderboardsPage from './components/LeaderboardsPage';
import AdminDashboard from './components/AdminDashboard';
import CreateClubPage from './components/CreateClubPage';
import ManageClubsPage from './components/ManageClubsPage';
import { Toaster } from './components/ui/sonner';

export type UserRole = 'student' | 'admin' | null;

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type Club = {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  currentMembers: number;
  maxMembers: number;
  totalPoints: number;
  badgeLevel: 'Bronze' | 'Silver' | 'Gold' | null;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  faculty: string;
  avatar: string;
  totalPoints: number;
  level: number;
  joinedClubs: string[];
  badges: string[];
  badge: string; // Added this line
};

export type AppState = {
  clubs: Club[];
  students: Student[];
  clubMemberships: { membership_id: number; user_id: number; club_id: number }[];
  badges: { badge_id: number; badge_name: string; badge_type: string; description: string; points_required: number }[];
  userBadges: { user_badge_id: number; user_id: number; badge_id: number }[];
  currentUser: Student | null;
  userRole: UserRole;
  currentPage: string;
  token: string | null;
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    clubs: [],
    students: [],
    clubMemberships: [],
    badges: [],
    userBadges: [],
    currentUser: null,
    userRole: null,
    currentPage: 'login',
    token: null,
  });

  const updateAppState = async (updates: Partial<AppState>) => {
    setAppState((prev) => ({ ...prev, ...updates }));

    if (updates.currentUser && updates.token) {
      try {
        const [clubsRes, studentsRes, membersRes, badgesRes, userBadgesRes] = await Promise.all([
          fetch('http://localhost:3001/api/clubs'),
          fetch('http://localhost:3001/api/users'),
          fetch('http://localhost:3001/api/club-members'),
          fetch('http://localhost:3001/api/badges'),
          fetch('http://localhost:3001/api/user-badges'),
        ]);

        const rawClubs = await clubsRes.json();
        const rawStudents = await studentsRes.json();
        const clubMemberships = await membersRes.json();
        const badges = await badgesRes.json();
        const userBadges = await userBadgesRes.json();

        // --- Data Transformation ---
        const clubs: Club[] = rawClubs.map((c: any) => ({
          id: String(c.club_id),
          name: c.club_name,
          description: c.description,
          category: 'General', // Placeholder
          logo: `https://picsum.photos/seed/${c.club_id}/200`,
          currentMembers: Number(c.current_members),
          maxMembers: Number(c.capacity),
          totalPoints: c.total_points,
          badgeLevel: c.badge,
        }));

        const students: Student[] = rawStudents.map((s: any) => ({
          id: String(s.user_id),
          name: s.name,
          email: s.email,
          faculty: 'Computing & IT', // Placeholder
          avatar: `https://picsum.photos/seed/${s.user_id}/200`,
          totalPoints: s.total_points,
          level: Math.floor(s.total_points / 20) + 1, // Calculate level
          joinedClubs: clubMemberships
            .filter((membership: any) => String(membership.user_id) === String(s.user_id))
            .map((membership: any) => String(membership.club_id)),
          badges: [], // This will be populated later if needed
          badge: s.badge, // Added this line
        }));

        // Find the fresh user object from the fetched students list
        const freshCurrentUser = students.find(student => student.id === String(updates.currentUser?.user_id));

        const finalClubs = updates.clubs || clubs; // Determine which clubs array to use

        setAppState((prev) => ({
          ...prev,
          clubs: finalClubs,
          students,
          clubMemberships,
          badges,
          userBadges,
          currentUser: freshCurrentUser || prev.currentUser
        }));

      } catch (error) {
        console.error("Failed to fetch app data:", error);
      }
    }
  };

  const renderPage = () => {
    switch (appState.currentPage) {
      case 'login':
        return <LoginPage appState={appState} updateAppState={updateAppState} />;
      case 'student-profile':
        return <StudentProfilePage appState={appState} updateAppState={updateAppState} />;
      case 'explore-clubs':
        return <ExploreClubsPage key={appState.clubs.length} appState={appState} updateAppState={updateAppState} />;
      case 'leaderboards':
        return <LeaderboardsPage appState={appState} updateAppState={updateAppState} />;
      case 'admin-dashboard':
        return <AdminDashboard appState={appState} updateAppState={updateAppState} />;
      case 'create-club':
        return <CreateClubPage appState={appState} updateAppState={updateAppState} />;
      case 'manage-clubs':
        return <ManageClubsPage appState={appState} updateAppState={updateAppState} />;
      default:
        return <LoginPage appState={appState} updateAppState={updateAppState} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B192C]">
      {renderPage()}
      <Toaster />
    </div>
  );
}

export default App;
