import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, FileText, MapPin, Menu, X } from 'lucide-react'
import { supabase } from './lib/supabase'

type ChurchEvent = { id: string; title: string; description: string | null; location: string | null; starts_at: string; ends_at: string | null; cover_image_url: string | null }
type Bulletin = { id: string; title: string; description: string | null; pdf_url: string; published_at: string }\ntype PageContent = { title: string; excerpt: string | null; body: string | null; cover_image_url: string | null }
type MenuPage = { id: string; title: string; slug: string; section_name: string; menu_label: string; menu_order: number; external_url: string }
type MenuSection = { id: string; label: string; sort_order: number; show_in_menu: boolean; is_dropdown: boolean; target_url: string }

export default function ContentPage({ path }: { path: string }) {
  const [events, setEvents] = useState<ChurchEvent[]>([])\n  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [page, setPage] = useState<PageContent | null>(null)
  const [news, setNews] = useState<PageContent | null>(null)
  const [category, setCategory] = useState('')
  const [dynamicPage, setDynamicPage] = useState<PageContent | null>(null)
  const [menuPages, setMenuPages] = useState<MenuPage[]>([])
  const [menuSections, setMenuSections] = useState<MenuSection[]>([])
  const [logoUrl, setLogoUrl] = useState('')\n  const [socialLinks, setSocialLinks] = useState<{ instagram_url?: string; youtube_url?: string; tiktok_url?: string }>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) { setLoading(false); return }
      if (path === '/boletins') {\n        const { data } = await supabase.from('bulletins').select('id,title,description,pdf_url,published_at').eq('status', 'published').order('published_at', { ascending: false })\n        if (active && data) setBulletins(data as Bulletin[])\n      } else if (path === '/agenda') {
        const { data } = await supabase.from('church_events').select('id,title,description,location,starts_at,ends_at,cover_image_url').eq('status', 'published').gte('starts_at', new Date().toISOString()).order('starts_at')
        if (active && data) setEvents(data as ChurchEvent[])
      } else if (path === '/historia') {
        const { data } = await supabase.from('pages').select('title,excerpt,body,cover_image_url').eq('slug', 'historia').eq('status', 'published').maybeSingle()
        if (active && data) setPage(data as PageContent)
      } else if (path.startsWith('/paginas/')) {
        const slug = decodeURIComponent(path.slice('/paginas/'.length))
        const { data } = await supabase.from('pages').select('title,excerpt,body,cover_image_url').eq('slug', slug).eq('status', 'published').maybeSingle()
        if (active && data) setDynamicPage(data as PageContent)
      } else if (path.startsWith('/noticias/')) {
        const slug = decodeURIComponent(path.slice('/noticias/'.length))
        const { data } = await supabase.from('news_posts').select('title,excerpt,body,cover_image_url,category').eq('slug', slug).eq('status', 'published').maybeSingle()
        if (active && data) {
          setNews(data as PageContent)
          setCategory('category' in data ? String(data.category || 'Notícia') : 'Notícia')
        }
      }
      if (active) setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [path])

  useEffect(() => {
    let active = true
    async function loadMenu() {
      if (!supabase) return
      const [pagesResult, sectionsResult, settingsResult] = await Promise.all([
        supabase.from('pages').select('id,title,slug,section_name,menu_label,menu_order,external_url').eq('status', 'published').eq('show_in_menu', true).order('menu_order').order('title'),
        supabase.from('navigation_sections').select('id,label,sort_order,show_in_menu,is_dropdown,target_url').eq('show_in_menu', true).order('sort_order'),
        supabase.from('site_settings').select('setting_value').eq('setting_key', 'church_profile').maybeSingle(),
      ])
      if (active && pagesResult.data) setMenuPages(pagesResult.data as MenuPage[])
      if (active && sectionsResult.data) setMenuSections(sectionsResult.data as MenuSection[])
      if (active && settingsResult.data?.setting_value && typeof settingsResult.data.setting_value === 'object') setLogoUrl(String((settingsResult.data.setting_value as Record<string, unknown>).logo_url || '')); setSocialLinks(settingsResult.data.setting_value as typeof socialLinks)
    }
    void loadMenu()
    return () => { active = false }
  }, [])

  const isAgenda = path === '/agenda'\n  const isBulletins = path === '/boletins'
  const isHistory = path === '/historia'
  const isDynamicPage = path.startsWith('/paginas/')
  const content = isHistory ? page : isDynamicPage ? dynamicPage : news
  const title = isBulletins ? 'Boletins da igreja' : isAgenda ? 'Agenda da igreja' : isHistory ? page?.title || 'A história da nossa igreja' : isDynamicPage ? dynamicPage?.title || 'Página' : news?.title || 'Notícia da comunidade'

  return <div className="site-shell">
    <div className="announcement"><span className="announcement-dot" /><span>Segunda Igreja Presbiteriana de Belo Horizonte</span></div>
    <header className="site-header">
      <a className="brand" href="/">{logoUrl ? <img className="brand-logo" src={logoUrl} alt="Logo da Segunda Igreja" /> : <span className="brand-mark"><BookOpen size={24} /></span>}<span className="brand-copy"><strong>Segunda Igreja</strong><small>Presbiteriana de Belo Horizonte</small></span></a>
      <button className="mobile-menu-button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
      <nav className={menuOpen ? 'main-nav subpage-nav is-open' : 'main-nav subpage-nav'} aria-label="Navegação principal"><a href="/">HOME</a>{menuSections.map((section) => { const links = menuPages.filter((page) => (page.section_name?.trim() || 'Páginas').toLocaleLowerCase('pt-BR') === section.label.trim().toLocaleLowerCase('pt-BR')); if (!section.is_dropdown) return <a key={section.id} href={section.target_url?.trim() || '/'} onClick={() => setMenuOpen(false)}>{section.label}</a>; return <div className="nav-dropdown" key={section.id}><button className="nav-dropdown-trigger" type="button" aria-haspopup="true" aria-expanded="false">{section.label}<span className="nav-chevron">⌄</span></button><div className="nav-dropdown-menu">{/redes sociais/i.test(section.label) ? <>{socialLinks.instagram_url ? <a href={socialLinks.instagram_url} target="_blank" rel="noreferrer">Instagram</a> : null}{socialLinks.youtube_url ? <a href={socialLinks.youtube_url} target="_blank" rel="noreferrer">YouTube — acompanhe nossos sermões</a> : null}{socialLinks.tiktok_url ? <a href={socialLinks.tiktok_url} target="_blank" rel="noreferrer">TikTok</a> : null}{!socialLinks.instagram_url && !socialLinks.youtube_url && !socialLinks.tiktok_url ? <span className="nav-dropdown-empty">Cadastre as redes sociais no painel administrativo.</span> : null}</> : links.length ? links.map((page) => <a key={page.id} href={page.external_url?.trim() || '/paginas/' + page.slug} target={page.external_url?.trim() ? '_blank' : undefined} rel={page.external_url?.trim() ? 'noreferrer' : undefined} onClick={() => setMenuOpen(false)}>{page.menu_label?.trim() || page.title}</a>) : <span className="nav-dropdown-empty">Nenhum link cadastrado nesta área. Adicione páginas em Administração → Páginas e locais do menu.</span>}</div></div>})}</nav>
    </header>
    <main className="content-page section-wrap">
      <a className="text-link back-link" href="/"><ArrowLeft size={15} /> Voltar à página inicial</a>
      {!isDynamicPage ? <span className="eyebrow"><span /> {isBulletins ? 'Informativos semanais' : isAgenda ? 'Participe conosco' : isHistory ? 'Nossa caminhada de fé' : category || 'Fique por dentro'}</span> : null}
      <h1>{title}</h1>
      {content?.cover_image_url ? <img className="content-page-cover" src={content.cover_image_url} alt="" /> : null}
      {content?.excerpt ? <p className="content-page-lead">{content.excerpt}</p> : null}
      {isBulletins ? <div className="bulletins-list">{loading ? <p>Carregando boletins...</p> : bulletins.length ? bulletins.map((item) => <article className="bulletin-card" key={item.id}><div className="bulletin-date"><CalendarDays size={22} /><span>{new Date(item.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div><h2>{item.title}</h2>{item.description ? <p>{item.description}</p> : null}<a className="button button-blue" href={item.pdf_url} target="_blank" rel="noreferrer">Abrir boletim em PDF <ArrowRight size={16} /></a></article>) : <div className="calendar-empty"><FileText size={30} /><h2>Nenhum boletim publicado ainda</h2><p>Os informativos semanais aparecerão aqui quando forem publicados pela equipe da igreja.</p></div>}</div> : isAgenda ? <div className="calendar-list">
        {loading ? <p>Carregando a programação...</p> : events.length ? events.map((event) => <article className="calendar-event" key={event.id}>
          <div className="calendar-date"><strong>{new Date(event.starts_at).toLocaleDateString('pt-BR', { day: '2-digit' })}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></div>
          <div className="calendar-event-main"><span className="update-category">{new Date(event.starts_at).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date(event.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{event.ends_at ? ' – ' + new Date(event.ends_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span><h2>{event.title}</h2>{event.description ? <p>{event.description}</p> : null}{event.location ? <p className="calendar-location"><MapPin size={16} /> {event.location}</p> : null}</div>
          {event.cover_image_url ? <img src={event.cover_image_url} alt="" loading="lazy" /> : null}
        </article>) : <div className="calendar-empty"><CalendarDays size={30} /><h2>Nenhum evento publicado no momento</h2><p>Os próximos cultos especiais, encontros e atividades aparecerão aqui quando forem publicados no painel administrativo.</p></div>}
      </div> : loading ? <p>Carregando conteúdo...</p> : content?.body ? <div className="content-page-body">{content.body.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div> : isHistory && !page ? <div className="content-page-body"><p>A história oficial da Segunda Igreja Presbiteriana de Belo Horizonte será publicada nesta página.</p><p>Para inserir ou editar o texto, acesse o painel administrativo, abra <strong>Páginas</strong> e crie uma página publicada com o endereço amigável (slug) <strong>historia</strong>. Você também pode adicionar um resumo e uma imagem de capa.</p></div> : <div className="calendar-empty"><BookOpen size={30} /><h2>Conteúdo não encontrado</h2><p>Esta publicação pode ter sido removida ou ainda não foi publicada.</p></div>}
      <div className="content-page-actions"><a className="button button-blue" href={isAgenda ? '/#contato' : '/agenda'}>{isAgenda ? 'Planeje sua visita' : 'Confira a programação'} <ArrowRight size={16} /></a></div>
    </main>
    <footer className="site-footer"><div className="footer-bottom"><span>© {new Date().getFullYear()} Segunda Igreja Presbiteriana de Belo Horizonte</span></div></footer>
  </div>
}