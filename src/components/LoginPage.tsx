import { useState } from 'react';
import { AppState } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

type LoginPageProps = {
  appState: AppState;
  updateAppState: (updates: Partial<AppState>) => void;
};

export default function LoginPage({ appState, updateAppState }: LoginPageProps) {
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail || !studentPassword) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: studentEmail, password: studentPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        updateAppState({
          currentUser: data.user,
          userRole: 'student',
          currentPage: 'student-profile',
          token: data.token,
        });
        toast.success('Welcome back, ' + data.user.name + '!');
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock admin authentication
    if (adminEmail === 'admin@sunway.edu.my' && adminPassword === 'admin123') {
      updateAppState({
        userRole: 'admin',
        currentPage: 'admin-dashboard',
      });
      toast.success('Welcome, Administrator!');
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6500] rounded-full mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white mb-2">ClubEngage</h1>
          <p className="text-gray-400">Gamified Club Management System</p>
        </div>

        {/* Login Card */}
        <Card className="bg-[#1E3E62] border-[#FF6500]/20">
          <CardHeader>
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#0B192C]">
                <TabsTrigger 
                  value="student"
                  className="data-[state=active]:bg-[#FF6500] data-[state=active]:text-white"
                >
                  Student Login
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  className="data-[state=active]:bg-[#FF6500] data-[state=active]:text-white"
                >
                  Admin Login
                </TabsTrigger>
              </TabsList>

              <TabsContent value="student" className="space-y-4">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email" className="text-white">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      placeholder="your.email@student.sunway.edu.my"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password" className="text-white">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      placeholder="Enter your password"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FF6500] hover:bg-[#FF6500]/90 text-white"
                  >
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-white">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@sunway.edu.my"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-white">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="bg-[#0B192C] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF6500]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FF6500] hover:bg-[#FF6500]/90 text-white"
                  >
                    Admin Login
                  </Button>
                  <p className="text-center text-gray-400">
                    Use: admin@sunway.edu.my / admin123
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 mt-8">
          © Sunway University 2025
        </p>
      </div>
    </div>
  );
}
