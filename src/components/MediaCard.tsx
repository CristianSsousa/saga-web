import { useState } from "react";
import type { MediaResult } from "../api/search";
import type { Status } from "../api/library";
import StatusSelect from "./StatusSelect";

const typeColors: Record<string, string> = {
  movie: "var(--color-movie)",
  tv: "var(--color-tv)",
  game: "var(--color-game)",
  book: "var(--color-book)",
  manga: "var(--color-manga)",
};

const typeLabels: Record<string, string> = {
  movie: "MOVIE",
  tv: "TV",
  game: "GAME",
  book: "BOOK",
  manga: "MANGA",
};

interface Props {
  media: MediaResult;
  onAdd: (media: MediaResult, status: Status) => void;
  adding?: boolean;
  added?: boolean;
}

export default function MediaCard({ media, onAdd, adding = false, added = false }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status>("planning");
  const [imgError, setImgError] = useState(false);

  const accentColor = typeColors[media.type] ?? "#e8a030";

  const handleAdd = () => {
    if (added) return;
    if (showPicker) {
      onAdd(media, selectedStatus);
      setShowPicker(false);
    } else {
      setShowPicker(true);
    }
  };

  return (
    <article
      className="animate-fade-in"
      style={{
        background: "var(--color-surface)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid var(--color-border-color)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}44`;
        e.currentTarget.style.borderColor = `${accentColor}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.35)";
        e.currentTarget.style.borderColor = "var(--color-border-color)";
      }}
    >
      {/* Cover Image */}
      <div
        style={{
          aspectRatio: "2/3",
          position: "relative",
          overflow: "hidden",
          background: "var(--color-deep)",
          flexShrink: 0,
        }}
      >
        {!imgError && media.cover_url ? (
          <img
            src={media.cover_url}
            alt={media.title}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.3s ease",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--color-dim)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
              NO COVER
            </span>
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
          {typeLabels[media.type] ?? media.type.toUpperCase()}
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex: 1,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: "14px",
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
            {media.title}
          </h3>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--color-dim)",
              letterSpacing: "0.04em",
            }}
          >
            {media.source}
          </p>
        </div>

        {/* Status picker (revealed on click) */}
        {showPicker && !added && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--color-dim)", letterSpacing: "0.08em" }}>
              STATUS
            </label>
            <StatusSelect value={selectedStatus} onChange={setSelectedStatus} />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleAdd}
          disabled={adding}
          style={{
            marginTop: "auto",
            padding: "8px 12px",
            borderRadius: "7px",
            border: added ? "1px solid var(--color-game)" : `1px solid ${showPicker ? accentColor : "var(--color-border-color)"}`,
            background: added ? `var(--color-game)22` : showPicker ? `${accentColor}22` : "transparent",
            color: added ? "var(--color-game)" : showPicker ? accentColor : "var(--color-ghost)",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            fontWeight: 600,
            cursor: added ? "default" : "pointer",
            transition: "all 0.18s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {adding ? (
            <span
              style={{
                width: "12px",
                height: "12px",
                border: "1.5px solid var(--color-dim)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin-slow 0.8s linear infinite",
              }}
            />
          ) : added ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added
            </>
          ) : showPicker ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Confirm
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add to Library
            </>
          )}
        </button>
      </div>
    </article>
  );
}
