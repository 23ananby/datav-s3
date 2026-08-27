const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace General file UI
code = code.replace(
  /<div className="flex flex-col">\s*<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">General<\/span>\s*<span className="text-sm font-medium text-gray-700 truncate max-w-\[150px\] leading-none">\{fileName\}<\/span>\s*<\/div>/,
  '<span className="text-sm font-semibold text-gray-700 hidden sm:inline">General</span>'
);

code = code.replace(
  /<span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">\{data\.length\} filas<\/span>/,
  '<span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">{data.length}</span>'
);

// Replace Bodega Central file UI
code = code.replace(
  /<div className="flex flex-col">\s*<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Bodega Central<\/span>\s*<span className="text-sm font-medium text-gray-700 truncate max-w-\[150px\] leading-none">\{bodegaCentralFileName\}<\/span>\s*<\/div>/,
  '<span className="text-sm font-semibold text-gray-700 hidden sm:inline">Bodega</span>'
);

fs.writeFileSync('src/App.tsx', code);
