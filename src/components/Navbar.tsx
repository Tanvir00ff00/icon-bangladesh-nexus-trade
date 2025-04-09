
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, LogOut, Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    // For mobile sidebar toggle
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('translate-x-0');
      sidebar.classList.toggle('-translate-x-full');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-2 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <img 
              src="https://via.placeholder.com/40/006A4E?text=IB" 
              alt="আইকন বাংলাদেশ" 
              className="h-8 w-8 mr-2"
            />
            <h1 className="text-xl font-semibold text-bangladesh-green hidden md:block">
              আইকন বাংলাদেশ
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-bangladesh-red rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>আমার অ্যাকাউন্ট</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{user?.name}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center text-bangladesh-red">
                <LogOut className="mr-2 h-4 w-4" />
                <span>লগ আউট</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
