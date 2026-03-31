import './SkeletonLoader.css';

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-cover animate-shimmer" />
      <div className="skeleton skeleton-text animate-shimmer" />
      <div className="skeleton skeleton-text short animate-shimmer" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row animate-shimmer">
      <div className="skeleton-row-inner" />
    </div>
  );
}

export function SkeletonArtist() {
  return (
    <div className="skeleton-artist-card">
      <div className="skeleton skeleton-circle animate-shimmer" style={{ width: 140, height: 140 }} />
      <div className="skeleton skeleton-text animate-shimmer" style={{ width: 80 }} />
    </div>
  );
}
