
import { toast } from "sonner";

// Google Sheets API endpoint
const SHEETS_API_ENDPOINT = 'https://sheets.googleapis.com/v4/spreadsheets';
const SPREADSHEET_ID = '18RW6Wxv6ym4cZlFrxIXzrw_zoRnPuDu_OFqzdAoeb5k';

export interface Lot {
  lotId: string;
  supplierName: string;
  supplierMobile: string;
  pieces: number;
  pricePerPiece: number;
  totalPrice: number;
  imageUrl: string;
  entryDate: string;
  status: string;
  remainingPieces: number;
}

export interface Sale {
  saleId: string;
  lotId: string;
  pieces: number;
  pricePerPiece: number;
  totalPrice: number;
  customerName: string;
  customerMobile: string;
  imageUrl: string;
  saleDate: string;
  profit: number;
}

// Initialize the Google Sheets if it doesn't exist yet
export const initializeGoogleSheet = async (accessToken: string) => {
  try {
    console.log("Initializing Google Sheet with token:", accessToken?.substring(0, 10) + "...");
    
    // First check if the spreadsheet exists and has the required sheets
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}?fields=sheets.properties.title`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Spreadsheet API response not OK:', response.status, response.statusText);
      if (response.status === 404) {
        toast.error('গুগল শিট খুঁজে পাওয়া যায়নি। স্প্রেডশিট আইডি চেক করুন।');
        return false;
      }
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      toast.error('গুগল শিট সেটআপ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Sheets data:", data);
    
    if (!data.sheets || !Array.isArray(data.sheets)) {
      console.error('Unexpected sheets data format:', data);
      toast.error('গুগল শিট ডেটা ফরম্যাট অপ্রত্যাশিত। আবার চেষ্টা করুন।');
      return false;
    }
    
    const existingSheets = data.sheets.map((sheet: any) => sheet.properties.title);
    console.log("Existing sheets:", existingSheets);
    
    // Define the sheets we need
    const requiredSheets = ['Lots', 'Sales', 'Inventory', 'Config'];
    const sheetsToCreate = requiredSheets.filter(sheet => !existingSheets.includes(sheet));
    console.log("Sheets to create:", sheetsToCreate);
    
    // Create missing sheets
    if (sheetsToCreate.length > 0) {
      for (const sheetTitle of sheetsToCreate) {
        await createSheet(accessToken, sheetTitle);
      }
      
      // Set up headers for each sheet
      await setupSheetHeaders(accessToken, 'Lots', [
        'লট আইডি', 'সাপ্লায়ারের নাম', 'মোবাইল নম্বর', 'পিস সংখ্যা', 
        'পিস প্রতি ক্রয় মূল্য', 'মোট ক্রয় মূল্য', 'ছবি লিঙ্ক', 'এন্ট্রির তারিখ', 'স্ট্যাটাস', 'অবশিষ্ট পিস'
      ]);
      
      await setupSheetHeaders(accessToken, 'Sales', [
        'বিক্রয় আইডি', 'লট আইডি', 'পিস সংখ্যা', 'পিস প্রতি বিক্রয় মূল্য', 
        'মোট বিক্রয় মূল্য', 'ক্রেতার নাম', 'মোবাইল নম্বর', 'ছবি লিঙ্ক', 'বিক্রয়ের তারিখ', 'লাভ'
      ]);
      
      await setupSheetHeaders(accessToken, 'Inventory', [
        'লট আইডি', 'মোট পিস', 'বিক্রিত পিস', 'অবশিষ্ট পিস', 'আপডেট তারিখ'
      ]);
      
      await setupSheetHeaders(accessToken, 'Config', [
        'সেটিং নাম', 'মান'
      ]);
      
      // Initialize config with last IDs
      await addRowToSheet(accessToken, 'Config', ['LastLotID', 'LOT-000']);
      await addRowToSheet(accessToken, 'Config', ['LastSaleID', 'SALE-000']);
      
      toast.success('গুগল শিট সফলভাবে সেটআপ করা হয়েছে।');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Google Sheet:', error);
    toast.error('গুগল শিট সেটআপ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return false;
  }
};

const createSheet = async (accessToken: string, title: string) => {
  try {
    console.log(`Creating sheet: ${title}`);
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title,
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error creating sheet ${title}:`, response.status, errorText);
      throw new Error(`Error creating sheet: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Sheet created successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to create sheet ${title}:`, error);
    throw error;
  }
};

