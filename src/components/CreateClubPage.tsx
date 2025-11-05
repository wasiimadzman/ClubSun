import { useState } from 'react';
import { AppState, Club } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LogOut, Plus, TrendingUp, Settings, Upload, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type CreateClubPageProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function CreateClubPage({ appState, updateAppState }: CreateClubPageProps) {
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [maxMembers, setMaxMembers] = useState('30');
  const [imageUrl, setImageUrl] = useState('');

  const categories = ['Arts', 'Technology', 'Sports', 'Social', 'Games', 'Academic', 'Other'];

  const handleLogout = () => {
    updateAppState({
      currentUser: null,
      userRole: null,
      currentPage: 'login',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clubName || !description || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: clubName,
      description,
      category,
      logo: imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
      currentMembers: 0,
      maxMembers: parseInt(maxMembers) || 30,
      totalPoints: 0,
      badgeLevel: null,
    };

    updateAppState({
      clubs: [...appState.clubs, newClub],
    });

    toast.success(`Club "${clubName}" created successfully!`);

    // Reset form
    setClubName('');
    setDescription('');
    setCategory('');
    setMaxMembers('30');
    setImageUrl('');

    // Navigate back to manage clubs
    setTimeout(() => {
      updateAppState({ currentPage: 'manage-clubs' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B192C]">
      {/* Header */}
      <header className="bg-[#1E3E62] border-b border-[#FF6500]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Create a new club</p>
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
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#FF6500]/10"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'create-club' })}
              variant="ghost"
              className="w-full justify-start text-white bg-[#FF6500]/10 border border-[#FF6500]"
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
          <div className="max-w-5xl mx-auto">
            <h2 className="text-white mb-8">Create New Club</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card className="bg-[#1E3E62] border-[#FF6500]/20">
                <CardHeader>
                  <CardTitle className="text-white">Club Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="club-name" className="text-white">
                        Club Name *
                      </Label>
                      <Input
                        id="club-name"
                        type="text"
                        placeholder="Enter club name"
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the club's purpose and activities"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500] min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">
                        Category *
                      </Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger className="bg-[#0B192C] border-gray-600 text-white focus:border-[#FF6500]">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1E3E62] border-gray-600">
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              className="text-white hover:bg-[#FF6500]/10"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-members" className="text-white">
                        Maximum Members
                      </Label>
                      <Input
                        id="max-members"
                        type="number"
                        min="1"
                        placeholder="30"
                        value={maxMembers}
                        onChange={(e) => setMaxMembers(e.target.value)}
                        className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                      />
                      <p className="text-gray-400">Default: 30 members</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image-url" className="text-white">
                        Cover Image URL
                      </Label>
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <Upload className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">
                          Or paste an image URL
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-[#FF6500] hover:bg-[#FF6500]/90 text-white"
                      >
                        Create Club
                      </Button>
                      <Button
                        type="button"
                        onClick={() => updateAppState({ currentPage: 'admin-dashboard' })}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-400 hover:bg-[#0B192C]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="bg-[#1E3E62] border-[#FF6500]/20">
                <CardHeader>
                  <CardTitle className="text-white">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#0B192C] rounded-lg overflow-hidden border border-[#FF6500]/20">
                    <div className="relative">
                      <img
                        src={
                          imageUrl ||
                          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop'
                        }
                        alt="Club preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-white mb-2">
                        {clubName || 'Club Name'}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-3">
                        {description || 'Club description will appear here...'}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        {category && (
                          <span className="px-3 py-1 rounded-full text-sm border border-gray-500 text-gray-400">
                            {category}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>0/{maxMembers || '30'}</span>
                        </div>
                      </div>
                      <Button
                        disabled
                        className="w-full bg-gray-600 text-white cursor-not-allowed"
                      >
                        Join Club
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
