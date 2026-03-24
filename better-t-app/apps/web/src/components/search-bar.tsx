import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";

type SearchBarProps = {
  defaultValue?: string;
  placeholder?: string;
  onSearch?: (value: string) => void;
};

export function SearchBar({
  defaultValue = "",
  placeholder = "スポーツ名・キーワード・国名で検索...",
  onSearch,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    } else {
      navigate({ to: "/sports", search: { search: value } });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        border: "1.5px solid var(--ink)",
        overflow: "hidden",
        background: "var(--paper)",
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: "12px 16px",
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "var(--ink)",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "12px 24px",
          background: "var(--ink)",
          color: "var(--paper)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          letterSpacing: "0.05em",
        }}
      >
        <Search size={16} />
        検索
      </button>
    </form>
  );
}
