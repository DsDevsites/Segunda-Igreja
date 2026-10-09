import { FormEvent, useEffect, useState } from 'react'
import { ArrowLeft, Cross, Eye, EyeOff, LockKeyhole, LogOut, ShieldCheck } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

type ViewState = 'loading' | 'login' | 'dashboard' | 'not-admin' | 'error'

export default function AdminApp() {
  const [view, setView] = useState<ViewState>(isSupabaseConfigured ? 'loading' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!supabase) return
    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) {
        setMessage('Não foi possível verificar a sessão. Tente novamente.')
        setView('error')
        return
      }
      if (!data.session) {
        setView('login')
        return
      }
      if (data.session.user.app_metadata?.role === 'admin') {
        setView('dashboard')
      } else {
        void supabase?.auth.signOut()
        setView('not-admin')
      }
    })

    return () => { active = false }
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!supabase) {
      setMessage('A conexão com o Supabase ainda não foi configurada. O login será ativado depois de criar o projeto e definir as variáveis de ambiente.')
      return
    }

    setBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error || !data.user) {
      setMessage('Não foi possível entrar. Confira o e-mail e a senha.')
      return
    }

    if (data.user.app_metadata?.role !== 'admin') {
      await supabase.auth.signOut()
      setView('not-admin')
      setMessage('Esta conta não tem permissão administrativa. Entre em contato com o responsável pelo site.')
      return
    }

    setView('dashboard')
  }

  async function handleSignOut() {
    if (supabase) await supabase.auth.signOut()
    setPassword('')
    setView('login')
  }

  return (
    <main className="admin-shell">
      <div className="admin-topline" />
      <a href="/" className="admin-back"><ArrowLeft size={16} /> Voltar ao site</a>

      {view === 'loading' ? (
        <section className="admin-card admin-centered">
          <span className="admin-emblem"><Cross size={27} /></span>
          <p>Verificando acesso seguro...</p>
        </section>
      ) : null}

      {(view === 'login' || view === 'error' || view === 'not-admin') ? (
        <section className="admin-card">
          <div className="admin-brand">
            <span className="admin-emblem"><Cross size={28} strokeWidth={1.6} /></span>
            <span><strong>Segunda Igreja</strong><small>Presbiteriana de Belo Horizonte</small></span>
          </div>
          <div className="admin-divider" />
          <span className="admin-kicker"><LockKeyhole size={14} /> ÁREA RESTRITA</span>
          <h1>Acesso administrativo</h1>
          <p className="admin-description">Entre com a conta autorizada para gerenciar os conteúdos do site.</p>

          <form className="admin-form" onSubmit={handleLogin}>
            <label htmlFor="admin-email">E-mail</label>
            <input id="admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@exemplo.com" required />
            <label htmlFor="admin-password">Senha</label>
            <div className="admin-password-wrap">
              <input id="admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" required />
              <button className="admin-password-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
            {message ? <p className="admin-message" role="alert">{message}</p> : null}
            <button className="admin-submit" type="submit" disabled={busy}>{busy ? 'Verificando...' : 'Entrar no painel'}</button>
          </form>

          {!isSupabaseConfigured ? (
            <div className="admin-setup-note"><ShieldCheck size={17} /><span>Ambiente de autenticação ainda não configurado. Este formulário só permitirá acesso após conectarmos o Supabase e autorizarmos uma conta administrativa.</span></div>
          ) : null}
          <p className="admin-security-note">Acesso exclusivo à equipe autorizada da igreja.</p>
        </section>
      ) : null}

      {view === 'dashboard' ? (
        <section className="admin-card admin-dashboard">
          <div className="admin-dashboard-heading">
            <span className="admin-emblem"><ShieldCheck size={27} /></span>
            <div><span className="admin-kicker">PAINEL SEGURO</span><h1>Bem-vindo ao painel</h1><p className="admin-description">A autenticação foi validada. A gestão de notícias, agenda e páginas será adicionada na próxima etapa.</p></div>
          </div>
          <div className="admin-dashboard-status"><span className="status-dot" /> Conta administrativa autenticada</div>
          <button className="admin-submit admin-logout" onClick={handleSignOut}><LogOut size={17} /> Sair com segurança</button>
        </section>
      ) : null}

      <footer className="admin-footer">© {new Date().getFullYear()} Segunda Igreja Presbiteriana de Belo Horizonte</footer>
    </main>
  )
}
