"use client";

import { useEffect } from "react";
import Link from "next/link";
import ButtonComponent from "../Resuable/ButtonComponent";

export function MobileMenuToggle({ menuOpen, setMenuOpen }) {
  return (
    <button
      type="button"
      aria-label={menuOpen ? "Close menu" : "Open menu"}
      aria-expanded={menuOpen}
      aria-controls="mobile-navigation"
      onClick={() => setMenuOpen((open) => !open)}
      className="hidden size-11 items-center justify-center max-md:flex"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        {menuOpen ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
      </svg>
    </button>
  );
}

export default function MobileNavbar({ links, menuOpen, setMenuOpen }) {
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1025.02px)");
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <div
      id="mobile-navigation"
      aria-hidden={!menuOpen}
      inert={!menuOpen}
      data-lenis-prevent
      className={`fixed inset-0 z-400 hidden h-dvh w-full overflow-y-auto bg-primary text-background transition-transform duration-[850ms] ease-[cubic-bezier(0.83,0,0.17,1)] max-md:block ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div className="flex min-h-full flex-col justify-between gap-10 px-[7%] pb-8 pt-28">
        <nav aria-label="Mobile navigation" className="flex flex-col gap-6">
          {links.map(({ href, label }, index) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              // Rides in behind the panel, one after the next. Closing runs
              // with no delay so the whole set leaves with the panel rather
              // than trailing out of a cover that has already gone.
              style={{ transitionDelay: menuOpen ? `${220 + index * 60}ms` : "0ms" }}
              className={`font-pp text-4xl uppercase leading-none transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div
          // Last in, just after the final link.
          style={{ transitionDelay: menuOpen ? `${220 + links.length * 60}ms` : "0ms" }}
          className={`flex flex-col gap-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
            menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <p className="flex items-center gap-2 font-mono text-sm uppercase">
            <span className="size-2.5 bg-background" />
            Available for work
          </p>
          <ButtonComponent href="#contact" onClick={() => setMenuOpen(false)} className="w-full !bg-background !text-primary max-md:px-5 max-md:py-4" />
        </div>
      </div>
    </div>
  );
}
