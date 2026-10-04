import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [kodeTerpilih, setKodeTerpilih] = useState(null);
  const [tahunTerpilih, setTahunTerpilih] = useState("2023"); // Sesuai default awal
  const [kodeBrush, setKodeBrush] = useState([]); // State baru untuk multivariat

  const clearBrush = () => setKodeBrush([]);

  return (
    <AppContext.Provider value={{
      kodeTerpilih, setKodeTerpilih,
      tahunTerpilih, setTahunTerpilih,
      kodeBrush, setKodeBrush, clearBrush
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);