import { AppState } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Award, LogOut, Search, Trophy, Users } from 'lucide-react';

type StudentProfilePageProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function StudentProfilePage({ appState, updateAppState }: StudentProfilePageProps) {
  const { currentUser, clubs, clubMemberships } = appState;

  if (!currentUser) {
    updateAppState({ currentPage: 'login', token: null });
    return null;
  }

  const userClubIds = (clubMemberships || [])
    .filter(m => String(m.user_id) === currentUser.id)
    .map(m => String(m.club_id));

  const joinedClubs = (clubs || []).filter(club => userClubIds.includes(club.id));

  const getLevelProgress = (points: number) => {
    const pointsPerLevel = 20;
    const currentLevelPoints = points % pointsPerLevel;
    return (currentLevelPoints / pointsPerLevel) * 100;
  };

  const getBadgeName = (badgeId: string) => {
    const badges: Record<string, string> = {
      starter: 'Starter',
      active: 'Active Member',
      enthusiast: 'Enthusiast',
      topContributor: 'Top Contributor',
    };
    return badges[badgeId] || badgeId;
  };

  const handleLeaveClub = async (clubId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch('http://localhost:3001/api/clubs/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id, clubId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to leave club');
        return;
      }

      // Update frontend state with data from backend
      const updatedUser = {
        ...currentUser,
        totalPoints: data.user.total_points,
        badge: data.user.badge,
        joinedClubs: currentUser.joinedClubs.filter(id => id !== clubId), // Remove the left club ID
      };

      const updatedClubs = clubs.map(c => {
        if (c.id === data.club.id) {
          return {
            ...c,
            currentMembers: data.club.current_members,
            totalPoints: data.club.total_points,
            badgeLevel: data.club.badgeLevel,
          };
        }
        return c;
      });

      const updatedStudents = appState.students.map(s =>
        s.id === currentUser.id ? updatedUser : s
      );

      const updatedClubMemberships = appState.clubMemberships.filter(
        m => !(String(m.user_id) === currentUser.id && String(m.club_id) === clubId)
      );

      updateAppState({
        currentUser: updatedUser,
        clubs: updatedClubs,
        students: updatedStudents,
        clubMemberships: updatedClubMemberships,
      });

      toast.success(`Successfully left ${data.club.name}! You lost 10 points.`);
      if (data.user.badge && data.user.badge !== currentUser.badge) {
        toast.success(`📉 Your Student Badge changed to: ${data.user.badge}!`);
      }
      if (data.club.badgeLevel && data.club.badgeLevel !== clubs.find(c => c.id === clubId)?.badgeLevel) {
        toast.success(`📉 ${data.club.name} Club Badge changed to: ${data.club.badgeLevel}!`);
      }

    } catch (error) {
      console.error('Error leaving club:', error);
      toast.error('An unexpected error occurred while leaving the club.');
    }
  };

  const handleLogout = () => {
    updateAppState({
      currentUser: null,
      userRole: null,
      currentPage: 'login',
    });
  };

  return (
    <div className="min-h-screen bg-[#0B192C]">
      {/* Header */}
      <header className="bg-[#1E3E62] border-b border-[#FF6500]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-[#FF6500]">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="bg-[#FF6500] text-white">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-white">{currentUser.name}</h2>
                <p className="text-gray-400">{currentUser.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2 text-[#FF6500]">
                  <Trophy className="w-5 h-5" />
                  <span className="text-white">{currentUser.totalPoints} Points</span>
                </div>
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
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[#1E3E62]/50 border-b border-[#FF6500]/20">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <Button
              onClick={() => updateAppState({ currentPage: 'student-profile' })}
              variant="ghost"
              className="text-white border-b-2 border-[#FF6500] rounded-none hover:bg-[#FF6500]/10"
            >
              Profile
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'explore-clubs' })}
              variant="ghost"
              className="text-gray-400 border-b-2 border-transparent rounded-none hover:bg-[#FF6500]/10 hover:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Explore Clubs
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'leaderboards' })}
              variant="ghost"
              className="text-gray-400 border-b-2 border-transparent rounded-none hover:bg-[#FF6500]/10 hover:text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboards
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="bg-[#1E3E62] border-[#FF6500]/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 border-4 border-[#FF6500]">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="bg-[#FF6500] text-white">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-white mt-4">{currentUser.name}</h3>
                <Badge
                  className={`mt-2 ${
                    currentUser.badge === 'gold'
                      ? 'bg-yellow-500 text-black'
                      : currentUser.badge === 'silver'
                      ? 'bg-gray-300 text-black'
                      : currentUser.badge === 'bronze'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  <Award className="w-3 h-3 mr-1" />
                  {currentUser.badge || 'none'}
                </Badge>
                <p className="text-gray-400">{currentUser.faculty}</p>
                <p className="text-gray-500">{currentUser.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Stats */}
          <Card className="bg-[#1E3E62] border-[#FF6500]/20">
            <CardHeader>
              <CardTitle className="text-white">Gamification Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Level {currentUser.level}</span>
                  <span className="text-[#FF6500]">{currentUser.totalPoints} pts</span>
                </div>
                <Progress 
                  value={getLevelProgress(currentUser.totalPoints)} 
                  className="h-3 bg-[#0B192C]"
                />
                <p className="text-gray-400 mt-1">
                  {20 - (currentUser.totalPoints % 20)} points to next level
                </p>
              </div>

              <div>
                <h4 className="text-white mb-3">Current Badge</h4>
                <Badge
                  className={`w-full justify-center ${
                    currentUser.badge === 'gold'
                      ? 'bg-yellow-500 text-black'
                      : currentUser.badge === 'silver'
                      ? 'bg-gray-300 text-black'
                      : currentUser.badge === 'bronze'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  <Award className="w-4 h-4 mr-2" />
                  {currentUser.badge || 'none'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Joined Clubs */}
          <Card className="bg-[#1E3E62] border-[#FF6500]/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Joined Clubs ({joinedClubs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {joinedClubs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">You haven't joined any clubs yet</p>
                  <Button
                    onClick={() => updateAppState({ currentPage: 'explore-clubs' })}
                    className="bg-[#FF6500] hover:bg-[#FF6500]/90 text-white"
                  >
                    Explore Clubs
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {joinedClubs.map((club) => (
                    <div
                      key={club.id}
                      className="bg-[#0B192C] p-4 rounded-lg border border-[#FF6500]/20 hover:border-[#FF6500]/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-white">{club.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`border-${
                                club.badgeLevel === 'gold'
                                  ? 'yellow-500 text-yellow-500'
                                  : club.badgeLevel === 'silver'
                                  ? 'gray-400 text-gray-400'
                                  : club.badgeLevel === 'bronze'
                                  ? 'orange-600 text-orange-600'
                                  : 'gray-500 text-gray-400'
                              }`}
                            >
                              {club.badgeLevel || 'none'}
                            </Badge>
                            <span className="text-gray-400 text-sm">
                              {club.totalPoints} pts
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleLeaveClub(club.id)}
                        >
                          Leave
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
