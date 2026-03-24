import { Link } from "@tanstack/react-router";

type PickupSport = {
  id: string;
  name: string;
  nameEn?: string | null;
  description: string;
  originCountry?: string | null;
  imageUrl?: string | null;
  category: { name: string; emoji: string };
  viewCount: number;
};

type SideCardSport = PickupSport & { label: "注目" | "急上昇" | "新着" };

type PickupSectionProps = {
  main: PickupSport;
  sideCards: SideCardSport[];
};

export function PickupSection({ main, sideCards }: PickupSectionProps) {
  return (
    <section
      style={{
        borderTop: "1.5px solid var(--ms-border)",
        paddingTop: "48px",
        paddingBottom: "48px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              letterSpacing: "0.05em",
            }}
          >
            今週の特集
          </h2>
          <span style={{ fontSize: "11px", color: "var(--ms-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            WEEKLY PICKUP
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* メインカード */}
          <Link
            to="/sports/$id"
            params={{ id: main.id }}
            style={{ textDecoration: "none", color: "inherit" }}
            className="lg:col-span-2"
          >
            <div
              style={{
                border: "1.5px solid var(--ms-border)",
                overflow: "hidden",
                background: "var(--paper)",
                height: "100%",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "rgba(26,20,16,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background =
                  "var(--paper)";
              }}
            >
              {main.imageUrl && (
                <div style={{ height: "240px", overflow: "hidden" }}>
                  <img
                    src={main.imageUrl}
                    alt={main.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              )}
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-accent)",
                    marginBottom: "8px",
                  }}
                >
                  {main.category.emoji} {main.category.name}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "36px",
                    letterSpacing: "0.03em",
                    lineHeight: 1.1,
                    marginBottom: "12px",
                  }}
                >
                  {main.name}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--ms-muted)",
                    lineHeight: 1.8,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {main.description}
                </p>
              </div>
            </div>
          </Link>

          {/* サイドカード */}
          <div style={{ display: "flex", flexDirection: "column", margin: "-0.75px" }}>
            {sideCards.map((sc) => (
              <Link
                key={sc.id}
                to="/sports/$id"
                params={{ id: sc.id }}
                style={{ textDecoration: "none", color: "inherit", flex: 1 }}
              >
                <div
                  style={{
                    border: "1.5px solid var(--ms-border)",
                    padding: "20px",
                    background: "var(--paper)",
                    transition: "background 0.15s",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(26,20,16,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background =
                      "var(--paper)";
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      background: "var(--ms-accent)",
                      color: "#fff",
                      fontSize: "10px",
                      letterSpacing: "0.08em",
                      alignSelf: "flex-start",
                    }}
                  >
                    {sc.label}
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "20px",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {sc.name}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--ms-muted)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {sc.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
