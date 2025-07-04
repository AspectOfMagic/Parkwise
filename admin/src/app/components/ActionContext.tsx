'use client'
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ActionContext {
  selectedAction: string | null;
  setSelectedAction: (action: string | null) => void;
}

const ActionContext = createContext<ActionContext | undefined>(undefined);

export const ActionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  return (
    <ActionContext.Provider value={{ selectedAction, setSelectedAction }}>
      {children}
    </ActionContext.Provider>
  );
};

// Custom hook to use the context
export const useSelectedAction = (): ActionContext => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useSelectedAction must be used within a ActionProvider');
  }
  return context;
};
