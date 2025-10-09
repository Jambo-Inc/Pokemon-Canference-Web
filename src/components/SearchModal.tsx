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

// タスク3: 検索モーダルのProps定義
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchQuery: string) => void;
  onClearFilter: () => void;
  hasActiveFilter: boolean;
}

// タスク3: 検索モーダルコンポーネント
export function SearchModal({
  isOpen,
  onClose,
  onSearch,
  onClearFilter,
  hasActiveFilter,
}: SearchModalProps) {
  // タスク3: モーダル内の検索入力状態
  const [searchInput, setSearchInput] = useState("");

  // タスク3: 検索実行ハンドラー
  const handleSearch = useCallback(() => {
    onSearch(searchInput.trim());
    onClose();
  }, [searchInput, onSearch, onClose]);

  // タスク3: フィルタクリアハンドラー
  const handleClearFilter = useCallback(() => {
    setSearchInput("");
    onClearFilter();
    onClose();
  }, [onClearFilter, onClose]);

  // タスク3: Enterキー押下時の検索実行
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
