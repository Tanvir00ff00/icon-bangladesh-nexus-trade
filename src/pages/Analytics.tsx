
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics: React.FC = () => {
  // Sample data for demonstration - in a real app, this would come from the Google Sheets API
  const monthlySalesData = [
    { name: 'জানুয়ারী', sales: 4000 },
    { name: 'ফেব্রুয়ারী', sales: 3000 },
    { name: 'মার্চ', sales: 5000 },
    { name: 'এপ্রিল', sales: 2780 },
    { name: 'মে', sales: 1890 },
    { name: 'জুন', sales: 2390 },
  ];

  const salesByCategory = [
    { name: 'শার্ট', value: 400 },
    { name: 'প্যান্ট', value: 300 },
    { name: 'টি-শার্ট', value: 300 },
    { name: 'জ্যাকেট', value: 200 },
    { name: 'অন্যান্য', value: 100 },
  ];

  const topCustomers = [
    { name: 'রহিম ট্রেডার্স', value: 120 },
    { name: 'করিম শপিং', value: 80 },
    { name: 'খান এন্টারপ্রাইজ', value: 70 },
    { name: 'জামিল স্টোর', value: 60 },
    { name: 'মধু মার্কেট', value: 30 },
  ];

  const COLORS = ['#006A4E', '#F42A41', '#FFD700', '#0088FE', '#FFBB28'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">অ্যানালিটিক্স</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>মাসিক বিক্রয় ট্রেন্ড</CardTitle>
            <CardDescription>গত ৬ মাসের বিক্রয় পরিসংখ্যান</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlySalesData}
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
                <Line type="monotone" dataKey="sales" stroke="#006A4E" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>পণ্য অনুযায়ী বিক্রয়</CardTitle>
            <CardDescription>বিভিন্ন পণ্যের বিক্রয়ের পরিমাণ</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {salesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} পিস`, 'পরিমাণ']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>সেরা ক্রেতা</CardTitle>
            <CardDescription>সর্বাধিক পণ্য ক্রয়কারী ক্রেতা</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topCustomers}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => [`${value} পিস`, 'পরিমাণ']} />
                <Legend />
                <Bar dataKey="value" name="পরিমাণ" fill="#F42A41" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>বিক্রয় পূর্বানুমান</CardTitle>
          <CardDescription>
            AI বিশ্লেষণের মাধ্যমে আগামী মাসের সম্ভাব্য বিক্রয় পূর্বানুমান
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-2">পূর্বানুমান এবং সুপারিশসমূহ</h3>
            <p className="text-gray-600 mb-4">
              গত ৬ মাসের বিক্রয় ডেটা বিশ্লেষণ করে AI সিস্টেম দ্বারা নিম্নলিখিত পূর্বানুমান করা হয়েছে:
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-white rounded-md border border-gray-200">
                <h4 className="font-medium text-bangladesh-green mb-1">আগামী মাসের বিক্রয় পূর্বানুমান</h4>
                <p className="text-gray-700">আগামী মাসে বিক্রয়ের পরিমাণ পূর্ববর্তী মাসের তুলনায় প্রায় ২৫% বাড়তে পারে।</p>
              </div>

              <div className="p-3 bg-white rounded-md border border-gray-200">
                <h4 className="font-medium text-bangladesh-green mb-1">সেরা বিক্রয় পণ্য</h4>
                <p className="text-gray-700">টি-শার্ট এবং প্যান্ট সবচেয়ে বেশি বিক্রি হওয়ার সম্ভাবনা রয়েছে। স্টক বাড়ানোর পরামর্শ দেওয়া হচ্ছে।</p>
              </div>

              <div className="p-3 bg-white rounded-md border border-gray-200">
                <h4 className="font-medium text-bangladesh-green mb-1">ঝুঁকিপূর্ণ স্টক</h4>
                <p className="text-gray-700">জ্যাকেট পণ্যের চাহিদা কমে যাচ্ছে। বর্তমান স্টক দ্রুত বিক্রয়ের চেষ্টা করুন।</p>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p>* এই পূর্বানুমানগুলি শুধুমাত্র সাধারণ ট্রেন্ড বিশ্লেষণের উপর ভিত্তি করে করা হয়েছে। বাস্তব বিক্রয় পরিস্থিতি ভিন্ন হতে পারে।</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
