const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{data.length > 0 && !bodegaCentralData.length && !isParsingBodegaCentral && (",
  "{!bodegaCentralData.length && !isParsingBodegaCentral && ("
);

code = code.replace(
  "{data.length > 0 && !auxData.length && !isParsingAux && (",
  "{(data.length > 0 || bodegaCentralData.length > 0) && !auxData.length && !isParsingAux && ("
);

fs.writeFileSync('src/App.tsx', code);
