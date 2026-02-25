import { useMemo, useState } from "react";

export default function AnimatedInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = useMemo(() => {
    if (!isPassword) return type;
    return showPassword ? "text" : "password";
  }, [isPassword, showPassword, type]);

  return (
    <div className="relative">
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        placeholder=" "
        className={`peer w-full rounded-xl border border-white/15 bg-black/30 pb-2.5 pt-5 text-white outline-none transition focus:border-indigo-300/70 focus:ring-2 focus:ring-indigo-300/20 ${
          isPassword ? "px-4 pr-12" : "px-4"
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2.5 origin-left text-xs text-white/60 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/45 peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-indigo-200"
      >
        {label}
      </label>
      {isPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white/90"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.2A11.4 11.4 0 0 1 12 6c6.5 0 10 6 10 6a19 19 0 0 1-4.3 4.9" />
      <path d="M6.5 6.8C3.8 8.7 2 12 2 12s3.5 6 10 6c1 0 2-.1 2.9-.4" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
