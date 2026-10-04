import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Hanya state yang benar-benar dibutuhkan sesuai instruksi
  const [kodeTerpilih, setKodeTerpilih] = useState(null);
  const [kodeBrush, setKodeBrush] = useState([]); // State baru untuk multivariat

  const clearBrush = () => setKodeBrush([]);

  return (
    <AppContext.Provider value={{
      kodeTerpilih, setKodeTerpilih,
      kodeBrush, setKodeBrush, clearBrush
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);