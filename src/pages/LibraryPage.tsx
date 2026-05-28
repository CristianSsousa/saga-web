import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listLibrary, updateLibraryItem, removeFromLibrary } from "../api/library";
import type { LibraryItem, Status } from "../api/library";
import type { MediaType } from "../api/search";
import { useAuthStore } from "../store/auth";
import StatusSelect from "../components/StatusSelect";

const typeOptions: { value: MediaType | ""; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV Shows" },
  { value: "game", label: "Games" },
  { value: "book", label: "Books" },
  { value: "manga", label: "Manga" },
];

const statusOptions: { value: Status | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "on_hold", label: "On Hold" },
];

const typeColors: Record<MediaType, string> = {
  movie: "var(--color-movie)",
  tv: "var(--color-tv)",
  game: "var(--color-game)",
  book: "var(--color-book)",
  manga: "var(--color-manga)",
};

const typeLabels: Record<MediaType, string> = {
  movie: "MOVIE",
  tv: "TV",
  game: "GAME",
  book: "BOOK",
  manga: "MANGA",
};

const STARS = [1, 2, 3, 4, 5];

export default function LibraryPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const [filterType, setFilterType] = useState<MediaType | "">("");
  const [filterStatus, setFilterStatus] = useState<Status | "">("");

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const fetchItems = useCallback(async (reset = true) => {
    if (reset) {
      setLoading(true);
      setItems([]);
      setCursor(undefined);
    } else {
      setLoadingMore(true);
    }

    try {
      const page = await listLibrary({
        ...(filterType ? { type: filterType } : {}),
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(reset ? {} : { cursor }),
        limit: 24,
      });

      setItems((prev) => reset ? (page.items ?? []) : [...prev, ...(page.items ?? [])]);
      setHasMore(page.has_more);
      setCursor(page.next_cursor);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterType, filterStatus, cursor]);

  useEffect(() => {
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStatusChange = async (item: LibraryItem, status: Status) => {
    setUpdatingIds((prev) => new Set(prev).add(item.id));
    try {
      const updated = await updateLibraryItem(item.id, { status });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      // revert silently
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleRating = async (item: LibraryItem, rating: number) => {
    const newRating = item.user_rating === rating ? undefined : rating;
    setUpdatingIds((prev) => new Set(prev).add(item.id));
    try {
      const updated = await updateLibraryItem(item.id, { user_rating: newRating });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch {
      // noop
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingIds((prev) => new Set(prev).add(id));
    try {
      await removeFromLibrary(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      // noop
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const selectStyle: React.CSSProperties = {
    padding: "7px 32px 7px 12px",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border-color)",
    borderRadius: "8px",
    color: "var(--color-silver)",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236b7fa3' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    outline: "none",
    letterSpacing: "0.03em",
  };

  return (
    <div style={{ minHeight: "100svh", background: "var(--color-void)", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "24px",
              fontWeight: 900,
              color: "var(--color-amber)",
              letterSpacing: "-0.5px",
            }}
          >
            Saga
          </span>
          <nav style={{ display: "flex", gap: "6px" }}>
            <Link
              to="/library"
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
              Library
            </Link>
            <Link
              to="/search"
              style={{
                padding: "6px 14px",
                borderRadius: "7px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-ghost)",
                textDecoration: "none",
              }}
            >
              Search
            </Link>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--color-dim)",
                letterSpacing: "0.04em",
              }}
            >
              @{user.username}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              borderRadius: "7px",
              background: "transparent",
              border: "1px solid var(--color-border-color)",
              color: "var(--color-ghost)",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-movie)";
              e.currentTarget.style.color = "var(--color-movie)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-color)";
              e.currentTarget.style.color = "var(--color-ghost)";
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          padding: "40px 24px",
          maxWidth: "1300px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Page header */}
        <div className="animate-fade-in" style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "36px",
                fontWeight: 900,
                color: "var(--color-snow)",
                margin: "0 0 4px",
                letterSpacing: "-0.5px",
              }}
            >
              My Archive
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-dim)", letterSpacing: "0.05em", margin: 0 }}>
              {loading ? "—" : `${items.length} title${items.length !== 1 ? "s" : ""}${hasMore ? "+" : ""} in collection`}
            </p>
          </div>
          <Link
            to="/search"
            style={{
              padding: "10px 20px",
              background: "var(--color-amber)",
              color: "var(--color-void)",
              borderRadius: "8px",
              textDecoration: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Media
          </Link>
        </div>

        {/* Filter Bar */}
        <div
          className="animate-fade-in stagger-1"
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "28px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as MediaType | "")}
            style={selectStyle}
          >
            {typeOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status | "")}
            style={selectStyle}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {(filterType || filterStatus) && (
            <button
              onClick={() => { setFilterType(""); setFilterStatus(""); }}
              style={{
                padding: "7px 12px",
                background: "transparent",
                border: "1px solid var(--color-border-color)",
                borderRadius: "8px",
                color: "var(--color-dim)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-shimmer"
                style={{
                  borderRadius: "12px",
                  height: "340px",
                  border: "1px solid var(--color-border-color)",
                }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "100px 20px",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "22px",
                fontStyle: "italic",
                color: "var(--color-ghost)",
                marginBottom: "8px",
              }}
            >
              Your archive is empty
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-dim)", marginBottom: "24px", letterSpacing: "0.05em" }}>
              Start tracking movies, shows, games & more
            </p>
            <Link
              to="/search"
              style={{
                padding: "12px 24px",
                background: "var(--color-amber)",
                color: "var(--color-void)",
                borderRadius: "8px",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              Discover Media
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px",
              }}
            >
              {items.map((item, i) => {
                const accentColor = typeColors[item.media.type] ?? "var(--color-amber)";
                const isUpdating = updatingIds.has(item.id);
                const isRemoving = removingIds.has(item.id);
                const imgError = imgErrors.has(item.media.id);

                return (
                  <article
                    key={item.id}
                    className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                    style={{
                      background: "var(--color-surface)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid var(--color-border-color)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.3s ease",
                      opacity: isRemoving ? 0.4 : 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      if (!isRemoving) {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.45), 0 0 0 1px ${accentColor}33`;
                        e.currentTarget.style.borderColor = `${accentColor}55`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
                      e.currentTarget.style.borderColor = "var(--color-border-color)";
                    }}
                  >
                    {/* Cover */}
                    <div
                      style={{
                        aspectRatio: "2/3",
                        position: "relative",
                        overflow: "hidden",
                        background: "var(--color-deep)",
                        flexShrink: 0,
                      }}
                    >
                      {!imgError && item.media.cover_url ? (
                        <img
                          src={item.media.cover_url}
                          alt={item.media.title}
                          onError={() => setImgErrors((prev) => new Set(prev).add(item.media.id))}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--color-dim)",
                          }}
                        >
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                      )}

                      {/* Type badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          background: accentColor,
                          color: "#fff",
                          fontSize: "9px",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          padding: "3px 7px",
                          borderRadius: "4px",
                        }}
                      >
                        {typeLabels[item.media.type]}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        title="Remove from library"
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(8,11,18,0.8)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "var(--color-dim)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          transition: "all 0.15s",
                          opacity: 0,
                        }}
                        className="remove-btn"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(192,57,43,0.8)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(8,11,18,0.8)";
                          e.currentTarget.style.color = "var(--color-dim)";
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Card body */}
                    <div
                      style={{
                        padding: "10px 12px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          color: "var(--color-snow)",
                          lineHeight: 1.3,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.media.title}
                      </h3>

                      {/* Status */}
                      <StatusSelect
                        value={item.status}
                        onChange={(s) => handleStatusChange(item, s)}
                      />

                      {/* Star rating */}
                      <div style={{ display: "flex", gap: "2px" }}>
                        {STARS.map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(item, star)}
                            disabled={isUpdating}
                            title={`Rate ${star}`}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "1px",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: (item.user_rating ?? 0) >= star ? "var(--color-amber)" : "var(--color-muted-bg)",
                              transition: "color 0.15s, transform 0.1s",
                              lineHeight: 1,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <button
                  onClick={() => fetchItems(false)}
                  disabled={loadingMore}
                  style={{
                    padding: "12px 32px",
                    background: "transparent",
                    border: "1px solid var(--color-border-color)",
                    borderRadius: "8px",
                    color: "var(--color-silver)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    transition: "all 0.18s ease",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.borderColor = "var(--color-amber)";
                      e.currentTarget.style.color = "var(--color-amber)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border-color)";
                    e.currentTarget.style.color = "var(--color-silver)";
                  }}
                >
                  {loadingMore ? (
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
                      Loading…
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
