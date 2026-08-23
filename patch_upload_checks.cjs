const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For Bodega Central
code = code.replace(
  "{data.length > 0 && !bodegaCentralData.length && !isParsingBodegaCentral && (",
  "{!bodegaCentralData.length && !isParsingBodegaCentral && ("
);

// For Aux Upload
code = code.replace(
  "{data.length > 0 && !auxData.length && !isParsingAux && (",
  "{(data.length > 0 || bodegaCentralData.length > 0) && !auxData.length && !isParsingAux && ("
);

// Also need to fix the main content area check. Currently it says:
// {data.length > 0 && (
//   <div className="space-y-4">
code = code.replace(
  "{data.length > 0 && (\\n          <div className=\"space-y-4\">",
  "{(data.length > 0 || bodegaCentralData.length > 0) && (\n          <div className=\"space-y-4\">"
);
// wait, regular expression with multiple lines can be tricky using string replace.
// Let's use regex or just simpler replaces.
