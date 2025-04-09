
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllLots, getAllSales, Sale, Lot, initializeGoogleSheet } from '@/services/googleSheetService';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DownloadCloud, Filter, Calendar } from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  
  const [lots, setLots] = useState<Lot[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.accessToken) return;
      
      try {
        await initializeGoogleSheet(user.accessToken);
        const [lotsData, salesData] = await Promise.all([
          getAllLots(user.accessToken),
          getAllSales(user.accessToken)
        ]);
        
        setLots(lotsData);
        setSales(salesData);
        setFilteredLots(lotsData);
        setFilteredSales(salesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('রিপোর্ট ডেটা লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  // Apply date filters
  const applyDateFilter = () => {
    let filteredSalesList = [...sales];
    let filteredLotsList = [...lots];
    
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999); // End of the day
      
      filteredSalesList = sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= start && saleDate <= end;
      });
      
      filteredLotsList = lots.filter(lot => {
        const lotDate = new Date(lot.entryDate);
        return lotDate >= start && lotDate <= end;
      });
    }
    
    setFilteredSales(filteredSalesList);
    setFilteredLots(filteredLotsList);
  };
  
  // Reset filters
  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilteredSales(sales);
    setFilteredLots(lots);
  };
  
  // Format date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('bn-BD', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return isoString;
    }
  };
  
  // Calculate totals for sales report
  const calculateSalesTotals = () => {
    const totalPieces = filteredSales.reduce((sum, sale) => sum + sale.pieces, 0);
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
    
    return { totalPieces, totalRevenue, totalProfit };
  };
  
  // Export as CSV
  const exportSalesCsv = () => {
    const headers = ['বিক্রয় আইডি', 'লট আইডি', 'পিস সংখ্যা', 'পিস প্রতি মূল্য', 'মোট মূল্য', 'ক্রেতা', 'মোবাইল', 'তারিখ', 'লাভ'];
    
    const csvRows = [
      headers.join(','),
      ...filteredSales.map(sale => [
        sale.saleId,
        sale.lotId,
        sale.pieces,
        sale.pricePerPiece,
        sale.totalPrice,
        sale.customerName,
        sale.customerMobile,
        new Date(sale.saleDate).toLocaleDateString(),
        sale.profit
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `বিক্রয়_রিপোর্ট_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportInventoryCsv = () => {
    const headers = ['লট আইডি', 'সাপ্লায়ার', 'মোবাইল', 'মোট পিস', 'অবশিষ্ট পিস', 'ক্রয় মূল্য', 'তারিখ', 'অবস্থা'];
    
    const csvRows = [
      headers.join(','),
      ...filteredLots.map(lot => [
        lot.lotId,
        lot.supplierName,
        lot.supplierMobile,
        lot.pieces,
        lot.remainingPieces,
        lot.totalPrice,
        new Date(lot.entryDate).toLocaleDateString(),
        lot.remainingPieces === 0 ? 'শেষ' : lot.remainingPieces < lot.pieces ? 'আংশিক' : 'পূর্ণ'
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ইনভেন্টরি_রিপোর্ট_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <h1 className="text-2xl font-bold text-gray-800">রিপোর্ট</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>তারিখ নির্বাচন করুন</CardTitle>
          <CardDescription>
            রিপোর্ট দেখার জন্য একটি তারিখ সীমা নির্বাচন করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="startDate">শুরুর তারিখ</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="startDate"
                  type="date"
                  className="pl-8"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full space-y-2">
              <Label htmlFor="endDate">শেষের তারিখ</Label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="endDate"
                  type="date"
                  className="pl-8"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={resetFilters}>
                রিসেট
              </Button>
              <Button onClick={applyDateFilter}>
                <Filter className="mr-2 h-4 w-4" />
                ফিল্টার করুন
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="sales">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="sales" className="flex-1">বিক্রয় রিপোর্ট</TabsTrigger>
          <TabsTrigger value="inventory" className="flex-1">ইনভেন্টরি রিপোর্ট</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>বিক্রয় রিপোর্ট</CardTitle>
              <Button variant="outline" size="sm" onClick={exportSalesCsv}>
                <DownloadCloud className="mr-2 h-4 w-4" />
                CSV ডাউনলোড
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">মোট বিক্রিত পিস</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{calculateSalesTotals().totalPieces}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">মোট বিক্রয় মূল্য</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">৳ {calculateSalesTotals().totalRevenue.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">মোট লাভ</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">৳ {calculateSalesTotals().totalProfit.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">বিক্রয় আইডি</th>
                      <th className="text-left py-3 font-semibold">লট আইডি</th>
                      <th className="text-left py-3 font-semibold">ক্রেতা</th>
                      <th className="text-left py-3 font-semibold">পিস</th>
                      <th className="text-left py-3 font-semibold">মোট মূল্য</th>
                      <th className="text-left py-3 font-semibold">লাভ</th>
                      <th className="text-left py-3 font-semibold">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="py-3">{sale.saleId}</td>
                          <td className="py-3">{sale.lotId}</td>
                          <td className="py-3">
                            <div>
                              <div>{sale.customerName}</div>
                              <div className="text-xs text-gray-500">{sale.customerMobile}</div>
                            </div>
                          </td>
                          <td className="py-3">{sale.pieces}</td>
                          <td className="py-3">৳ {sale.totalPrice}</td>
                          <td className="py-3 text-bangladesh-green">৳ {sale.profit}</td>
                          <td className="py-3">{formatDate(sale.saleDate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-gray-500">
                          কোন বিক্রয় তথ্য পাওয়া যায়নি
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>ইনভেন্টরি রিপোর্ট</CardTitle>
              <Button variant="outline" size="sm" onClick={exportInventoryCsv}>
                <DownloadCloud className="mr-2 h-4 w-4" />
                CSV ডাউনলোড
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">মোট লট</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{filteredLots.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">মোট পিস</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{filteredLots.reduce((sum, lot) => sum + lot.pieces, 0)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-sm font-medium text-gray-500">অবশিষ্ট পিস</CardTitle>
                  </CardHeader>
                  <CardContent className="py-0">
                    <div className="text-2xl font-bold">{filteredLots.reduce((sum, lot) => sum + lot.remainingPieces, 0)}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">লট আইডি</th>
                      <th className="text-left py-3 font-semibold">সাপ্লায়ার</th>
                      <th className="text-left py-3 font-semibold">মোট পিস</th>
                      <th className="text-left py-3 font-semibold">অবশিষ্ট পিস</th>
                      <th className="text-left py-3 font-semibold">বিক্রিত %</th>
                      <th className="text-left py-3 font-semibold">ক্রয় মূল্য</th>
                      <th className="text-left py-3 font-semibold">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLots.length > 0 ? (
                      filteredLots.map((lot, index) => (
                        <tr 
                          key={index} 
                          className={`border-b hover:bg-gray-50 ${
                            lot.remainingPieces === 0 ? 'bg-gray-50 text-gray-500' : ''
                          }`}
                        >
                          <td className="py-3">{lot.lotId}</td>
                          <td className="py-3">
                            <div>
                              <div>{lot.supplierName}</div>
                              <div className="text-xs text-gray-500">{lot.supplierMobile}</div>
                            </div>
                          </td>
                          <td className="py-3">{lot.pieces}</td>
                          <td className="py-3">{lot.remainingPieces}</td>
                          <td className="py-3">
                            {Math.round(((lot.pieces - lot.remainingPieces) / lot.pieces) * 100)}%
                          </td>
                          <td className="py-3">৳ {lot.totalPrice}</td>
                          <td className="py-3">{formatDate(lot.entryDate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-4 text-center text-gray-500">
                          কোন লট তথ্য পাওয়া যায়নি
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
