"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchQuery: string) => void;
  onClearFilter: () => void;
  hasActiveFilter: boolean;
}

export function SearchModal({
  isOpen,
  onClose,
  onSearch,
  onClearFilter,
  hasActiveFilter,
}: SearchModalProps) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = useCallback(() => {
    onSearch(searchInput.trim());
    onClose();
  }, [searchInput, onSearch, onClose]);

  const handleClearFilter = useCallback(() => {
    setSearchInput("");
    onClearFilter();
    onClose();
  }, [onClearFilter, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ポケモン検索</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              検索キーワード:
            </label>
            <Input
              id="search"
              placeholder="ポケモン名を入力（例: ピカチュウ、pikachu）"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              ※ポケモン名の一部でも検索できます
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={handleSearch} className="bg-[#E53935] hover:bg-[#D32F2F] text-white">
              検索
            </Button>
            {hasActiveFilter && (
              <Button
                onClick={handleClearFilter}
                variant="outline"
                className="border-gray-300"
              >
                フィルタをクリア
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
