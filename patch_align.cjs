const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<div className="absolute top-full left-0 mt-1 w-[85vw] sm:w-72',
  '<div className={`absolute top-full ${alignRight ? \\\'right-0\\\' : \\\'left-0\\\'} mt-1 w-[85vw] sm:w-72'
);
// Wait, since I'm using string concatenation, let's just use string replacement
code = code.replace(
  'bg-white border border-gray-200 shadow-xl rounded-md z-20 flex flex-col font-normal text-gray-900 normal-case cursor-default p-3" onClick',
  'bg-white border border-gray-200 shadow-xl rounded-md z-20 flex flex-col font-normal text-gray-900 normal-case cursor-default p-3`} onClick'
);

code = code.replace(
  '<div className="absolute top-full left-0 mt-1 w-[85vw] sm:w-64 max-w-[300px] bg-white border border-gray-200 shadow-xl rounded-md z-20 max-h-96 flex flex-col font-normal text-gray-900 normal-case">',
  '<div className={`absolute top-full ${alignRight ? \\\'right-0\\\' : \\\'left-0\\\'} mt-1 w-[85vw] sm:w-64 max-w-[300px] bg-white border border-gray-200 shadow-xl rounded-md z-20 max-h-96 flex flex-col font-normal text-gray-900 normal-case`}>'
);

fs.writeFileSync('src/App.tsx', code);
