import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Cross,
  MapPin,
  Menu,
  PlayCircle,
  X,
} from 'lucide-react'

const serviceTimes = [
  { day: 'Domingo', time: 'Horários a confirmar', note: 'Culto de adoração' },
  { day: 'Durante a semana', time: 'Programação a confirmar', note: 'Estudos e encontros' },
]

const quickLinks = [
  { icon: BookOpen, title: 'Nossa história', text: 'Conheça nossa caminhada de fé e a história da nossa comunidade.', href: '#historia' },
  { icon: PlayCircle, title: 'Mensagens', text: 'Acompanhe sermões, estudos bíblicos e transmissões.', href: '#mensagens' },
  { icon: CalendarDays, title: 'Agenda', text: 'Veja os encontros e eventos da vida da igreja.', href: '#agenda' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        <span>Uma comunidade reunida pela fé, pela Palavra e pela comunhão.</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Segunda Igreja Presbiteriana - início" onClick={closeMenu}>
          <span className="brand-mark"><Cross size={25} strokeWidth={1.7} /></span>
          <span className="brand-copy">
            <strong>Segunda Igreja</strong>
            <small>Presbiteriana de Belo Horizonte</small>
          </span>
        </a>

        <button className="mobile-menu-button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegação principal">
          <a href="#inicio" onClick={closeMenu}>Início</a>
          <a href="#historia" onClick={closeMenu}>Nossa história</a>
          <a href="#agenda" onClick={closeMenu}>Cultos e agenda</a>
          <a href="#mensagens" onClick={closeMenu}>Mensagens</a>
          <a className="nav-contact" href="#contato" onClick={closeMenu}>Entre em contato <ArrowRight size={15} /></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-image" role="img" aria-label="Interior de um templo iluminado pela luz natural" />
          <div className="hero-shade" />
          <div className="hero-content">
            <span className="eyebrow eyebrow-light"><span /> Fé • Palavra • Comunhão</span>
            <h1>Uma história de fé.<br /><em>Uma comunidade em Cristo.</em></h1>
            <p>Um lugar para conhecer a Palavra, crescer na fé e caminhar em comunhão.</p>
            <div className="hero-actions">
              <a className="button button-gold" href="#historia">Conheça nossa igreja <ArrowRight size={17} /></a>
              <a className="hero-text-link" href="#agenda">Confira a programação <ArrowDownRight size={17} /></a>
            </div>
          </div>
          <div className="hero-caption"><span className="caption-line" /> Segunda Igreja Presbiteriana de Belo Horizonte</div>
        </section>

        <section className="welcome section-wrap" id="historia">
          <div className="welcome-heading">
            <span className="eyebrow"><span /> Seja bem-vindo</span>
            <h2>Tradição na fé.<br /><em>Esperança para hoje.</em></h2>
          </div>
          <div className="welcome-copy">
            <p className="lead">Somos uma comunidade que deseja glorificar a Deus, anunciar o evangelho de Jesus Cristo e viver a fé em comunhão.</p>
            <p>Este espaço está sendo preparado para reunir a história da igreja, informações sobre os cultos, mensagens e atividades da nossa comunidade.</p>
            <a className="text-link" href="#contato">Saiba mais sobre nós <ArrowRight size={16} /></a>
          </div>
        </section>

        <section className="quick-section">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <span className="eyebrow"><span /> Explore</span>
                <h2>Conheça a vida da <em>igreja.</em></h2>
              </div>
              <p>Encontre informações, acompanhe as mensagens e participe da nossa programação.</p>
            </div>
            <div className="quick-grid">
              {quickLinks.map(({ icon: Icon, title, text, href }, index) => (
                <a className="quick-card" href={href} key={title}>
                  <span className="quick-card-number">0{index + 1}</span>
                  <span className="quick-icon"><Icon size={22} strokeWidth={1.6} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="card-arrow"><ArrowRight size={18} /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="service-section section-wrap" id="agenda">
          <div className="service-intro">
            <span className="eyebrow"><span /> Venha nos visitar</span>
            <h2>Há um lugar<br />para você <em>conosco.</em></h2>
            <p>Será uma alegria receber você e sua família. Em breve, esta área terá os horários oficiais e a programação atualizada da igreja.</p>
            <a className="button button-blue" href="#contato">Planeje sua visita <ArrowRight size={17} /></a>
          </div>
          <div className="service-card">
            <div className="service-card-title">
              <span className="service-symbol"><Clock3 size={20} /></span>
              <div><span className="eyebrow">Programação</span><h3>Cultos e encontros</h3></div>
            </div>
            {serviceTimes.map((service) => (
              <div className="service-row" key={service.day}>
                <div><strong>{service.day}</strong><span>{service.note}</span></div>
                <span className="service-time">{service.time}</span>
              </div>
            ))}
            <p className="pending-note">Os horários serão confirmados pela liderança antes da publicação oficial.</p>
          </div>
        </section>

        <section className="message-section" id="mensagens">
          <div className="message-image" role="img" aria-label="Bíblia aberta sobre um banco de madeira" />
          <div className="message-content">
            <span className="eyebrow eyebrow-light"><span /> Palavra que edifica</span>
            <h2>Uma fé que se fortalece<br /><em>ao ouvir a Palavra.</em></h2>
            <p>Este espaço reunirá sermões, estudos e transmissões para você acompanhar e compartilhar.</p>
            <a className="button button-outline-light" href="#contato">Acompanhe as mensagens <PlayCircle size={18} /></a>
          </div>
        </section>

        <section className="contact-section section-wrap" id="contato">
          <div>
            <span className="eyebrow"><span /> Estamos à disposição</span>
            <h2>Vamos nos <em>conhecer?</em></h2>
            <p>Em breve, você encontrará aqui os contatos oficiais, o endereço e os links das redes sociais da igreja.</p>
          </div>
          <div className="contact-placeholder">
            <div className="contact-placeholder-row"><MapPin size={19} /><span>Endereço oficial a confirmar</span></div>
            <div className="contact-placeholder-row"><CalendarDays size={19} /><span>Horários dos cultos a confirmar</span></div>
            <div className="contact-placeholder-row"><PlayCircle size={19} /><span>Redes sociais oficiais a confirmar</span></div>
            <a className="text-link" href="#inicio">Voltar ao início <ArrowRight size={16} /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <a className="brand brand-footer" href="#inicio">
            <span className="brand-mark"><Cross size={25} strokeWidth={1.7} /></span>
            <span className="brand-copy"><strong>Segunda Igreja</strong><small>Presbiteriana de Belo Horizonte</small></span>
          </a>
          <p>Fé, Palavra e comunhão.<br />Uma comunidade em Cristo.</p>
          <div className="footer-links"><a className="footer-top" href="#inicio">Voltar ao topo ↑</a><a className="footer-admin-link" href="/admin">Área administrativa</a></div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Segunda Igreja Presbiteriana de Belo Horizonte</span>
          <span>Site em desenvolvimento</span>
        </div>
      </footer>
    </div>
  )
}

export default App