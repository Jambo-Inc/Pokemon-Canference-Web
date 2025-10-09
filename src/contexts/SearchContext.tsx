"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// タスク3: 検索機能の状態管理Context
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  clearSearch: () => void;
}

// タスク3: SearchContext作成（初期値undefined）
const SearchContext = createContext<SearchContextType | undefined>(undefined);

// タスク3: SearchProviderコンポーネント
export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        isModalOpen,
        openModal,
        closeModal,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

// タスク3: useSearchカスタムフック（Provider外での使用を防ぐ）
export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}
