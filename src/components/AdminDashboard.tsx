import { AppState } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, Building2, TrendingUp, Trophy, LogOut, Plus, Settings } from 'lucide-react';

type AdminDashboardProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function AdminDashboard({ appState, updateAppState }: AdminDashboardProps) {
  const { clubs, students } = appState;

  const totalClubs = clubs.length;
  const totalStudents = students.length;
  const totalMembers = clubs.reduce((sum, club) => sum + club.currentMembers, 0);
  const topClub = [...clubs].sort((a, b) => b.totalPoints - a.totalPoints)[0];

  const recentActivity = [
    { id: 1, text: 'Student joined Photography Club', time: '5 minutes ago' },
    { id: 2, text: 'Coding Society reached Gold badge', time: '1 hour ago' },
    { id: 3, text: 'New club created: Chess Club', time: '2 hours ago' },
    { id: 4, text: 'Basketball Team gained 5 new members', time: '3 hours ago' },
    { id: 5, text: 'Environmental Society unlocked Silver badge', time: '5 hours ago' },
  ];

  const handleLogout = () => {
    updateAppState({
      currentUser: null,
      userRole: null,
      currentPage: 'login',
    });
  };

  const topClubs = [...clubs]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0B192C]">
      {/* Header */}
      <header className="bg-[#1E3E62] border-b border-[#FF6500]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Manage clubs and monitor engagement</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-[#FF6500] text-[#FF6500] hover:bg-[#FF6500]/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-[#1E3E62] min-h-[calc(100vh-73px)] border-r border-[#FF6500]/20 p-4">
          <nav className="space-y-2">
            <Button
              onClick={() => updateAppState({ currentPage: 'admin-dashboard' })}
              variant="ghost"
              className="w-full justify-start text-white bg-[#FF6500]/10 border border-[#FF6500]"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'create-club' })}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#FF6500]/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'manage-clubs' })}
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#FF6500]/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Clubs
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[#1E3E62] border-[#FF6500]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-400">Total Clubs</CardTitle>
                <Building2 className="w-5 h-5 text-[#FF6500]" />
              </CardHeader>
              <CardContent>
                <div className="text-white">{totalClubs}</div>
                <p className="text-gray-400 mt-1">Active clubs</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1E3E62] border-[#FF6500]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-400">Total Students</CardTitle>
                <Users className="w-5 h-5 text-[#FF6500]" />
              </CardHeader>
              <CardContent>
                <div className="text-white">{totalStudents}</div>
                <p className="text-gray-400 mt-1">Registered users</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1E3E62] border-[#FF6500]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-400">Club Members</CardTitle>
                <TrendingUp className="w-5 h-5 text-[#FF6500]" />
              </CardHeader>
              <CardContent>
                <div className="text-white">{totalMembers}</div>
                <p className="text-gray-400 mt-1">Total memberships</p>
              </CardContent>
            </Card>

            <Card className="bg-[#1E3E62] border-[#FF6500]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-400">Top Club</CardTitle>
                <Trophy className="w-5 h-5 text-[#FF6500]" />
              </CardHeader>
              <CardContent>
                <div className="text-white">{topClub?.name || 'N/A'}</div>
                <p className="text-gray-400 mt-1">{topClub?.totalPoints || 0} points</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <Card className="bg-[#1E3E62] border-[#FF6500]/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[#0B192C] border border-[#FF6500]/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#FF6500] mt-2" />
                      <div className="flex-1">
                        <p className="text-white">{activity.text}</p>
                        <p className="text-gray-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Clubs Preview */}
            <Card className="bg-[#1E3E62] border-[#FF6500]/20">
              <CardHeader>
                <CardTitle className="text-white">Top 5 Clubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topClubs.map((club, index) => (
                    <div
                      key={club.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#0B192C] border border-[#FF6500]/10"
                    >
                      <div className="w-8 text-center">
                        {index === 0 ? (
                          <Trophy className="w-5 h-5 text-yellow-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">#{index + 1}</span>
                        )}
                      </div>
                      <img
                        src={club.logo}
                        alt={club.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="text-white">{club.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            {club.category}
                          </Badge>
                          {club.badgeLevel && (
                            <Badge
                              className={`${
                                club.badgeLevel === 'Gold'
                                  ? 'bg-yellow-500 text-black'
                                  : club.badgeLevel === 'Silver'
                                  ? 'bg-gray-300 text-black'
                                  : 'bg-orange-600 text-white'
                              }`}
                            >
                              {club.badgeLevel}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#FF6500]">{club.totalPoints}</div>
                        <p className="text-gray-400">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
