
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Shield, User, Clipboard, Database, Download, HardDrive, Server } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    language, setLanguage,
    currency, setCurrency,
    dateFormat, setDateFormat,
    timezone, setTimezone,
    notifications, setNotificationSetting,
    autoBackup, setAutoBackup
  } = useSettings();
  
  const handleDownloadFullData = () => {
    toast.success('ডাটা ডাউনলোড শুরু হয়েছে...');
    // Normally this would trigger a real download from Google Sheets
    setTimeout(() => {
      toast.success('সম্পূর্ণ ডেটা ডাউনলোড সম্পন্ন হয়েছে।');
    }, 2000);
  };
  
  const handleDownloadMonthlyData = () => {
    toast.success('এই মাসের ডেটা ডাউনলোড শুরু হয়েছে...');
    // Normally this would trigger a real download from Google Sheets
    setTimeout(() => {
      toast.success('এই মাসের ডেটা ডাউনলোড সম্পন্ন হয়েছে।');
    }, 1500);
  };
  
  const handleChangeAPIKey = () => {
    toast.info('API কি পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।');
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">সেটিংস</h1>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="account">অ্যাকাউন্ট</TabsTrigger>
          <TabsTrigger value="notification">নোটিফিকেশন</TabsTrigger>
          <TabsTrigger value="system">সিস্টেম</TabsTrigger>
          <TabsTrigger value="backup">ব্যাকআপ</TabsTrigger>
          <TabsTrigger value="storage">স্টোরেজ</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>প্রোফাইল তথ্য</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্ট এবং প্রোফাইল সেটিংস পরিবর্তন করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-bangladesh-green text-white text-4xl font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="mr-2">
                      <User className="mr-2 h-4 w-4" />
                      গুগল প্রোফাইল দেখুন
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  * আপনি গুগল অ্যাকাউন্ট দিয়ে লগইন করেছেন। আপনার প্রোফাইল তথ্য গুগল অ্যাকাউন্ট থেকে আসে।
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>অ্যাকাউন্ট সেটিংস</CardTitle>
              <CardDescription>
                আপনার অ্যাকাউন্টের বিভিন্ন সেটিংস পরিবর্তন করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">ভাষা পরিবর্তন</Label>
                  <p className="text-sm text-gray-500">সিস্টেমের ভাষা পরিবর্তন করুন</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Select
                    value={language}
                    onValueChange={setLanguage}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ভাষা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bn">বাংলা</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">অ্যাকাউন্ট লগআউট</Label>
                  <p className="text-sm text-gray-500">সিস্টেম থেকে লগআউট করুন</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="destructive" onClick={handleLogout}>
                    লগআউট
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>নোটিফিকেশন সেটিংস</CardTitle>
              <CardDescription>
                আপনার নোটিফিকেশন প্রেফারেন্স পরিবর্তন করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Bell className="mr-2 h-4 w-4" />
                    স্টক অ্যালার্ট
                  </Label>
                  <p className="text-sm text-gray-500">যখন পিস সংখ্যা ১০-এর নিচে নামবে তখন অ্যালার্ট পাবেন</p>
                </div>
                <Switch 
                  checked={notifications.stockAlerts} 
                  onCheckedChange={(checked) => setNotificationSetting('stockAlerts', checked)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    ইমেইল নোটিফিকেশন
                  </Label>
                  <p className="text-sm text-gray-500">সাপ্তাহিক রিপোর্ট ইমেইলে পাবেন</p>
                </div>
                <Switch 
                  checked={notifications.emailNotifs} 
                  onCheckedChange={(checked) => setNotificationSetting('emailNotifs', checked)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Clipboard className="mr-2 h-4 w-4" />
                    নতুন লট এন্ট্রি নোটিফিকেশন
                  </Label>
                  <p className="text-sm text-gray-500">যখন নতুন লট এন্ট্রি হবে তখন নোটিফিকেশন পাবেন</p>
                </div>
                <Switch 
                  checked={notifications.lotEntryNotifs} 
                  onCheckedChange={(checked) => setNotificationSetting('lotEntryNotifs', checked)} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    সিকিউরিটি অ্যালার্ট
                  </Label>
                  <p className="text-sm text-gray-500">অ্যাকাউন্টে নতুন লগইন হলে নোটিফিকেশন পাবেন</p>
                </div>
                <Switch 
                  checked={notifications.securityAlerts} 
                  onCheckedChange={(checked) => setNotificationSetting('securityAlerts', checked)} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>সিস্টেম সেটিংস</CardTitle>
              <CardDescription>
                সিস্টেমের বিভিন্ন সেটিংস পরিবর্তন করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">ডিফল্ট কারেন্সি</Label>
                <Select
                  value={currency}
                  onValueChange={setCurrency}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="কারেন্সি নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BDT">৳ বাংলাদেশি টাকা (BDT)</SelectItem>
                    <SelectItem value="USD">$ মার্কিন ডলার (USD)</SelectItem>
                    <SelectItem value="EUR">€ ইউরো (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">তারিখ ফরম্যাট</Label>
                <Select
                  value={dateFormat}
                  onValueChange={setDateFormat}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="তারিখ ফরম্যাট নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">টাইমজোন</Label>
                <Select
                  value={timezone}
                  onValueChange={setTimezone}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="টাইমজোন নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Dhaka">Asia/Dhaka (GMT+6)</SelectItem>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">অটো-ব্যাকআপ</Label>
                  <p className="text-sm text-gray-500">প্রতি ৭ দিন অন্তর সিস্টেম অটোমেটিক ব্যাকআপ নিবে</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>ব্যাকআপ এবং রিস্টোর</CardTitle>
              <CardDescription>
                আপনার ডেটার ব্যাকআপ নিন এবং প্রয়োজনে রিস্টোর করুন
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2">ব্যাকআপ তথ্য</h3>
                <p className="text-sm text-gray-600 mb-4">
                  সব ডেটা গুগল শিটে সেভ থাকে, তাই আলাদা ব্যাকআপের প্রয়োজন নেই। 
                  তবে প্রয়োজনে আপনি এক্সেল ফরম্যাটে ডেটা ডাউনলোড করে রাখতে পারেন।
                </p>

                <div className="flex flex-col space-y-2">
                  <Button onClick={handleDownloadFullData}>
                    <Database className="mr-2 h-4 w-4" />
                    সম্পূর্ণ ডেটা ডাউনলোড করুন
                  </Button>
                  <Button variant="outline" onClick={handleDownloadMonthlyData}>
                    <Download className="mr-2 h-4 w-4" />
                    শুধু এই মাসের ডেটা ডাউনলোড করুন
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2">রিস্টোর সেটিংস</h3>
                <p className="text-sm text-gray-600 mb-4">
                  গুগল শিট ডেটা রিস্টোর করার জন্য, যোগাযোগ করুন সিস্টেম অ্যাডমিনের সাথে।
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>ডাটা স্টোরেজ অপশন</CardTitle>
              <CardDescription>
                আইকন বাংলাদেশ ওয়েবসাইট কোথায় ডাটা সংরক্ষণ করে
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <Server className="mr-2 h-5 w-5 text-bangladesh-green" />
                  বর্তমান স্টোরেজ সিস্টেম
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  বর্তমানে আমরা গুগল ক্লাউড সার্ভিস ব্যবহার করছি সমস্ত ডাটা সংরক্ষণ এবং পরিচালনার জন্য:
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-full mr-3">
                        <HardDrive className="h-5 w-5 text-bangladesh-green" />
                      </div>
                      <div>
                        <h4 className="font-medium">গুগল ড্রাইভ</h4>
                        <p className="text-xs text-gray-500">ছবি এবং ফাইল স্টোরেজের জন্য</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-full mr-3">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">গুগল শিট</h4>
                        <p className="text-xs text-gray-500">সমস্ত তথ্য এবং রেকর্ড সংরক্ষণের জন্য</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2">স্টোরেজ অপশন</h3>
                <p className="text-sm text-gray-600 mb-4">
                  আপনি চাইলে ভবিষ্যতে নিম্নলিখিত সিস্টেমগুলিতে মাইগ্রেট করতে পারেন:
                </p>

                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">ফায়ারবেজ</div>
                    <div className="text-xs text-gray-500">রিয়েল-টাইম ডাটাবেজ এবং ফাইল স্টোরেজ</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">সুপাবেজ</div>
                    <div className="text-xs text-gray-500">পোস্টগ্রেস ডাটাবেজ এবং স্টোরেজ</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">কাস্টম সার্ভার</div>
                    <div className="text-xs text-gray-500">নিজস্ব হোস্টিং সিস্টেম</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  * স্টোরেজ সিস্টেম পরিবর্তন করার আগে অবশ্যই একজন ডেভেলপার বা টেকনিকাল অ্যাডমিনের সাহায্য নিন।
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>API সেটিংস</CardTitle>
              <CardDescription>
                API কি এবং ইন্টিগ্রেশন সেটিংস
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2">গুগল API ইন্টিগ্রেশন</h3>
                <p className="text-sm text-gray-600 mb-4">
                  সিস্টেমে নিম্নলিখিত Google API সার্ভিসগুলি ব্যবহৃত হয়:
                </p>

                <div className="space-y-2">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">Google OAuth 2.0</div>
                    <div className="text-xs text-gray-500">লগইন এবং অথেনটিকেশনের জন্য</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">Google Sheets API</div>
                    <div className="text-xs text-gray-500">ডেটা সংরক্ষণ এবং পড়ার জন্য</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <div className="font-medium">Google Drive API</div>
                    <div className="text-xs text-gray-500">ছবি সংরক্ষণ এবং ব্যবস্থাপনার জন্য</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-medium mb-2">API কি</h3>
                <p className="text-sm text-gray-600 mb-4">
                  সিস্টেমে API কি গুলি নিরাপদে সংরক্ষিত আছে।
                </p>
                <Button variant="outline" onClick={handleChangeAPIKey}>
                  API কি পরিবর্তন করুন
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
