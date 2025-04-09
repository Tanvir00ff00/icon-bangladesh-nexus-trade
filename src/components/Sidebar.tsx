
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  Layers, 
  FileText, 
  Home 
} from 'lucide-react';

const navItems = [
  {
    title: 'ড্যাশবোর্ড',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'লট এন্ট্রি',
    href: '/lots',
    icon: Package,
  },
  {
    title: 'বিক্রয় এন্ট্রি',
    href: '/sales',
    icon: ShoppingCart,
  },
  {
    title: 'স্টক/ইনভেন্টরি',
    href: '/inventory',
    icon: Layers,
  },
  {
    title: 'রিপোর্ট',
    href: '/reports',
    icon: FileText,
  },
  {
    title: 'অ্যানালিটিক্স',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'সেটিংস',
    href: '/settings',
    icon: Settings,
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  return (
    <aside 
      id="sidebar"
      className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 transition-transform -translate-x-full md:translate-x-0 overflow-y-auto"
    >
      <div className="p-4 flex items-center border-b border-gray-200">
        <img 
          src="/lovable-uploads/aa065400-b821-4e2f-b88e-fda0f76a5719.png" 
          alt="আইকন বাংলাদেশ" 
          className="h-8 w-8 mr-2"
        />
        <h2 className="text-lg font-semibold text-bangladesh-green">আইকন বাংলাদেশ</h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center py-2 px-4 rounded-md transition-colors",
                  {
                    "bg-bangladesh-green text-white": location.pathname === item.href,
                    "text-gray-700 hover:bg-gray-100": location.pathname !== item.href,
                  }
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">ভার্শন ১.০</div>
        <div className="text-xs text-gray-500">© ২০২৫ আইকন বাংলাদেশ</div>
      </div>
    </aside>
  );
};

export default Sidebar;
