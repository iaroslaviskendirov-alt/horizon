import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Atom, CalendarDays, Clock, Home, Minus, Palette, Plus, Ticket, Users, X } from 'lucide-react'
import EtchedAccretion from '@/components/ui/etched-accretion'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
import { FACTS, PORTFOLIO_URL, SHOWS, THEMES } from '@/data'
import { cn } from '@/lib/utils'

const money = (n: number) => n.toLocaleString('ru-RU') + ' ₸'
const SECTIONS = ['top', 'shows', 'science', 'tickets'] as const

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: 'easeOut' as const },
}

// Ближайшие 7 дней для выбора даты
function nextDays() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })
}

export default function App() {
  const [themeIdx, setThemeIdx] = useState(0)
  const theme = THEMES[themeIdx]
  const [active, setActive] = useState<(typeof SECTIONS)[number]>('top')

  // ---- билеты ----
  const days = useMemo(nextDays, [])
  const [showId, setShowId] = useState(SHOWS[0].id)
  const show = SHOWS.find((s) => s.id === showId)!
  const [dayIdx, setDayIdx] = useState(0)
  const [time, setTime] = useState<string | null>(null)
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [notice, setNotice] = useState(false)

  const dayAllowed = (d: Date) => !show.days || show.days.includes(d.getDay())
  const timePassed = (d: Date, t: string) => {
    const [h, m] = t.split(':').map(Number)
    const at = new Date(d)
    at.setHours(h, m, 0, 0)
    return at.getTime() < Date.now() + 15 * 60000 // продажа закрывается за 15 минут
  }
  const day = days[dayIdx]
  const freeTimes = show.times.filter((t) => !timePassed(day, t))
  // день доступен, если шоу идёт в этот день недели и остался хотя бы один сеанс
  const dayOk = (d: Date) => dayAllowed(d) && show.times.some((t) => !timePassed(d, t))

  // При открытии и смене шоу: если выбранный день недоступен (например, вечером все сеансы
  // уже прошли) — переходим на ближайший день с сеансами
  useEffect(() => {
    if (!dayOk(days[dayIdx])) {
      const first = days.findIndex(dayOk)
      if (first >= 0) setDayIdx(first)
    }
    if (show.child === null) setKids(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId])
  useEffect(() => {
    setTime((cur) => (cur && freeTimes.includes(cur) ? cur : freeTimes[0] ?? null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId, dayIdx])

  const total = adults * show.adult + kids * (show.child ?? 0)
  const canBuy = !!time && adults + kids > 0 && dayAllowed(day)

  // ---- подсветка текущего раздела в доке ----
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id as (typeof SECTIONS)[number]) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!notice) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNotice(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [notice])

  const dockItems = [
    { id: 'top', title: 'Главная', icon: Home, href: '#top' },
    { id: 'shows', title: 'Программа', icon: CalendarDays, href: '#shows' },
    { id: 'science', title: 'Наука', icon: Atom, href: '#science' },
    { id: 'tickets', title: 'Билеты', icon: Ticket, href: '#tickets' },
    { id: 'theme', title: `Цвет диска: ${theme.name}`, icon: Palette, onClick: () => setThemeIdx((i) => (i + 1) % THEMES.length) },
    { id: 'portfolio', title: 'Портфолио', icon: ArrowUpRight, href: PORTFOLIO_URL },
  ]

  return (
    <div style={{ '--accent': theme.accent } as CSSProperties} className="min-h-svh pb-28 font-sans">
      {/* ---------- Первый экран: чёрная дыра ---------- */}
      <div id="top">
        <EtchedAccretion preset={theme.preset} aria-label="Чёрная дыра с аккреционным диском — заставка шоу">
          <div className="pointer-events-none flex h-full flex-col justify-between p-5 pb-28 sm:p-10 sm:pb-32">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-sm tracking-[0.5em] text-white">HORIZON</div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.3em] text-white/45 uppercase">иммерсивный планетарий</div>
              </div>
              <div className="font-mono text-[10px] tracking-[0.3em] text-white/45 uppercase">сезон 2026</div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-4 font-mono text-[11px] tracking-[0.3em] text-[var(--accent)] uppercase transition-colors duration-700">новое шоу на куполе 360°</div>
              <h1 className="font-serif text-5xl leading-[1.02] text-white sm:text-7xl">
                Ничто не вырвется<br />за <em className="text-[var(--accent)] transition-colors duration-700">горизонт</em>.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
                45 минут рядом со сверхмассивной чёрной дырой: как она искривляет свет, пожирает звёзды и почему её всё-таки удалось сфотографировать.
              </p>
              <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
                <a href="#tickets" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-black transition-[background-color,transform] duration-300 hover:scale-[1.03]">
                  <Ticket className="h-4 w-4" /> Купить билет
                </a>
                <a href="#shows" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 text-sm text-white backdrop-blur transition-colors hover:border-white/60">
                  Программа
                </a>
              </div>
              <p className="mt-6 font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">двигайте мышью — меняйте ракурс · зажмите — накормите дыру</p>
            </div>
          </div>
        </EtchedAccretion>
      </div>

      {/* ---------- Программа ---------- */}
      <section id="shows" className="mx-auto max-w-6xl px-5 pt-24">
        <motion.div {...reveal}>
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">01 · программа</div>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Три способа <em className="text-[var(--accent)]">потерять</em> счёт времени</h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {SHOWS.map((s, i) => (
            <motion.article key={s.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              {/* «светящаяся дыра» в углу карточки */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-60 blur-2xl transition-[opacity,background-color] duration-700 group-hover:opacity-90"
                style={{ background: 'radial-gradient(circle, transparent 28%, var(--accent) 30%, transparent 62%)' }} />
              <div className="font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">{s.tagline}</div>
              <h3 className="mt-2 font-serif text-3xl">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">{s.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] text-white/70">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1"><Clock className="h-3 w-3" />{s.duration}</span>
                <span className="rounded-full border border-white/15 px-2.5 py-1">{s.age}</span>
                <span className="rounded-full border border-white/15 px-2.5 py-1">{s.times.join(' · ')}{s.daysText ? `, ${s.daysText}` : ''}</span>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-white/60">от <b className="text-lg text-white">{money(s.child ?? s.adult)}</b></span>
                <a href="#tickets" onClick={() => setShowId(s.id)} className="inline-flex min-h-10 items-center gap-1 rounded-full border border-white/20 px-4 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  Билеты <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- Наука ---------- */}
      <section id="science" className="mx-auto max-w-6xl px-5 pt-28">
        <motion.div {...reveal}>
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">02 · наука</div>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl sm:text-5xl">Цифры, от которых <em className="text-[var(--accent)]">кружится</em> голова</h2>
          <p className="mt-4 max-w-2xl text-white/60">Горизонт событий — граница, из-за которой не может вырваться даже свет. Всё, что вы увидите в шоу, основано на реальных наблюдениях.</p>
        </motion.div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
          {FACTS.map((f, i) => (
            <motion.div key={f.value} {...reveal} transition={{ ...reveal.transition, delay: (i % 2) * 0.1 }} className="bg-[#05050a] p-7 sm:p-9">
              <div className="font-serif text-5xl text-[var(--accent)] transition-colors duration-700 sm:text-6xl">{f.value}</div>
              <div className="mt-1 font-mono text-[11px] tracking-[0.25em] text-white/50 uppercase">{f.unit}</div>
              <p className="mt-4 text-sm leading-relaxed text-white/65">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Билеты ---------- */}
      <section id="tickets" className="mx-auto max-w-6xl px-5 pt-28">
        <motion.div {...reveal}>
          <div className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">03 · билеты</div>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Выберите <em className="text-[var(--accent)]">сеанс</em></h2>
        </motion.div>

        <motion.div {...reveal} className="mt-10 grid min-w-0 gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0 space-y-7">
            <fieldset className="min-w-0">
              <legend className="mb-3 font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">Шоу</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {SHOWS.map((s) => (
                  <button key={s.id} type="button" onClick={() => setShowId(s.id)} aria-pressed={s.id === showId}
                    className={cn('min-h-12 rounded-2xl border px-4 py-3 text-left text-sm transition-colors',
                      s.id === showId ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-white/15 hover:border-white/40')}>
                    <div className="font-medium">{s.title}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-white/50">{s.duration} · {s.age}</div>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-3 font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">Дата</legend>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {days.map((d, i) => {
                  const ok = dayOk(d)
                  return (
                    <button key={i} type="button" disabled={!ok} onClick={() => setDayIdx(i)} aria-pressed={i === dayIdx}
                      className={cn('min-h-16 min-w-16 flex-none rounded-2xl border px-3 py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-30',
                        i === dayIdx && ok ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-white/15 hover:border-white/40')}>
                      <div className="font-mono text-[10px] text-white/50 uppercase">{i === 0 ? 'сегодня' : d.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                      <div className="text-lg font-medium">{d.getDate()}</div>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-3 font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">Сеанс</legend>
              {freeTimes.length && dayAllowed(day) ? (
                <div className="flex flex-wrap gap-2">
                  {show.times.map((t) => {
                    const past = timePassed(day, t)
                    return (
                      <button key={t} type="button" disabled={past} onClick={() => setTime(t)} aria-pressed={t === time}
                        className={cn('min-h-11 rounded-full border px-5 font-mono text-sm transition-colors disabled:cursor-not-allowed disabled:line-through disabled:opacity-30',
                          t === time ? 'border-[var(--accent)] bg-[var(--accent)] text-black' : 'border-white/15 hover:border-white/40')}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-white/50">На этот день сеансов нет — выберите другую дату.</p>
              )}
            </fieldset>

            <fieldset className="grid min-w-0 gap-3 sm:grid-cols-2">
              <legend className="mb-3 font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">Гости</legend>
              <Counter label="Взрослый" price={show.adult} value={adults} onChange={setAdults} />
              {show.child !== null
                ? <Counter label="Детский, до 14 лет" price={show.child} value={kids} onChange={setKids} />
                : <div className="flex min-h-14 items-center rounded-2xl border border-dashed border-white/15 px-4 text-sm text-white/45">Сеанс 18+, детских билетов нет</div>}
            </fieldset>
          </div>

          {/* Итог */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-black/40 p-6">
            <div className="font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">Ваш заказ</div>
            <div className="mt-3 font-serif text-3xl">{show.title}</div>
            <dl className="mt-5 space-y-3 text-sm">
              <Row icon={CalendarDays} label="Дата" value={day.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} />
              <Row icon={Clock} label="Сеанс" value={time ?? '—'} />
              <Row icon={Users} label="Гости" value={`${adults} взр.${kids ? ` + ${kids} дет.` : ''}`} />
            </dl>
            <div className="mt-auto pt-8">
              <div className="flex items-baseline justify-between border-t border-white/10 pt-5">
                <span className="text-white/60">Итого</span>
                <span className="font-serif text-4xl text-[var(--accent)] transition-colors duration-700">{money(total)}</span>
              </div>
              <button type="button" disabled={!canBuy} onClick={() => setNotice(true)}
                className="mt-5 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3.5 font-semibold text-black transition-[background-color,opacity,transform] duration-300 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40">
                <Ticket className="h-4 w-4" /> Перейти к оплате
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="mx-auto mt-24 max-w-6xl border-t border-white/10 px-5 py-10 text-sm text-white/45">
        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div><span className="font-mono tracking-[0.4em] text-white">HORIZON</span> · иммерсивный планетарий · ежедневно 10:00–23:00</div>
          <a href={PORTFOLIO_URL} className="hover:text-white">Сделал Ярослав ↗</a>
        </div>
        <p className="mt-4 text-xs text-white/30">Концепт сайта. Планетарий, цены и расписание вымышленные; факты о чёрных дырах — настоящие.</p>
      </footer>

      {/* ---------- Док ---------- */}
      <nav className="fixed inset-x-0 bottom-2 z-40 flex justify-center pb-[env(safe-area-inset-bottom)]" aria-label="Разделы сайта">
        <Dock className="items-end border border-white/10 bg-black/60 pb-3 backdrop-blur-xl" magnification={68} distance={120}>
          {dockItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === active
            return (
              <DockItem key={item.id} label={item.title} href={item.href} onClick={item.onClick} active={isActive}
                className={cn('aspect-square rounded-full bg-white/10 transition-colors', isActive && 'bg-[var(--accent)]/25 ring-1 ring-[var(--accent)]')}>
                <DockLabel>{item.title}</DockLabel>
                <DockIcon>
                  <Icon className={cn('h-full w-full', item.id === 'theme' ? 'text-[var(--accent)]' : 'text-white/80')} />
                </DockIcon>
              </DockItem>
            )
          })}
        </Dock>
      </nav>

      {/* ---------- Окно «оплата» ---------- */}
      <AnimatePresence>
        {notice && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNotice(false)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="notice-title" onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0a0a10] p-7">
              <button type="button" onClick={() => setNotice(false)} aria-label="Закрыть" className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="h-4 w-4" />
              </button>
              <h3 id="notice-title" className="font-serif text-3xl">Почти на месте ✦</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                {show.title}, {day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {time}, {adults + kids} {adults + kids === 1 ? 'гость' : 'гостя'} — <b className="text-white">{money(total)}</b>.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Это концепт-сайт, поэтому оплата не подключена. В настоящем проекте здесь была бы оплата Kaspi или картой и электронный билет на почту.
              </p>
              <button type="button" onClick={() => setNotice(false)} className="mt-6 min-h-12 w-full rounded-full bg-[var(--accent)] font-semibold text-black">Понятно</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Counter({ label, price, value, onChange }: { label: string; price: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex min-h-14 items-center justify-between rounded-2xl border border-white/15 px-4 py-2">
      <div>
        <div className="text-sm">{label}</div>
        <div className="font-mono text-[11px] text-white/50">{money(price)}</div>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Меньше: ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-white/40"><Minus className="h-4 w-4" /></button>
        <span className="w-7 text-center font-mono" aria-live="polite">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(10, value + 1))} aria-label={`Больше: ${label}`} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-white/40"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="flex items-center gap-2 text-white/50"><Icon className="h-4 w-4" />{label}</dt>
      <dd className="text-right first-letter:uppercase">{value}</dd>
    </div>
  )
}
