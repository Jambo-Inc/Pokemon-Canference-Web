"use client";

import "./globals.css";
import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";

function Header() {
  const { openModal } = useSearch();

  return (
    <div className="bg-[#E53935] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-white text-xl">Pokédex</h1>
          <button
            onClick={openModal}
            className="text-white hover:opacity-80 transition-opacity"
            aria-label="検索"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <title>Pokédex (Next.js 15)</title>
        <meta name="description" content="PokéAPI sample with Next.js App Router" />
      </head>
      <body className="min-h-dvh bg-gray-50 text-gray-900">
        <SearchProvider>
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </SearchProvider>
      </body>
    </html>
  );
}
