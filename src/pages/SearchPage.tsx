import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import MediaCard from "../components/MediaCard";
import { search } from "../api/search";
import type { MediaResult, MediaType } from "../api/search";
import { addToLibrary } from "../api/library";
import type { Status } from "../api/library";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function SearchPage() {
  const [results, setResults] = useState<MediaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const handleSearch = async (query: string, type: MediaType) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await search(query, type);
      setResults(data);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Search failed", "error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (media: MediaResult, status: Status) => {
    setAddingIds((prev) => new Set(prev).add(media.id));
    try {
      await addToLibrary({
        external_id: media.id,
        media_type: media.type,
        title: media.title,
        cover_url: media.cover_url,
        source: media.source,
        status,
      });
      setAddedIds((prev) => new Set(prev).add(media.id));
      showToast(`"${media.title}" added to your library!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to library", "error");
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(media.id);
        return next;
      });
    }
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        background: "var(--color-void)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--color-border-color)",
          background: "var(--color-abyss)",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          to="/library"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            fontWeight: 900,
            color: "var(--color-amber)",
            textDecoration: "none",
            letterSpacing: "-0.5px",
          }}
        >
          Saga
        </Link>

        <nav style={{ display: "flex", gap: "6px" }}>
          <Link
            to="/search"
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--color-amber)",
              background: "rgba(232,160,48,0.1)",
              border: "1px solid rgba(232,160,48,0.3)",
              textDecoration: "none",
            }}
          >
            Search
          </Link>
          <Link
            to="/library"
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--color-ghost)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            Library
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: "40px 24px",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Page title */}
        <div className="animate-fade-in" style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 900,
              color: "var(--color-snow)",
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
            }}
          >
            Discover Media
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-dim)", letterSpacing: "0.05em" }}>
            Search movies, shows, games, books & manga — add them to your archive
          </p>
        </div>

        <div className="animate-fade-in stagger-1">
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>

        {/* Results */}
        <div style={{ marginTop: "40px" }}>
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "16px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-shimmer"
                  style={{
                    aspectRatio: "2/3",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border-color)",
                  }}
                />
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--color-dim)",
                  letterSpacing: "0.08em",
                  marginBottom: "16px",
                }}
              >
                {results.length} RESULT{results.length !== 1 ? "S" : ""}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: "16px",
                }}
              >
                {results.map((media, i) => (
                  <div
                    key={media.id}
                    className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                  >
                    <MediaCard
                      media={media}
                      onAdd={handleAdd}
                      adding={addingIds.has(media.id)}
                      added={addedIds.has(media.id)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : searched ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "var(--color-dim)",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--color-ghost)", marginBottom: "6px" }}>
                No results found
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.05em" }}>
                Try a different query or media type
              </p>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                color: "var(--color-dim)",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✦</div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: "20px", color: "var(--color-ghost)", fontStyle: "italic" }}>
                What's your next obsession?
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Toast container */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in"
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              background: toast.type === "success" ? "var(--color-surface)" : "rgba(192,57,43,0.9)",
              border: toast.type === "success" ? "1px solid var(--color-game)" : "1px solid rgba(192,57,43,0.6)",
              color: toast.type === "success" ? "var(--color-snow)" : "#fff",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 500,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              maxWidth: "320px",
              pointerEvents: "none",
            }}
          >
            {toast.type === "success" ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-game)" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
