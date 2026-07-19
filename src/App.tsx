import React, { useState, useMemo, useEffect } from 'react';
import { UploadCloud, Search, FileSpreadsheet, X, ChevronLeft, ChevronRight, Filter, RefreshCw, Copy, Check, Store, Warehouse, ExternalLink, Share } from 'lucide-react';
import { get, set, del } from 'idb-keyval';
import { parseExcelFile } from './utils';
import { ProductRow } from './types';

function FilterableHeader({ 
  title, 
  columnKey, 
  filteredData,
  columnFilters,
  columnSearchTags,
  facetCounts,
  toggleColumnFilter, 
  clearColumnFilter,
  addColumnSearchTag,
  removeColumnSearchTag,
  cantidadColorFilter,
  setCantidadColorFilter
}: {
  title: string;
  columnKey: string;
  filteredData: ProductRow[];
  columnFilters: Record<string, Set<string>>;
  columnSearchTags: Record<string, string[]>;
  facetCounts: Record<string, number>;
  toggleColumnFilter: (col: string, val: string) => void;
  clearColumnFilter: (col: string) => void;
  addColumnSearchTag: (col: string, tag: string) => void;
  removeColumnSearchTag: (col: string, tag: string) => void;
  cantidadColorFilter?: 'all' | 'green' | 'yellow' | 'red';
  setCantidadColorFilter?: (val: 'all' | 'green' | 'yellow' | 'red') => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionPrefixText, setActionPrefixText] = useState('');
  
  const selected = columnFilters[columnKey] || new Set();
  const tags = columnSearchTags[columnKey] || [];
  
  const uniqueValues = useMemo(() => {
    const counts = facetCounts || {};
    const vals = new Set([...Object.keys(counts), ...Array.from(selected)]);
    return Array.from(vals).filter(Boolean).sort();
  }, [facetCounts, selected]);
  
  const hasFilters = selected.size > 0 || tags.length > 0;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const values = filteredData.map(row => row[columnKey]).filter(val => val != null && val !== '');
    let textToCopy = values.join('\n');
    
    if (textToCopy) {
      if (columnKey === 'nombre' && actionPrefixText.trim()) {
        textToCopy = `${actionPrefixText.trim()}\n\n${textToCopy}`;
      }
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowActionMenu(false);
    }
  };

  const handleSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const values = filteredData.map(row => row[columnKey]).filter(val => val != null && val !== '');
    let textToSearch = values.join('\n');
    
    if (textToSearch && columnKey === 'nombre') {
      if (actionPrefixText.trim()) {
        textToSearch = `${actionPrefixText.trim()}\n\n${textToSearch}`;
      }
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(textToSearch)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      setShowActionMenu(false);
    }
  };

  const handleCantidadColorToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!setCantidadColorFilter) return;
    
    if (cantidadColorFilter === 'all') setCantidadColorFilter('green');
    else if (cantidadColorFilter === 'green') setCantidadColorFilter('yellow');
    else if (cantidadColorFilter === 'yellow') setCantidadColorFilter('red');
    else setCantidadColorFilter('all');
  };

  const getCircleColor = () => {
    if (cantidadColorFilter === 'green') return 'bg-emerald-500';
    if (cantidadColorFilter === 'yellow') return 'bg-amber-400';
    if (cantidadColorFilter === 'red') return 'bg-red-500';
    return 'bg-gradient-to-tr from-emerald-500 via-amber-400 to-red-500';
  };

  return (
    <th className="px-4 py-3 font-medium relative select-none align-top min-w-[150px]">
      <div className="flex items-center justify-between mb-2">
        <div 
          className="flex items-center space-x-1 cursor-pointer hover:text-blue-600 inline-flex"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{title}</span>
          <Filter className={`h-3.5 w-3.5 ${hasFilters ? 'text-blue-600 fill-blue-100' : 'text-gray-400'}`} />
        </div>
        <div className="flex items-center space-x-1">
          {columnKey === 'cantidad' && setCantidadColorFilter && (
            <button
              onClick={handleCantidadColorToggle}
              className="text-gray-400 hover:text-blue-600 rounded p-1 transition-colors flex items-center justify-center"
              title="Filtrar por estado de cantidad"
            >
              <div className={`h-3.5 w-3.5 rounded-full ${getCircleColor()}`}></div>
            </button>
          )}
          {columnKey === 'nombre' ? (
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowActionMenu(!showActionMenu); }}
                className={`rounded p-1 transition-colors ${showActionMenu ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'}`}
                title="Opciones de exportación"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share className="h-4 w-4" />}
              </button>
              {showActionMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowActionMenu(false); }}></div>
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-xl rounded-md z-20 flex flex-col font-normal text-gray-900 normal-case cursor-default p-3" onClick={(e) => e.stopPropagation()}>
                    <label className="text-xs font-semibold text-gray-700 mb-1 block">Texto inicial (opcional)</label>
                    <textarea 
                      value={actionPrefixText}
                      onChange={(e) => setActionPrefixText(e.target.value)}
                      placeholder="Ej: comparativa de modelos..."
                      className="w-full border border-gray-300 rounded text-xs p-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={handleCopy}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 font-medium"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </button>
                      <button 
                        onClick={handleSearch}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 font-medium"
                      >
                        <Search className="h-3.5 w-3.5" />
                        Buscar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              onClick={handleCopy}
              className="text-gray-400 hover:text-blue-600 rounded p-1 transition-colors"
              title="Copiar lista visible"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          )}
          {hasFilters && (
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                clearColumnFilter(columnKey); 
              }}
              className="text-gray-400 hover:text-red-600 rounded p-1 transition-colors"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="font-normal text-gray-900">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (tagInput.trim()) {
              addColumnSearchTag(columnKey, tagInput.trim());
              setTagInput('');
            }
          }}
          className="w-full"
        >
          <input 
            type="search"
            enterKeyHint="search"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Filtro (+Enter)"
            className="w-full border border-gray-300 rounded text-xs px-2 py-1.5 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
          />
        </form>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {tags.map((tag, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 leading-none max-w-full">
                <span className="truncate" title={tag}>{tag}</span>
                <button onClick={(e) => { e.stopPropagation(); removeColumnSearchTag(columnKey, tag); }} className="hover:text-red-600 shrink-0">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-md z-20 max-h-96 flex flex-col font-normal text-gray-900 normal-case">
            <div className="p-2 border-b border-gray-100 font-semibold text-xs text-gray-700 bg-gray-50 rounded-t-md">
              <span>Filtrar valores únicos</span>
            </div>

            <div className="overflow-y-auto p-2 space-y-1 max-h-60 bg-white rounded-b-md">
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
                    <span className="text-gray-700 break-words flex-1">{val || '(Vacío)'}</span>
                    <span className="text-gray-400 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full font-medium">
                      {facetCounts?.[val] || 0}
                    </span>
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
  const [isRestoring, setIsRestoring] = useState(true);
  
  const [auxData, setAuxData] = useState<ProductRow[]>([]);
  const [auxFileName, setAuxFileName] = useState<string>('');
  const [isParsingAux, setIsParsingAux] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Filters
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [columnSearchTags, setColumnSearchTags] = useState<Record<string, string[]>>({});
  const [locationFilter, setLocationFilter] = useState<'all' | 'exhibited' | 'bodega'>('all');
  const [cantidadColorFilter, setCantidadColorFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    const restoreState = async () => {
      try {
        const storedData = await get('app-data');
        const storedFileName = await get('app-fileName');
        const storedAuxData = await get('app-auxData');
        const storedAuxFileName = await get('app-auxFileName');
        
        if (storedData && storedFileName) {
          setData(storedData);
          setFileName(storedFileName);
        }
        
        if (storedAuxData && storedAuxFileName) {
          setAuxData(storedAuxData);
          setAuxFileName(storedAuxFileName);
        }
      } catch (error) {
        console.error('Failed to restore from IndexedDB', error);
      } finally {
        setIsRestoring(false);
      }
    };
    
    restoreState();
  }, []);

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

  const addColumnSearchTag = (columnKey: string, tag: string) => {
    setColumnSearchTags(prev => {
      const newTags = prev[columnKey] ? [...prev[columnKey]] : [];
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
      return { ...prev, [columnKey]: newTags };
    });
  };

  const removeColumnSearchTag = (columnKey: string, tag: string) => {
    setColumnSearchTags(prev => {
      const newTags = (prev[columnKey] || []).filter(t => t !== tag);
      const newState = { ...prev, [columnKey]: newTags };
      if (newTags.length === 0) delete newState[columnKey];
      return newState;
    });
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
    setColumnSearchTags(prev => {
      const newTags = { ...prev };
      delete newTags[columnKey];
      return newTags;
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
      const parsedData = await parseExcelFile(file, true);
      setData(parsedData);
      set('app-data', parsedData).catch(console.error);
      set('app-fileName', file.name).catch(console.error);
      resetFilters();
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar el archivo. Asegúrate de que tenga un formato válido.');
      setData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAuxFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      setError('Por favor sube un archivo .xlsx válido para la base auxiliar.');
      return;
    }

    setIsParsingAux(true);
    setError(null);
    setAuxFileName(file.name);

    try {
      const parsedData = await parseExcelFile(file);
      setAuxData(parsedData);
      set('app-auxData', parsedData).catch(console.error);
      set('app-auxFileName', file.name).catch(console.error);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar el archivo auxiliar.');
      setAuxData([]);
    } finally {
      setIsParsingAux(false);
    }
  };

  const removeAuxFile = () => {
    setAuxData([]);
    setAuxFileName('');
    del('app-auxData').catch(console.error);
    del('app-auxFileName').catch(console.error);
  };

  const exhibitedSet = useMemo(() => {
    const set = new Set<string>();
    for (const row of auxData) {
      const sku = String(row['sku'] ?? '').trim().toLowerCase();
      const linea = String(row['linea'] ?? '').trim().toLowerCase();
      const marca = String(row['marca'] ?? '').trim().toLowerCase();
      if (sku || linea || marca) {
        set.add(`${sku}|${linea}|${marca}`);
      }
    }
    return set;
  }, [auxData]);

  const resetFilters = () => {
    setGlobalSearch('');
    setColumnFilters({});
    setColumnSearchTags({});
    setCurrentPage(1);
  };

  const resetColumnFilters = () => {
    setColumnFilters({});
    setColumnSearchTags({});
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
      if (locationFilter !== 'all') {
        const isExhibited = exhibitedSet.has(`${String(row['sku'] ?? '').trim().toLowerCase()}|${String(row['linea'] ?? '').trim().toLowerCase()}|${String(row['marca'] ?? '').trim().toLowerCase()}`);
        if (locationFilter === 'exhibited' && !isExhibited) return false;
        if (locationFilter === 'bodega' && isExhibited) return false;
      }

      for (const [colKey, tags] of Object.entries(columnSearchTags)) {
        if (tags.length > 0) {
          const rowVal = String(row[colKey] ?? '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let tagMatched = false;
          for (const tag of tags) {
            const normalizedTag = tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (rowVal.includes(normalizedTag)) {
              tagMatched = true;
              break;
            }
          }
          if (!tagMatched) return false;
        }
      }

      for (const [colKey, selectedSet] of Object.entries(columnFilters)) {
        if (selectedSet.size > 0) {
          const rowVal = String(row[colKey] ?? '');
          if (!selectedSet.has(rowVal)) {
            return false;
          }
        }
      }
      
      if (cantidadColorFilter !== 'all') {
        const cantidadRaw = row['cantidad'];
        const cantidadNum = typeof cantidadRaw === 'number' ? cantidadRaw : parseFloat(String(cantidadRaw).replace(/,/g, ''));
        const cantidadVal = isNaN(cantidadNum) ? 0 : cantidadNum;
        
        if (cantidadColorFilter === 'green' && cantidadVal <= 1) return false;
        if (cantidadColorFilter === 'yellow' && cantidadVal !== 1) return false;
        if (cantidadColorFilter === 'red' && cantidadVal >= 1) return false;
      }

      return true;
    });
  }, [baseData, columnFilters, columnSearchTags, locationFilter, exhibitedSet, cantidadColorFilter]);

  const facetCounts = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {
      nombre: {}, linea: {}, marca: {}, cantidad: {}, tags: {}, modelo: {}, sku: {}, upc: {}
    };

    for (const row of baseData) {
      let passesLocation = true;
      if (locationFilter !== 'all') {
        const isExhibited = exhibitedSet.has(`${String(row['sku'] ?? '').trim().toLowerCase()}|${String(row['linea'] ?? '').trim().toLowerCase()}|${String(row['marca'] ?? '').trim().toLowerCase()}`);
        if (locationFilter === 'exhibited' && !isExhibited) passesLocation = false;
        if (locationFilter === 'bodega' && isExhibited) passesLocation = false;
      }

      let passesTags = true;
      for (const [colKey, tags] of Object.entries(columnSearchTags)) {
        if (tags.length > 0) {
          const rowVal = String(row[colKey] ?? '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          let tagMatched = false;
          for (const tag of tags) {
            const normalizedTag = tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (rowVal.includes(normalizedTag)) {
              tagMatched = true;
              break;
            }
          }
          if (!tagMatched) {
            passesTags = false;
            break;
          }
        }
      }

      if (!passesLocation || !passesTags) continue;

      if (cantidadColorFilter !== 'all') {
        const cantidadRaw = row['cantidad'];
        const cantidadNum = typeof cantidadRaw === 'number' ? cantidadRaw : parseFloat(String(cantidadRaw).replace(/,/g, ''));
        const cantidadVal = isNaN(cantidadNum) ? 0 : cantidadNum;
        
        if (cantidadColorFilter === 'green' && cantidadVal <= 1) continue;
        if (cantidadColorFilter === 'yellow' && cantidadVal !== 1) continue;
        if (cantidadColorFilter === 'red' && cantidadVal >= 1) continue;
      }

      const failedCheckboxes = [];
      for (const [colKey, selectedSet] of Object.entries(columnFilters)) {
        if (selectedSet.size > 0) {
          const rowVal = String(row[colKey] ?? '');
          if (!selectedSet.has(rowVal)) {
            failedCheckboxes.push(colKey);
          }
        }
      }

      const columns = ['nombre', 'linea', 'marca', 'cantidad', 'tags', 'modelo', 'sku', 'upc'];
      for (const col of columns) {
        if (failedCheckboxes.length === 0 || (failedCheckboxes.length === 1 && failedCheckboxes[0] === col)) {
          const val = String(row[col] ?? '');
          if (val) {
            counts[col][val] = (counts[col][val] || 0) + 1;
          }
        }
      }
    }

    return counts;
  }, [baseData, columnFilters, columnSearchTags, locationFilter, exhibitedSet, cantidadColorFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, columnFilters, columnSearchTags]);

  const removeFile = () => {
    setData([]);
    setFileName('');
    del('app-data').catch(console.error);
    del('app-fileName').catch(console.error);
    resetFilters();
  };

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">Cargando base de datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visor de Datos</h1>
            <p className="text-sm text-gray-500 mt-1">Busca y filtra tus productos fácilmente.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Main Upload Area */}
            {!data.length && !isParsing && (
              <label className="relative flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-6 py-3 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-2">
                  <UploadCloud className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Subir General (.xlsx)</span>
                </div>
                <input type="file" accept=".xlsx" className="sr-only" onChange={handleFileUpload} />
              </label>
            )}

            {isParsing && (
              <div className="flex items-center space-x-2 px-6 py-3 bg-white rounded-md border border-gray-200 shadow-sm">
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">Procesando General...</span>
              </div>
            )}

            {data.length > 0 && (
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">General</span>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] leading-none">{fileName}</span>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">{data.length} filas</span>
                <button onClick={removeFile} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors" title="Quitar base general">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Aux Upload Area */}
            {data.length > 0 && !auxData.length && !isParsingAux && (
              <label className="relative flex cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Subir Exhibición</span>
                </div>
                <input type="file" accept=".xlsx" className="sr-only" onChange={handleAuxFileUpload} />
              </label>
            )}

            {isParsingAux && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-md border border-gray-200 shadow-sm">
                <div className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">Procesando...</span>
              </div>
            )}

            {auxData.length > 0 && (
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm border-l-4 border-l-blue-500">
                <Store className="h-5 w-5 text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Exhibición</span>
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] leading-none">{auxFileName}</span>
                </div>
                <button onClick={removeAuxFile} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-600 transition-colors" title="Quitar base de exhibición">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
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
              
              <div className="flex items-center space-x-4">
                <div className="flex bg-white rounded border border-gray-200 shadow-sm p-0.5">
                  <button
                    onClick={() => setLocationFilter(prev => prev === 'exhibited' ? 'all' : 'exhibited')}
                    className={`p-1 rounded flex items-center justify-center transition-colors ${locationFilter === 'exhibited' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Mostrar solo exhibidos"
                  >
                    <Store className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLocationFilter(prev => prev === 'bodega' ? 'all' : 'bodega')}
                    className={`p-1 rounded flex items-center justify-center transition-colors ${locationFilter === 'bodega' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Mostrar solo en bodega"
                  >
                    <Warehouse className="h-4 w-4" />
                  </button>
                </div>

                {(Object.keys(columnFilters).length > 0 || Object.keys(columnSearchTags).length > 0) && (
                  <button 
                    onClick={resetColumnFilters}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors bg-white px-2 py-1 rounded border border-gray-200 shadow-sm"
                    title="Restablecer filtros de columnas"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Limpiar filtros de columna</span>
                  </button>
                )}
                
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
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                    <tr>
                      <FilterableHeader title="Nombre" columnKey="nombre" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['nombre']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                      <FilterableHeader title="Línea" columnKey="linea" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['linea']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                      <FilterableHeader title="Marca" columnKey="marca" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['marca']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                      <FilterableHeader title="Cantidad" columnKey="cantidad" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['cantidad']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} cantidadColorFilter={cantidadColorFilter} setCantidadColorFilter={setCantidadColorFilter} />
                      <FilterableHeader title="Tags" columnKey="tags" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['tags']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                      <FilterableHeader title="Modelo" columnKey="modelo" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['modelo']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                      <FilterableHeader title="SKU" columnKey="sku" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['sku']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                      <FilterableHeader title="UPC" columnKey="upc" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['upc']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentData.length > 0 ? (
                      currentData.map((row, idx) => {
                        const isExhibited = exhibitedSet.has(`${String(row['sku'] ?? '').trim().toLowerCase()}|${String(row['linea'] ?? '').trim().toLowerCase()}|${String(row['marca'] ?? '').trim().toLowerCase()}`);
                        
                        const cantidadRaw = row['cantidad'];
                        const cantidadNum = typeof cantidadRaw === 'number' ? cantidadRaw : parseFloat(String(cantidadRaw).replace(/,/g, ''));
                        const cantidadVal = isNaN(cantidadNum) ? 0 : cantidadNum;
                        
                        let rowColorClass = 'hover:bg-gray-50';
                        if (cantidadVal > 1) {
                          rowColorClass = 'bg-emerald-50/60 hover:bg-emerald-100/60';
                        } else if (cantidadVal === 1) {
                          rowColorClass = 'bg-amber-50/60 hover:bg-amber-100/60';
                        } else {
                          rowColorClass = 'bg-red-50/60 hover:bg-red-100/60';
                        }
                        
                        return (
                          <tr key={idx} className={`transition-colors ${rowColorClass}`}>
                            <td className="px-4 py-3 font-medium text-gray-900 min-w-[200px]">
                              <div className="flex items-center space-x-2">
                                {row['nombre'] && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(`https://www.google.com/search?q=${encodeURIComponent(row['nombre'])}`, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors shrink-0"
                                    title="Buscar producto en Google"
                                  >
                                    <Search className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                <span>{row['nombre'] || '-'}</span>
                                {isExhibited ? (
                                  <Store className="h-4 w-4 text-blue-600 shrink-0" title="En exhibición en tienda" />
                                ) : (
                                  <Warehouse className="h-4 w-4 text-amber-600 shrink-0" title="En bodega" />
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{row['linea'] || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{row['marca'] || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap font-medium text-blue-600">{row['cantidad'] ?? '-'}</td>
                            <td className="px-4 py-3 min-w-[200px] text-xs text-gray-500">{row['tags'] || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{row['modelo'] || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs">{row['sku'] || '-'}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs">{row['upc'] || '-'}</td>
                          </tr>
                        );
                      })
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

