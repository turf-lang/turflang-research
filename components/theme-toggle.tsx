"use client";

import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { Moon, Sun } from "@/components/icons";

type Theme = "light" | "dark";

/* Light unless the reader chose dark (layout's inline script restores that choice before first paint). */
function read(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/*
 * Puts a saved dark choice back on <html>. The inline script in the root layout does this before first paint,
 * but when React has to client-render the document (an error or notFound() after the stream started), it
 * rebuilds <html> from its own props and the attribute is lost. Every header mounts this toggle, so its mount
 * restores the choice in that case too.
 */
function restore() {
  try {
    if (localStorage.getItem("turf-theme") === "dark" && document.documentElement.dataset.theme !== "dark") {
      document.documentElement.dataset.theme = "dark";
      listeners.forEach((l) => l());
    }
  } catch {}
}

/* Flips between the light default and dark, and remembers a choice of dark. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  // The server cannot know the theme; rendering "light" there and the real value after hydration only swaps the icon.
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);

  const button = useRef<HTMLButtonElement>(null);
  // The icons only transition once the real theme is known; otherwise a dark-theme visitor would watch the sun
  // spin into a moon on every page load as hydration corrects the server's guess.
  // Before paint, so a rebuilt document never shows a frame of the light theme.
  useLayoutEffect(restore, []);
  useEffect(() => {
    const id = requestAnimationFrame(() => button.current?.setAttribute("data-ready", ""));
    return () => cancelAnimationFrame(id);
  }, []);

  const apply = () => {
    const root = document.documentElement;
    const dark = theme !== "dark";
    if (dark) root.dataset.theme = "dark";
    else delete root.dataset.theme;
    try {
      if (dark) localStorage.setItem("turf-theme", "dark");
      else localStorage.removeItem("turf-theme");
    } catch {}
    listeners.forEach((l) => l());
  };

  // A short crossfade of the whole page (globals.css times it) where the browser supports view transitions;
  // elsewhere, and for anyone who asked for less motion, the theme simply changes.
  const flip = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !document.startViewTransition) return apply();
    document.startViewTransition(apply);
  };

  const label = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  return (
    <button
      ref={button}
      type="button"
      onClick={flip}
      data-theme-icon={theme}
      aria-label={label}
      title={label}
      className={`theme-toggle btn btn-sm btn-icon text-ink-soft hover:text-ink ${className}`}
    >
      {/* Both icons are always present and trade places, so the swap can turn rather than blink. */}
      <Sun className="icon-sun" />
      <Moon className="icon-moon" />
    </button>
  );
}
