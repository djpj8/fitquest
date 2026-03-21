import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const CLASSES = [
  { id: "warrior", name: "Warrior", icon: "⚔️", desc: "Master of strength and power" },
  { id: "mage", name: "Mage", icon: "🔮", desc: "Disciplined mind, precise technique" },
  { id: "ranger", name: "Ranger", icon: "🏹", desc: "Speed, endurance, and agility" },
];

export default function AuthPage() {
  const { login, register, loginError, registerError } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [selectedClass, setSelectedClass] = useState("warrior");
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ ...form, avatarClass: selectedClass });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(43 85% 55%), transparent)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(280 60% 50%), transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, hsl(43 85% 55% / 0.3) 0px, transparent 1px, transparent 40px),
              repeating-linear-gradient(90deg, hsl(43 85% 55% / 0.3) 0px, transparent 1px, transparent 40px)`
          }} />
      </div>

      <div className="w-full max-w-md fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚔️</div>
          <h1 className="text-4xl font-bold gold-shimmer mb-1" style={{ fontFamily: "var(--font-serif)" }}>
            FitQuest
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))", fontStyle: "italic" }}>
            Level up your life, one rep at a time
          </p>
        </div>

        <div className="rpg-card p-6">
          {/* Mode toggle */}
          <div className="flex mb-6 rounded-lg overflow-hidden border" style={{ borderColor: "hsl(var(--border))" }}>
            {(["login", "register"] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className="flex-1 py-2 text-sm font-medium transition-all capitalize"
                style={{
                  fontFamily: "var(--font-serif)",
                  letterSpacing: "0.05em",
                  background: mode === m ? "hsl(var(--primary))" : "transparent",
                  color: mode === m ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                {m === "login" ? "Enter Realm" : "Begin Quest"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                    HERO NAME
                  </label>
                  <input
                    type="text" required
                    value={form.displayName}
                    onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                    placeholder="Your display name"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: "hsl(var(--input))", border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                    onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
                    onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                    USERNAME
                  </label>
                  <input
                    type="text" required
                    value={form.username}
                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
                    onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                EMAIL
              </label>
              <input
                type="email" required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="hero@realm.com"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
                onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
              />
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                PASSWORD
              </label>
              <input
                type="password" required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                onFocus={e => e.target.style.borderColor = "hsl(var(--primary))"}
                onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
              />
            </div>

            {/* Class selection */}
            {mode === "register" && (
              <div>
                <label className="block text-xs mb-2" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", letterSpacing: "0.1em" }}>
                  CHOOSE YOUR CLASS
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CLASSES.map(cls => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClass(cls.id)}
                      className="p-3 rounded-lg text-center transition-all border"
                      style={{
                        background: selectedClass === cls.id ? "hsl(43 85% 55% / 0.15)" : "hsl(var(--muted))",
                        borderColor: selectedClass === cls.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                        boxShadow: selectedClass === cls.id ? "0 0 12px hsl(43 85% 40% / 0.3)" : "none",
                      }}
                    >
                      <div className="text-2xl mb-1">{cls.icon}</div>
                      <div className="text-xs font-bold" style={{ fontFamily: "var(--font-serif)", color: selectedClass === cls.id ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}>
                        {cls.name}
                      </div>
                      <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.65rem" }}>
                        {cls.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-sm px-3 py-2 rounded-lg" style={{ background: "hsl(0 70% 50% / 0.15)", color: "hsl(0 70% 65%)", border: "1px solid hsl(0 70% 35%)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm transition-all"
              style={{
                fontFamily: "var(--font-serif)",
                letterSpacing: "0.1em",
                background: loading ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(43 85% 45%), hsl(43 85% 60%))",
                color: "hsl(220 20% 6%)",
                boxShadow: loading ? "none" : "0 4px 20px hsl(43 85% 40% / 0.3)",
              }}
            >
              {loading ? "⏳ Loading..." : mode === "login" ? "⚔️ Enter Realm" : "🏆 Begin Quest"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-4" style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
          Registrandoti accetti la nostra{" "}
          <a href="#privacy" onClick={e => { e.preventDefault(); alert("Vai su Profilo → Privacy Policy dopo aver fatto login."); }}
            style={{ color: "hsl(var(--primary))", textDecoration: "underline" }}>
            Privacy Policy
          </a>
          {" "}· Contatti:{" "}
          <a href="mailto:djpj8.09@gmail.com" style={{ color: "hsl(var(--primary))" }}>djpj8.09@gmail.com</a>
        </div>
      </div>
    </div>
  );
}