const setupSheetHeaders = async (accessToken: string, sheetName: string, headers: string[]) => {
  try {
    console.log(`Setting up headers for ${sheetName}:`, headers);
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/${sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headers],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error setting up headers for ${sheetName}:`, response.status, errorText);
      throw new Error(`Error setting up headers: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Headers set up successfully for ${sheetName}:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to set headers for ${sheetName}:`, error);
    throw error;
  }
};

// Get the next ID (LOT-XXX or SALE-XXX)
export const getNextId = async (accessToken: string, type: 'LOT' | 'SALE') => {
  try {
    console.log(`Getting next ${type} ID`);
    const configKey = type === 'LOT' ? 'LastLotID' : 'LastSaleID';
    
    // Get the current ID from Config sheet
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Config!A:B`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching config:`, response.status, errorText);
      throw new Error(`Error fetching config: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Config data:`, data);
    const rows = data.values || [];
    let lastIdRow = rows.find((row: string[]) => row[0] === configKey);
    
    if (!lastIdRow) {
      console.log(`${configKey} not found in config, creating it`);
      // If config doesn't exist, create it
      await addRowToSheet(accessToken, 'Config', [configKey, `${type}-000`]);
      lastIdRow = [configKey, `${type}-000`];
    }
    
    // Parse the current ID and increment
    const lastId = lastIdRow[1];
    console.log(`Last ${type} ID:`, lastId);
    const currentNumber = parseInt(lastId.split('-')[1], 10);
    const nextNumber = currentNumber + 1;
    const nextId = `${type}-${nextNumber.toString().padStart(3, '0')}`;
    console.log(`Next ${type} ID:`, nextId);
    
    // Update the config with the new ID
    await updateConfigValue(accessToken, configKey, nextId);
    
    return nextId;
  } catch (error) {
    console.error(`Failed to get next ${type} ID:`, error);
    toast.error(`নতুন ${type} আইডি তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।`);
    throw error;
  }
};

const updateConfigValue = async (accessToken: string, key: string, value: string) => {
  try {
    // First get all config values to find the row index
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Config!A:B`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching config: ${await response.text()}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    // Find the row with the key
    const rowIndex = rows.findIndex((row: string[]) => row[0] === key);
    
    if (rowIndex === -1) {
      // Key doesn't exist, add it
      await addRowToSheet(accessToken, 'Config', [key, value]);
      return;
    }
    
    // Update the existing key
    const updateResponse = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Config!B${rowIndex + 1}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[value]],
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Error updating config: ${await updateResponse.text()}`);
    }

    return await updateResponse.json();
  } catch (error) {
    console.error(`Failed to update config value for ${key}:`, error);
    throw error;
  }
};

// Add a row to a sheet
export const addRowToSheet = async (accessToken: string, sheetName: string, rowData: any[]) => {
  try {
    // Get the current row count to determine the next row
    const countResponse = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/${sheetName}!A:A`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!countResponse.ok) {
      throw new Error(`Error fetching row count: ${await countResponse.text()}`);
    }

    const countData = await countResponse.json();
    const rowCount = countData.values ? countData.values.length : 0;
    const nextRow = rowCount + 1;

    // Add the new row
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/${sheetName}!A${nextRow}:${String.fromCharCode(65 + rowData.length - 1)}${nextRow}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    if (!response.ok) {
      throw new Error(`Error adding row: ${await response.text()}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to add row to ${sheetName}:`, error);
    toast.error('ডেটা সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    throw error;
  }
};

