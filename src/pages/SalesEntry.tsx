
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadToGoogleDrive } from '@/services/fileUploadService';
import { 
  getAllLots, 
  addSale, 
  Lot, 
  initializeGoogleSheet 
} from '@/services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const SalesEntry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [pieces, setPieces] = useState('');
  const [pricePerPiece, setPricePerPiece] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Get lot information
  useEffect(() => {
    const fetchLots = async () => {
      if (!user?.accessToken) return;
      
      try {
        await initializeGoogleSheet(user.accessToken);
        const lotsData = await getAllLots(user.accessToken);
        // Only show lots with remaining pieces
        setLots(lotsData.filter(lot => lot.remainingPieces > 0));
      } catch (error) {
        console.error('Failed to fetch lots:', error);
        toast.error('লট তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchLots();
  }, [user]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const calculateTotalPrice = () => {
    const pcs = parseInt(pieces, 10) || 0;
    const price = parseFloat(pricePerPiece) || 0;
    return pcs * price;
  };
  
  const calculateProfit = () => {
    const pcs = parseInt(pieces, 10) || 0;
    const salePrice = parseFloat(pricePerPiece) || 0;
    const selectedLotObj = lots.find(lot => lot.lotId === selectedLot);
    const costPrice = selectedLotObj?.pricePerPiece || 0;
    
    return pcs * (salePrice - costPrice);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.accessToken) {
      toast.error('অনুগ্রহ করে আবার লগইন করুন');
      return;
    }
    
    if (!selectedLot) {
      toast.error('একটি লট নির্বাচন করুন');
      return;
    }

    if (!pieces || parseInt(pieces, 10) <= 0) {
      toast.error('পিস সংখ্যা সঠিকভাবে লিখুন');
      return;
    }
    
    const selectedLotObj = lots.find(lot => lot.lotId === selectedLot);
    if (!selectedLotObj) {
      toast.error('নির্বাচিত লট খুঁজে পাওয়া যায়নি');
      return;
    }
    
    if (parseInt(pieces, 10) > selectedLotObj.remainingPieces) {
      toast.error(`পর্যাপ্ত পিস নেই। অবশিষ্ট পিস: ${selectedLotObj.remainingPieces}`);
      return;
    }
    
    if (!pricePerPiece || parseFloat(pricePerPiece) <= 0) {
      toast.error('পিস প্রতি বিক্রয় মূল্য সঠিকভাবে লিখুন');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('ক্রেতার নাম লিখুন');
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload image if provided
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadToGoogleDrive(user.accessToken, image);
      }
      
      // Add sale to Google Sheet
      await addSale(
        user.accessToken,
        selectedLot,
        parseInt(pieces, 10),
        parseFloat(pricePerPiece),
        customerName,
        customerMobile,
        imageUrl
      );
      
      toast.success('নতুন বিক্রয় সফলভাবে সংরক্ষণ করা হয়েছে।');
      
      // Reset form
      setSelectedLot('');
      setPieces('');
      setPricePerPiece('');
      setCustomerName('');
      setCustomerMobile('');
      setImage(null);
      setPreviewUrl(null);
      
      // Refresh lots
      const updatedLots = await getAllLots(user.accessToken);
      setLots(updatedLots.filter(lot => lot.remainingPieces > 0));
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Failed to add sale:', error);
      toast.error('বিক্রয় সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bangladesh-green"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">নতুন বিক্রয় এন্ট্রি</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>বিক্রয় তথ্য</CardTitle>
          <CardDescription>
            নতুন বিক্রয়ের সকল তথ্য এখানে লিখুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lots.length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium text-gray-700">কোন অ্যাক্টিভ লট পাওয়া যায়নি</h3>
              <p className="mt-2 text-gray-500">বিক্রয় এন্ট্রি করার আগে প্রথমে একটি লট যোগ করুন</p>
              <Button className="mt-4" onClick={() => navigate('/lots')}>
                নতুন লট যোগ করুন
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="lotId">লট নির্বাচন করুন</Label>
                    <Select value={selectedLot} onValueChange={setSelectedLot}>
                      <SelectTrigger id="lotId">
                        <SelectValue placeholder="লট নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {lots.map((lot) => (
                          <SelectItem key={lot.lotId} value={lot.lotId}>
                            {lot.lotId} - {lot.supplierName} ({lot.remainingPieces} পিস)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="pieces">পিস সংখ্যা</Label>
                    <Input
                      id="pieces"
                      type="number"
                      min="1"
                      max={selectedLot ? lots.find(lot => lot.lotId === selectedLot)?.remainingPieces || 0 : 0}
                      value={pieces}
                      onChange={(e) => setPieces(e.target.value)}
                      placeholder="বিক্রয় পিস সংখ্যা"
                      required
                    />
                    {selectedLot && (
                      <p className="text-xs text-gray-500 mt-1">
                        অবশিষ্ট পিস: {lots.find(lot => lot.lotId === selectedLot)?.remainingPieces || 0}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="pricePerPiece">পিস প্রতি বিক্রয় মূল্য (৳)</Label>
                    <Input
                      id="pricePerPiece"
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricePerPiece}
                      onChange={(e) => setPricePerPiece(e.target.value)}
                      placeholder="পিস প্রতি বিক্রয় মূল্য"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>মোট বিক্রয় মূল্য (৳)</Label>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md mt-1">
                      ৳ {calculateTotalPrice().toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <Label>অনুমিত লাভ (৳)</Label>
                    <div className="p-2 bg-gray-50 border border-gray-200 rounded-md mt-1 text-bangladesh-green font-semibold">
                      ৳ {calculateProfit().toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="customerName">ক্রেতার নাম</Label>
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ক্রেতার নাম লিখুন"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerMobile">মোবাইল নম্বর</Label>
                    <Input
                      id="customerMobile"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      placeholder="ক্রেতার মোবাইল নম্বর"
                    />
                  </div>
                  
                  <div className="mt-3">
                    <Label>বিক্রয়ের ছবি</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mt-1">
                      {previewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={previewUrl}
                            alt="বিক্রয়ের প্রিভিউ"
                            className="max-h-32 mx-auto object-contain"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImage(null);
                              setPreviewUrl(null);
                            }}
                          >
                            ছবি পরিবর্তন করুন
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <ImagePlus className="h-12 w-12 text-gray-400" />
                          </div>
                          <p className="text-gray-500">বিক্রয়ের ছবি আপলোড করুন</p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('saleImage')?.click()}
                          >
                            ছবি নির্বাচন করুন
                          </Button>
                          <input
                            id="saleImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      সর্বোচ্চ ফাইল সাইজ: 5MB. অনুমোদিত ফরম্যাট: JPG, PNG
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  বাতিল করুন
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'বিক্রয় সংরক্ষণ করুন'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesEntry;
