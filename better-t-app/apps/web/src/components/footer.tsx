import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1.5px solid var(--ms-border)",
        background: "var(--ink)",
        color: "var(--paper)",
        padding: "48px 0 32px",
        marginTop: "auto",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          {/* ブランド */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "28px",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              MINOR SPORTS
            </div>
            <p style={{ fontSize: "12px", color: "rgba(247,243,237,0.6)", lineHeight: 1.8 }}>
              世界中のマイナースポーツを<br />探索しよう。
            </p>
          </div>

          {/* コンテンツ */}
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(247,243,237,0.5)",
                marginBottom: "12px",
              }}
            >
              コンテンツ
            </p>
            <div className="flex flex-col gap-2">
              <FooterLink to="/sports">スポーツ図鑑</FooterLink>
              <FooterLink to="/ranking">ランキング</FooterLink>
              <FooterLink to="/categories">カテゴリ</FooterLink>
            </div>
          </div>

          {/* 参加する */}
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(247,243,237,0.5)",
                marginBottom: "12px",
              }}
            >
              参加する
            </p>
            <div className="flex flex-col gap-2">
              <FooterLink to="/submit">スポーツを投稿</FooterLink>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(247,243,237,0.15)",
            paddingTop: "24px",
            fontSize: "11px",
            color: "rgba(247,243,237,0.4)",
            letterSpacing: "0.05em",
          }}
        >
          © 2026 MinorSports. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: "13px",
        color: "rgba(247,243,237,0.75)",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