// Get all lots from the sheet
export const getAllLots = async (accessToken: string): Promise<Lot[]> => {
  try {
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Lots!A2:J`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching lots: ${await response.text()}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    return rows.map((row: string[]) => ({
      lotId: row[0] || '',
      supplierName: row[1] || '',
      supplierMobile: row[2] || '',
      pieces: parseInt(row[3], 10) || 0,
      pricePerPiece: parseFloat(row[4]) || 0,
      totalPrice: parseFloat(row[5]) || 0,
      imageUrl: row[6] || '',
      entryDate: row[7] || new Date().toISOString(),
      status: row[8] || 'Active',
      remainingPieces: parseInt(row[9], 10) || 0
    }));
  } catch (error) {
    console.error('Failed to fetch lots:', error);
    toast.error('লট তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return [];
  }
};

// Get all sales from the sheet
export const getAllSales = async (accessToken: string): Promise<Sale[]> => {
  try {
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Sales!A2:J`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching sales: ${await response.text()}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    return rows.map((row: string[]) => ({
      saleId: row[0] || '',
      lotId: row[1] || '',
      pieces: parseInt(row[2], 10) || 0,
      pricePerPiece: parseFloat(row[3]) || 0,
      totalPrice: parseFloat(row[4]) || 0,
      customerName: row[5] || '',
      customerMobile: row[6] || '',
      imageUrl: row[7] || '',
      saleDate: row[8] || new Date().toISOString(),
      profit: parseFloat(row[9]) || 0
    }));
  } catch (error) {
    console.error('Failed to fetch sales:', error);
    toast.error('বিক্রয় তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    return [];
  }
};

// Add a new lot
export const addLot = async (
  accessToken: string, 
  supplierName: string,
  supplierMobile: string,
  pieces: number,
  pricePerPiece: number,
  imageUrl: string
) => {
  try {
    const lotId = await getNextId(accessToken, 'LOT');
    const totalPrice = pieces * pricePerPiece;
    const entryDate = new Date().toISOString();
    
    await addRowToSheet(accessToken, 'Lots', [
      lotId,
      supplierName,
      supplierMobile,
      pieces.toString(),
      pricePerPiece.toString(),
      totalPrice.toString(),
      imageUrl,
      entryDate,
      'Active',
      pieces.toString() // Initially remaining pieces equals total pieces
    ]);
    
    // Also update the inventory sheet
    await addRowToSheet(accessToken, 'Inventory', [
      lotId,
      pieces.toString(),
      '0', // No pieces sold initially
      pieces.toString(),
      entryDate
    ]);
    
    toast.success('নতুন লট সফলভাবে সংরক্ষণ করা হয়েছে।');
    return lotId;
  } catch (error) {
    console.error('Failed to add lot:', error);
    toast.error('লট সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    throw error;
  }
};

// Add a new sale
export const addSale = async (
  accessToken: string,
  lotId: string,
  pieces: number,
  pricePerPiece: number,
  customerName: string,
  customerMobile: string,
  imageUrl: string
) => {
  try {
    // First, get the lot to calculate profit and check if enough pieces remain
    const lots = await getAllLots(accessToken);
    const lot = lots.find(l => l.lotId === lotId);
    
    if (!lot) {
      toast.error('লট খুঁজে পাওয়া যায়নি।');
      throw new Error('Lot not found');
    }
    
    if (lot.remainingPieces < pieces) {
      toast.error(`পর্যাপ্ত পিস নেই। অবশিষ্ট পিস: ${lot.remainingPieces}`);
      throw new Error('Not enough pieces remaining');
    }
    
    const saleId = await getNextId(accessToken, 'SALE');
    const totalPrice = pieces * pricePerPiece;
    const saleDate = new Date().toISOString();
    const profit = totalPrice - (pieces * lot.pricePerPiece);
    
    await addRowToSheet(accessToken, 'Sales', [
      saleId,
      lotId,
      pieces.toString(),
      pricePerPiece.toString(),
      totalPrice.toString(),
      customerName,
      customerMobile,
      imageUrl,
      saleDate,
      profit.toString()
    ]);
    
    // Update the lot's remaining pieces
    await updateLotRemainingPieces(accessToken, lotId, lot.remainingPieces - pieces);
    
    // Update the inventory sheet
    await updateInventoryAfterSale(accessToken, lotId, pieces);
    
    toast.success('নতুন বিক্রয় সফলভাবে সংরক্ষণ করা হয়েছে।');
    return saleId;
  } catch (error) {
    console.error('Failed to add sale:', error);
    if (error instanceof Error && error.message === 'Not enough pieces remaining') {
      // Already showed toast in the check above
    } else {
      toast.error('বিক্রয় সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
    throw error;
  }
};

const updateLotRemainingPieces = async (accessToken: string, lotId: string, remainingPieces: number) => {
  try {
    // Find the row with the lot ID
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Lots!A:A`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching lots: ${await response.text()}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    // Find the row index with the lot ID (first column)
    const rowIndex = rows.findIndex((row: string[]) => row[0] === lotId);
    
    if (rowIndex === -1) {
      throw new Error('Lot not found');
    }
    
    // Update the remaining pieces column (J)
    const updateResponse = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Lots!J${rowIndex + 1}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[remainingPieces.toString()]],
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Error updating lot: ${await updateResponse.text()}`);
    }

    return await updateResponse.json();
  } catch (error) {
    console.error(`Failed to update lot ${lotId}:`, error);
    throw error;
  }
};

const updateInventoryAfterSale = async (accessToken: string, lotId: string, soldPieces: number) => {
  try {
    // Find the inventory row with the lot ID
    const response = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Inventory!A:E`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching inventory: ${await response.text()}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    // Find the row with the lot ID
    const rowIndex = rows.findIndex((row: string[]) => row[0] === lotId);
    
    if (rowIndex === -1) {
      throw new Error('Inventory entry not found');
    }
    
    // Get current values
    const totalPieces = parseInt(rows[rowIndex][1], 10) || 0;
    const currentSoldPieces = parseInt(rows[rowIndex][2], 10) || 0;
    const newSoldPieces = currentSoldPieces + soldPieces;
    const newRemainingPieces = totalPieces - newSoldPieces;
    const updateDate = new Date().toISOString();
    
    // Update the sold and remaining pieces
    const updateResponse = await fetch(`${SHEETS_API_ENDPOINT}/${SPREADSHEET_ID}/values/Inventory!C${rowIndex + 1}:E${rowIndex + 1}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[newSoldPieces.toString(), newRemainingPieces.toString(), updateDate]],
      }),
    });

    if (!updateResponse.ok) {
      throw new Error(`Error updating inventory: ${await updateResponse.text()}`);
    }

    return await updateResponse.json();
  } catch (error) {
    console.error(`Failed to update inventory for lot ${lotId}:`, error);
    throw error;
  }
};

