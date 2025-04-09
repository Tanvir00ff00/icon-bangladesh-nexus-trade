
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllLots, Lot, initializeGoogleSheet } from '@/services/googleSheetService';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inventory: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all lots
  useEffect(() => {
    const fetchLots = async () => {
      if (!user?.accessToken) return;
      
      try {
        await initializeGoogleSheet(user.accessToken);
        const lotsData = await getAllLots(user.accessToken);
        setLots(lotsData);
        setFilteredLots(lotsData);
      } catch (error) {
        console.error('Failed to fetch lots:', error);
        toast.error('লট তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLots();
  }, [user]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLots(lots);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = lots.filter(
      lot => 
        lot.lotId.toLowerCase().includes(term) ||
        lot.supplierName.toLowerCase().includes(term) ||
        lot.supplierMobile.includes(term)
    );
    
    setFilteredLots(filtered);
  }, [searchTerm, lots]);
  
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bangladesh-green"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">স্টক/ইনভেন্টরি</h1>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="সার্চ করুন..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate('/lots')}>
            <Plus className="mr-2 h-4 w-4" />
            নতুন লট
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>লট তালিকা</span>
            <span className="text-sm font-normal text-gray-500">মোট: {filteredLots.length} লট</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-semibold">লট আইডি</th>
                  <th className="text-left py-3 font-semibold">সাপ্লায়ার</th>
                  <th className="text-left py-3 font-semibold">মোট পিস</th>
                  <th className="text-left py-3 font-semibold">অবশিষ্ট পিস</th>
                  <th className="text-left py-3 font-semibold">ক্রয় মূল্য</th>
                  <th className="text-left py-3 font-semibold">এন্ট্রি তারিখ</th>
                  <th className="text-left py-3 font-semibold">অবস্থা</th>
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
                      <td className="py-3">
                        <div className="flex items-center">
                          {lot.remainingPieces}
                          {lot.remainingPieces < 10 && lot.remainingPieces > 0 && (
                            <AlertCircle className="h-4 w-4 text-yellow-500 ml-1" />
                          )}
                        </div>
                      </td>
                      <td className="py-3">৳ {lot.totalPrice}</td>
                      <td className="py-3">{formatDate(lot.entryDate)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lot.remainingPieces === 0 
                            ? 'bg-red-100 text-red-800' 
                            : lot.remainingPieces < lot.pieces 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {lot.remainingPieces === 0 
                            ? 'শেষ' 
                            : lot.remainingPieces < lot.pieces 
                              ? 'আংশিক' 
                              : 'পূর্ণ'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-500">
                      {searchTerm ? 'সার্চ ফলাফল পাওয়া যায়নি' : 'কোন লট পাওয়া যায়নি'}
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

export default Inventory;
