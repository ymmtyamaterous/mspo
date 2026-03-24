import { Link } from "@tanstack/react-router";

type CategoryCardProps = {
  id: string;
  name: string;
  emoji: string;
  description?: string | null;
  sportCount: number;
};

export function CategoryGrid({ categories }: { categories: CategoryCardProps[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
      {categories.map((cat) => (
        <CategoryCard key={cat.id} {...cat} />
      ))}
    </div>
  );
}

export function CategoryCard({ id, name, emoji, description, sportCount }: CategoryCardProps) {
  return (
    <Link
      to="/sports"
      search={{ category: id }}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          border: "1.5px solid var(--ms-border)",
          padding: "24px",
          background: "var(--paper)",
          transition: "background 0.15s",
          cursor: "pointer",
          margin: "-0.75px",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background =
            "rgba(26,20,16,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "var(--paper)";
        }}
      >
        <div style={{ fontSize: "32px", marginBottom: "8px" }}>{emoji}</div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            letterSpacing: "0.05em",
            marginBottom: "4px",
          }}
        >
          {name}
        </div>
        {description && (
          <div style={{ fontSize: "11px", color: "var(--ms-muted)", marginBottom: "8px" }}>
            {description}
          </div>
        )}
        <div
          style={{
            fontSize: "11px",
            color: "var(--ms-accent)",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          {sportCount} スポーツ
        </div>
      </div>
    </Link>
  );
}
