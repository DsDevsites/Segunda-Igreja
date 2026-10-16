import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Check, ChevronRight, FileText, Image, LoaderCircle, Newspaper, Plus, RefreshCw, Save, Settings2, Trash2, Video, Clock3, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type ResourceKey = 'news_posts' | 'church_events' | 'sermons' | 'pages' | 'service_times' | 'site_settings' | 'navigation_sections' | 'homepage_slides' | 'homepage_settings'
type FieldType = 'text' | 'textarea' | 'url' | 'date' | 'datetime-local' | 'time' | 'number' | 'select' | 'json'
type Field = { name: string; label: string; type?: FieldType; required?: boolean; options?: string[]; help?: string }
type Resource = { key: ResourceKey; label: string; singular: string; icon: typeof Newspaper; description: string; fields: Field[] }

const resources: Resource[] = [
  { key: 'homepage_settings', label: 'Página inicial', singular: 'conteúdo da página inicial', icon: Image, description: 'Para mudar o título e os textos da primeira parte da página inicial, entre aqui. Também é aqui que você envia a foto suave de fundo da apresentação. Contatos, sermões, vídeos, notícias e eventos ficam separados.', fields: [
    { name: 'welcome_heading', label: 'Título principal', required: true, help: 'Ex.: Tradição na fé.' },
    { name: 'welcome_emphasis', label: 'Título em destaque', required: true, help: 'Ex.: Esperança para hoje.' },
    { name: 'welcome_text', label: 'Texto de apresentação', type: 'textarea', help: 'Texto curto que aparece na área de boas-vindas.' },
    { name: 'welcome_background_url', label: 'Foto de fundo da apresentação', type: 'url', help: 'Envie uma foto da igreja. Ela ficará bem suave atrás dos textos da área “Seja bem-vindo”.' },
    { name: 'about_text', label: 'Texto complementar', type: 'textarea', help: 'Parágrafo que apresenta a comunidade.' },
  ] },
  { key: 'homepage_slides', label: 'Slides do carrossel', singular: 'slide do carrossel', icon: Image, description: 'Gerencie as imagens que passam lateralmente no início do site. Envie uma imagem, defina a ordem e ative o slide para publicá-lo.', fields: [
    { name: 'title', label: 'Título sobre a imagem (opcional)', help: 'Deixe vazio se não quiser texto sobre a imagem.' },
    { name: 'subtitle', label: 'Texto de apoio (opcional)', type: 'textarea' },
    { name: 'cover_image_url', label: 'Imagem do slide', type: 'url', required: true, help: 'Prefira imagens horizontais. A prévia mantém a proporção e não corta a imagem.' },
    { name: 'link_url', label: 'Link ao clicar na imagem (opcional)', type: 'url', help: 'Ex.: /agenda ou link para uma página publicada.' },
    { name: 'sort_order', label: 'Ordem de exibição', type: 'number', required: true, help: 'Use 1 para a primeira imagem, 2 para a segunda e assim por diante.' },
    { name: 'is_active', label: 'Mostrar no site?', type: 'select', options: ['true', 'false'], required: true },
  ] },
  { key: 'news_posts', label: 'Notícias', singular: 'notícia', icon: Newspaper, description: 'Publicações e comunicados da igreja.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'slug', label: 'Endereço amigável (slug)', required: true, help: 'Ex.: encontro-de-oracao' }, { name: 'excerpt', label: 'Resumo', type: 'textarea' }, { name: 'body', label: 'Conteúdo', type: 'textarea' }, { name: 'cover_image_url', label: 'URL da imagem de capa', type: 'url' }, { name: 'category', label: 'Categoria' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
  ] },
  { key: 'church_events', label: 'Eventos', singular: 'evento', icon: CalendarDays, description: 'Agenda de cultos especiais, encontros e atividades.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'description', label: 'Descrição', type: 'textarea' }, { name: 'location', label: 'Local' }, { name: 'starts_at', label: 'Data e horário de início', type: 'datetime-local', required: true }, { name: 'ends_at', label: 'Data e horário de término', type: 'datetime-local' }, { name: 'cover_image_url', label: 'URL da imagem', type: 'url' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'cancelled'], required: true },
  ] },
  { key: 'sermons', label: 'Sermões', singular: 'sermão', icon: Video, description: 'Mensagens, pregadores, referências bíblicas e vídeos.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'speaker', label: 'Pregador' }, { name: 'scripture', label: 'Referência bíblica' }, { name: 'description', label: 'Descrição', type: 'textarea' }, { name: 'video_url', label: 'Link do vídeo do YouTube', type: 'url', help: 'Cole o link completo do vídeo. Se for do YouTube e você não enviar uma imagem própria, a miniatura será preenchida automaticamente.' }, { name: 'audio_url', label: 'Link do áudio', type: 'url' }, { name: 'cover_image_url', label: 'Imagem/miniatura personalizada (opcional)', type: 'url', help: 'Envie uma imagem se quiser substituir a miniatura automática do YouTube.' }, { name: 'preached_at', label: 'Data da mensagem', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
  ] },
  { key: 'pages', label: 'Páginas e locais do menu', singular: 'página ou local', icon: FileText, description: 'Cadastre aqui cada local (ex.: Escola Dominical). Ao salvar como publicado e marcar para aparecer no menu, o sistema cria uma página própria e adiciona o link na área escolhida.', fields: [
    { name: 'title', label: 'Nome do local / título da página', required: true, help: 'Ex.: Escola Dominical, Junta Diaconal ou Sociedade Interna.' }, { name: 'slug', label: 'Endereço da página', required: true, help: 'Use letras minúsculas e hífens, sem espaços. Ex.: escola-dominical. A página ficará em /paginas/escola-dominical.' }, { name: 'excerpt', label: 'Texto curto de apresentação', type: 'textarea' }, { name: 'body', label: 'Conteúdo da página', type: 'textarea', help: 'Escreva a apresentação, atividades, horários, responsáveis e informações do local. A página será criada automaticamente ao salvar.' }, { name: 'cover_image_url', label: 'URL da imagem de capa', type: 'url' }, { name: 'section_name', label: 'Adicionar dentro desta área do menu', required: true, help: 'Digite exatamente o nome da área exibida no menu, por exemplo: SOCIEDADES INTERNAS. O link será colocado dentro desse menu.' }, { name: 'menu_label', label: 'Texto do link no menu (opcional)', help: 'Deixe vazio para usar o nome do local.' }, { name: 'menu_order', label: 'Posição dentro do menu', type: 'number' }, { name: 'show_in_menu', label: 'Mostrar o link no menu?', type: 'select', options: ['true', 'false'], required: true }, { name: 'external_url', label: 'Link externo (opcional)', type: 'url', help: 'Deixe vazio para abrir a página criada automaticamente no próprio site.' }, { name: 'status', label: 'Publicação', type: 'select', options: ['draft', 'published'], required: true },
  ] },
  { key: 'service_times', label: 'Horários', singular: 'horário', icon: Clock3, description: 'Horários de cultos e encontros semanais.', fields: [
    { name: 'title', label: 'Nome da programação', required: true }, { name: 'day_of_week', label: 'Dia da semana', required: true }, { name: 'starts_at', label: 'Horário', type: 'time', required: true }, { name: 'description', label: 'Observação', type: 'textarea' }, { name: 'sort_order', label: 'Ordem de exibição' }, { name: 'is_active', label: 'Ativo?', type: 'select', options: ['true', 'false'], required: true },
  ] },
  { key: 'site_settings', label: 'Contato e dados do site', singular: 'configuração de contato', icon: Settings2, description: 'Edite a logo global, endereço, telefone, e-mail, WhatsApp e redes sociais. Use o registro “church_profile”; ao salvar, a mesma logo será aplicada ao cabeçalho e rodapé.', fields: [
    { name: 'setting_key', label: 'Identificador do perfil', required: true, help: 'Mantenha o valor church_profile para atualizar os dados exibidos no site.' },
    { name: 'logo_url', label: 'Logo do site', type: 'url', help: 'Envie o arquivo da logo ou cole uma URL pública. Ela será exibida no cabeçalho e no rodapé.' },
    { name: 'contact_heading', label: 'Título da seção de contato', help: 'Ex.: Vamos nos conhecer?' },
    { name: 'contact_text', label: 'Texto de apresentação', type: 'textarea', help: 'Texto exibido ao lado do cartão de endereço e contatos.' },
    { name: 'address', label: 'Endereço completo' },
    { name: 'phone', label: 'Telefone' },
    { name: 'email', label: 'E-mail de contato', type: 'text' },
    { name: 'whatsapp', label: 'WhatsApp com DDI e DDD', help: 'Somente números. Ex.: 5531999999999.' },
    { name: 'maps_url', label: 'Link do Google Maps', type: 'url' },
    { name: 'instagram_url', label: 'Link do Instagram', type: 'url' },
    { name: 'facebook_url', label: 'Link do Facebook', type: 'url' },
  ] },
  { key: 'navigation_sections', label: 'Menu do site', singular: 'área do menu', icon: Settings2, description: 'Aqui você controla os botões principais do cabeçalho. Para adicionar itens dentro de um botão com seta, use “Páginas e locais do menu” e escolha exatamente o nome desta área.', fields: [
    { name: 'label', label: 'Nome da área', required: true, help: 'Ex.: IPU, DOCUMENTOS, PRESBITÉRIOS.' }, { name: 'sort_order', label: 'Ordem no menu', type: 'number', required: true }, { name: 'show_in_menu', label: 'Exibir no site?', type: 'select', options: ['true', 'false'], required: true }, { name: 'is_dropdown', label: 'Abrir lista de links?', type: 'select', options: ['true', 'false'], required: true }, { name: 'target_url', label: 'Destino se não abrir lista', type: 'url', help: 'Opcional. Usado quando “Abrir lista de links?” estiver como Não.' },
  ] },
]

