import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
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
  const [liveServiceTimes, setLiveServiceTimes] = useState<Array<{ day_of_week: string; starts_at: string; title: string; description?: string }>>([])
  const [latestNews, setLatestNews] = useState<Array<{ id: string; title: string; excerpt: string; cover_image_url: string; category: string; slug: string }>>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Array<{ id: string; title: string; description: string; location: string; starts_at: string; cover_image_url: string }>>([])
  const [sermons, setSermons] = useState<Array<{ id: string; title: string; speaker: string; scripture: string; description: string; video_url: string; audio_url?: string; preached_at?: string; cover_image_url?: string }>>([])
  const [profile, setProfile] = useState<{ address?: string; phone?: string; email?: string; whatsapp?: string; instagram_url?: string; facebook_url?: string; maps_url?: string; welcome_text?: string; about_text?: string }>({})

  useEffect(() => {
    if (!supabase) return
    let active = true
    async function loadPublicContent() {
      const [times, news, events, sermonResult, settings] = await Promise.all([
        supabase!.from('service_times').select('day_of_week,starts_at,title,description').eq('is_active', true).order('sort_order'),
        supabase!.from('news_posts').select('id,title,excerpt,cover_image_url,category,slug').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
        supabase!.from('church_events').select('id,title,description,location,starts_at,cover_image_url').eq('status', 'published').gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
        supabase!.from('sermons').select('id,title,speaker,scripture,description,video_url,audio_url,preached_at,cover_image_url').eq('status', 'published').order('preached_at', { ascending: false }).limit(3),
        supabase!.from('site_settings').select('setting_value').eq('setting_key', 'church_profile').maybeSingle(),
      ])
      if (!active) return
      if (!times.error && times.data) setLiveServiceTimes(times.data)
      if (!news.error && news.data) setLatestNews(news.data)
      if (!events.error && events.data) setUpcomingEvents(events.data)
      if (!sermonResult.error && sermonResult.data) setSermons(sermonResult.data)\n      if (!settings.error && settings.data?.setting_value && typeof settings.data.setting_value === 'object') setProfile(settings.data.setting_value as typeof profile)
    }
    void loadPublicContent()
    return () => { active = false }
  }, [])

  useEffect(() => {
    document.title = 'Segunda Igreja Presbiteriana de Belo Horizonte'
    let description = document.querySelector('meta[name="description"]')
    if (!description) {
      description = document.createElement('meta')
      description.setAttribute('name', 'description')
      document.head.appendChild(description)
    }
    description.setAttribute('content', 'Conheça a Segunda Igreja Presbiteriana de Belo Horizonte: cultos, mensagens bíblicas, agenda e vida em comunidade.')
  }, [])

  const closeMenu = () => setMenuOpen(false)
  const mapUrl = profile.maps_url || (profile.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(profile.address) : '')

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
            <p>{profile.about_text || 'Somos uma igreja presbiteriana comprometida com as Escrituras, a adoração a Deus e o cuidado mútuo. Queremos caminhar com você na fé e na comunhão cristã.'}</p>
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

        {(latestNews.length > 0 || upcomingEvents.length > 0) ? (
          <section className="updates-section section-wrap" aria-label="Últimas notícias e próximos eventos">
            {latestNews.length > 0 ? <div className="updates-block">
              <div className="updates-heading"><div><span className="eyebrow"><span /> Fique por dentro</span><h2>Notícias da <em>comunidade.</em></h2></div></div>
              <div className="updates-grid">{latestNews.map((item) => <article className="update-card" key={item.id}>
                {item.cover_image_url ? <img src={item.cover_image_url} alt="" loading="lazy" /> : <div className="update-card-placeholder"><BookOpen size={24} /></div>}
                <div className="update-card-body"><span className="update-category">{item.category}</span><h3>{item.title}</h3><p>{item.excerpt}</p><a className="text-link" href={'/noticias/' + item.slug}>Leia mais <ArrowRight size={15} /></a></div>
              </article>)}</div>
            </div> : null}
            {upcomingEvents.length > 0 ? <div className="updates-block updates-events">
              <div className="updates-heading"><div><span className="eyebrow"><span /> Participe</span><h2>Próximos <em>encontros.</em></h2></div></div>
              <div className="updates-grid">{upcomingEvents.map((item) => <article className="update-card" key={item.id}>
                {item.cover_image_url ? <img src={item.cover_image_url} alt="" loading="lazy" /> : <div className="update-card-placeholder"><CalendarDays size={24} /></div>}
                <div className="update-card-body"><span className="update-category">{new Date(item.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} • {new Date(item.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span><h3>{item.title}</h3><p>{item.description}</p>{item.location ? <p className="update-location">{item.location}</p> : null}</div>
              </article>)}</div>
            </div> : null}
          </section>
        ) : null}

        <section className="service-section section-wrap" id="agenda">
          <div className="service-intro">
            <span className="eyebrow"><span /> Venha nos visitar</span>
            <h2>Há um lugar<br />para você <em>conosco.</em></h2>
            <p>Será uma alegria receber você e sua família. Confira a programação abaixo e, se precisar de orientação para chegar, consulte o endereço e o mapa.</p>
            <div className="hero-actions"><a className="button button-blue" href="#contato">Planeje sua visita <ArrowRight size={17} /></a>{mapUrl ? <a className="text-link" href={mapUrl} target="_blank" rel="noreferrer">Como chegar <MapPin size={16} /></a> : null}</div>
          </div>
          <div className="service-card">
            <div className="service-card-title">
              <span className="service-symbol"><Clock3 size={20} /></span>
              <div><span className="eyebrow">Programação</span><h3>Cultos e encontros</h3></div>
            </div>
            {(liveServiceTimes.length ? liveServiceTimes.map((item) => ({ day: item.day_of_week, time: item.starts_at.slice(0, 5), note: item.title })) : serviceTimes).map((service) => (
              <div className="service-row" key={service.day + service.note}>
                <div><strong>{service.day}</strong><span>{service.note}</span></div>
                <span className="service-time">{service.time}</span>
              </div>
            ))}
            {!liveServiceTimes.length ? <p className="pending-note">Os horários oficiais serão informados pela liderança da igreja.</p> : <p className="pending-note">Confira a programação e entre em contato se precisar de mais informações.</p>}
          </div>
        </section>

        <section className="message-section" id="mensagens">
          <div className="message-image" role="img" aria-label="Bíblia aberta sobre um banco de madeira" />
          <div className="message-content">
            <span className="eyebrow eyebrow-light"><span /> Palavra que edifica</span>
            <h2>Mensagens para<br /><em>fortalecer a fé.</em></h2>
            <p>Acompanhe as mensagens bíblicas e continue refletindo sobre a Palavra durante a semana.</p>
            {sermons.length ? <div className="sermon-list">{sermons.map((sermon) => <article className="sermon-item" key={sermon.id}>
              <div><strong>{sermon.title}</strong><span>{[sermon.speaker, sermon.scripture].filter(Boolean).join(' • ')}</span>{sermon.description ? <p>{sermon.description}</p> : null}</div>
              <div className="sermon-links">{sermon.video_url ? <a href={sermon.video_url} target="_blank" rel="noreferrer" aria-label={'Assistir ' + sermon.title}><PlayCircle size={19} /> Vídeo</a> : null}{sermon.audio_url ? <a href={sermon.audio_url} target="_blank" rel="noreferrer" aria-label={'Ouvir ' + sermon.title}>Ouvir áudio</a> : null}</div>
            </article>)}</div> : <p>As mensagens serão publicadas aqui pela equipe da igreja.</p>}
          </div>
        </section>

        <section className="contact-section section-wrap" id="contato">
          <div>
            <span className="eyebrow"><span /> Estamos à disposição</span>
            <h2>Vamos nos <em>conhecer?</em></h2>
            <p>Fale com a equipe da igreja ou consulte o mapa para planejar sua visita. Os dados exibidos são os cadastrados pela administração.</p>
          </div>
          <div className="contact-placeholder">
            <div className="contact-placeholder-row"><MapPin size={19} /><span>{profile.address || 'Endereço será informado pela igreja'}</span></div>
            {profile.phone ? <div className="contact-placeholder-row"><span>Telefone: {profile.phone}</span></div> : null}
            {profile.email ? <div className="contact-placeholder-row"><span>E-mail: {profile.email}</span></div> : null}
            {profile.whatsapp ? <a className="text-link" href={'https://wa.me/' + profile.whatsapp.replace(/\\D/g, '')} target="_blank" rel="noreferrer">Fale pelo WhatsApp <ArrowRight size={16} /></a> : null}
            {mapUrl ? <a className="text-link" href={mapUrl} target="_blank" rel="noreferrer">Ver no mapa <MapPin size={16} /></a> : null}
            {profile.instagram_url ? <a className="text-link" href={profile.instagram_url} target="_blank" rel="noreferrer">Instagram <ArrowRight size={16} /></a> : null}
            {profile.facebook_url ? <a className="text-link" href={profile.facebook_url} target="_blank" rel="noreferrer">Facebook <ArrowRight size={16} /></a> : null}
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
          <span>Fé, Palavra e comunhão</span>
        </div>
      </footer>
    </div>
  )
}

export default App