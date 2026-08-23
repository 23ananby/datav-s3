const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const unifiedDataCode = `
  const unifiedData = useMemo(() => {
    const map = new Map<string, ProductRow & { cantidadTienda?: number; cantidadCentral?: number; source?: 'tienda' | 'central' | 'ambos' }>();

    for (const row of data) {
      const sku = String(row['sku'] ?? '').trim().toLowerCase();
      const marca = String(row['marca'] ?? '').trim().toLowerCase();
      const key = \`\${sku}|\${marca}\`;
      map.set(key, { ...row, cantidadTienda: row['cantidad'], source: 'tienda' });
    }

    for (const row of bodegaCentralData) {
      const sku = String(row['sku'] ?? '').trim().toLowerCase();
      const marca = String(row['marca'] ?? '').trim().toLowerCase();
      const key = \`\${sku}|\${marca}\`;
      
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.cantidadCentral = row['cantidad'];
        existing.source = 'ambos';
      } else {
        map.set(key, { ...row, cantidadCentral: row['cantidad'], source: 'central' });
      }
    }

    return Array.from(map.values());
  }, [data, bodegaCentralData]);

  const baseData = useMemo(() => {
    let currentMatches = [...unifiedData];
    
    if (viewMode === 'tienda') {
      currentMatches = currentMatches.filter(r => r.source === 'tienda' || r.source === 'ambos');
    } else if (viewMode === 'central') {
      currentMatches = currentMatches.filter(r => r.source === 'central' || r.source === 'ambos');
    } else if (viewMode === 'tienda_only') {
      currentMatches = currentMatches.filter(r => r.source === 'tienda');
    } else if (viewMode === 'central_only') {
      currentMatches = currentMatches.filter(r => r.source === 'central');
    }

    if (!globalSearch.trim()) return currentMatches;

    const searchTerms = globalSearch.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").split(/\\s+/).filter(Boolean);
    
    for (const term of searchTerms) {
      const nextMatches = currentMatches.filter(row => {
        const searchStr = row._searchString || '';
        return searchStr.includes(term);
      });
      if (nextMatches.length > 0) {
        currentMatches = nextMatches;
      } else {
        return [];
      }
    }
    return currentMatches;
  }, [unifiedData, globalSearch, viewMode]);
`;

code = code.replace(/const baseData = useMemo\(\(\) => \{[\s\S]*?return currentMatches;\n  \}, \[data, globalSearch\]\);/, unifiedDataCode.trim());

fs.writeFileSync('src/App.tsx', code);
