import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/",
  });
  const { isPending } = authClient.useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("アカウントを作成しました");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z
        .object({
          name: z.string().min(2, "名前は2文字以上で入力してください"),
          email: z.email("有効なメールアドレスを入力してください"),
          password: z.string().min(8, "パスワードは8文字以上で入力してください"),
          confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "パスワードが一致しません",
          path: ["confirmPassword"],
        }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div
      className="mx-auto w-full max-w-md"
      style={{ marginTop: "64px", marginBottom: "64px", padding: "0 16px" }}
    >
      {/* ヘッダー */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--ms-muted)",
            marginBottom: "12px",
          }}
        >
          JOIN US
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(40px, 8vw, 64px)",
            letterSpacing: "0.05em",
            lineHeight: 1,
            color: "var(--ink)",
          }}
        >
          CREATE <span style={{ color: "var(--ms-accent)" }}>ACCOUNT</span>
        </h1>
      </div>

      {/* フォームカード */}
      <div
        style={{
          border: "1.5px solid var(--ms-border)",
          padding: "40px 32px",
          backgroundColor: "var(--paper)",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field name="name">
            {(field) => (
              <div className="space-y-1">
                <Label
                  htmlFor={field.name}
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-muted)",
                  }}
                >
                  Name
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--ms-border)",
                    borderRadius: "0",
                    color: "var(--ink)",
                  }}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} style={{ color: "var(--ms-accent)", fontSize: "12px" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <div className="space-y-1">
                <Label
                  htmlFor={field.name}
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-muted)",
                  }}
                >
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--ms-border)",
                    borderRadius: "0",
                    color: "var(--ink)",
                  }}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} style={{ color: "var(--ms-accent)", fontSize: "12px" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-1">
                <Label
                  htmlFor={field.name}
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-muted)",
                  }}
                >
                  Password
                </Label>
                <div style={{ position: "relative" }}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showPassword ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid var(--ms-border)",
                      borderRadius: "0",
                      color: "var(--ink)",
                      paddingRight: "40px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--ms-muted)",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} style={{ color: "var(--ms-accent)", fontSize: "12px" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <div className="space-y-1">
                <Label
                  htmlFor={field.name}
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--ms-muted)",
                  }}
                >
                  Confirm Password
                </Label>
                <div style={{ position: "relative" }}>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={showConfirm ? "text" : "password"}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid var(--ms-border)",
                      borderRadius: "0",
                      color: "var(--ink)",
                      paddingRight: "40px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--ms-muted)",
                      padding: "0",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={showConfirm ? "パスワードを隠す" : "パスワードを表示"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} style={{ color: "var(--ms-accent)", fontSize: "12px" }}>
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: canSubmit && !isSubmitting ? "var(--ms-accent)" : "var(--ms-border)",
                  color: "#fff",
                  border: "none",
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  letterSpacing: "0.1em",
                  cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
                  transition: "background-color 0.2s",
                  marginTop: "8px",
                }}
              >
                {isSubmitting ? "CREATING..." : "CREATE ACCOUNT"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>

      {/* 切り替えリンク */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <p style={{ fontSize: "13px", color: "var(--ms-muted)" }}>
          すでにアカウントをお持ちの方は{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--ms-accent)",
              fontWeight: "700",
              textDecoration: "underline",
              fontSize: "13px",
            }}
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
}
