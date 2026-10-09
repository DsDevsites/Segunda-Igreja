import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, MapPin } from 'lucide-react'
import { supabase } from './lib/supabase'

type ChurchEvent = { id: string; title: string; description: string | null; location: string | null; starts_at: string; ends_at: string | null; cover_image_url: string | null }
type PageContent = { title: string; excerpt: string | null; body: string | null; cover_image_url: string | null }
type MenuPage = { id: string; title: string; slug: string; section_name: string; menu_label: string; menu_order: number; external_url: string }

export default function ContentPage({ path }: { path: string }) {
  const [events, setEvents] = useState<ChurchEvent[]>([])
  const [page, setPage] = useState<PageContent | null>(null)
  const [news, setNews] = useState<PageContent | null>(null)
  const [category, setCategory] = useState('')
  const [dynamicPage, setDynamicPage] = useState<PageContent | null>(null)
  const [menuPages, setMenuPages] = useState<MenuPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) { setLoading(false); return }
      if (path === '/agenda') {
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
      const { data } = await supabase.from('pages').select('id,title,slug,section_name,menu_label,menu_order,external_url').eq('status', 'published').eq('show_in_menu', true).order('menu_order').order('title')
      if (active && data) setMenuPages(data as MenuPage[])
    }
    void loadMenu()
    return () => { active = false }
  }, [])

  const isAgenda = path === '/agenda'
  const isHistory = path === '/historia'
  const isDynamicPage = path.startsWith('/paginas/')
  const content = isHistory ? page : isDynamicPage ? dynamicPage : news
  const title = isAgenda ? 'Agenda da igreja' : isHistory ? page?.title || 'A história da nossa igreja' : isDynamicPage ? dynamicPage?.title || 'Página' : news?.title || 'Notícia da comunidade'

  return <div className="site-shell">
    <div className="announcement"><span className="announcement-dot" /><span>Segunda Igreja Presbiteriana de Belo Horizonte</span></div>
    <header className="site-header">
      <a className="brand" href="/"><span className="brand-mark"><BookOpen size={24} /></span><span className="brand-copy"><strong>Segunda Igreja</strong><small>Presbiteriana de Belo Horizonte</small></span></a>
      <nav className="main-nav subpage-nav"><a href="/">Início</a><a href="/historia">Nossa história</a><a href="/agenda">Agenda</a>{Array.from(new Set(menuPages.map((page) => page.section_name?.trim() || 'Páginas'))).map((section) => <div className="nav-dropdown" key={section}><button className="nav-dropdown-trigger" type="button">{section}<span className="nav-chevron">⌄</span></button><div className="nav-dropdown-menu">{menuPages.filter((page) => (page.section_name?.trim() || 'Páginas') === section).map((page) => <a key={page.id} href={page.external_url?.trim() || '/paginas/' + page.slug} target={page.external_url?.trim() ? '_blank' : undefined} rel={page.external_url?.trim() ? 'noreferrer' : undefined}>{page.menu_label?.trim() || page.title}</a>)}</div></div>)}<a href="/#contato">Contato</a></nav>
    </header>
    <main className="content-page section-wrap">
      <a className="text-link back-link" href="/"><ArrowLeft size={15} /> Voltar à página inicial</a>
      <span className="eyebrow"><span /> {isAgenda ? 'Participe conosco' : isHistory ? 'Nossa caminhada de fé' : isDynamicPage ? 'Conheça a igreja' : category || 'Fique por dentro'}</span>
      <h1>{title}</h1>
      {content?.cover_image_url ? <img className="content-page-cover" src={content.cover_image_url} alt="" /> : null}
      {content?.excerpt ? <p className="content-page-lead">{content.excerpt}</p> : null}
      {isAgenda ? <div className="calendar-list">
        {loading ? <p>Carregando a programação...</p> : events.length ? events.map((event) => <article className="calendar-event" key={event.id}>
          <div className="calendar-date"><strong>{new Date(event.starts_at).toLocaleDateString('pt-BR', { day: '2-digit' })}</strong><span>{new Date(event.starts_at).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></div>
          <div className="calendar-event-main"><span className="update-category">{new Date(event.starts_at).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date(event.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}{event.ends_at ? ' – ' + new Date(event.ends_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span><h2>{event.title}</h2>{event.description ? <p>{event.description}</p> : null}{event.location ? <p className="calendar-location"><MapPin size={16} /> {event.location}</p> : null}</div>
          {event.cover_image_url ? <img src={event.cover_image_url} alt="" loading="lazy" /> : null}
        </article>) : <div className="calendar-empty"><CalendarDays size={30} /><h2>Nenhum evento publicado no momento</h2><p>Os próximos cultos especiais, encontros e atividades aparecerão aqui quando forem publicados no painel administrativo.</p></div>}
      </div> : loading ? <p>Carregando conteúdo...</p> : content?.body ? <div className="content-page-body">{content.body.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div> : isHistory && !page ? <div className="content-page-body"><p>A história oficial da Segunda Igreja Presbiteriana de Belo Horizonte será publicada nesta página.</p><p>Para inserir ou editar o texto, acesse o painel administrativo, abra <strong>Páginas</strong> e crie uma página publicada com o endereço amigável (slug) <strong>historia</strong>. Você também pode adicionar um resumo e uma imagem de capa.</p></div> : <div className="calendar-empty"><BookOpen size={30} /><h2>Conteúdo não encontrado</h2><p>Esta publicação pode ter sido removida ou ainda não foi publicada.</p></div>}
      <div className="content-page-actions"><a className="button button-blue" href={isAgenda ? '/#contato' : '/agenda'}>{isAgenda ? 'Planeje sua visita' : 'Confira a programação'} <ArrowRight size={16} /></a></div>
    </main>
    <footer className="site-footer"><div className="footer-bottom"><span>© {new Date().getFullYear()} Segunda Igreja Presbiteriana de Belo Horizonte</span><a href="/admin">Área administrativa</a></div></footer>
  </div>
}