// Get summary statistics for dashboard
export const getDashboardStats = async (accessToken: string) => {
  try {
    // Get all lots and sales
    const lots = await getAllLots(accessToken);
    const sales = await getAllSales(accessToken);
    
    // Calculate summary statistics
    const totalLots = lots.length;
    const activeLots = lots.filter(lot => lot.remainingPieces > 0).length;
    const totalPieces = lots.reduce((sum, lot) => sum + lot.pieces, 0);
    const remainingPieces = lots.reduce((sum, lot) => sum + lot.remainingPieces, 0);
    const soldPieces = totalPieces - remainingPieces;
    
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    
    // Get monthly sales for charts
    const monthlySales = getMonthlyData(sales, 'saleDate', 'totalPrice');
    const monthlyProfit = getMonthlyData(sales, 'saleDate', 'profit');
    
    // Get top selling lots
    const lotSales = sales.reduce((acc: Record<string, number>, sale) => {
      if (!acc[sale.lotId]) acc[sale.lotId] = 0;
      acc[sale.lotId] += sale.pieces;
      return acc;
    }, {});
    
    const topSellingLots = Object.entries(lotSales)
      .map(([lotId, pieces]) => {
        const lot = lots.find(l => l.lotId === lotId);
        return {
          lotId,
          supplierName: lot?.supplierName || 'Unknown',
          totalSold: pieces,
          totalPieces: lot?.pieces || 0,
          percentage: lot ? (pieces / lot.pieces) * 100 : 0
        };
      })
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
    
    return {
      totalLots,
      activeLots,
      totalPieces,
      remainingPieces,
      soldPieces,
      totalSales,
      totalRevenue,
      totalProfit,
      monthlySales,
      monthlyProfit,
      topSellingLots
    };
  } catch (error) {
    console.error('Failed to get dashboard stats:', error);
    toast.error('ড্যাশবোর্ড তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    throw error;
  }
};

const getMonthlyData = (data: any[], dateField: string, valueField: string) => {
  const monthlyData: Record<string, number> = {};
  
  // Initialize last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthYear] = 0;
  }
  
  // Add actual data
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (monthlyData[monthYear] !== undefined) {
      monthlyData[monthYear] += item[valueField];
    }
  });
  
  // Convert to array for charts
  return Object.entries(monthlyData).map(([month, value]) => ({
    month,
    value
  }));
};
