"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { PokemonListItem } from "../components/PokemonListItem";
import { PokemonHeroDisplay } from "../components/PokemonHeroDisplay";
import { SearchModal } from "../components/SearchModal";
import { useSearch } from "@/contexts/SearchContext";
import { pokemonService, type PokemonDetailWithJapanese } from "@/services/pokemonService";
import type { PokemonListResponse } from "@/api/pokemon.api";
import { Loader2 } from "lucide-react";

export function ModernPokedex() {
  const [pokemonList, setPokemonList] = useState<PokemonListResponse | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetailWithJapanese | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pokemonNameCache, setPokemonNameCache] = useState<Map<string, string>>(new Map());

  // SearchContextから検索状態を取得
  const { searchQuery, setSearchQuery, isModalOpen, closeModal, clearSearch } = useSearch();

  // フィルタリング処理
  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return pokemonList?.results || [];
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();

    return pokemonList?.results.filter(pokemon => {
      // 英語名での部分一致検索
      if (pokemon.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // 日本語名での部分一致検索（キャッシュから）
      const japaneseName = pokemonNameCache.get(pokemon.name);
      if (japaneseName && japaneseName.includes(searchQuery)) {
        return true;
      }

      return false;
    }) || [];
  }, [pokemonList, searchQuery, pokemonNameCache]);

  // 選択されているポケモンのURL
  const selectedPokemonUrl = selectedPokemon
    ? `https://pokeapi.co/api/v2/pokemon/${selectedPokemon.id}/`
    : '';

  const handlePokemonSelect = useCallback(async (pokemonUrl: string) => {
    try {
      setIsLoadingDetail(true);
      const pokemonId = pokemonService.extractIdFromResourceUrl(pokemonUrl);
      if (!pokemonId) throw new Error('Invalid Pokemon URL');
      const pokemonDetail = await pokemonService.getPokemonDetailWithJapaneseName(pokemonId);
      setSelectedPokemon(pokemonDetail);
    } catch (error) {
      console.error('ポケモン詳細の取得に失敗しました:', error);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // タスク1.初期読み込みと最初のポケモン自動選択
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoadingList(true);
        const data = await pokemonService.getPokemonList(24, 0);
        setPokemonList(data);

        // 最初のポケモンを自動選択
        if (data.results.length > 0) {
          handlePokemonSelect(data.results[0].url);
        }
      } catch (error) {
        console.error('ポケモンリストの取得に失敗しました:', error);
      } finally {
        setIsLoadingList(false);
      }
    };

    initialize();
  }, [handlePokemonSelect]);

  // 日本語名キャッシュ構築
  useEffect(() => {
    const fetchJapaneseNames = async () => {
      if (!pokemonList?.results) return;

      const namesToFetch = pokemonList.results
        .filter(p => !pokemonNameCache.has(p.name))
        .slice(0, 10); // バッチで10件ずつ取得

      for (const pokemon of namesToFetch) {
        try {
          const japaneseName = await pokemonService.getPokemonNameInJapanese(pokemon.name);
          setPokemonNameCache(prev => new Map(prev).set(pokemon.name, japaneseName));
        } catch {
          console.error(`Failed to fetch Japanese name for ${pokemon.name}`);
        }
      }
    };

    fetchJapaneseNames();
  }, [pokemonList, pokemonNameCache]);

  // もっと見るボタンの処理
  const loadMorePokemon = async () => {
    if (!pokemonList) return;

    try {
      setIsLoadingMore(true);

      // 現在のリスト件数をoffsetとして使用
      const currentCount = pokemonList.results.length;

      // 次の24件を取得
      const newData = await pokemonService.getPokemonList(24, currentCount);

      // 既存リストに新規データを追加
      setPokemonList(prevList => ({
        ...newData,
        results: [...(prevList?.results || []), ...newData.results]
      }));
    } catch (error) {
      console.error('追加ポケモンの取得に失敗しました:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 検索ハンドラー
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  // フィルタクリアハンドラー
  const handleClearFilter = useCallback(() => {
    clearSearch();
  }, [clearSearch]);

  return (
    <>
      {/* 検索モーダル */}
      <SearchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSearch={handleSearch}
        onClearFilter={handleClearFilter}
        hasActiveFilter={!!searchQuery}
      />

      <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
        {/* メインコンテンツ */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {/* 上部: 選択中のポケモン表示 */}
        <div className="h-1/2 relative overflow-hidden">
          {isLoadingDetail ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-600 mb-2 mx-auto" />
                <p className="text-gray-500">読み込み中...</p>
              </div>
            </div>
          ) : (
            <PokemonHeroDisplay
              pokemon={selectedPokemon}
            />
          )}
        </div>

        {/* 下部: ポケモンリスト */}
        <div className="h-1/2 bg-white flex flex-col">
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">
                {filteredPokemon.length}匹のポケモン
              </p>
              <span className="text-gray-500 text-sm">音順</span>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="px-4 py-2 space-y-1">
              {isLoadingList && filteredPokemon.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : filteredPokemon.length === 0 && searchQuery ? (
                <div className="text-center py-8 text-gray-500">
                  「{searchQuery}」に一致するポケモンが見つかりませんでした
                </div>
              ) : (
                <>
                  {filteredPokemon.map((pokemon) => (
                    <PokemonListItem
                      key={pokemon.name}
                      name={pokemon.name}
                      url={pokemon.url}
                      onClick={() => handlePokemonSelect(pokemon.url)}
                      isSelected={selectedPokemonUrl === pokemon.url}
                    />
                  ))}
                  {/* もっと読み込むボタン */}
                  {pokemonList && pokemonList.results.length < 151 && !searchQuery && (
                    <div className="text-center pt-4">
                      <Button
                        onClick={loadMorePokemon}
                        disabled={isLoadingMore}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-300"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            読み込み中...
                          </>
                        ) : (
                          'もっと見る'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      </div>
    </>
  );
}

export default ModernPokedex;