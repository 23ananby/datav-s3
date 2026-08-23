const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const viewModeSelect = `
              <div className="flex items-center space-x-2">
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as any)}
                  className="block rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 bg-white border shadow-sm text-gray-700"
                >
                  <option value="all">Todas las bases de datos</option>
                  <option value="tienda">Disponibles en Tienda</option>
                  <option value="central">Disponibles en Bodega Central</option>
                  <option value="tienda_only">Solo en Tienda (Falta Central)</option>
                  <option value="central_only">Solo en Central (Falta Tienda)</option>
                </select>
`;

code = code.replace('<div className="flex items-center space-x-4">', '<div className="flex items-center space-x-4">\n' + viewModeSelect);

fs.writeFileSync('src/App.tsx', code);