function blankRecord(resource: Resource) {
  const value: Record<string, unknown> = {}
  resource.fields.forEach((field) => {
    value[field.name] = field.name === 'setting_key' && resource.key === 'site_settings' ? 'church_profile' : field.name === 'status' ? (resource.key === 'pages' ? 'published' : 'draft') : field.name === 'category' ? 'Notícias' : field.name === 'is_active' ? (resource.key === 'homepage_slides' ? 'true' : 'false') : field.name === 'show_in_menu' ? (resource.key === 'navigation_sections' || resource.key === 'pages' ? 'true' : 'false') : field.name === 'is_dropdown' ? 'true' : field.name === 'sort_order' || field.name === 'menu_order' ? '0' : field.name === 'section_name' ? '' : field.type === 'json' ? '{\n  "is_demo": true\n}' : ''
  })
  return value
}

function toInputValue(field: Field, value: unknown) {
  if (value == null) return ''
  if (field.type === 'datetime-local' && typeof value === 'string') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  if (field.type === 'json') return typeof value === 'string' ? value : JSON.stringify(value, null, 2)
  return String(value)
}

function formatDate(value: unknown) {
  if (!value) return ''
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function ContentManager() {
  const [activeKey, setActiveKey] = useState<ResourceKey>('news_posts')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const resource = resources.find((item) => item.key === activeKey) ?? resources[0]

  const loadRows = useCallback(async () => {
    if (!supabase) return
    setLoading(true)
    setError('')
    const tableKey = activeKey === 'homepage_settings' ? 'site_settings' : activeKey
    const orderColumn = activeKey === 'service_times' || activeKey === 'navigation_sections' || activeKey === 'homepage_slides' ? 'sort_order' : activeKey === 'site_settings' || activeKey === 'homepage_settings' ? 'setting_key' : 'created_at'
    let query = supabase.from(tableKey as any).select('*')
    if (activeKey === 'site_settings' || activeKey === 'homepage_settings') query = query.eq('setting_key', 'church_profile') as any
    const { data, error: queryError } = await query.order(orderColumn, { ascending: activeKey === 'service_times' || activeKey === 'site_settings' || activeKey === 'homepage_settings' || activeKey === 'homepage_slides' })
    if (queryError) setError(queryError.message.includes('permission') || queryError.message.includes('row-level') ? 'A conta precisa ter a função administrativa configurada no Supabase.' : 'Não foi possível carregar os dados. Confira a conexão e as permissões.')
    setRows((data ?? []) as Record<string, unknown>[])
    setLoading(false)
  }, [activeKey])

  useEffect(() => { void loadRows() }, [loadRows])

  function chooseResource(key: ResourceKey) {
    setActiveKey(key)
    setEditing(null)
    setIsCreating(false)
    setNotice('')
    setError('')
  }

  function beginCreate() {
    setEditing(blankRecord(resource))
    setIsCreating(true)
    setNotice('')
    setError('')
  }

  function beginEdit(row: Record<string, unknown>) {
    const next: Record<string, unknown> = {}
    resource.fields.forEach((field) => {
      if ((activeKey === 'site_settings' || activeKey === 'homepage_settings') && field.name !== 'setting_key') {
        const profile = row.setting_value && typeof row.setting_value === 'object' ? row.setting_value as Record<string, unknown> : {}
        next[field.name] = toInputValue(field, profile[field.name])
      } else {
        next[field.name] = ['show_in_menu', 'is_dropdown', 'is_active'].includes(field.name) ? String(Boolean(row[field.name])) : toInputValue(field, row[field.name])
      }
    })
    setEditing({ ...next, id: row.id })
    setIsCreating(false)
    setNotice('')
    setError('')
  }

  function updateField(name: string, value: string) {
    setEditing((current) => current ? { ...current, [name]: value } : current)
  }

  async function uploadImage(file: File, targetField: 'cover_image_url' | 'logo_url' | 'welcome_background_url' = 'cover_image_url') {
    if (!supabase || !editing) return
    if (!file.type.startsWith('image/')) { setError('Selecione um arquivo de imagem.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('A imagem deve ter no máximo 10 MB.'); return }
    setUploadingImage(true)
    setError('')
    setNotice('')
    const safeName = file.name.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-')
    const path = `${activeKey}/${Date.now()}-${targetField}-${safeName || 'imagem'}`
    const { error: uploadError } = await supabase.storage.from('church-media').upload(path, file, { upsert: false, contentType: file.type })
    setUploadingImage(false)
    if (uploadError) {
      setError(uploadError.message.includes('row-level security') ? 'O Supabase bloqueou o envio. Confira se sua sessão administrativa foi renovada após a configuração das permissões.' : 'Não foi possível enviar a imagem. Tente novamente.')
      return
    }
    const { data } = supabase.storage.from('church-media').getPublicUrl(path)
    updateField(targetField, data.publicUrl)
    setNotice(targetField === 'logo_url' ? 'Logo enviada. Salve as alterações para atualizar a identidade do site.' : 'Imagem enviada. Salve o cadastro para aplicar a imagem ao conteúdo.')
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !editing) return
    setSaving(true)
    setError('')
    setNotice('')
    const payload: Record<string, unknown> = {}
    if (activeKey === 'site_settings' || activeKey === 'homepage_settings') {
      payload.setting_key = 'church_profile'
      const { data: existingSettings } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'church_profile').maybeSingle()
      const existingProfile = existingSettings?.setting_value && typeof existingSettings.setting_value === 'object' ? existingSettings.setting_value as Record<string, unknown> : {}
      const profile: Record<string, unknown> = { ...existingProfile }
      for (const field of resource.fields) {
        if (field.name !== 'setting_key') profile[field.name] = String(editing[field.name] ?? '').trim()
      }
      payload.setting_value = profile
    } else {
      for (const field of resource.fields) {
        const raw = editing[field.name]
        if (field.type === 'json') {
          try { payload[field.name] = JSON.parse(String(raw || '{}')) } catch { setError('O campo JSON contém um formato inválido.'); setSaving(false); return }
        } else if (['is_active', 'show_in_menu', 'is_dropdown'].includes(field.name)) payload[field.name] = raw === 'true'
        else if (['sort_order', 'menu_order'].includes(field.name)) payload[field.name] = Number(raw || 0)
        else if (field.name === 'ends_at' && resource.key === 'church_events') payload[field.name] = raw ? new Date(String(raw)).toISOString() : null
        else if (field.name === 'preached_at') payload[field.name] = raw || null
        else if (field.name === 'starts_at' && resource.key === 'church_events') payload[field.name] = raw ? new Date(String(raw)).toISOString() : null
        else if (field.name === 'published_at' && raw) payload[field.name] = raw
        else payload[field.name] = raw ?? ''
      }
    }
    if (resource.key === 'news_posts' && payload.status === 'published' && !editing.published_at) payload.published_at = new Date().toISOString()
    const tableKey = activeKey === 'homepage_settings' ? 'site_settings' : activeKey
    const result = activeKey === 'homepage_settings'
      ? await supabase.from('site_settings').upsert(payload, { onConflict: 'setting_key' })
      : isCreating
        ? await supabase.from(tableKey as any).insert(payload)
        : await supabase.from(tableKey as any).update(payload).eq('id', editing.id)
    setSaving(false)
    if (result.error) {
      setError(result.error.code === '23505' ? 'Já existe um item com esse identificador/slug. Escolha outro.' : 'Não foi possível salvar. Verifique os campos e se sua conta tem permissão administrativa.')
      return
    }
    setNotice('Alterações salvas com sucesso.')
    setEditing(null)
    setIsCreating(false)
    await loadRows()
  }

  async function deleteRecord(row: Record<string, unknown>) {
    if (!supabase || !window.confirm('Tem certeza que deseja excluir este item? Essa ação não pode ser desfeita.')) return
    setError('')
    setNotice('')
    const tableKey = activeKey === 'homepage_settings' ? 'site_settings' : activeKey
    const { error: deleteError } = await supabase.from(tableKey as any).delete().eq('id', row.id)
    if (deleteError) { setError('Não foi possível excluir. Confira se sua conta tem permissão administrativa.'); return }
    setNotice('Item excluído.')
    await loadRows()
  }

  const displayTitle = (row: Record<string, unknown>) => String(row.title ?? row.label ?? row.setting_key ?? 'Item sem título')
  const statusLabel = (row: Record<string, unknown>) => {
    if (row.status === 'published') return 'Publicado'
    if (row.status === 'draft') return 'Rascunho'
    if (row.status === 'cancelled') return 'Cancelado'
    if (row.is_active === true) return 'Ativo'
    if (row.is_active === false) return 'Inativo'
    return activeKey === 'site_settings' || activeKey === 'homepage_settings' ? 'Configuração' : 'Cadastrado'
  }

  return (
    <div className="cms-layout">
      <aside className="cms-sidebar">
        <div className="cms-sidebar-label">GERENCIAMENTO</div>
        <div className="cms-sidebar-label cms-sidebar-group">PÁGINA INICIAL</div>
        {resources.filter((item) => item.key === 'homepage_settings' || item.key === 'homepage_slides').map((item) => {
          const Icon = item.icon
          return <button key={item.key} className={activeKey === item.key ? 'cms-nav-item is-active' : 'cms-nav-item'} onClick={() => chooseResource(item.key)}><Icon size={17} /><span>{item.label}</span><ChevronRight size={14} /></button>
        })}
        <div className="cms-sidebar-label cms-sidebar-group">OUTROS CONTEÚDOS</div>
        {resources.filter((item) => item.key !== 'homepage_settings' && item.key !== 'homepage_slides').map((item) => { const Icon = item.icon; return <button key={item.key} className={activeKey === item.key ? 'cms-nav-item is-active' : 'cms-nav-item'} onClick={() => chooseResource(item.key)}><Icon size={17} /><span>{item.label}</span><ChevronRight size={14} /></button> })}
        <div className="cms-sidebar-tip"><Image size={17} /><span>Envie imagens diretamente para o armazenamento seguro da igreja ou informe uma URL pública. Arquivos de até 10 MB.</span></div>
      </aside>

      <section className="cms-main">
        <div className="cms-heading">
          <div><span className="admin-kicker">CONTEÚDO DO SITE</span><h2>{resource.label}</h2><p>{resource.description}</p></div>
          <div className="cms-heading-actions"><button className="cms-icon-button" onClick={() => void loadRows()} title="Atualizar lista"><RefreshCw size={17} /></button>{activeKey !== 'homepage_settings' ? <button className="cms-primary-button" onClick={beginCreate}><Plus size={17} /> Novo item</button> : null}</div>
        </div>

        {error ? <div className="cms-alert cms-alert-error" role="alert">{error}</div> : null}
        {notice ? <div className="cms-alert cms-alert-success"><Check size={16} />{notice}</div> : null}

        {editing ? (
          <form className="cms-editor" onSubmit={saveRecord}>
            <div className="cms-editor-heading"><div><span className="admin-kicker">{isCreating ? 'NOVO CADASTRO' : 'EDITAR CADASTRO'}</span><h3>{isCreating ? 'Adicionar ' + resource.singular : 'Editar ' + resource.singular}</h3></div><button type="button" className="cms-icon-button" onClick={() => setEditing(null)} aria-label="Fechar formulário"><X size={18} /></button></div>
            <div className="cms-fields">
              {resource.fields.map((field) => <label key={field.name} className={field.type === 'textarea' || field.type === 'json' ? 'cms-field cms-field-wide' : 'cms-field'}>
                <span>{field.label}{field.required ? ' *' : ''}</span>
                {field.type === 'textarea' || field.type === 'json' ? <textarea value={String(editing[field.name] ?? '')} onChange={(event) => updateField(field.name, event.target.value)} required={field.required} rows={field.type === 'json' ? 8 : 4} spellCheck={field.type !== 'json'} />
                  : field.type === 'select' ? <select value={String(editing[field.name] ?? '')} onChange={(event) => updateField(field.name, event.target.value)} required={field.required}>{(field.options ?? []).map((option) => <option key={option} value={option}>{option === 'published' ? 'Publicado' : option === 'draft' ? 'Rascunho' : option === 'cancelled' ? 'Cancelado' : option === 'true' ? 'Sim' : option === 'false' ? 'Não' : option}</option>)}</select>
                  : field.type === 'url' && (field.name === 'cover_image_url' || field.name === 'logo_url' || field.name === 'welcome_background_url') ? <><input type="url" value={String(editing[field.name] ?? '')} onChange={(event) => updateField(field.name, event.target.value)} placeholder="URL da imagem ou envie um arquivo" /><input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" disabled={uploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, field.name === 'logo_url' ? 'logo_url' : field.name === 'welcome_background_url' ? 'welcome_background_url' : 'cover_image_url'); event.currentTarget.value = '' }} /><small>{uploadingImage ? 'Enviando imagem...' : 'JPG, PNG, WebP, GIF ou SVG · máximo 10 MB. O arquivo será armazenado no Supabase.'}</small>{editing[field.name] ? <img src={String(editing[field.name])} alt={field.name === 'logo_url' ? 'Pré-visualização da logo' : field.name === 'welcome_background_url' ? 'Pré-visualização da foto de fundo' : 'Pré-visualização da imagem'} style={{ display: 'block', maxWidth: field.name === 'logo_url' ? '260px' : '220px', maxHeight: '140px', objectFit: 'contain', borderRadius: '8px', marginTop: '8px' }} /> : null}</>
                  : <input type={field.type === 'number' ? 'number' : field.type ?? 'text'} value={String(editing[field.name] ?? '')} onChange={(event) => updateField(field.name, event.target.value)} required={field.required} step={field.type === 'time' ? 60 : undefined} />}
                {field.help ? <small>{field.help}</small> : null}
              </label>)}
            </div>
            <div className="cms-editor-actions"><button type="button" className="cms-secondary-button" onClick={() => setEditing(null)}>Cancelar</button><button className="cms-primary-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="cms-spin" size={16} /> : <Save size={16} />}{saving ? 'Salvando...' : 'Salvar alterações'}</button></div>
          </form>
        ) : (
          <div className="cms-list-card">
            <div className="cms-list-top"><strong>{rows.length} {rows.length === 1 ? 'registro' : 'registros'}</strong><span>Somente a equipe autorizada pode alterar o conteúdo.</span></div>
            {loading ? <div className="cms-empty"><LoaderCircle className="cms-spin" size={22} /><span>Carregando conteúdo...</span></div> : rows.length === 0 ? <div className="cms-empty"><FileText size={24} /><strong>Nenhum item cadastrado</strong><span>{activeKey === 'homepage_settings' ? 'A configuração inicial será criada ao salvar os textos.' : 'Use “Novo item” para adicionar o primeiro conteúdo.'}</span>{activeKey === 'homepage_settings' ? <button className="cms-primary-button" onClick={() => { setEditing({ welcome_heading: 'Tradição na fé.', welcome_emphasis: 'Esperança para hoje.', welcome_text: '', about_text: '' }); setIsCreating(true) }}>Configurar página inicial</button> : null}</div> : <div className="cms-record-list">{rows.map((row) => <article className="cms-record" key={String(row.id ?? row.setting_key)}><div className="cms-record-copy"><strong>{displayTitle(row)}</strong><span>{String(row.excerpt ?? row.description ?? row.speaker ?? row.day_of_week ?? row.slug ?? row.label ?? '')}</span><div className="cms-record-meta"><span className={row.status === 'published' || row.is_active === true ? 'cms-status is-published' : 'cms-status'}>{statusLabel(row)}</span>{row.starts_at && activeKey === 'church_events' ? <span>{formatDate(row.starts_at)}</span> : null}{row.created_at && activeKey !== 'site_settings' && activeKey !== 'homepage_settings' && activeKey !== 'service_times' ? <span>Criado em {formatDate(row.created_at)}</span> : null}</div></div><div className="cms-record-actions"><button className="cms-icon-button" onClick={() => beginEdit(row)} aria-label={'Editar ' + displayTitle(row)} title="Editar"><Settings2 size={16} /></button>{activeKey !== 'homepage_settings' ? <button className="cms-icon-button cms-delete-button" onClick={() => void deleteRecord(row)} aria-label={'Excluir ' + displayTitle(row)} title="Excluir"><Trash2 size={16} /></button> : null}</div></article>)}</div>}
          </div>
        )}
        <p className="cms-demo-note">Ambiente de demonstração: confirme e substitua os dados fictícios antes de publicar o site.</p>
      </section>
    </div>
  )
}
