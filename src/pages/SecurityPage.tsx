import {
  ShieldCheck,
  Sparkles,
  Lock,
  Zap,
  FileCode,
  Bot,
} from 'lucide-react';

export const SecurityPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '1.4rem' }}>
              Security Hardening & Future Roadmap
            </h1>
          </div>
          <p className="page-subtitle" style={{ maxWidth: '750px', fontSize: '0.9rem' }}>
            Strategic enhancement plans for production readiness: enterprise-grade security hardening, multi-tier
            Redis caching, AI note intelligence, and system scalability.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* 1. Security Hardening */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={18} color="#6366f1" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>1. Security Hardening Upgrades</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Refresh Token Rotation in HttpOnly Cookies
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Move JWT storage out of <code>localStorage</code> into short-lived access tokens (15m) in memory paired with
                refresh tokens (7d) stored in <code>SameSite=Strict; HttpOnly; Secure</code> cookies with automatic reuse detection.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Client-Side Field Level Encryption (CSFLE)
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Implement MongoDB CSFLE for note content with AES-256-GCM. Note bodies are encrypted before reaching the database,
                preventing database administrators from reading raw note contents.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Distributed Rate Limiting (Redis)
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Deploy <code>rate-limiter-flexible</code> backed by Upstash Redis to throttle brute-force attacks on{' '}
                <code>/api/auth/login</code> (limit 5 attempts / 15 mins per IP & account) and prevent DoS.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#a5b4fc', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Audit Logging & SIEM Integration
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Capture all administrative events (user deletions, privilege escalation, global note queries) in an append-only
                audit collection containing actor ID, IP address, and cryptographic integrity hashes.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Performance & Caching */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Zap size={18} color="#eab308" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>2. Performance & Caching Strategy</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#fde047', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Multi-Tier Redis Aggregation Cache
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Cache expensive results of <code>/api/aggregations/interests</code> with a 5-minute TTL. Invalidate cache on user
                interest mutation to keep response times consistently below 5 milliseconds.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#fde047', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Keyset (Cursor-Based) Pagination
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Transition offset pagination (<code>skip()</code>) to cursor pagination (<code>_id &lt; cursor</code>) for massive
                note collections to eliminate <code>O(N)</code> B-tree skip overhead at scale.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#fde047', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Secondary Preferred Read Routing
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Direct aggregation analytics and public post reads to MongoDB Atlas Secondary Replica Nodes, protecting Primary Node
                IOPS strictly for transactional write operations.
              </p>
            </div>
          </div>
        </div>

        {/* 3. AI Features */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles size={18} color="#a855f7" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>3. Future AI & Intelligence Capabilities</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#d8b4fe', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Atlas Vector Search & Semantic Retrieval
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Compute 1536-dimensional embeddings for note contents using text-embedding models and store in a MongoDB Atlas{' '}
                <code>$vectorSearch</code> index for natural language semantic query retrieval.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#d8b4fe', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Automated Note Abstract & Tagging
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                When notes are saved, an AI worker generates a concise 1-sentence abstract and automatically categorizes relevant
                interests into user profiles to enhance aggregation accuracy.
              </p>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ fontWeight: 600, color: '#d8b4fe', fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                Natural Language Analytics Copilot for Admins
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Allow administrators to ask queries in natural language (e.g., <em>"Which users joined this week with interests in cardiology?"</em>)
                and convert them to validated, secure MongoDB Aggregation Pipelines.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Markdown Documentation Index */}
        <div className="card" style={{ borderColor: 'var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <FileCode size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>
              Project Documentation & AI Agent Context Files
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Complete architectural documentation and onboarding guidelines are maintained directly in dedicated Markdown files in
            the codebase:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            <div
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem' }}>
                <Bot size={15} />
                <span>server/AGENT.md</span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Full backend schema, index rules, aggregation stages, and RBAC matrix for AI agents.
              </p>
            </div>

            <div
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#38bdf8', fontSize: '0.85rem' }}>
                <Bot size={15} />
                <span>client/AGENT.md</span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Frontend architecture, routing table, safe API layer, and state management blueprint.
              </p>
            </div>

            <div
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#818cf8', fontSize: '0.85rem' }}>
                <FileCode size={15} />
                <span>server/DEVELOPER.md</span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Backend onboarding guide, quickstart commands, seed credentials, and API specifications.
              </p>
            </div>

            <div
              style={{
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#818cf8', fontSize: '0.85rem' }}>
                <FileCode size={15} />
                <span>client/DEVELOPER.md</span>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Frontend onboarding guide, design tokens, component architecture, and deployment instructions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
