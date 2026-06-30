import React, { useState, useMemo, useEffect } from 'react';
import { UploadCloud, Search, FileSpreadsheet, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { parseExcelFile, extractUniqueValues } from './utils';
import { ProductRow } from './types';

export default function App() {
  const [data, setData] = useState<ProductRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedLinea, setSelectedLinea] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Extracted unique values for dropdowns
  const lineas = useMemo(() => extractUniqueValues(data, 'linea'), [data]);
  const marcas = useMemo(() => extractUniqueValues(data, 'marca'), [data]);
  const categorias = useMemo(() => extractUniqueValues(data, 'categoria'), [data]);

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
    setSelectedLinea('');
    setSelectedMarca('');
    setSelectedCategoria('');
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Dropdown Filters
      if (selectedLinea && row['linea'] !== selectedLinea) return false;
      if (selectedMarca && row['marca'] !== selectedMarca) return false;
      if (selectedCategoria && row['categoria'] !== selectedCategoria) return false;

      // 2. Global Text Search across all properties (multi-word match)
      if (globalSearch.trim()) {
        const searchTerms = globalSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean);
        const rowString = row._searchString || '';
        
        // Every search term must be found somewhere in the row
        const matchesAllTerms = searchTerms.every(term => rowString.includes(term));
        if (!matchesAllTerms) return false;
      }

      return true;
    });
  }, [data, selectedLinea, selectedMarca, selectedCategoria, globalSearch]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, selectedLinea, selectedMarca, selectedCategoria]);

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
            
            {/* Filters Box */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Global Search */}
              <div className="lg:col-span-1 relative">
                <label className="block text-xs font-medium text-gray-500 mb-1">Búsqueda libre (Nombre, Tags, etc)</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500 shadow-sm"
                    placeholder='Ej. "xiaomi 8" o "celular rojo"'
                  />
                </div>
              </div>

              {/* Linea Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Línea</label>
                <select
                  value={selectedLinea}
                  onChange={(e) => setSelectedLinea(e.target.value)}
                  className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Todas las líneas</option>
                  {lineas.map(linea => <option key={linea} value={linea}>{linea}</option>)}
                </select>
              </div>

              {/* Marca Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Marca</label>
                <select
                  value={selectedMarca}
                  onChange={(e) => setSelectedMarca(e.target.value)}
                  className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Todas las marcas</option>
                  {marcas.map(marca => <option key={marca} value={marca}>{marca}</option>)}
                </select>
              </div>

              {/* Categoria Dropdown */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                <select
                  value={selectedCategoria}
                  onChange={(e) => setSelectedCategoria(e.target.value)}
                  className="block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500 shadow-sm"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
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
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Nombre</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Línea</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Marca</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Cantidad</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Tags</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">Modelo</th>
                      <th className="px-4 py-3 font-medium whitespace-nowrap">SKU / UPC</th>
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
                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            SKU: {row['sku'] || '-'}<br/>
                            UPC: {row['upc'] || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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

