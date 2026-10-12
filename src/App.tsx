import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import ContentPage from './ContentPage'
import {
  ArrowRight,
  ArrowLeft,
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
  { icon: BookOpen, title: 'Nossa história', text: 'Conheça nossa caminhada de fé e a história da nossa comunidade.', href: '/historia' },
  { icon: PlayCircle, title: 'Mensagens', text: 'Acompanhe sermões, estudos bíblicos e transmissões.', href: '/#mensagens' },
  { icon: CalendarDays, title: 'Agenda', text: 'Veja os encontros e eventos da vida da igreja.', href: '/agenda' },
]

function App() {
  const routePath = window.location.pathname
  const [menuOpen, setMenuOpen] = useState(false)
  const [liveServiceTimes, setLiveServiceTimes] = useState<Array<{ day_of_week: string; starts_at: string; title: string; description?: string }>>([])
  const [menuPages, setMenuPages] = useState<Array<{ id: string; title: string; slug: string; section_name: string; menu_label: string; menu_order: number; external_url: string }>>([])
  const [homepageSlides, setHomepageSlides] = useState<Array<{ id: string; title: string; subtitle: string; cover_image_url: string; link_url: string; sort_order: number }>>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [menuSections, setMenuSections] = useState<Array<{ id: string; label: string; sort_order: number; show_in_menu: boolean; is_dropdown: boolean; target_url: string }>>([])
  const [latestNews, setLatestNews] = useState<Array<{ id: string; title: string; excerpt: string; cover_image_url: string; category: string; slug: string }>>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Array<{ id: string; title: string; description: string; location: string; starts_at: string; cover_image_url: string }>>([])
  const [sermons, setSermons] = useState<Array<{ id: string; title: string; speaker: string; scripture: string; description: string; video_url: string; audio_url?: string; preached_at?: string; cover_image_url?: string }>>([])
  const [profile, setProfile] = useState<{ address?: string; phone?: string; email?: string; whatsapp?: string; instagram_url?: string; facebook_url?: string; maps_url?: string; welcome_text?: string; about_text?: string; contact_heading?: string; contact_text?: string; logo_url?: string }>({})

  useEffect(() => {
    if (!supabase) return
    let active = true
    async function loadPublicContent() {
      const [times, news, events, sermonResult, settings, pagesResult, sectionsResult, slidesResult] = await Promise.all([
        supabase!.from('service_times').select('day_of_week,starts_at,title,description').eq('is_active', true).order('sort_order'),
        supabase!.from('news_posts').select('id,title,excerpt,cover_image_url,category,slug').eq('status', 'published').order('published_at', { ascending: false }).limit(3),
        supabase!.from('church_events').select('id,title,description,location,starts_at,cover_image_url').eq('status', 'published').gte('starts_at', new Date().toISOString()).order('starts_at').limit(3),
        supabase!.from('sermons').select('id,title,speaker,scripture,description,video_url,audio_url,preached_at,cover_image_url').eq('status', 'published').order('preached_at', { ascending: false }).limit(3),
        supabase!.from('site_settings').select('setting_value').eq('setting_key', 'church_profile').maybeSingle(),
        supabase!.from('pages').select('id,title,slug,section_name,menu_label,menu_order,external_url').eq('status', 'published').eq('show_in_menu', true).order('menu_order').order('title'),
        supabase!.from('navigation_sections').select('id,label,sort_order,show_in_menu,is_dropdown,target_url').eq('show_in_menu', true).order('sort_order'),
        supabase!.from('homepage_slides').select('id,title,subtitle,cover_image_url,link_url,sort_order').eq('is_active', true).order('sort_order').order('created_at'),
      ])
      if (!active) return
      if (!times.error && times.data) setLiveServiceTimes(times.data)
      if (!news.error && news.data) setLatestNews(news.data)
      if (!events.error && events.data) setUpcomingEvents(events.data)
      if (!sermonResult.error && sermonResult.data) setSermons(sermonResult.data)
      if (!settings.error && settings.data?.setting_value && typeof settings.data.setting_value === 'object') setProfile(settings.data.setting_value as typeof profile)
      if (!pagesResult.error && pagesResult.data) setMenuPages(pagesResult.data)
      if (!sectionsResult.error && sectionsResult.data) setMenuSections(sectionsResult.data)
      if (!slidesResult.error && slidesResult.data) setHomepageSlides(slidesResult.data)
    }
    void loadPublicContent()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (homepageSlides.length < 2) return
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % homepageSlides.length), 6000)
    return () => window.clearInterval(timer)
  }, [homepageSlides.length])

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

  if (routePath === '/agenda' || routePath === '/historia' || routePath.startsWith('/noticias/') || routePath.startsWith('/paginas/')) return <ContentPage path={routePath} />

  const closeMenu = () => setMenuOpen(false)
  const mapUrl = profile.maps_url || (profile.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(profile.address) : '')

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        <span>SEGUNDA IGREJA PRESBITERIANA DE BELO HORIZONTE · FÉ, PALAVRA E COMUNHÃO</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Segunda Igreja Presbiteriana - início" onClick={closeMenu}>
          {profile.logo_url ? <img className="brand-logo" src={profile.logo_url} alt="Logo da Segunda Igreja" /> : <span className="brand-mark"><Cross size={25} strokeWidth={1.7} /></span>}
          <span className="brand-copy">
            <strong>Segunda Igreja</strong>
            <small>Presbiteriana de Belo Horizonte</small>
          </span>
        </a>

        <button className="mobile-menu-button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Navegação principal">
          <a href="/" onClick={closeMenu}>HOME</a>
          {menuSections.map((section) => {
            const links = menuPages.filter((page) => (page.section_name?.trim() || 'Páginas').toLocaleLowerCase('pt-BR') === section.label.trim().toLocaleLowerCase('pt-BR'))
            if (!section.is_dropdown) return <a key={section.id} href={section.target_url?.trim() || '/'} onClick={closeMenu}>{section.label}</a>
            return <div className="nav-dropdown" key={section.id}>
              <button className="nav-dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">{section.label}<span className="nav-chevron">⌄</span></button>
              <div className="nav-dropdown-menu">{links.length ? links.map((page) => <a key={page.id} href={page.external_url?.trim() || '/paginas/' + page.slug} target={page.external_url?.trim() ? '_blank' : undefined} rel={page.external_url?.trim() ? 'noreferrer' : undefined} onClick={closeMenu}>{page.menu_label?.trim() || page.title}</a>) : <span className="nav-dropdown-empty">Links desta área serão adicionados pelo painel administrativo.</span>}</div>
            </div>
          })}
        </nav>
      </header>

      {homepageSlides.length ? <section className="homepage-carousel" aria-label="Destaques da igreja">
        <div className="carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
          {homepageSlides.map((slide) => <article className="carousel-slide" key={slide.id}>
            {slide.link_url ? <a className="carousel-slide-link" href={slide.link_url} aria-label={slide.title || 'Abrir destaque'}><img src={slide.cover_image_url} alt={slide.title || 'Destaque da Segunda Igreja'} /></a> : <img src={slide.cover_image_url} alt={slide.title || 'Destaque da Segunda Igreja'} />}
            {(slide.title || slide.subtitle) ? <div className="carousel-caption">{slide.title ? <h2>{slide.title}</h2> : null}{slide.subtitle ? <p>{slide.subtitle}</p> : null}</div> : null}
          </article>)}
        </div>
        {homepageSlides.length > 1 ? <>
          <button className="carousel-arrow carousel-prev" type="button" onClick={() => setActiveSlide((activeSlide - 1 + homepageSlides.length) % homepageSlides.length)} aria-label="Imagem anterior"><ArrowLeft size={19} /></button>
          <button className="carousel-arrow carousel-next" type="button" onClick={() => setActiveSlide((activeSlide + 1) % homepageSlides.length)} aria-label="Próxima imagem"><ArrowRight size={19} /></button>
          <div className="carousel-dots">{homepageSlides.map((slide, index) => <button key={slide.id} type="button" className={index === activeSlide ? 'is-active' : ''} onClick={() => setActiveSlide(index)} aria-label={`Ir para imagem ${index + 1}`} />)}</div>
        </> : null}
      </section> : null}
      <main>
        <section className="welcome section-wrap" id="historia">
          <div className="welcome-heading">
            <span className="eyebrow"><span /> Seja bem-vindo</span>
            <h2>Tradição na fé.<br /><em>Esperança para hoje.</em></h2>
          </div>
          <div className="welcome-copy">
            <p className="lead">Somos uma comunidade que deseja glorificar a Deus, anunciar o evangelho de Jesus Cristo e viver a fé em comunhão.</p>
            <p>{profile.about_text || 'Somos uma igreja presbiteriana comprometida com as Escrituras, a adoração a Deus e o cuidado mútuo. Queremos caminhar com você na fé e na comunhão cristã.'}</p>
            <a className="text-link" href="/historia">Saiba mais sobre nós <ArrowRight size={16} /></a>
          </div>
        </section>

        {(latestNews.length > 0 || upcomingEvents.length > 0) ? (
          <section className="updates-section section-wrap" aria-label="Últimas notícias e próximos eventos">
            {latestNews.length > 0 ? <div className="updates-block">
              <div className="updates-heading"><div><span className="eyebrow"><span /> Fique por dentro</span><h2>Notícias da <em>comunidade.</em></h2></div></div>
              <div className="updates-grid">{latestNews.map((item) => <article className="update-card" key={item.id}>
                <a className="update-card-image-link" href={/programa|agenda|ora[cç][aã]o/i.test(item.category + ' ' + item.title) ? '/agenda' : /comunidade|bem-vind|hist[oó]ria/i.test(item.category + ' ' + item.title) ? '/historia' : '/noticias/' + item.slug} aria-label={'Abrir ' + item.title}>
                  {item.cover_image_url ? <img src={item.cover_image_url} alt="" loading="lazy" /> : <div className="update-card-placeholder"><BookOpen size={24} /></div>}
                </a>
                <div className="update-card-body"><span className="update-category">{item.category}</span><h3><a href={/programa|agenda|ora[cç][aã]o/i.test(item.category + ' ' + item.title) ? '/agenda' : /comunidade|bem-vind|hist[oó]ria/i.test(item.category + ' ' + item.title) ? '/historia' : '/noticias/' + item.slug}>{item.title}</a></h3><p>{item.excerpt}</p><a className="text-link" href={/programa|agenda|ora[cç][aã]o/i.test(item.category + ' ' + item.title) ? '/agenda' : /comunidade|bem-vind|hist[oó]ria/i.test(item.category + ' ' + item.title) ? '/historia' : '/noticias/' + item.slug}>{/programa|agenda|ora[cç][aã]o/i.test(item.category + ' ' + item.title) ? 'Ver programação' : /comunidade|bem-vind|hist[oó]ria/i.test(item.category + ' ' + item.title) ? 'Conheça nossa história' : 'Leia mais'} <ArrowRight size={15} /></a></div>
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
            {sermons.length ? <div className="sermon-list">{sermons.map((sermon) => {
              const youtubeId = sermon.video_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/)?.[1]
              const thumbnail = sermon.cover_image_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : '')
              return <article className="sermon-item" key={sermon.id}>
                {thumbnail ? <a className="sermon-thumbnail" href={sermon.video_url || '#mensagens'} target={sermon.video_url ? '_blank' : undefined} rel={sermon.video_url ? 'noreferrer' : undefined} aria-label={'Ver ' + sermon.title}><img src={thumbnail} alt={`Miniatura: ${sermon.title}`} loading="lazy" /><span><PlayCircle size={23} /></span></a> : null}
                <div className="sermon-item-copy"><strong>{sermon.title}</strong><span>{[sermon.speaker, sermon.scripture].filter(Boolean).join(' • ')}</span>{sermon.description ? <p>{sermon.description}</p> : null}
                <div className="sermon-links">{sermon.video_url ? <a href={sermon.video_url} target="_blank" rel="noreferrer" aria-label={'Assistir ' + sermon.title}><PlayCircle size={19} /> Vídeo</a> : null}{sermon.audio_url ? <a href={sermon.audio_url} target="_blank" rel="noreferrer" aria-label={'Ouvir ' + sermon.title}>Ouvir áudio</a> : null}</div></div>
              </article>
            })}</div> : <p>As mensagens serão publicadas aqui pela equipe da igreja.</p>}
          </div>
        </section>

        <section className="contact-section section-wrap" id="contato">
          <div>
            <span className="eyebrow"><span /> Estamos à disposição</span>
            <h2>{profile.contact_heading || 'Vamos nos conhecer?'}</h2>
            <p>{profile.contact_text || 'Fale com a equipe da igreja ou consulte o mapa para planejar sua visita.'}</p>
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
            {profile.logo_url ? <img className="brand-logo" src={profile.logo_url} alt="Logo da Segunda Igreja" /> : <span className="brand-mark"><Cross size={25} strokeWidth={1.7} /></span>}
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