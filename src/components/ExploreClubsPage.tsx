import { useState } from 'react';
import { AppState } from '../App';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, LogOut, Trophy, Users, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type ExploreClubsPageProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function ExploreClubsPage({ appState, updateAppState }: ExploreClubsPageProps) {
  const { currentUser, students } = appState;
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!currentUser) {
    updateAppState({ currentPage: 'login' });
    return null;
  }

  const filteredClubs = appState.clubs.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(appState.clubs.map(club => club.category)));

  const handleJoinClub = async (clubId: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch('http://localhost:3001/api/clubs/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id, clubId }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to join club');
        return;
      }

      console.log('DEBUG: Backend data.club.current_members:', data.club.current_members);

      // Update frontend state with data from backend
      const updatedUser = {
        ...currentUser,
        totalPoints: data.user.total_points,
        badge: data.user.badge,
        joinedClubs: [...currentUser.joinedClubs, clubId], // Add the newly joined club ID
      };

      const updatedClubs = appState.clubs.map(c => {
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

      console.log('DEBUG: updatedClubs before updateAppState:', updatedClubs);

      const updatedStudents = students.map(s =>
        s.id === currentUser.id ? updatedUser : s
      );

      const newMembership = { membership_id: Date.now(), user_id: parseInt(currentUser.id), club_id: parseInt(clubId) }; // Dummy ID for frontend
      const updatedClubMemberships = [...appState.clubMemberships, newMembership];

      updateAppState({
        currentUser: updatedUser,
        clubs: updatedClubs,
        students: updatedStudents,
        clubMemberships: updatedClubMemberships,
      });

      toast.success(`Successfully joined ${data.club.name}! You earned 10 points.`);
      if (data.user.badge && data.user.badge !== currentUser.badge) {
        toast.success(`🏆 New Student Badge: ${data.user.badge}!`);
      }
      if (data.club.badgeLevel && data.club.badgeLevel !== appState.clubs.find(c => c.id === clubId)?.badgeLevel) {
        toast.success(`🎉 ${data.club.name} earned a new Club Badge: ${data.club.badgeLevel}!`);
      }

    } catch (error) {
      console.error('Error joining club:', error);
      toast.error('An unexpected error occurred while joining the club.');
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
              className="text-gray-400 border-b-2 border-transparent rounded-none hover:bg-[#FF6500]/10 hover:text-white"
            >
              Profile
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'explore-clubs' })}
              variant="ghost"
              className="text-white border-b-2 border-[#FF6500] rounded-none hover:bg-[#FF6500]/10"
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
        <div className="mb-8">
          <h1 className="text-white mb-2">Explore Clubs</h1>
          <p className="text-gray-400">Find and join clubs that match your interests</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search clubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1E3E62] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48 bg-[#1E3E62] border-gray-600 text-white focus:border-[#FF6500]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#1E3E62] border-gray-600">
              <SelectItem value="all" className="text-white hover:bg-[#FF6500]/10">
                All Categories
              </SelectItem>
              {categories.map(category => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="text-white hover:bg-[#FF6500]/10"
                >
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => {
            const isJoined = currentUser.joinedClubs.includes(club.id);
            const isFull = club.currentMembers >= club.maxMembers;

            return (
              <Card
                key={club.id}
                className="bg-[#1E3E62] border-[#FF6500]/20 hover:border-[#FF6500]/50 transition-all overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-full h-48 object-cover"
                  />
                  {club.badgeLevel && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`${
                          club.badgeLevel === 'Gold'
                            ? 'bg-yellow-500 text-black'
                            : club.badgeLevel === 'Silver'
                            ? 'bg-gray-300 text-black'
                            : 'bg-orange-600 text-white'
                        }`}
                      >
                        <Award className="w-3 h-3 mr-1" />
                        {club.badgeLevel}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-white mb-2">{club.name}</h3>
                  <p className="text-gray-400 mb-4 line-clamp-2">{club.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline" className="border-gray-500 text-gray-400">
                      {club.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-400">
                                          <span>
                                            {club.currentMembers}/{club.maxMembers}
                                          </span>                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#FF6500]">{club.totalPoints} points</span>
                  </div>

                  <Button
                    onClick={() => handleJoinClub(club.id)}
                    disabled={isJoined || isFull}
                    className={`w-full ${
                      isJoined
                        ? 'bg-gray-600 text-white cursor-not-allowed'
                        : isFull
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-[#FF6500] hover:bg-[#FF6500]/90 text-white'
                    }`}
                  >
                    {isJoined ? 'Already Joined' : isFull ? 'Full' : 'Join Club'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredClubs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No clubs found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
}
