
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardStats, initializeGoogleSheet } from '@/services/googleSheetService';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface StatsData {
  monthlySales: Array<{month: string, value: number}>;
  monthlyProfit: Array<{month: string, value: number}>;
  topSellingLots: Array<{
    lotId: string;
    supplierName: string;
    totalSold: number;
    totalPieces: number;
    percentage: number;
  }>;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ['#006A4E', '#F42A41', '#FFD700', '#0088FE', '#FFBB28'];

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.accessToken) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const initialized = await initializeGoogleSheet(user.accessToken);
        if (!initialized) {
          setError('গুগল শিট সেটআপ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
          return;
        }
        
        const stats = await getDashboardStats(user.accessToken);
        setStatsData({
          monthlySales: stats.monthlySales || [],
          monthlyProfit: stats.monthlyProfit || [],
          topSellingLots: stats.topSellingLots || []
        });
      } catch (error) {
        console.error("Failed to load analytics data:", error);
        setError('ডেটা লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        toast.error('অ্যানালিটিক্স ডেটা লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getMonthName = (monthStr: string) => {
    // Convert YYYY-MM to Bengali month names
    const months: Record<string, string> = {
      '01': 'জানুয়ারী',
      '02': 'ফেব্রুয়ারী',
      '03': 'মার্চ',
      '04': 'এপ্রিল',
      '05': 'মে',
      '06': 'জুন',
      '07': 'জুলাই',
      '08': 'আগস্ট',
      '09': 'সেপ্টেম্বর',
      '10': 'অক্টোবর',
      '11': 'নভেম্বর',
      '12': 'ডিসেম্বর'
    };
    
    const parts = monthStr.split('-');
    if (parts.length === 2) {
      return months[parts[1]] || monthStr;
    }
    return monthStr;
  };

  // Format the monthly data for charts
  const formatMonthlyData = (data: Array<{month: string, value: number}>) => {
    return data.map(item => ({
      name: getMonthName(item.month),
      value: item.value
    }));
  };

  // Generate placeholder data if we don't have real data yet
  const getPlaceholderData = () => {
    return [
      { name: 'জানুয়ারী', value: 0 },
      { name: 'ফেব্রুয়ারী', value: 0 },
      { name: 'মার্চ', value: 0 },
      { name: 'এপ্রিল', value: 0 },
      { name: 'মে', value: 0 },
      { name: 'জুন', value: 0 },
    ];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">অ্যানালিটিক্স</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>মাসিক বিক্রয় ট্রেন্ড</CardTitle>
            <CardDescription>গত ৬ মাসের বিক্রয় পরিসংখ্যান</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-5/6 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={statsData?.monthlySales?.length ? formatMonthlyData(statsData.monthlySales) : getPlaceholderData()}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`৳ ${value}`, 'বিক্রয়']}
                    labelFormatter={(name) => `মাস: ${name}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" name="বিক্রয়" stroke="#006A4E" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>লট অনুযায়ী বিক্রয়</CardTitle>
            <CardDescription>সর্বাধিক বিক্রিত লট</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-5/6 w-full rounded-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData?.topSellingLots?.length ? 
                      statsData.topSellingLots.map(lot => ({ name: lot.lotId, value: lot.totalSold })) : 
                      [{ name: 'কোন ডেটা নেই', value: 100 }]
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(statsData?.topSellingLots?.length ? 
                      statsData.topSellingLots.map(lot => ({ name: lot.lotId, value: lot.totalSold })) : 
                      [{ name: 'কোন ডেটা নেই', value: 100 }]
                    ).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} পিস`, 'পরিমাণ']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>মাসিক লাভ</CardTitle>
            <CardDescription>গত ৬ মাসের লাভের পরিসংখ্যান</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-5/6 w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsData?.monthlyProfit?.length ? formatMonthlyData(statsData.monthlyProfit) : getPlaceholderData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`৳ ${value}`, 'লাভ']} />
                  <Legend />
                  <Bar dataKey="value" name="লাভ" fill="#F42A41" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>বিক্রয় পূর্বানুমান</CardTitle>
          <CardDescription>
            ট্রেন্ড বিশ্লেষণের মাধ্যমে আগামী মাসের সম্ভাব্য বিক্রয় পূর্বানুমান
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-2">পূর্বানুমান এবং সুপারিশসমূহ</h3>
              <p className="text-gray-600 mb-4">
                আপনার বিক্রয় ডেটা বিশ্লেষণ করে নিম্নলিখিত পূর্বানুমান করা হয়েছে:
              </p>

              <div className="space-y-4">
                {statsData?.monthlySales?.length ? (
                  <>
                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <h4 className="font-medium text-bangladesh-green mb-1">আগামী মাসের বিক্রয় পূর্বানুমান</h4>
                      <p className="text-gray-700">
                        আপনার বর্তমান ট্রেন্ড অনুযায়ী, আগামী মাসে বিক্রয়ের পরিমাণ বাড়তে পারে।
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <h4 className="font-medium text-bangladesh-green mb-1">সর্বোচ্চ বিক্রয় লট</h4>
                      <p className="text-gray-700">
                        {statsData?.topSellingLots?.length > 0 ? 
                          `লট ${statsData.topSellingLots[0].lotId} সবচেয়ে বেশি বিক্রি হয়েছে, এই ধরনের আরো পণ্য নিন।` :
                          `এখনো পর্যাপ্ত ডেটা নেই সঠিক সুপারিশের জন্য।`
                        }
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-md border border-gray-200">
                      <h4 className="font-medium text-bangladesh-green mb-1">স্টক সুপারিশ</h4>
                      <p className="text-gray-700">
                        আপনার বিক্রয় ট্রেন্ড অনুযায়ী, আগামী সপ্তাহে স্টক বাড়ানোর পরামর্শ দেওয়া হচ্ছে।
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-white rounded-md border border-gray-200">
                    <h4 className="font-medium text-amber-600 mb-1">পর্যাপ্ত ডেটা নেই</h4>
                    <p className="text-gray-700">
                      এখনো পর্যাপ্ত বিক্রয় ডেটা নেই। আরো বিক্রয় এন্ট্রি করুন পূর্বানুমান পেতে।
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <p>* এই পূর্বানুমানগুলি শুধুমাত্র সাধারণ ট্রেন্ড বিশ্লেষণের উপর ভিত্তি করে করা হয়েছে। বাস্তব বিক্রয় পরিস্থিতি ভিন্ন হতে পারে।</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
