export function DashboardIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M3 12h8V3H3v9Zm10 9h8v-9h-8v9Zm0-18v5h8V3h-8Zm-10 18h8v-5H3v5Z" />
    </svg>
  );
}

export function MealsIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M4 4v6a3 3 0 0 0 3 3v7M7 4v9M11 4v6a3 3 0 0 1-3 3M16 4c2 1 3 3 3 6v10M16 13h3" />
    </svg>
  );
}

export function FoodsIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M7 14c0-3.3 2.7-6 6-6h3a1 1 0 0 1 1 1v3c0 3.3-2.7 6-6 6H8a1 1 0 0 1-1-1v-3Z" />
      <path d="M8 16c1.5 0 3-.6 4.1-1.7L17 9.4" />
    </svg>
  );
}

export function ProfileIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function InfoIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

export function FireIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 3s1 3-1 5-3 3-3 6a4 4 0 0 0 8 0c0-2-1-3-2-4s-1-3-2-7Z" />
    </svg>
  );
}

export function PlusIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SettingsIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="m10.3 4.3 1.7-.8 1.7.8 1.6-1 1.5 1.5-1 1.6.8 1.7 1.9.4v2.1l-1.9.4-.8 1.7 1 1.6-1.5 1.5-1.6-1-1.7.8-.4 1.9h-2.1l-.4-1.9-1.7-.8-1.6 1-1.5-1.5 1-1.6-.8-1.7-1.9-.4V9.9l1.9-.4.8-1.7-1-1.6L6.8 4l1.6 1 1.9-.7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function WarningIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 10v5M12 18h.01" />
    </svg>
  );
}

export function SpinnerIcon({ className = "h-5 w-5 animate-spin" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
