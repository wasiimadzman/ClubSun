import { useState } from 'react';
import { AppState, Club } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { LogOut, Plus, TrendingUp, Settings, Search, Pencil, Trash2, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type ManageClubsPageProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function ManageClubsPage({ appState, updateAppState }: ManageClubsPageProps) {
  const { clubs } = appState;
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMaxMembers, setEditMaxMembers] = useState('');

  const categories = Array.from(new Set(clubs.map(club => club.category)));

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || club.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleLogout = () => {
    updateAppState({
      currentUser: null,
      userRole: null,
      currentPage: 'login',
    });
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setEditName(club.name);
    setEditDescription(club.description);
    setEditCategory(club.category);
    setEditMaxMembers(club.maxMembers.toString());
  };

  const handleSaveEdit = () => {
    if (!editingClub) return;

    const updatedClubs = clubs.map((club) =>
      club.id === editingClub.id
        ? {
            ...club,
            name: editName,
            description: editDescription,
            category: editCategory,
            maxMembers: parseInt(editMaxMembers) || 30,
          }
        : club
    );

    updateAppState({ clubs: updatedClubs });
    toast.success('Club updated successfully!');
    setEditingClub(null);
  };

  const handleDelete = (clubId: string) => {
    setDeletingClubId(clubId);
  };

  const confirmDelete = () => {
    if (!deletingClubId) return;

    const clubToDelete = clubs.find(c => c.id === deletingClubId);
    const updatedClubs = clubs.filter((club) => club.id !== deletingClubId);
    
    updateAppState({ clubs: updatedClubs });
    toast.success(`Club "${clubToDelete?.name}" deleted successfully!`);
    setDeletingClubId(null);
  };

  return (
    <div className="min-h-screen bg-[#0B192C]">
      {/* Header */}
      <header className="bg-[#1E3E62] border-b border-[#FF6500]/20 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Manage all clubs</p>
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
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#FF6500]/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
            <Button
              onClick={() => updateAppState({ currentPage: 'manage-clubs' })}
              variant="ghost"
              className="w-full justify-start text-white bg-[#FF6500]/10 border border-[#FF6500]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Clubs
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-white mb-2">Manage Clubs</h2>
            <p className="text-gray-400">View, edit, and delete clubs</p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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

          {/* Clubs Table */}
          <Card className="bg-[#1E3E62] border-[#FF6500]/20">
            <CardHeader>
              <CardTitle className="text-white">All Clubs ({filteredClubs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead className="text-gray-400">Club Name</TableHead>
                      <TableHead className="text-gray-400">Category</TableHead>
                      <TableHead className="text-gray-400">Members</TableHead>
                      <TableHead className="text-gray-400">Points</TableHead>
                      <TableHead className="text-gray-400">Badge</TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClubs.map((club) => (
                      <TableRow key={club.id} className="border-gray-700 hover:bg-[#0B192C]/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={club.logo}
                              alt={club.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <span className="text-white">{club.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-500 text-gray-400">
                            {club.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {club.currentMembers}/{club.maxMembers}
                        </TableCell>
                        <TableCell className="text-[#FF6500]">
                          {club.totalPoints}
                        </TableCell>
                        <TableCell>
                          {club.badgeLevel ? (
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
                          ) : (
                            <span className="text-gray-500">No Badge</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => handleEdit(club)}
                              variant="ghost"
                              size="sm"
                              className="text-[#FF6500] hover:bg-[#FF6500]/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(club.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredClubs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No clubs found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingClub} onOpenChange={(open) => !open && setEditingClub(null)}>
        <DialogContent className="bg-[#1E3E62] border-[#FF6500]/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Club</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update club information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-white">Club Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-[#0B192C] border-gray-600 text-white focus:border-[#FF6500]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-white">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-[#0B192C] border-gray-600 text-white focus:border-[#FF6500]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category" className="text-white">Category</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="bg-[#0B192C] border-gray-600 text-white focus:border-[#FF6500]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E3E62] border-gray-600">
                  {['Arts', 'Technology', 'Sports', 'Social', 'Games', 'Academic', 'Other'].map(cat => (
                    <SelectItem key={cat} value={cat} className="text-white hover:bg-[#FF6500]/10">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-max-members" className="text-white">Max Members</Label>
              <Input
                id="edit-max-members"
                type="number"
                value={editMaxMembers}
                onChange={(e) => setEditMaxMembers(e.target.value)}
                className="bg-[#0B192C] border-gray-600 text-white focus:border-[#FF6500]"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-[#FF6500] hover:bg-[#FF6500]/90 text-white"
              >
                Save Changes
              </Button>
              <Button
                onClick={() => setEditingClub(null)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingClubId} onOpenChange={(open) => !open && setDeletingClubId(null)}>
        <AlertDialogContent className="bg-[#1E3E62] border-[#FF6500]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the club and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-600 text-gray-400 hover:bg-[#0B192C]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
