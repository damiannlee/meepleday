import { useState } from "react";
import { FeedView } from "./FeedView";
import { AdminView } from "./AdminView";
import { SubmitView } from "./SubmitView";

type Tab = "feed" | "submit" | "admin";

const TABS: { key: Tab; label: string }[] = [
  { key: "feed", label: "피드" },
  { key: "submit", label: "제보" },
  { key: "admin", label: "검수" },
];

export function App() {
  const [tab, setTab] = useState<Tab>("feed");

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          🎲 MeepleDay
          <span className="tagline">보드게임 펀딩·선주문·특가를 한눈에</span>
        </div>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="content">
        {tab === "feed" && <FeedView />}
        {tab === "submit" && <SubmitView />}
        {tab === "admin" && <AdminView />}
      </main>
    </div>
  );
}
