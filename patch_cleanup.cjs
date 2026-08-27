const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove aux state
code = code.replace(/const \[auxData, setAuxData\].*\n/, '');
code = code.replace(/const \[auxFileName, setAuxFileName\].*\n/, '');
code = code.replace(/const \[isParsingAux, setIsParsingAux\].*\n/, '');

// Remove aux loading from IndexedDB
code = code.replace(/const storedAuxData = await get\('app-auxData'\);\n/, '');
code = code.replace(/const storedAuxFileName = await get\('app-auxFileName'\);\n/, '');
code = code.replace(/        if \(storedAuxData && storedAuxFileName\) \{\n          setAuxData\(storedAuxData\);\n          setAuxFileName\(storedAuxFileName\);\n        \}\n/, '');

// Remove aux file handlers
code = code.replace(/  const handleAuxFileUpload =[\s\S]*?const removeAuxFile =[\s\S]*?};\n/, '');

// Remove exhibitedSet
code = code.replace(/  const exhibitedSet = useMemo\(\(\) => \{[\s\S]*?  \}, \[auxData\]\);\n/, '');

// Replace isExhibited logic
code = code.replace(/const isExhibited = manualLoc \? manualLoc === 'exhibited' : exhibitedSet\.has\(productKey\);/g, "const isExhibited = manualLoc === 'exhibited';");

// Remove exhibitedSet from dependencies
code = code.replace(/, exhibitedSet/g, '');

// Remove aux UI sections
code = code.replace(/            \{\/\* Aux Upload Area \*\/\}[\s\S]*?(?=          <\/div>\n        \)\}\n\n        \{\/\* Main Error Display \*\/)/, '');

fs.writeFileSync('src/App.tsx', code);
