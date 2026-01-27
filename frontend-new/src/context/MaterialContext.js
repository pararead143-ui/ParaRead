import { createContext, useContext, useState } from "react";

// Create a context
const MaterialContext = createContext();

// Custom hook
export const useMaterial = () => useContext(MaterialContext);

// Provider component
export const MaterialProvider = ({ children }) => {
  const [currentMaterialId, setCurrentMaterialId] = useState(null);

  return (
    <MaterialContext.Provider value={{ currentMaterialId, setCurrentMaterialId }}>
      {children}
    </MaterialContext.Provider>
  );
};
