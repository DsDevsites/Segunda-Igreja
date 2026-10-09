import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Check, ChevronRight, FileText, Image, LoaderCircle, Newspaper, Plus, RefreshCw, Save, Settings2, Trash2, Video, Clock3, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type ResourceKey = 'news_posts' | 'church_events' | 'sermons' | 'pages' | 'service_times' | 'site_settings' | 'navigation_sections'
type FieldType = 'text' | 'textarea' | 'url' | 'date' | 'datetime-local' | 'time' | 'number' | 'select' | 'json'
type Field = { name: string; label: string; type?: FieldType; required?: boolean; options?: string[]; help?: string }
type Resource = { key: ResourceKey; label: string; singular: string; icon: typeof Newspaper; description: string; fields: Field[] }

const resources: Resource[] = [
  { key: 'news_posts', label: 'Notícias', singular: 'notícia', icon: Newspaper, description: 'Publicações e comunicados da igreja.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'slug', label: 'Endereço amigável (slug)', required: true, help: 'Ex.: encontro-de-oracao' }, { name: 'excerpt', label: 'Resumo', type: 'textarea' }, { name: 'body', label: 'Conteúdo', type: 'textarea' }, { name: 'cover_image_url', label: 'URL da imagem de capa', type: 'url' }, { name: 'category', label: 'Categoria' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
  ] },
  { key: 'church_events', label: 'Eventos', singular: 'evento', icon: CalendarDays, description: 'Agenda de cultos especiais, encontros e atividades.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'description', label: 'Descrição', type: 'textarea' }, { name: 'location', label: 'Local' }, { name: 'starts_at', label: 'Data e horário de início', type: 'datetime-local', required: true }, { name: 'ends_at', label: 'Data e horário de término', type: 'datetime-local' }, { name: 'cover_image_url', label: 'URL da imagem', type: 'url' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'cancelled'], required: true },
  ] },
  { key: 'sermons', label: 'Sermões', singular: 'sermão', icon: Video, description: 'Mensagens, pregadores, referências bíblicas e vídeos.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'speaker', label: 'Pregador' }, { name: 'scripture', label: 'Referência bíblica' }, { name: 'description', label: 'Descrição', type: 'textarea' }, { name: 'video_url', label: 'Link do vídeo', type: 'url' }, { name: 'audio_url', label: 'Link do áudio', type: 'url' }, { name: 'cover_image_url', label: 'URL da imagem', type: 'url' }, { name: 'preached_at', label: 'Data da mensagem', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
  ] },
  { key: 'pages', label: 'Páginas', singular: 'página', icon: FileText, description: 'Páginas institucionais, como história e ministérios.', fields: [
    { name: 'title', label: 'Título', required: true }, { name: 'slug', label: 'Endereço amigável (slug)', required: true, help: 'Define o endereço da página: exemplo nossa-historia.' }, { name: 'excerpt', label: 'Resumo', type: 'textarea' }, { name: 'body', label: 'Conteúdo', type: 'textarea' }, { name: 'cover_image_url', label: 'URL da imagem de capa', type: 'url' }, { name: 'section_name', label: 'Área do menu', help: 'Páginas com o mesmo nome ficam agrupadas no mesmo menu. Ex.: Institucional, Ministérios, Documentos.' }, { name: 'menu_label', label: 'Nome do link no menu', help: 'Deixe vazio para usar o título da página.' }, { name: 'menu_order', label: 'Ordem no menu', type: 'number' }, { name: 'show_in_menu', label: 'Exibir no menu?', type: 'select', options: ['true', 'false'], required: true }, { name: 'external_url', label: 'Link externo (opcional)', type: 'url', help: 'Se preenchido, o item do menu abre este endereço em vez da página interna.' }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'published'], required: true },
  ] },
  { key: 'service_times', label: 'Horários', singular: 'horário', icon: Clock3, description: 'Horários de cultos e encontros semanais.', fields: [
    { name: 'title', label: 'Nome da programação', required: true }, { name: 'day_of_week', label: 'Dia da semana', required: true }, { name: 'starts_at', label: 'Horário', type: 'time', required: true }, { name: 'description', label: 'Observação', type: 'textarea' }, { name: 'sort_order', label: 'Ordem de exibição' }, { name: 'is_active', label: 'Ativo?', type: 'select', options: ['true', 'false'], required: true },
  ] },
  { key: 'site_settings', label: 'Configurações', singular: 'configuração', icon: Settings2, description: 'Dados gerais do site e textos principais.', fields: [
    { name: 'setting_key', label: 'Identificador', required: true, help: 'Use church_profile para atualizar endereço, telefone, WhatsApp e redes sociais exibidos no site.' }, { name: 'setting_value', label: 'Configuração em JSON', type: 'json', required: true, help: 'Para church_profile, use chaves como address, phone, email, whatsapp (somente números com DDI/DDD), instagram_url, facebook_url, maps_url, about_text.' },
  ] },
  { key: 'navigation_sections', label: 'Menu do site', singular: 'área do menu', icon: Settings2, description: 'Crie, renomeie, ordene e oculte áreas do menu principal. Para adicionar links dentro de uma área, cadastre uma página com o mesmo nome em “Área do menu”.', fields: [
    { name: 'label', label: 'Nome da área', required: true, help: 'Ex.: IPU, DOCUMENTOS, PRESBITÉRIOS.' }, { name: 'sort_order', label: 'Ordem no menu', type: 'number', required: true }, { name: 'show_in_menu', label: 'Exibir no site?', type: 'select', options: ['true', 'false'], required: true }, { name: 'is_dropdown', label: 'Abrir lista de links?', type: 'select', options: ['true', 'false'], required: true }, { name: 'target_url', label: 'Destino se não abrir lista', type: 'url', help: 'Opcional. Usado quando “Abrir lista de links?” estiver como Não.' },
  ] },
]

