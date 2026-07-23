import { useEffect, useState } from "react";
import { FeedView } from "./FeedView";
import { AdminView } from "./AdminView";
import { SubmitView } from "./SubmitView";
import { fetchMe, logout, type MeResponse } from "./api";

type Tab = "feed" | "submit" | "admin";

const TABS: { key: Tab; label: string }[] = [
  { key: "feed", label: "피드" },
  { key: "submit", label: "제보" },
  { key: "admin", label: "검수" },
];

function AuthStatus() {
  const [me, setMe] = useState<MeResponse | null | undefined>(undefined);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const onLogout = async () => {
    await logout();
    setMe(null);
  };

  if (me === undefined) return null;

  if (me) {
    return (
      <div className="auth-status">
        <span>{me.displayName}님</span>
        <button className="btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="auth-status">
      <a className="btn" href="/oauth2/authorization/kakao">
        카카오로 로그인
      </a>
      <a className="btn" href="/oauth2/authorization/google">
        Google로 로그인
      </a>
    </div>
  );
}

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
        <AuthStatus />
      </header>
      <main className="content">
        {tab === "feed" && <FeedView />}
        {tab === "submit" && <SubmitView />}
        {tab === "admin" && <AdminView />}
      </main>
    </div>
  );
}
