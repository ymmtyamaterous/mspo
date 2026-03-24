import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
  head: () => ({
    meta: [{ title: "カテゴリ管理 — 管理画面 — MinorSports" }],
  }),
});

type FormState = {
  name: string;
  emoji: string;
  description: string;
  sortOrder: number;
};

const emptyForm: FormState = {
  name: "",
  emoji: "",
  description: "",
  sortOrder: 0,
};

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery(
    orpc.categories.list.queryOptions({ input: {} })
  );

  const createMutation = useMutation({
    mutationFn: () =>
      client.categories.create({
        name: form.name,
        emoji: form.emoji,
        description: form.description || undefined,
        sortOrder: form.sortOrder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setForm(emptyForm);
      toast.success("カテゴリを作成しました");
    },
    onError: (e) => toast.error(`作成失敗: ${e.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) =>
      client.categories.update({
        id,
        name: form.name,
        emoji: form.emoji,
        description: form.description || undefined,
        sortOrder: form.sortOrder,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setForm(emptyForm);
      setEditId(null);
      toast.success("更新しました");
    },
    onError: (e) => toast.error(`更新失敗: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => client.categories.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("削除しました");
    },
    onError: (e) => toast.error(`削除失敗: ${e.message}`),
  });

  const handleEdit = (cat: NonNullable<typeof categories>[number]) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      emoji: cat.emoji ?? "",
      description: cat.description ?? "",
      sortOrder: cat.sortOrder ?? 0,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1.5px solid var(--ms-border)",
    fontSize: "13px",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "4px",
    color: "var(--ms-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "40px",
          letterSpacing: "0.05em",
          marginBottom: "32px",
          borderBottom: "1.5px solid var(--ms-border)",
          paddingBottom: "16px",
        }}
      >
        CATEGORY MANAGEMENT
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "32px" }}>
        {/* Form */}
        <div
          style={{
            border: "1.5px solid var(--ms-border)",
            padding: "24px",
            background: "#fff",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              marginBottom: "20px",
              letterSpacing: "0.05em",
            }}
          >
            {editId ? "カテゴリを編集" : "新規カテゴリ作成"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>カテゴリ名 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                placeholder="例: 格闘系"
              />
            </div>
            <div>
              <label style={labelStyle}>emoji *</label>
              <input
                type="text"
                value={form.emoji}
                onChange={(e) => setForm((p) => ({ ...p, emoji: e.target.value }))}
                style={inputStyle}
                placeholder="例: 🥋"
              />
            </div>
            <div>
              <label style={labelStyle}>説明</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                style={{ ...inputStyle, height: "80px", resize: "vertical" }}
              />
            </div>
            <div>
              <label style={labelStyle}>並び順</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "var(--ms-accent)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
                onClick={() => {
                  if (editId) {
                    updateMutation.mutate(editId);
                  } else {
                    createMutation.mutate();
                  }
                }}
                disabled={!form.name || !form.emoji}
              >
                {editId ? "更新する" : "作成する"}
              </button>
              {editId && (
                <button
                  type="button"
                  style={{
                    padding: "10px 16px",
                    background: "transparent",
                    border: "1.5px solid var(--ms-border)",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                  onClick={() => {
                    setEditId(null);
                    setForm(emptyForm);
                  }}
                >
                  キャンセル
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category list */}
        <div>
          {isLoading ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--ms-muted)" }}>読み込み中...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {(categories ?? []).map((cat) => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--ms-border)",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      background: "var(--ms-accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {cat.emoji ?? "🏃"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>{cat.name}</p>
                    <p style={{ fontSize: "12px", color: "var(--ms-muted)" }}>{cat.description ?? ""}</p>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--ms-muted)" }}>
                    {(cat as any).sportCount ?? 0} 件
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid var(--ms-border)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                      onClick={() => handleEdit(cat)}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: "5px 10px",
                        border: "1px solid var(--ms-muted)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: "var(--ms-muted)",
                      }}
                      onClick={() => {
                        if (confirm("削除しますか？")) {
                          deleteMutation.mutate(cat.id);
                        }
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
