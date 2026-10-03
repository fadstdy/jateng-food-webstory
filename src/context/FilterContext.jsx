import { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [tahun, setTahun] = useState(2023);
  const [wilayah, setWilayah] = useState('Semua');

  return (
    <FilterContext.Provider value={{ tahun, setTahun, wilayah, setWilayah }}>
      {children}
    </FilterContext.Provider>
  );
}
export const useFilter = () => useContext(FilterContext);