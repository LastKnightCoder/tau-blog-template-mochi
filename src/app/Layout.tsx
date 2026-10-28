import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@mochi/ui";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Balloon } from "./scenery";

const SHOW_AFTER_PX = 300;
const FLOAT_AWAY_MS = 1000;

/** 回到顶部：滚过一屏后出现，点击后气球飘走、页面回顶 */
function BalloonToTop() {
  const [visible, setVisible] = useState(false);
  const [flying, setFlying] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!flying) return;
    const timer = setTimeout(() => setFlying(false), FLOAT_AWAY_MS);
    return () => clearTimeout(timer);
  }, [flying]);
  return (
    <button
      type="button"
      aria-label="回到顶部"
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        setFlying(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className={cn(
        "fixed right-6 bottom-6 z-50 w-[54px] cursor-pointer border-0 bg-transparent p-0 transition-[opacity,transform] duration-500 ease-spring",
        visible ? "mochi-sway" : "pointer-events-none translate-y-8 opacity-0",
        flying && "mochi-float-away",
      )}
    >
      <Balloon />
    </button>
  );
}

export function Layout({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-paper focus:px-3 focus:py-1">
        跳到正文
      </a>
      <Header />
      <main id="main" className={cn("mochi-page-in relative flex-1", className)}>
        {children}
      </main>
      <Footer />
      <BalloonToTop />
    </div>
  );
}
