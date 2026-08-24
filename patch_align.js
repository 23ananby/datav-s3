const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add alignRight to props interface
code = code.replace(
  "requestSort?: (key: string) => void;\n}) {",
  "requestSort?: (key: string) => void;\n  alignRight?: boolean;\n}) {"
);

// Replace left-0 with dynamic alignment for filter menu
code = code.replace(
  '<div className="absolute top-full left-0 mt-1 w-64',
  '<div className={`absolute top-full ${alignRight ? \'right-0\' : \'left-0\'} mt-1 w-[85vw] sm:w-64 max-w-[300px]'
);
// Wait, I already replaced w-64 with w-[85vw] sm:w-64 max-w-[300px]. Let's be precise.
