import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
  head: () => ({
    meta: [{ title: "スポーツを投稿 — MinorSports" }],
  }),
});

function SubmitPage() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/login" });
    }
  }, [isPending, session, navigate]);

  if (isPending) return <div style={{ padding: "64px", textAlign: "center", color: "var(--ms-muted)" }}>読み込み中...</div>;
  if (!session) return null;

  return <SubmitForm />;
}

function SubmitForm() {
  const navigate = useNavigate();
  const { data: categories = [] } = useQuery(orpc.categories.list.queryOptions());

  const [form, setForm] = useState({
    name: "",
    nameEn: "",
    categoryId: "",
    description: "",
    rules: "",
    history: "",
    originCountry: "",
    foundedYear: "",
    playerCount: "",
    difficulty: "",
    imageUrl: "",
    videoUrl: "",
    tags: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = useMutation({
    mutationFn: () =>
      client.sports.create({
        name: form.name,
        nameEn: form.nameEn || undefined,
        categoryId: form.categoryId,
        description: form.description,
        rules: form.rules || undefined,
        history: form.history || undefined,
        originCountry: form.originCountry || undefined,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        playerCount: form.playerCount || undefined,
        difficulty: form.difficulty ? (Number(form.difficulty) as 1 | 2 | 3 | 4 | 5) : undefined,
        imageUrl: form.imageUrl || undefined,
        videoUrl: form.videoUrl || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      }),
    onSuccess: () => {
      toast.success("投稿を受け付けました。審査後に公開されます。");
      navigate({ to: "/my/submissions" });
    },
    onError: (e) => toast.error(`エラーが発生しました: ${e.message}`),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "スポーツ名は必須です";
    if (!form.categoryId) errs.categoryId = "カテゴリは必須です";
    if (!form.description) errs.description = "説明は必須です";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) submit.mutate();
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <div>
      <div
        style={{
          borderBottom: "1.5px solid var(--ms-border)",
          padding: "48px 0",
          background: "var(--search-bg)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "56px",
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            スポーツを投稿
          </h1>
          <p style={{ fontSize: "13px", color: "var(--ms-muted)" }}>
            新しいスポーツ情報を投稿できます。管理者の審査後に公開されます。
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <FormField label="スポーツ名 *" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              maxLength={100}
              style={inputStyle}
              placeholder="例: フィンスイミング"
            />
          </FormField>

          <FormField label="スポーツ名（英語）">
            <input
              type="text"
              value={form.nameEn}
              onChange={set("nameEn")}
              maxLength={100}
              style={inputStyle}
              placeholder="例: Fin Swimming"
            />
          </FormField>

          <FormField label="カテゴリ *" error={errors.categoryId}>
            <select
              value={form.categoryId}
              onChange={set("categoryId")}
              style={inputStyle}
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="概要・説明 *" error={errors.description}>
            <textarea
              value={form.description}
              onChange={set("description")}
              maxLength={2000}
              rows={5}
              style={inputStyle}
              placeholder="このスポーツについて説明してください..."
            />
          </FormField>

          <FormField label="ルール説明">
            <textarea
              value={form.rules}
              onChange={set("rules")}
              rows={4}
              style={inputStyle}
              placeholder="競技のルールを説明してください..."
            />
          </FormField>

          <FormField label="歴史・背景">
            <textarea
              value={form.history}
              onChange={set("history")}
              rows={4}
              style={inputStyle}
              placeholder="このスポーツの歴史や背景を説明してください..."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="発祥国">
              <input
                type="text"
                value={form.originCountry}
                onChange={set("originCountry")}
                style={inputStyle}
                placeholder="例: フィンランド"
              />
            </FormField>
            <FormField label="発祥年">
              <input
                type="number"
                value={form.foundedYear}
                onChange={set("foundedYear")}
                style={inputStyle}
                placeholder="例: 1950"
                min={0}
                max={2026}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label="競技人口">
              <input
                type="text"
                value={form.playerCount}
                onChange={set("playerCount")}
                style={inputStyle}
                placeholder="例: 約100万人"
              />
            </FormField>
            <FormField label="難易度（1〜5）">
              <select value={form.difficulty} onChange={set("difficulty")} style={inputStyle}>
                <option value="">選択</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="アイキャッチ画像URL">
            <input
              type="url"
              value={form.imageUrl}
              onChange={set("imageUrl")}
              style={inputStyle}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="紹介動画URL">
            <input
              type="url"
              value={form.videoUrl}
              onChange={set("videoUrl")}
              style={inputStyle}
              placeholder="https://..."
            />
          </FormField>

          <FormField label="タグ（カンマ区切り）">
            <input
              type="text"
              value={form.tags}
              onChange={set("tags")}
              style={inputStyle}
              placeholder="例: 水中, スピード, 個人競技"
            />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              type="submit"
              disabled={submit.isPending}
              style={{
                padding: "14px 32px",
                background: "var(--ms-accent)",
                color: "#fff",
                border: "none",
                cursor: submit.isPending ? "not-allowed" : "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                letterSpacing: "0.05em",
                opacity: submit.isPending ? 0.7 : 1,
              }}
            >
              {submit.isPending ? "投稿中..." : "投稿する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  border: "1.5px solid var(--ms-border)",
  background: "var(--paper)",
  color: "var(--ink)",
  outline: "none",
};

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ms-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: "12px", color: "var(--ms-accent)", marginTop: "4px" }}>{error}</p>
      )}
    </div>
  );
}
