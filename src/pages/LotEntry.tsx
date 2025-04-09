
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadToGoogleDrive } from '@/services/fileUploadService';
import { addLot, initializeGoogleSheet } from '@/services/googleSheetService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ImagePlus } from 'lucide-react';

const LotEntry: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [supplierName, setSupplierName] = useState('');
  const [supplierMobile, setSupplierMobile] = useState('');
  const [pieces, setPieces] = useState('');
  const [pricePerPiece, setPricePerPiece] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.accessToken) {
      toast.error('অনুগ্রহ করে আবার লগইন করুন');
      return;
    }
    
    if (!supplierName.trim()) {
      toast.error('সাপ্লায়ারের নাম লিখুন');
      return;
    }
    
    if (!supplierMobile.trim()) {
      toast.error('সাপ্লায়ারের মোবাইল নম্বর লিখুন');
      return;
    }
    
    if (!pieces || parseInt(pieces, 10) <= 0) {
      toast.error('পিস সংখ্যা সঠিকভাবে লিখুন');
      return;
    }
    
    if (!pricePerPiece || parseFloat(pricePerPiece) <= 0) {
      toast.error('পিস প্রতি ক্রয় মূল্য সঠিকভাবে লিখুন');
      return;
    }
    
    try {
      setLoading(true);
      
      // Initialize Google Sheet if needed
      await initializeGoogleSheet(user.accessToken);
      
      // Upload image if provided
      let imageUrl = '';
      if (image) {
        imageUrl = await uploadToGoogleDrive(user.accessToken, image);
      }
      
      // Add lot to Google Sheet
      await addLot(
        user.accessToken,
        supplierName,
        supplierMobile,
        parseInt(pieces, 10),
        parseFloat(pricePerPiece),
        imageUrl
      );
      
      toast.success('নতুন লট সফলভাবে সংরক্ষণ করা হয়েছে।');
      
      // Reset form
      setSupplierName('');
      setSupplierMobile('');
      setPieces('');
      setPricePerPiece('');
      setImage(null);
      setPreviewUrl(null);
      
      // Navigate to inventory
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to add lot:', error);
      toast.error('লট সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">নতুন লট এন্ট্রি</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>লট তথ্য</CardTitle>
          <CardDescription>
            নতুন গার্মেন্টস লটের সকল তথ্য এখানে লিখুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="supplierName">সাপ্লায়ারের নাম</Label>
                  <Input
                    id="supplierName"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="সাপ্লায়ারের নাম লিখুন"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplierMobile">মোবাইল নম্বর</Label>
                  <Input
                    id="supplierMobile"
                    value={supplierMobile}
                    onChange={(e) => setSupplierMobile(e.target.value)}
                    placeholder="সাপ্লায়ারের মোবাইল নম্বর"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pieces">পিস সংখ্যা</Label>
                  <Input
                    id="pieces"
                    type="number"
                    min="1"
                    value={pieces}
                    onChange={(e) => setPieces(e.target.value)}
                    placeholder="মোট পিস সংখ্যা"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="pricePerPiece">পিস প্রতি ক্রয় মূল্য (৳)</Label>
                  <Input
                    id="pricePerPiece"
                    type="number"
                    min="0"
                    step="0.01"
                    value={pricePerPiece}
                    onChange={(e) => setPricePerPiece(e.target.value)}
                    placeholder="পিস প্রতি ক্রয় মূল্য"
                    required
                  />
                </div>
                
                <div>
                  <Label>মোট ক্রয় মূল্য (৳)</Label>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-md mt-1">
                    ৳ {calculateTotalPrice().toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>লটের ছবি</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="লটের প্রিভিউ"
                        className="max-h-60 mx-auto object-contain"
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
                        <ImagePlus className="h-16 w-16 text-gray-400" />
                      </div>
                      <p className="text-gray-500">লটের ছবি আপলোড করুন</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('lotImage')?.click()}
                      >
                        ছবি নির্বাচন করুন
                      </Button>
                      <input
                        id="lotImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  সর্বোচ্চ ফাইল সাইজ: 5MB. অনুমোদিত ফরম্যাট: JPG, PNG
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/inventory')}
                disabled={loading}
              >
                বাতিল করুন
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'সংরক্ষণ হচ্ছে...' : 'লট সংরক্ষণ করুন'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LotEntry;