function blankRecord(resource: Resource) {
  const value: Record<string, unknown> = {}
  resource.fields.forEach((field) => {
    value[field.name] = field.name === 'status' ? 'draft' : field.name === 'category' ? 'Notícias' : field.name === 'is_active' ? 'false' : field.name === 'show_in_menu' ? (resource.key === 'navigation_sections' ? 'true' : 'false') : field.name === 'is_dropdown' ? 'true' : field.name === 'sort_order' || field.name === 'menu_order' ? '0' : field.name === 'section_name' ? 'Institucional' : field.type === 'json' ? '{\n  "is_demo": true\n}' : ''
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
    const orderColumn = activeKey === 'service_times' || activeKey === 'navigation_sections' ? 'sort_order' : activeKey === 'site_settings' ? 'setting_key' : 'created_at'
    const { data, error: queryError } = await supabase.from(activeKey as any).select('*').order(orderColumn, { ascending: activeKey === 'service_times' || activeKey === 'site_settings' })
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
    resource.fields.forEach((field) => { next[field.name] = ['show_in_menu', 'is_dropdown', 'is_active'].includes(field.name) ? String(Boolean(row[field.name])) : toInputValue(field, row[field.name]) })
    setEditing({ ...next, id: row.id })
    setIsCreating(false)
    setNotice('')
    setError('')
  }

  function updateField(name: string, value: string) {
    setEditing((current) => current ? { ...current, [name]: value } : current)
  }

  async function uploadImage(file: File) {
    if (!supabase || !editing) return
    if (!file.type.startsWith('image/')) { setError('Selecione um arquivo de imagem.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('A imagem deve ter no máximo 10 MB.'); return }
    setUploadingImage(true)
    setError('')
    setNotice('')
    const safeName = file.name.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '-')
    const path = `${activeKey}/${Date.now()}-${safeName || 'imagem'}`
    const { error: uploadError } = await supabase.storage.from('church-media').upload(path, file, { upsert: false, contentType: file.type })
    setUploadingImage(false)
    if (uploadError) {
      setError(uploadError.message.includes('row-level security') ? 'O Supabase bloqueou o envio. Confira se sua sessão administrativa foi renovada após a configuração das permissões.' : 'Não foi possível enviar a imagem. Tente novamente.')
      return
    }
    const { data } = supabase.storage.from('church-media').getPublicUrl(path)
    updateField('cover_image_url', data.publicUrl)
    setNotice('Imagem enviada. Salve o cadastro para aplicar a imagem ao conteúdo.')
  }

  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !editing) return
    setSaving(true)
    setError('')
    setNotice('')
    const payload: Record<string, unknown> = {}
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
    if (resource.key === 'news_posts' && payload.status === 'published' && !editing.published_at) payload.published_at = new Date().toISOString()
    const result = isCreating
      ? await supabase.from(activeKey as any).insert(payload)
      : await supabase.from(activeKey as any).update(payload).eq('id', editing.id)
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
    const { error: deleteError } = await supabase.from(activeKey as any).delete().eq('id', row.id)
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
    return activeKey === 'site_settings' ? 'Configuração' : 'Cadastrado'
  }

  return (
    <div className="cms-layout">
      <aside className="cms-sidebar">
        <div className="cms-sidebar-label">GERENCIAMENTO</div>
        {resources.map((item) => {
          const Icon = item.icon
          return <button key={item.key} className={activeKey === item.key ? 'cms-nav-item is-active' : 'cms-nav-item'} onClick={() => chooseResource(item.key)}><Icon size={17} /><span>{item.label}</span><ChevronRight size={14} /></button>
        })}
        <div className="cms-sidebar-tip"><Image size={17} /><span>Envie imagens diretamente para o armazenamento seguro da igreja ou informe uma URL pública. Arquivos de até 10 MB.</span></div>
      </aside>

      <section className="cms-main">
        <div className="cms-heading">
          <div><span className="admin-kicker">CONTEÚDO DO SITE</span><h2>{resource.label}</h2><p>{resource.description}</p></div>
          <div className="cms-heading-actions"><button className="cms-icon-button" onClick={() => void loadRows()} title="Atualizar lista"><RefreshCw size={17} /></button><button className="cms-primary-button" onClick={beginCreate}><Plus size={17} /> Novo item</button></div>
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
                  : field.type === 'url' && field.name === 'cover_image_url' ? <><input type="url" value={String(editing[field.name] ?? '')} onChange={(event) => updateField(field.name, event.target.value)} placeholder="URL da imagem ou envie um arquivo" /><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingImage} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = '' }} /><small>{uploadingImage ? 'Enviando imagem...' : 'JPG, PNG, WebP ou GIF · máximo 10 MB. O arquivo será armazenado no Supabase.'}</small>{editing[field.name] ? <img src={String(editing[field.name])} alt="Pré-visualização da imagem" style={{ display: 'block', maxWidth: '220px', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} /> : null}</>
                  : <input type={field.type === 'number' ? 'number' : field.type ?? 'text'} value={String(editing[field.name] ?? '')} onChange={(event) => updateField(field.name, event.target.value)} required={field.required} step={field.type === 'time' ? 60 : undefined} />}
                {field.help ? <small>{field.help}</small> : null}
              </label>)}
            </div>
            <div className="cms-editor-actions"><button type="button" className="cms-secondary-button" onClick={() => setEditing(null)}>Cancelar</button><button className="cms-primary-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="cms-spin" size={16} /> : <Save size={16} />}{saving ? 'Salvando...' : 'Salvar alterações'}</button></div>
          </form>
        ) : (
          <div className="cms-list-card">
            <div className="cms-list-top"><strong>{rows.length} {rows.length === 1 ? 'registro' : 'registros'}</strong><span>Somente a equipe autorizada pode alterar o conteúdo.</span></div>
            {loading ? <div className="cms-empty"><LoaderCircle className="cms-spin" size={22} /><span>Carregando conteúdo...</span></div> : rows.length === 0 ? <div className="cms-empty"><FileText size={24} /><strong>Nenhum item cadastrado</strong><span>Use “Novo item” para adicionar o primeiro conteúdo.</span></div> : <div className="cms-record-list">{rows.map((row) => <article className="cms-record" key={String(row.id ?? row.setting_key)}><div className="cms-record-copy"><strong>{displayTitle(row)}</strong><span>{String(row.excerpt ?? row.description ?? row.speaker ?? row.day_of_week ?? row.slug ?? row.label ?? '')}</span><div className="cms-record-meta"><span className={row.status === 'published' || row.is_active === true ? 'cms-status is-published' : 'cms-status'}>{statusLabel(row)}</span>{row.starts_at && activeKey === 'church_events' ? <span>{formatDate(row.starts_at)}</span> : null}{row.created_at && activeKey !== 'site_settings' && activeKey !== 'service_times' ? <span>Criado em {formatDate(row.created_at)}</span> : null}</div></div><div className="cms-record-actions"><button className="cms-icon-button" onClick={() => beginEdit(row)} aria-label={'Editar ' + displayTitle(row)} title="Editar"><Settings2 size={16} /></button><button className="cms-icon-button cms-delete-button" onClick={() => void deleteRecord(row)} aria-label={'Excluir ' + displayTitle(row)} title="Excluir"><Trash2 size={16} /></button></div></article>)}</div>}
          </div>
        )}
        <p className="cms-demo-note">Ambiente de demonstração: confirme e substitua os dados fictícios antes de publicar o site.</p>
      </section>
    </div>
  )
}
