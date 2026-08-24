const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Revert container
code = code.replace('w-full max-w-[1920px] mx-auto space-y-6 px-1', 'max-w-7xl mx-auto space-y-6');

// 2. Revert input sizes
code = code.replaceAll('text-base sm:text-xs', 'text-xs');
code = code.replaceAll('text-base sm:text-sm', 'text-sm');

// 3. Revert interface
code = code.replace("requestSort?: (key: string) => void;\n  alignRight?: boolean;\n}) {", "requestSort?: (key: string) => void;\n}) {");

// 4. Revert template literals for positioning
code = code.replace(
  "className={`absolute top-full ${alignRight ? 'right-0' : 'left-0'} mt-1 w-[85vw] sm:w-72 max-w-[300px] bg-white border border-gray-200 shadow-xl rounded-md z-20 flex flex-col font-normal text-gray-900 normal-case cursor-default p-3`} onClick",
  'className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-xl rounded-md z-20 flex flex-col font-normal text-gray-900 normal-case cursor-default p-3" onClick'
);

code = code.replace(
  "className={`absolute top-full ${alignRight ? 'right-0' : 'left-0'} mt-1 w-[85vw] sm:w-64 max-w-[300px] bg-white border border-gray-200 shadow-xl rounded-md z-20 max-h-96 flex flex-col font-normal text-gray-900 normal-case`}>",
  'className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-md z-20 max-h-96 flex flex-col font-normal text-gray-900 normal-case">'
);

// 5. Revert leftover widths globally
code = code.replaceAll('w-[85vw] sm:w-72 max-w-[300px]', 'w-72');
code = code.replaceAll('w-[85vw] sm:w-64 max-w-[300px]', 'w-64');

// 6. Revert prop usages
code = code.replaceAll('<FilterableHeader alignRight title=', '<FilterableHeader title=');

fs.writeFileSync('src/App.tsx', code);
