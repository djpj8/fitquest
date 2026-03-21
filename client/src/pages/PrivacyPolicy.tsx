export default function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 fade-in max-w-2xl mx-auto">
      <button onClick={onBack} style={{ color: "hsl(var(--muted-foreground))", background: "none", border: "none", cursor: "pointer", marginBottom: "1rem", fontSize: "0.9rem" }}>
        ← Back
      </button>

      <div className="rpg-card p-6">
        <h1 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", marginBottom: "0.5rem" }}>
          🔒 Privacy Policy
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.85rem", marginBottom: "2rem" }}>
          Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", color: "hsl(var(--foreground))", lineHeight: 1.7 }}>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              1. Titolare del trattamento
            </h2>
            <p>
              Il titolare del trattamento dei dati personali è <strong>Parisi Alessandro</strong>,
              contattabile all'indirizzo email: <a href="mailto:djpj8.09@gmail.com" style={{ color: "hsl(var(--primary))" }}>djpj8.09@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              2. Dati raccolti
            </h2>
            <p>FitQuest raccoglie i seguenti dati personali:</p>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <li><strong>Nome utente e email</strong> — necessari per la registrazione e il login</li>
              <li><strong>Password</strong> — conservata in forma cifrata, non leggibile da nessuno</li>
              <li><strong>Dati di allenamento</strong> — esercizi, routine, programmi e log workout inseriti volontariamente</li>
              <li><strong>Livello e progressi</strong> — calcolati automaticamente dai tuoi allenamenti</li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              Non raccogliamo dati di geolocalizzazione, non usiamo cookie di tracciamento, non vendiamo i tuoi dati a terzi.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              3. Finalità del trattamento
            </h2>
            <p>I dati sono utilizzati esclusivamente per:</p>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <li>Permetterti di accedere al tuo account</li>
              <li>Salvare e mostrare i tuoi allenamenti e progressi</li>
              <li>Calcolare il tuo livello e gli achievements</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              4. Conservazione dei dati
            </h2>
            <p>
              I dati sono conservati su server di <strong>Render.com</strong> (USA) e su database PostgreSQL.
              Render è conforme alle normative internazionali sulla privacy.
              I dati vengono conservati finché mantieni il tuo account attivo.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              5. I tuoi diritti (GDPR)
            </h2>
            <p>Hai diritto a:</p>
            <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <li><strong>Accesso</strong> — sapere quali dati abbiamo su di te</li>
              <li><strong>Rettifica</strong> — correggere dati errati</li>
              <li><strong>Cancellazione</strong> — eliminare il tuo account e tutti i dati associati</li>
              <li><strong>Portabilità</strong> — ricevere i tuoi dati in formato leggibile</li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>
              Per esercitare questi diritti, contattaci a{" "}
              <a href="mailto:djpj8.09@gmail.com" style={{ color: "hsl(var(--primary))" }}>djpj8.09@gmail.com</a>{" "}
              oppure usa la funzione <strong>"Elimina Account"</strong> nelle impostazioni del profilo.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: "var(--font-serif)", color: "hsl(var(--primary))", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              6. Contatti
            </h2>
            <p>
              Per qualsiasi domanda sulla privacy:<br />
              <strong>Parisi Alessandro</strong><br />
              <a href="mailto:djpj8.09@gmail.com" style={{ color: "hsl(var(--primary))" }}>djpj8.09@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
