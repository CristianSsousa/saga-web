import { useState } from "react";
import type { MediaType } from "../api/search";

const mediaTypes: { value: MediaType; label: string; icon: string }[] = [
  { value: "movie", label: "Movies", icon: "🎬" },
  { value: "tv", label: "TV Shows", icon: "📺" },
  { value: "game", label: "Games", icon: "🎮" },
  { value: "book", label: "Books", icon: "📖" },
  { value: "manga", label: "Manga", icon: "📚" },
];

const typeColors: Record<MediaType, string> = {
  movie: "var(--color-movie)",
  tv: "var(--color-tv)",
  game: "var(--color-game)",
  book: "var(--color-book)",
  manga: "var(--color-manga)",
};

interface Props {
  onSearch: (query: string, type: MediaType) => void;
  loading?: boolean;
}

export default function SearchBar({ onSearch, loading = false }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<MediaType>("movie");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim(), type);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {/* Media Type Tabs */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {mediaTypes.map(({ value, label, icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              letterSpacing: "0.04em",
              cursor: "pointer",
              transition: "all 0.18s ease",
              border: `1px solid ${type === value ? typeColors[value] : "var(--color-border-color)"}`,
              background: type === value ? `${typeColors[value]}22` : "transparent",
              color: type === value ? typeColors[value] : "var(--color-ghost)",
              outline: "none",
            }}
          >
            <span style={{ marginRight: "5px" }}>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "stretch",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-dim)",
              pointerEvents: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${mediaTypes.find(m => m.value === type)?.label.toLowerCase()}…`}
            style={{
              width: "100%",
              padding: "14px 16px 14px 44px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-color)",
              borderRadius: "10px",
              color: "var(--color-snow)",
              fontFamily: "var(--font-sans)",
              fontSize: "15px",
              outline: "none",
              transition: "border-color 0.18s, box-shadow 0.18s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = typeColors[type];
              e.currentTarget.style.boxShadow = `0 0 0 3px ${typeColors[type]}18`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-color)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            padding: "14px 24px",
            borderRadius: "10px",
            background: loading || !query.trim() ? "var(--color-muted-bg)" : "var(--color-amber)",
            color: loading || !query.trim() ? "var(--color-dim)" : "var(--color-void)",
            border: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading || !query.trim() ? "not-allowed" : "pointer",
            transition: "all 0.18s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: "14px",
                  height: "14px",
                  border: "2px solid var(--color-dim)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin-slow 0.8s linear infinite",
                }}
              />
              Searching
            </>
          ) : (
            "Search"
          )}
        </button>
      </div>
    </form>
  );
}
