const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const bodegaHandlers = `
  const handleBodegaCentralFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx')) {
      setError('Por favor sube un archivo .xlsx válido para la bodega central.');
      return;
    }
    setIsParsingBodegaCentral(true);
    setError(null);
    setBodegaCentralFileName(file.name);

    try {
      const parsedData = await parseExcelFile(file);
      setBodegaCentralData(parsedData);
      set('app-bodegaCentralData', parsedData).catch(console.error);
      set('app-bodegaCentralFileName', file.name).catch(console.error);
    } catch (err) {
      console.error(err);
      setError('Hubo un error al procesar el archivo de bodega central.');
      setBodegaCentralData([]);
    } finally {
      setIsParsingBodegaCentral(false);
    }
  };

  const removeBodegaCentralFile = () => {
    setBodegaCentralData([]);
    setBodegaCentralFileName('');
    del('app-bodegaCentralData').catch(console.error);
    del('app-bodegaCentralFileName').catch(console.error);
  };
`;

code = code.replace("const handleAuxFileUpload =", bodegaHandlers + "\n  const handleAuxFileUpload =");

fs.writeFileSync('src/App.tsx', code);
