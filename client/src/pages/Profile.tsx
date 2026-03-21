import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile({ onNavigate }: { onNavigate: (p: string) => void }) {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleDeleteAccount = async () => {
    if (deleteInput !== user.username) {
      setError(`Scrivi "${user.username}" per confermare`);
      return;
    }
    setDeleting(true);
    try {
      await api.del("/auth/account");
      qc.clear();
      await logout();
    } catch (e: any) {
      setError(e.message);
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 fade-in max-w-xl mx-auto">
      <h1 className="text-3xl mb-6" style={{ fontFamily: "var(--font-serif)" }}>⚙️ Profilo</h1>

      {/* Info card */}
      <div className="rpg-card p-5 mb-4">
        <h2 className="text-lg mb-4" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
          Informazioni account
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { label: "Nome", value: user.displayName || "—" },
            { label: "Username", value: `@${user.username}` },
            { label: "Email", value: user.email },
            { label: "Classe", value: user.avatarClass, capitalize: true },
            { label: "Livello", value: `${user.level}` },
            { label: "XP totale", value: user.totalXp?.toLocaleString() },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid hsl(var(--border))" }}>
              <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.875rem" }}>{item.label}</span>
              <span style={{ fontWeight: 500, textTransform: item.capitalize ? "capitalize" : "none" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="rpg-card p-5 mb-4">
        <h2 className="text-lg mb-3" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))" }}>
          Informazioni legali
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button onClick={() => onNavigate("privacy")}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0", background: "none", border: "none", cursor: "pointer", color: "hsl(var(--foreground))", borderBottom: "1px solid hsl(var(--border))", width: "100%", textAlign: "left" }}>
            <span>🔒 Privacy Policy</span>
            <span style={{ color: "hsl(var(--muted-foreground))" }}>→</span>
          </button>
          <div style={{ padding: "0.625rem 0", fontSize: "0.85rem", color: "hsl(var(--muted-foreground))" }}>
            📧 Contatti: <a href="mailto:djpj8.09@gmail.com" style={{ color: "hsl(var(--primary))" }}>djpj8.09@gmail.com</a>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rpg-card p-5" style={{ borderColor: "hsl(var(--destructive-border))" }}>
        <h2 className="text-lg mb-3" style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--destructive))" }}>
          ⚠️ Zona pericolosa
        </h2>

        {!showDeleteConfirm ? (
          <div>
            <p className="text-sm mb-4" style={{ color: "hsl(var(--muted-foreground))" }}>
              Eliminare l'account rimuove permanentemente tutti i tuoi dati: allenamenti, routine, programmi, livello e achievements. Questa azione è irreversibile.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: "0.625rem 1.25rem", borderRadius: "0.5rem", cursor: "pointer",
                background: "hsl(0 70% 50% / 0.15)", color: "hsl(var(--destructive))",
                border: "1px solid hsl(var(--destructive-border))", fontWeight: "bold",
                fontFamily: "var(--font-serif)",
              }}>
              🗑️ Elimina account
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
              Scrivi il tuo username <strong style={{ color: "hsl(var(--foreground))" }}>{user.username}</strong> per confermare l'eliminazione:
            </p>
            <input
              value={deleteInput}
              onChange={e => { setDeleteInput(e.target.value); setError(""); }}
              placeholder={user.username}
              style={{
                width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
                background: "hsl(var(--input))", border: "1px solid hsl(var(--destructive-border))",
                color: "hsl(var(--foreground))", outline: "none", marginBottom: "0.75rem",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ color: "hsl(var(--destructive))", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>
            )}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); setError(""); }}
                style={{
                  flex: 1, padding: "0.625rem", borderRadius: "0.5rem", cursor: "pointer",
                  background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                }}>
                Annulla
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{
                  flex: 1, padding: "0.625rem", borderRadius: "0.5rem", cursor: "pointer",
                  background: "hsl(var(--destructive))", border: "none",
                  color: "white", fontWeight: "bold", fontFamily: "var(--font-serif)",
                  opacity: deleting ? 0.7 : 1,
                }}>
                {deleting ? "⏳ Eliminando..." : "🗑️ Conferma eliminazione"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
