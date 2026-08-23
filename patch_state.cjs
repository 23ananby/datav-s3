const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert bodega central state
code = code.replace(
  "const [auxFileName, setAuxFileName] = useState<string>('');\n  const [isParsingAux, setIsParsingAux] = useState(false);",
  "const [auxFileName, setAuxFileName] = useState<string>('');\n  const [isParsingAux, setIsParsingAux] = useState(false);\n\n  const [bodegaCentralData, setBodegaCentralData] = useState<ProductRow[]>([]);\n  const [bodegaCentralFileName, setBodegaCentralFileName] = useState<string>('');\n  const [isParsingBodegaCentral, setIsParsingBodegaCentral] = useState(false);\n  const [viewMode, setViewMode] = useState<'all' | 'tienda' | 'central' | 'tienda_only' | 'central_only'>('all');"
);

// Insert restore logic
code = code.replace(
  "const storedAuxFileName = await get('app-auxFileName');\n        const storedManualLocations = await get('app-manualLocations');",
  "const storedAuxFileName = await get('app-auxFileName');\n        const storedBodegaCentralData = await get('app-bodegaCentralData');\n        const storedBodegaCentralFileName = await get('app-bodegaCentralFileName');\n        const storedManualLocations = await get('app-manualLocations');"
);

code = code.replace(
  "if (storedAuxData && storedAuxFileName) {\n          setAuxData(storedAuxData);\n          setAuxFileName(storedAuxFileName);\n        }",
  "if (storedAuxData && storedAuxFileName) {\n          setAuxData(storedAuxData);\n          setAuxFileName(storedAuxFileName);\n        }\n\n        if (storedBodegaCentralData && storedBodegaCentralFileName) {\n          setBodegaCentralData(storedBodegaCentralData);\n          setBodegaCentralFileName(storedBodegaCentralFileName);\n        }"
);

fs.writeFileSync('src/App.tsx', code);
