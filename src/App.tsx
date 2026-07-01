import React, { useState, useMemo, useEffect } from 'react';
import { UploadCloud, Search, FileSpreadsheet, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { parseExcelFile } from './utils';
import { ProductRow } from './types';

function FilterableHeader({ 
  title, 
  columnKey, 
  baseData, 
  columnFilters, 
  toggleColumnFilter, 
  clearColumnFilter 
}: {
  title: string;
  columnKey: string;
  baseData: ProductRow[];
  columnFilters: Record<string, Set<string>>;
  toggleColumnFilter: (col: string, val: string) => void;
  clearColumnFilter: (col: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const uniqueValues = useMemo(() => {
    const vals = baseData.map(row => String(row[columnKey] ?? ''));
    return Array.from(new Set(vals)).filter(Boolean).sort();
  }, [baseData, columnKey]);
  
  const selected = columnFilters[columnKey] || new Set();

  return (
    <th className="px-4 py-3 font-medium whitespace-nowrap relative select-none">
      <div 
        className="flex items-center space-x-1 cursor-pointer hover:text-blue-600 inline-flex"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <Filter className={`h-3.5 w-3.5 ${selected.size > 0 ? 'text-blue-600 fill-blue-100' : 'text-gray-400'}`} />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-md z-20 max-h-72 flex flex-col font-normal text-gray-900 normal-case">
            <div className="p-2 border-b border-gray-100 font-semibold text-xs text-gray-700 bg-gray-50 flex justify-between items-center rounded-t-md">
              <span>Filtrar {title}</span>
              {selected.size > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); clearColumnFilter(columnKey); }}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="overflow-y-auto p-2 space-y-1">
              {uniqueValues.length === 0 ? (
                <div className="text-gray-500 text-xs py-2 px-1">Sin valores</div>
              ) : (
                uniqueValues.map(val => (
                  <label key={val} className="flex items-start space-x-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={selected.has(val)}
                      onChange={() => toggleColumnFilter(columnKey, val)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 break-words">{val || '(Vacío)'}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </th>
  );
}

export default function App() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const toggleColumnFilter = (columnKey: string, value: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      if (!newFilters[columnKey]) newFilters[columnKey] = new Set();
      
      const newSet = new Set(newFilters[columnKey]);
      if (newSet.has(value)) newSet.delete(value);
      else newSet.add(value);
      
      if (newSet.size === 0) delete newFilters[columnKey];
      else newFilters[columnKey] = newSet;
      
      return newFilters;
    });
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setError('Por favor sube un archivo .xlsx válido.');
      return;
    }

    setIsParsing(true);
    setError(null);
    setFileName(file.name);

    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      resetFilters();
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar el archivo. Asegúrate de que tenga un formato válido.');
      setData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const resetFilters = () => {
    setGlobalSearch('');
    setColumnFilters({});
    setCurrentPage(1);
  };

  const baseData = useMemo(() => {
    if (!globalSearch.trim()) return data;

    const searchTerms = globalSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean);
    
    let currentMatches = [...data];
    
    for (const term of searchTerms) {
      const nextMatches = currentMatches.filter(row => {
        const searchStr = row._searchString || '';
        return searchStr.includes(term);
      });
      
      // Búsqueda inteligente: Si un término no existe en ninguna parte de los resultados restantes (ej. un error de tipeo), 
      // lo ignoramos en vez de borrar toda la lista. Así no se pierden los resultados por una palabra extraña.
      if (nextMatches.length > 0) {
        currentMatches = nextMatches;
      }
    }
    return currentMatches;
  }, [data, globalSearch]);

  const filteredData = useMemo(() => {
    return baseData.filter(row => {
      for (const [colKey, selectedSet] of Object.entries(columnFilters)) {
        if (selectedSet.size > 0) {
          const rowVal = String(row[colKey] ?? '');
          if (!selectedSet.has(rowVal)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [baseData, columnFilters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, columnFilters]);

  const removeFile = () => {
    setData([]);
    setFileName('');
    resetFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visor de Datos</h1>
            <p className="text-sm text-gray-500 mt-1">Busca y filtra tus productos fácilmente.</p>
          </div>

          {/* Upload Area */}
          {!data.length && !isParsing && (
            <label className="relative flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-6 py-4 hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-2">
                <UploadCloud className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Subir archivo .xlsx</span>
              </div>
              <input type="file" accept=".xlsx" className="sr-only" onChange={handleFileUpload} />
            </label>
          )}

          {isParsing && (
            <div className="flex items-center space-x-2 px-6 py-4 bg-white rounded-md border border-gray-200 shadow-sm">
              <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
              <span className="text-sm text-gray-600">Procesando archivo...</span>
            </div>
          )}

          {data.length > 0 && (
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{fileName}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">{data.length} filas</span>
              <button onClick={removeFile} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </header>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Main Content Area */}
        {data.length > 0 && (
          <div className="space-y-4">
            
            {/* Search Box */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="block w-full rounded-md border-gray-300 bg-gray-50 py-3 pl-10 pr-3 text-base focus:border-blue-500 focus:bg-white focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            {/* Results Count & Pagination top */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600">
              <p>Mostrando {filteredData.length} resultados de {data.length}</p>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2">Página {currentPage} de {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <FilterableHeader title="Nombre" columnKey="nombre" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="Línea" columnKey="linea" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="Marca" columnKey="marca" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="Cantidad" columnKey="cantidad" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="Tags" columnKey="tags" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="Modelo" columnKey="modelo" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="SKU" columnKey="sku" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                      <FilterableHeader title="UPC" columnKey="upc" baseData={baseData} columnFilters={columnFilters} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentData.length > 0 ? (
                      currentData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900 min-w-[200px]">{row['nombre'] || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{row['linea'] || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{row['marca'] || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-blue-600">{row['cantidad'] ?? '-'}</td>
                          <td className="px-4 py-3 min-w-[200px] text-xs text-gray-500">{row['tags'] || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{row['modelo'] || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs">{row['sku'] || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs">{row['upc'] || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          No se encontraron resultados con los filtros actuales.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Bottom */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 pb-8">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="px-2">Página {currentPage} de {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}

