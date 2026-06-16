import { Designer, Service, Testimonial } from './types';
import endyAvatar from './assets/images/designer_endy_new_1781434607962.jpg';
import cutService from './assets/images/service_korean_cut_1781318500488.jpg';
import permService from './assets/images/service_perm_1781318514087.jpg';
import colorService from './assets/images/service_color_1781318529528.jpg';

export const DESIGNERS: Designer[] = [
  {
    id: 'endy',
    name: 'Endy',
    title: '1 號 創意視覺總監 / 精緻剪燙染專家 (LINE: end0708)',
    avatar: endyAvatar,
    bio: '身為斯古林髮型林口旗艦店的 1 號主理設計師，Endy 擁有多年男士/女士美髮與流行沙龍資歷。他熱衷於將最前沿的流行趨勢（如客製燙染、小紅書爆款、日韓前刺、縮毛矯正、羊毛捲與潮流挑染）融入客人的日常造型中。憑藉細緻的傾聽與高超的水分鎖定燙染技術，為每位顧客打造高質感且極易整理的專屬髮型。',
    specialties: ['男士/女士燙髮 (羊毛捲/縮毛矯正/前刺)', '專業染髮 (挑染/霧感系列)', '男士/女士精緻剪髮 + 洗髮', '精緻舒壓洗髮'],
    experience: '斯古林麗林旗艦店主辦設計師 (LINE: end0708)',
    rating: 4.9,
    reviewCount: 168,
    workDays: [2, 3, 5, 6, 7], // Tue, Wed, Fri, Sat, Sun (Mon, Thu off)
    availableTimes: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00']
  }
];

export const SERVICES: Service[] = [
  {
    id: 'mens_cut_wash',
    name: '男士/女士剪髮+洗髮 (各式造型剪髮)',
    category: 'cut',
    price: 600,
    duration: 45,
    description: '包含男士/女士精緻剪髮與各式造型剪髮。結合深層頭皮舒壓洗髮，依據個人頭型骨骼比例，雕琢最細緻俐落的極致線條感。',
    image: cutService,
    tags: ['精緻剪髮', '造型剪髮', '男士/女士適用']
  },
  {
    id: 'mens_perm',
    name: '男士/女士潮流設計燙髮 (羊毛捲/前刺/縮毛矯正系列)',
    category: 'perm',
    price: 1500,
    duration: 120,
    description: '支援羊毛捲、縮毛矯正、溫塑捲、小紅書熱門、韓日陸系列、前刺、火焰前刺等精緻燙髮項目。量身控制蓬鬆度與支撐力，解決扁塌、難撫平、難塑形問題。',
    image: permService,
    tags: ['設計燙髮', '縮毛矯正', '1500元起']
  },
  {
    id: 'hair_color',
    name: '大師級藝境防禦染髮 (挑染/潮流彩染)',
    category: 'color',
    price: 1500,
    duration: 120,
    description: '提供客製設計級挑染、時尚潮流染髮以及純粹霧感等多元色系。使用低氨高保濕名品溫和染劑，保護髮絲健康。',
    image: colorService,
    tags: ['霧感色系', '挑染/潮流染', '1500元起']
  },
  {
    id: 'hair_wash',
    name: '舒壓深層洗髮與造型吹整',
    category: 'treatment',
    price: 350,
    duration: 30,
    description: '使用清爽草本洗髮及頭皮輕撫按摩，深層洗淨角質與毛囊髒污，並由 Endy 設計師為您進行專業的精緻吹風與手撥定型吹整。',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800&h=600',
    tags: ['精細洗髮', '吹風造型', '350元起']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    clientName: '林*豪',
    designerId: 'endy',
    serviceName: '男士/女士剪髮+洗髮',
    rating: 5,
    text: '極度推薦 1 號 Endy 設計師！剪髮非常細密，我的兩側容易硬梆梆翹起來，Endy 剪好後超順完全不用特別整理，林口三井附近最厲害的！',
    date: '2026-06-10'
  },
  {
    id: '2',
    clientName: '徐*凱',
    designerId: 'endy',
    serviceName: '男士/女士潮流設計燙髮 (前刺捲)',
    rating: 5,
    text: '以前去別家燙前刺都垮掉，這次指定 Endy 燙火焰前刺，頭頂蓬鬆度非常有型，出門只需要吹乾抹上一點髮蠟，同事都誇很精神！',
    date: '2026-06-12'
  },
  {
    id: '3',
    clientName: '陳*安',
    designerId: 'endy',
    serviceName: '大師級藝境防禦染髮 (霧感灰)',
    rating: 5,
    text: '幫我做的霧色潮流挑染非常顯白，過程完全沒有一般藥水刺鼻味道，Endy 還仔細叮嚀如何洗護。LINE 回覆預約也很迅速！',
    date: '2026-06-13'
  }
];
