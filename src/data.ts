import type { AccretionPreset } from '@/components/ui/etched-accretion'

// Цвета диска: пресет шейдера + акцент для текста и кнопок (светлее, чтобы читался на чёрном).
export const THEMES: { preset: AccretionPreset; name: string; accent: string }[] = [
  { preset: 'crimson', name: 'Багровый', accent: '#ff3b47' },
  { preset: 'ember', name: 'Огненный', accent: '#ff8a3d' },
  { preset: 'glacier', name: 'Ледяной', accent: '#6f9dff' },
  { preset: 'orchid', name: 'Орхидея', accent: '#e563d4' },
  { preset: 'ash', name: 'Пепельный', accent: '#d4d4d4' },
]

export interface Show {
  id: string
  title: string
  tagline: string
  desc: string
  duration: string
  age: string
  adult: number
  child: number | null // null — детских билетов нет (18+)
  times: string[]
  days?: number[] // дни недели (0 — воскресенье); если не указано — каждый день
  daysText?: string
}

export const SHOWS: Show[] = [
  {
    id: 'horizon',
    title: 'Горизонт событий',
    tagline: 'Главное шоу сезона',
    desc: 'Полёт к сверхмассивной чёрной дыре в центре Галактики на куполе 360°: аккреционный диск, искривление света и история первых снимков чёрных дыр.',
    duration: '45 мин',
    age: '12+',
    adult: 4500,
    child: 2700,
    times: ['11:00', '14:00', '17:00', '20:00'],
  },
  {
    id: 'kids',
    title: 'Звёздные дети',
    tagline: 'Для всей семьи',
    desc: 'Как рождаются, живут и умирают звёзды — и почему самые большие из них становятся чёрными дырами. С викториной после сеанса.',
    duration: '30 мин',
    age: '6+',
    adult: 3000,
    child: 2000,
    times: ['10:00', '12:30', '15:30'],
  },
  {
    id: 'night',
    title: 'Ночь на куполе',
    tagline: 'Только по пятницам и субботам',
    desc: 'Расширенная версия шоу, живая лекция астрофизика и наблюдение в телескопы на крыше, если позволит погода.',
    duration: '90 мин',
    age: '18+',
    adult: 7000,
    child: null,
    times: ['22:00'],
    days: [5, 6],
    daysText: 'пт и сб',
  },
]

// Реальные факты о чёрных дырах (округлено).
export const FACTS = [
  { value: '≈ 4 млн', unit: 'масс Солнца', text: 'весит Стрелец A* — сверхмассивная чёрная дыра в центре нашей Галактики.' },
  { value: '≈ 26 000', unit: 'световых лет', text: 'отделяют нас от Стрельца A*. Свет от него шёл к нам дольше, чем существует человеческая цивилизация.' },
  { value: '2019', unit: 'год', text: 'когда телескоп «Горизонт событий» (EHT) впервые показал изображение чёрной дыры — M87* в галактике Messier 87.' },
  { value: '6,5 млрд', unit: 'масс Солнца', text: 'масса M87*. Один её горизонт событий в несколько раз шире орбиты Нептуна.' },
]

export const PORTFOLIO_URL = 'https://iaroslaviskendirov-alt.github.io/'
