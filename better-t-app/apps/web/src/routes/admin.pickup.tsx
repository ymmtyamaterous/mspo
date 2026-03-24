import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/pickup")({
  component: AdminPickupPage,
  head: () => ({
    meta: [{ title: "ピックアップ設定 — 管理画面 — MinorSports" }],
  }),
});

function AdminPickupPage() {
  const queryClient = useQueryClient();
  const [mainId, setMainId] = useState("");
const [sideCards, setSideCards] = useState<Array<{ sportId: string; label: "注目" | "急上昇" | "新着" | "" }>>([  
    { sportId: "", label: "" },
    { sportId: "", label: "" },
    { sportId: "", label: "" },
  ]);

  const { data: current } = useQuery(orpc.pickup.getCurrent.queryOptions());

  const { data: sportsData } = useQuery(
    orpc.sports.list.queryOptions({ input: { sortBy: "createdAt", limit: 200 } })
  );

  const setPickupMutation = useMutation({
    mutationFn: () =>
      client.pickup.set({
        mainSportId: mainId,
        sideCards: sideCards
          .filter((s): s is { sportId: string; label: "注目" | "急上昇" | "新着" } => !!s.sportId && s.label !== ""),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.success("ピックアップを更新しました");
    },
    onError: (e) => toast.error(`更新失敗: ${e.message}`),
  });

  const sports = sportsData?.items ?? [];

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 12px",
    border: "1.5px solid var(--ms-border)",
    fontSize: "13px",
    background: "#fff",
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
        PICKUP SETTING
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* 設定フォーム */}
        <div style={{ border: "1.5px solid var(--ms-border)", padding: "24px", background: "#fff" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              marginBottom: "20px",
              letterSpacing: "0.05em",
            }}
          >
            新規ピックアップを設定
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>メインスポーツ *</label>
              <select
                value={mainId}
                onChange={(e) => setMainId(e.target.value)}
                style={selectStyle}
              >
                <option value="">選択してください</option>
                {sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ ...labelStyle, marginBottom: "12px" }}>サイドカード (最大3件)</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sideCards.map((card, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid var(--ms-border)",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "var(--ms-muted)", fontWeight: 700 }}>
                      SIDE {i + 1}
                    </span>
                    <select
                      value={card.sportId}
                      onChange={(e) => {
                        const updated = [...sideCards];
                        updated[i] = { ...updated[i], sportId: e.target.value };
                        setSideCards(updated);
                      }}
                      style={selectStyle}
                    >
                      <option value="">スポーツを選択</option>
                      {sports.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={card.label}
                      onChange={(e) => {
                        const updated = [...sideCards];
                        updated[i] = { ...updated[i], label: e.target.value as "" | "注目" | "急上昇" | "新着" };
                        setSideCards(updated);
                      }}
                      style={selectStyle}
                    >
                      <option value="">ラベルを選択</option>
                      <option value="注目">注目</option>
                      <option value="急上昇">急上昇</option>
                      <option value="新着">新着</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              style={{
                padding: "12px",
                background: "var(--ms-accent)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
              }}
              onClick={() => setPickupMutation.mutate()}
              disabled={!mainId || setPickupMutation.isPending}
            >
              ピックアップを更新する
            </button>
          </div>
        </div>

        {/* 現在のピックアップ */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              marginBottom: "20px",
              letterSpacing: "0.05em",
            }}
          >
            現在のピックアップ
          </h2>

          {!current ? (
            <div
              style={{
                border: "1.5px dashed var(--ms-border)",
                padding: "32px",
                textAlign: "center",
                color: "var(--ms-muted)",
                fontSize: "13px",
              }}
            >
              ピックアップが設定されていません
            </div>
          ) : (
            <div>
              <div
                style={{
                  background: "var(--ink)",
                  color: "#f7f3ed",
                  padding: "20px",
                  marginBottom: "12px",
                }}
              >
                <p style={{ fontSize: "11px", opacity: 0.6, marginBottom: "4px" }}>MAIN PICKUP</p>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "24px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {current.main?.name}
                </p>
              </div>
              {current.sideCards?.map((card: any, i: number) => (
                <div
                  key={i}
                  style={{
                    border: "1.5px solid var(--ms-border)",
                    padding: "12px 16px",
                    marginBottom: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "#fff",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      background: "var(--ms-accent)",
                      color: "#fff",
                    }}
                  >
                    {card.label || `SIDE ${i + 1}`}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>{card.sport?.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
