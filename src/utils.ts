import * as XLSX from 'xlsx';
import { ProductRow } from './types';

const normalizeKey = (key: string) => {
  return key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const parseExcelFile = (file: File): Promise<ProductRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('No data found in file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        
        let jsonData: any[] = [];
        
        // Find the first sheet that actually has data
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
          if (sheetData.length > 0) {
            jsonData = sheetData;
            break;
          }
        }

        // Normalize keys to prevent errors due to capitalization, spaces or accents
        const normalizedData = jsonData.map(row => {
          const newRow: any = {};
          for (const key in row) {
            newRow[normalizeKey(key)] = row[key];
          }
          // Store a single string combining all values for fast global search
          newRow._searchString = Object.values(newRow)
            .join(' ')
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return newRow;
        });

        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsArrayBuffer(file);
  });
};

export const extractUniqueValues = (data: ProductRow[], key: string): string[] => {
  const values = data.map(item => item[key]).filter(val => val !== undefined && val !== null && val !== '') as string[];
  return Array.from(new Set(values)).sort();
};
