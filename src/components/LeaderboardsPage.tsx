import { useState } from 'react';
import { AppState } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Trophy, Medal, Award, LogOut, Search, Users, Crown } from 'lucide-react';

type LeaderboardsPageProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function LeaderboardsPage({ appState, updateAppState }: LeaderboardsPageProps) {
  const { currentUser, clubs } = appState;
  const [categoryFilter, setCategoryFilter] = useState('all');

  if (!currentUser) {
    updateAppState({ currentPage: 'login' });
    return null;
  }

  const filteredClubs = clubs.filter((club) => {
    return categoryFilter === 'all' || club.category === categoryFilter;
  });

  const sortedClubs = [...filteredClubs].sort((a, b) => b.totalPoints - a.totalPoints);
  const categories = Array.from(new Set(clubs.map(club => club.category)));

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBorder = (index: number) => {
    if (index === 0) return 'border-yellow-500 bg-yellow-500/5';
    if (index === 1) return 'border-gray-400 bg-gray-400/5';
    if (index === 2) return 'border-orange-600 bg-orange-600/5';
    return 'border-[#FF6500]/20';
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
              className="text-gray-400 border-b-2 border-transparent rounded-none hover:bg-[#FF6500]/10 hover:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Explore Clubs
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'leaderboards' })}
              variant="ghost"
              className="text-white border-b-2 border-[#FF6500] rounded-none hover:bg-[#FF6500]/10"
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
          <h1 className="text-white mb-2">Club Leaderboards</h1>
          <p className="text-gray-400">Rankings based on total club points</p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-64 bg-[#1E3E62] border-gray-600 text-white focus:border-[#FF6500]">
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

        {/* Top 3 Podium */}
        {sortedClubs.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            <Card className={`bg-[#1E3E62] ${getRankBorder(1)} order-2 md:order-1`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getRankIcon(1)}
                </div>
                <CardTitle className="text-white">#2</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img
                  src={sortedClubs[1].logo}
                  alt={sortedClubs[1].name}
                  className="w-20 h-20 mx-auto rounded-full object-cover mb-4"
                />
                <h3 className="text-white mb-2">{sortedClubs[1].name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-[#FF6500]" />
                  <span className="text-[#FF6500]">{sortedClubs[1].totalPoints} points</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{sortedClubs[1].currentMembers} members</span>
                </div>
                {sortedClubs[1].badgeLevel && (
                  <Badge className="mt-3 bg-gray-300 text-black">
                    <Award className="w-3 h-3 mr-1" />
                    {sortedClubs[1].badgeLevel}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className={`bg-[#1E3E62] ${getRankBorder(0)} order-1 md:order-2 md:scale-105`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getRankIcon(0)}
                </div>
                <CardTitle className="text-white">#1</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img
                  src={sortedClubs[0].logo}
                  alt={sortedClubs[0].name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-4 border-yellow-500"
                />
                <h3 className="text-white mb-2">{sortedClubs[0].name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-[#FF6500]" />
                  <span className="text-[#FF6500]">{sortedClubs[0].totalPoints} points</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{sortedClubs[0].currentMembers} members</span>
                </div>
                {sortedClubs[0].badgeLevel && (
                  <Badge className="mt-3 bg-yellow-500 text-black">
                    <Award className="w-3 h-3 mr-1" />
                    {sortedClubs[0].badgeLevel}
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className={`bg-[#1E3E62] ${getRankBorder(2)} order-3`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {getRankIcon(2)}
                </div>
                <CardTitle className="text-white">#3</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <img
                  src={sortedClubs[2].logo}
                  alt={sortedClubs[2].name}
                  className="w-20 h-20 mx-auto rounded-full object-cover mb-4"
                />
                <h3 className="text-white mb-2">{sortedClubs[2].name}</h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-[#FF6500]" />
                  <span className="text-[#FF6500]">{sortedClubs[2].totalPoints} points</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{sortedClubs[2].currentMembers} members</span>
                </div>
                {sortedClubs[2].badgeLevel && (
                  <Badge className="mt-3 bg-orange-600 text-white">
                    <Award className="w-3 h-3 mr-1" />
                    {sortedClubs[2].badgeLevel}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="bg-[#1E3E62] border-[#FF6500]/20">
          <CardHeader>
            <CardTitle className="text-white">Complete Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedClubs.map((club, index) => (
                <div
                  key={club.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBorder(index)} transition-all hover:scale-[1.02]`}
                >
                  <div className="w-12 text-center">
                    {getRankIcon(index) || (
                      <span className="text-gray-400">#{index + 1}</span>
                    )}
                  </div>
                  <img
                    src={club.logo}
                    alt={club.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-white">{club.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="border-gray-500 text-gray-400">
                        {club.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="w-3 h-3" />
                        <span>{club.currentMembers} members</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-[#FF6500] mb-2">
                      <Trophy className="w-5 h-5" />
                      <span className="text-white">{club.totalPoints} pts</span>
                    </div>
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
                        <Award className="w-3 h-3 mr-1" />
                        {club.badgeLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
