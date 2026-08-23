const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newHeaders = `
                      <FilterableHeader title="Cant. Tienda" columnKey="cantidadTienda" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['cantidadTienda']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} cantidadColorFilter={cantidadColorFilter} setCantidadColorFilter={setCantidadColorFilter} selectedRowKeys={selectedRowKeys} sortConfig={sortConfig} requestSort={requestSort} />
                      <FilterableHeader title="Cant. Central" columnKey="cantidadCentral" filteredData={filteredData} columnFilters={columnFilters} columnSearchTags={columnSearchTags} facetCounts={facetCounts['cantidadCentral']} toggleColumnFilter={toggleColumnFilter} clearColumnFilter={clearColumnFilter} addColumnSearchTag={addColumnSearchTag} removeColumnSearchTag={removeColumnSearchTag} selectedRowKeys={selectedRowKeys} sortConfig={sortConfig} requestSort={requestSort} />
`;

code = code.replace(/<FilterableHeader title="Cantidad" columnKey="cantidad" [^>]+ \/>/, newHeaders.trim());

// Update row rendering
code = code.replace(
  /<td className="px-4 py-3 whitespace-nowrap font-medium text-blue-600">\{row\['cantidad'\] \?\? '-'}<\/td>/g,
  '<td className="px-4 py-3 whitespace-nowrap font-medium text-blue-600">{row[\'cantidadTienda\'] ?? \'-\'}</td>\n                            <td className="px-4 py-3 whitespace-nowrap font-medium text-purple-600">{row[\'cantidadCentral\'] ?? \'-\'}</td>'
);

// Update facetCounts columns
code = code.replace(
  "nombre: {}, linea: {}, marca: {}, cantidad: {}, tags: {}, modelo: {}, sku: {}, upc: {}",
  "nombre: {}, linea: {}, marca: {}, cantidadTienda: {}, cantidadCentral: {}, tags: {}, modelo: {}, sku: {}, upc: {}"
);
code = code.replace(
  "const columns = ['nombre', 'linea', 'marca', 'cantidad', 'tags', 'modelo', 'sku', 'upc'];",
  "const columns = ['nombre', 'linea', 'marca', 'cantidadTienda', 'cantidadCentral', 'tags', 'modelo', 'sku', 'upc'];"
);

// Update cantidadColorFilter logic inside useMemo(() => { ... baseData ...})
code = code.replace(
  "const cantidadRaw = row['cantidad'];",
  "const cantidadRaw = row['cantidadTienda'];"
);

// Update cantidadColorFilter logic in row rendering loop
code = code.replace(
  "const cantidadRaw = row['cantidad'];",
  "const cantidadRaw = row['cantidadTienda'];"
);

fs.writeFileSync('src/App.tsx', code);
