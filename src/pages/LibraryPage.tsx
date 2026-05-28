import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listLibrary, updateLibraryItem, removeFromLibrary } from "../api/library";
import type { LibraryItem, Status } from "../api/library";
import type { MediaType } from "../api/search";
import { useAuthStore } from "../store/auth";
import { statusColors, statusLabels } from "../components/StatusSelect";

/* ─── constants ──────────────────────────────────────────────────────── */

const TYPE_TABS: { value: MediaType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
  { value: "game", label: "Games" },
  { value: "book", label: "Books" },
  { value: "manga", label: "Manga" },
];

const STATUS_CHIPS: { value: Status | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "dropped", label: "Dropped" },
  { value: "on_hold", label: "On Hold" },
];

const TYPE_COLORS: Record<MediaType, string> = {
  movie: "var(--color-movie)",
  tv: "var(--color-tv)",
  game: "var(--color-game)",
  book: "var(--color-book)",
  manga: "var(--color-manga)",
};

const TYPE_LABELS: Record<MediaType, string> = {
  movie: "FILM",
  tv: "TV",
  game: "GAME",
  book: "BOOK",
  manga: "MANGA",
};

const STARS = [1, 2, 3, 4, 5];

/* ─── component ─────────────────────────────────────────────────────── */

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const typeCounts = useMemo(
    () =>
      items.reduce(
        (acc, item) => {
          acc[item.media.type] = (acc[item.media.type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [items],
  );

  const fetchItems = useCallback(
    async (reset = true) => {
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
        setItems((prev) => (reset ? (page.items ?? []) : [...prev, ...(page.items ?? [])]));
        setHasMore(page.has_more);
        setCursor(page.next_cursor);
      } catch {
        /* noop */
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterType, filterStatus, cursor],
  );

  useEffect(() => {
    fetchItems(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleStatusChange = async (item: LibraryItem, status: Status) => {
    setUpdatingIds((p) => new Set(p).add(item.id));
    try {
      const updated = await updateLibraryItem(item.id, { status });
      setItems((p) => p.map((i) => (i.id === item.id ? updated : i)));
    } catch { /* noop */ } finally {
      setUpdatingIds((p) => { const n = new Set(p); n.delete(item.id); return n; });
    }
  };

  const handleRating = async (item: LibraryItem, rating: number) => {
    const newRating = item.user_rating === rating ? undefined : rating;
    setUpdatingIds((p) => new Set(p).add(item.id));
    try {
      const updated = await updateLibraryItem(item.id, { user_rating: newRating });
      setItems((p) => p.map((i) => (i.id === item.id ? updated : i)));
    } catch { /* noop */ } finally {
      setUpdatingIds((p) => { const n = new Set(p); n.delete(item.id); return n; });
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingIds((p) => new Set(p).add(id));
    try {
      await removeFromLibrary(id);
      setItems((p) => p.filter((i) => i.id !== id));
    } catch { /* noop */ } finally {
      setRemovingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  return (
    <div style={{ minHeight: "100svh", background: "var(--color-void)", display: "flex", flexDirection: "column" }}>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <header style={{
        borderBottom: "1px solid var(--color-border-color)",
        background: "var(--color-abyss)",
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "60px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 900,
            color: "var(--color-amber)",
            letterSpacing: "-0.5px",
          }}>Saga</span>

          <nav style={{ display: "flex", gap: "2px" }}>
            {[
              { to: "/library", label: "Archive" },
              { to: "/search", label: "Discover" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{
                padding: "5px 14px",
                borderRadius: "7px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 500,
                color: to === "/library" ? "var(--color-amber)" : "var(--color-ghost)",
                background: to === "/library" ? "rgba(232,160,48,0.08)" : "transparent",
                textDecoration: "none",
                transition: "color 0.15s",
              }}>
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user && (
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--color-dim)",
              letterSpacing: "0.06em",
            }}>
              {user.username}
            </span>
          )}
          <button onClick={handleLogout} style={{
            padding: "5px 13px",
            borderRadius: "6px",
            background: "transparent",
            border: "1px solid var(--color-border-color)",
            color: "var(--color-dim)",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-ghost)"; e.currentTarget.style.color = "var(--color-ghost)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border-color)"; e.currentTarget.style.color = "var(--color-dim)"; }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, maxWidth: "1440px", width: "100%", margin: "0 auto", padding: "40px 28px 60px" }}>

        {/* Page title row */}
        <div className="animate-fade-in" style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "36px",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              color: "var(--color-snow)",
              margin: "0 0 5px",
              letterSpacing: "-1px",
              lineHeight: 1,
            }}>
              My Archive
            </h1>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--color-dim)",
              letterSpacing: "0.1em",
              margin: 0,
              textTransform: "uppercase",
            }}>
              {loading ? "loading…" : `${items.length}${hasMore ? "+" : ""} title${items.length !== 1 ? "s" : ""} tracked`}
            </p>
          </div>

          <Link to="/search" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "10px 20px",
            background: "var(--color-amber)",
            color: "var(--color-void)",
            borderRadius: "9px",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.01em",
            transition: "opacity 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Media
          </Link>
        </div>

        {/* ── Type tab strip ─────────────────────────────────────────── */}
        <div className="animate-fade-in stagger-1" style={{
          display: "flex",
          gap: "6px",
          marginBottom: "12px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
        }}>
          {TYPE_TABS.map((tab) => {
            const active = filterType === tab.value;
            const count = tab.value === "" ? items.length : (typeCounts[tab.value] ?? 0);
            return (
              <button
                key={tab.value}
                onClick={() => setFilterType(tab.value as MediaType | "")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 16px",
                  borderRadius: "100px",
                  border: active ? "none" : "1px solid var(--color-border-color)",
                  background: active ? "var(--color-amber)" : "transparent",
                  color: active ? "var(--color-void)" : "var(--color-ghost)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
              >
                {tab.label}
                {!loading && count > 0 && (
                  <span style={{
                    padding: "1px 7px",
                    borderRadius: "100px",
                    background: active ? "rgba(0,0,0,0.18)" : "var(--color-muted-bg)",
                    color: active ? "rgba(0,0,0,0.6)" : "var(--color-dim)",
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    lineHeight: "18px",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Status chip strip ──────────────────────────────────────── */}
        <div className="animate-fade-in stagger-2" style={{
          display: "flex",
          gap: "6px",
          marginBottom: "36px",
          flexWrap: "wrap",
        }}>
          {STATUS_CHIPS.map((chip) => {
            const active = filterStatus === chip.value;
            const color = chip.value ? statusColors[chip.value as Status] : "var(--color-dim)";
            return (
              <button
                key={chip.value}
                onClick={() => setFilterStatus(chip.value as Status | "")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "100px",
                  border: `1px solid ${active ? color + "88" : "var(--color-border-color)"}`,
                  background: active ? color + "18" : "transparent",
                  color: active ? color : "var(--color-dim)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: "0.04em",
                }}
              >
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: active ? color : "var(--color-border-color)",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }} />
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        {loading ? (
          /* Skeleton */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "18px",
          }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div className="animate-shimmer" style={{ borderRadius: "10px", aspectRatio: "2/3" }} />
                <div className="animate-shimmer" style={{ borderRadius: "5px", height: "14px", width: "80%" }} />
                <div className="animate-shimmer" style={{ borderRadius: "5px", height: "11px", width: "50%" }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty state */
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "100px 20px",
            gap: "16px",
            textAlign: "center",
          }}>
            <div style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-dim)" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--color-ghost)",
              margin: 0,
              fontStyle: "italic",
            }}>
              {filterType || filterStatus ? "Nothing matches your filters" : "Your archive is empty"}
            </p>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--color-dim)",
              margin: 0,
              letterSpacing: "0.05em",
              maxWidth: "280px",
            }}>
              {filterType || filterStatus
                ? "Try clearing the filters above"
                : "Start tracking movies, shows, games & more"}
            </p>
            {!(filterType || filterStatus) && (
              <Link to="/search" style={{
                marginTop: "8px",
                padding: "11px 24px",
                background: "var(--color-amber)",
                color: "var(--color-void)",
                borderRadius: "8px",
                textDecoration: "none",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                fontWeight: 700,
              }}>
                Discover Media
              </Link>
            )}
            {(filterType || filterStatus) && (
              <button
                onClick={() => { setFilterType(""); setFilterStatus(""); }}
                style={{
                  marginTop: "8px",
                  padding: "9px 20px",
                  background: "transparent",
                  border: "1px solid var(--color-border-color)",
                  color: "var(--color-ghost)",
                  borderRadius: "8px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Grid ──────────────────────────────────────────────── */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "20px",
            }}>
              {items.map((item, i) => {
                const accent = TYPE_COLORS[item.media.type] ?? "var(--color-amber)";
                const isUpdating = updatingIds.has(item.id);
                const isRemoving = removingIds.has(item.id);
                const imgError = imgErrors.has(item.media.id);
                const hovered = hoveredId === item.id;
                const statusColor = statusColors[item.status];

                return (
                  <article
                    key={item.id}
                    className={`animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      opacity: isRemoving ? 0.35 : 1,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    {/* Cover */}
                    <div style={{
                      position: "relative",
                      aspectRatio: "2/3",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "var(--color-surface)",
                      border: `1px solid ${hovered ? accent + "55" : "var(--color-border-color)"}`,
                      boxShadow: hovered
                        ? `0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px ${accent}22`
                        : "0 4px 20px rgba(0,0,0,0.3)",
                      transform: hovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
                      transition: "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
                    }}>
                      {!imgError && item.media.cover_url ? (
                        <img
                          src={item.media.cover_url}
                          alt={item.media.title}
                          onError={() => setImgErrors((p) => new Set(p).add(item.media.id))}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          background: `linear-gradient(135deg, var(--color-deep), var(--color-surface))`,
                          color: "var(--color-muted-bg)",
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                          <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>NO COVER</span>
                        </div>
                      )}

                      {/* Type badge — always visible */}
                      <div style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        background: accent,
                        color: "#fff",
                        fontSize: "9px",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        padding: "3px 7px",
                        borderRadius: "4px",
                        pointerEvents: "none",
                      }}>
                        {TYPE_LABELS[item.media.type]}
                      </div>

                      {/* Remove button — visible on hover */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        title="Remove from archive"
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          width: "26px",
                          height: "26px",
                          borderRadius: "50%",
                          background: "rgba(8,11,18,0.75)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "var(--color-ghost)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                          opacity: hovered ? 1 : 0,
                          transform: hovered ? "scale(1)" : "scale(0.8)",
                          transition: "opacity 0.18s ease, transform 0.18s ease, background 0.15s",
                          backdropFilter: "blur(4px)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(192,57,43,0.85)";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.borderColor = "rgba(192,57,43,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(8,11,18,0.75)";
                          e.currentTarget.style.color = "var(--color-ghost)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        }}
                      >
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Info below cover */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "7px", paddingBottom: "4px" }}>
                      {/* Title */}
                      <h3 style={{
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
                        letterSpacing: "0.01em",
                      }}>
                        {item.media.title}
                      </h3>

                      {/* Status row */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: statusColor,
                          flexShrink: 0,
                        }} />
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item, e.target.value as Status)}
                          disabled={isUpdating}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: statusColor,
                            fontFamily: "var(--font-mono)",
                            fontSize: "11px",
                            fontWeight: 500,
                            cursor: "pointer",
                            appearance: "none",
                            WebkitAppearance: "none",
                            padding: 0,
                            outline: "none",
                            letterSpacing: "0.02em",
                            opacity: isUpdating ? 0.5 : 1,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {(Object.keys(statusColors) as Status[]).map((s) => (
                            <option key={s} value={s} style={{ background: "var(--color-deep)", color: statusColors[s] }}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Star rating */}
                      <div style={{ display: "flex", gap: "1px" }}>
                        {STARS.map((star) => {
                          const filled = (item.user_rating ?? 0) >= star;
                          return (
                            <button
                              key={star}
                              onClick={() => handleRating(item, star)}
                              disabled={isUpdating}
                              title={`Rate ${star}/5`}
                              style={{
                                background: "none",
                                border: "none",
                                padding: "1px 2px",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: filled ? "var(--color-amber)" : "var(--color-muted-bg)",
                                transition: "color 0.12s, transform 0.1s",
                                lineHeight: 1,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.25)"; e.currentTarget.style.color = "var(--color-amber-bright)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.color = filled ? "var(--color-amber)" : "var(--color-muted-bg)"; }}
                            >
                              ★
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: "48px" }}>
                <button
                  onClick={() => fetchItems(false)}
                  disabled={loadingMore}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 36px",
                    background: "transparent",
                    border: "1px solid var(--color-border-color)",
                    borderRadius: "9px",
                    color: "var(--color-ghost)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    transition: "all 0.18s ease",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) {
                      e.currentTarget.style.borderColor = "var(--color-amber)";
                      e.currentTarget.style.color = "var(--color-amber)";
                      e.currentTarget.style.background = "rgba(232,160,48,0.06)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border-color)";
                    e.currentTarget.style.color = "var(--color-ghost)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {loadingMore ? (
                    <>
                      <span style={{
                        width: "13px",
                        height: "13px",
                        border: "1.5px solid var(--color-dim)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin-slow 0.8s linear infinite",
                      }} />
                      Loading…
                    </>
                  ) : (
                    <>
                      Load more
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M19 12l-7 7-7-7" />
                      </svg>
                    </>
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
