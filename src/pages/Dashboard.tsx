
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats } from '@/services/googleSheetService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, ShoppingCart, Coins, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalLots: number;
  activeLots: number;
  totalPieces: number;
  remainingPieces: number;
  soldPieces: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  monthlySales: { month: string; value: number }[];
  monthlyProfit: { month: string; value: number }[];
  topSellingLots: {
    lotId: string;
    supplierName: string;
    totalSold: number;
    totalPieces: number;
    percentage: number;
  }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.accessToken) {
        try {
          const dashboardStats = await getDashboardStats(user.accessToken);
          setStats(dashboardStats);
        } catch (error) {
          console.error('Failed to load dashboard stats:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadStats();
  }, [user]);

  // Format month names for charts
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['জানুয়ারী', 'ফেব্রুয়ারী', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return monthNames[parseInt(monthNum) - 1];
  };

  // Format numbers with Bengali numerals
  const formatBengaliNumber = (num: number) => {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(char => {
      if (char >= '0' && char <= '9') {
        return bengaliNumerals[parseInt(char)];
      }
      return char;
    }).join('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bangladesh-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">ড্যাশবোর্ড</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('bn-BD', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">মোট লট</CardTitle>
            <Package className="h-4 w-4 text-bangladesh-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBengaliNumber(stats?.totalLots || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              অ্যাক্টিভ: {formatBengaliNumber(stats?.activeLots || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">মোট বিক্রয়</CardTitle>
            <ShoppingCart className="h-4 w-4 text-bangladesh-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBengaliNumber(stats?.totalSales || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              বিক্রিত পিস: {formatBengaliNumber(stats?.soldPieces || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">মোট রেভিনিউ</CardTitle>
            <Coins className="h-4 w-4 text-bangladesh-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {formatBengaliNumber(Math.round(stats?.totalRevenue || 0))}</div>
            <p className="text-xs text-gray-500 mt-1">
              অবশিষ্ট পিস: {formatBengaliNumber(stats?.remainingPieces || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">মোট লাভ</CardTitle>
            <TrendingUp className="h-4 w-4 text-bangladesh-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳ {formatBengaliNumber(Math.round(stats?.totalProfit || 0))}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalRevenue ? 
                `প্রফিট মার্জিন: ${formatBengaliNumber(Math.round((stats.totalProfit / stats.totalRevenue) * 100))}%` : 
                'প্রফিট মার্জিন: ০%'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>মাসিক বিক্রয়</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlySales.map(item => ({ ...item, month: formatMonth(item.month) })) || []}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`৳ ${value}`, 'বিক্রয়']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="value" fill="#006A4E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>মাসিক লাভ</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyProfit.map(item => ({ ...item, month: formatMonth(item.month) })) || []}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`৳ ${value}`, 'লাভ']}
                  labelFormatter={(label) => `${label}`}
                />
                <Line type="monotone" dataKey="value" stroke="#F42A41" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Lots */}
      <Card>
        <CardHeader>
          <CardTitle>সর্বাধিক বিক্রিত লট</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-2 font-semibold">লট আইডি</th>
                  <th className="pb-2 font-semibold">সাপ্লায়ার</th>
                  <th className="pb-2 font-semibold">বিক্রিত পিস</th>
                  <th className="pb-2 font-semibold">মোট পিস</th>
                  <th className="pb-2 font-semibold">বিক্রয় শতাংশ</th>
                </tr>
              </thead>
              <tbody>
                {stats?.topSellingLots.map((lot, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3">{lot.lotId}</td>
                    <td className="py-3">{lot.supplierName}</td>
                    <td className="py-3">{formatBengaliNumber(lot.totalSold)}</td>
                    <td className="py-3">{formatBengaliNumber(lot.totalPieces)}</td>
                    <td className="py-3">{formatBengaliNumber(Math.round(lot.percentage))}%</td>
                  </tr>
                ))}
                {(!stats?.topSellingLots || stats.topSellingLots.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">
                      কোন বিক্রয় তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
