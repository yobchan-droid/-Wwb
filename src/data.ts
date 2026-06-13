import { Designer, Service, Testimonial } from './types';

export const DESIGNERS: Designer[] = [
  {
    id: 'endy',
    name: 'Endy',
    title: '1 號 創意視覺總監 / 韓系風格大師 (LINE: end0708)',
    avatar: '/src/assets/images/designer_endy_1781318458395.jpg',
    bio: '身為 1 號主辦設計師，擁有 8 年以上豐富美髮資歷，曾赴首爾江南區頂級沙龍深造研習。Endy 擅長將亞洲人的臉型輪廓與最新韓國潮流完美結合，以流暢精準的剪裁技術打造極具線條感與蓬鬆空氣感的髮型。不論是極致乾淨的韓式潮剪，還是隨手一撥就好看的自然空氣燙，都能為您塑造個人專屬的高級氣場。',
    specialties: ['韓式潮剪', '空氣燙髮', '男士漸層推剪', '結構修剪'],
    experience: '8 年資歷 / 韓國江南沙龍研習認證 (LINE: end0708)',
    rating: 4.9,
    reviewCount: 148,
    workDays: [2, 3, 5, 6, 7], // Tue, Wed, Fri, Sat, Sun (Mon, Thu off)
    availableTimes: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
  },
  {
    id: 'migo',
    name: 'Migo',
    title: '色彩美學大師 / 質感燙髮專家',
    avatar: '/src/assets/images/designer_migo_1781318475151.jpg',
    bio: '專注於色彩學與日韓流行燙髮 6 年。Migo 擁有一流的審美洞察力，擅長透過客製化的「膚色調和染髮」為顧客調配命定髮色，展現完美好氣色。她打造的縮毛矯正與氣墊木馬燙，捲度豐盈柔順，不著痕跡地修飾臉型。她親切溫柔的溝通風格，讓每位走進沙龍的客人都能在放鬆愉快的氛圍中，發掘自己最美的一面。',
    specialties: ['極致挑染 / 霧彩染髮', '縮毛矯正', '氣墊波浪燙', '日系輕盈剪髮'],
    experience: '6 年資歷 / 日本威娜色彩學大師認證',
    rating: 4.8,
    reviewCount: 112,
    workDays: [2, 3, 5, 6, 7], // Tue, Wed, Fri, Sat, Sun (Mon, Thu off)
    availableTimes: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
  }
];

export const SERVICES: Service[] = [
  {
    id: 'korean_cut',
    name: '韓式微整潮剪 (含深層洗髮與造型吹整)',
    category: 'cut',
    price: 1200,
    duration: 60,
    description: '依據個人頭型骨骼、面部輪廓黃金比例進行3D剪裁，精心處理髮絲落點與層次。結合精細去量技術，創造充滿空氣感、線條流暢且易於日常整理的時尚髮型。全程搭配有機植萃洗髮與客製化熱電棒/電捲棒精緻吹整。',
    image: '/src/assets/images/service_korean_cut_1781318500488.jpg',
    tags: ['修飾臉型', '高蓬鬆度', '附深層洗髮']
  },
  {
    id: 'premium_perm',
    name: '高質感設計熱塑燙 (氣墊燙/木馬燙/縮毛矯正)',
    category: 'perm',
    price: 3800,
    duration: 180,
    description: '引進日本頂級沙龍專用溫和低溫燙髮藥水，搭配高科技導熱系統。根據您的髮質受損程度進行分段上藥，最大程度保留秀髮內含的水分與彈力蛋白質。燙後捲度極富彈性，觸感柔順有光澤，洗完頭隨意吹乾即能呈現優雅唯美的波浪線條。',
    image: '/src/assets/images/service_perm_1781318514087.jpg',
    tags: ['燙後抗毛躁', '修補受損', '日本進口藥水']
  },
  {
    id: 'luxury_color',
    name: '藝境調色染髮設計 (高質感光感單色/局部染髮)',
    category: 'color',
    price: 3200,
    duration: 150,
    description: '專為亞洲人黃皮膚調配的顯白底色。使用低氨無刺鼻異味的歐美日名品染劑，並在染劑中額外注入保濕精華與鏈鍵修護配方。染後色澤飽滿均勻、富含光影折射底蘊，提供自然亮澤感，展現絕美氣質。',
    image: '/src/assets/images/service_color_1781318529528.jpg',
    tags: ['提亮膚色', '低氨不刺激', '光感防禦技術']
  },
  {
    id: 'intensive_treatment',
    name: '極致深層結構式護髮 (黑曜光感/角蛋白護理)',
    category: 'treatment',
    price: 1800,
    duration: 90,
    description: '針對長期燙染受損嚴重、多孔性乾枯髮質。深層灌注毛髮所需的多重氨基酸、神經醯胺與微分子水解膠原蛋白，由內而外重建斷裂鏈鍵，再以專用超音波導入夾將營養封鎖在髮芯。給予秀髮如羽毛般無重力柔順與極致絲綢光澤。',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800&h=600',
    tags: ['極速強韌', '絲滑水潤', '護色防微熱']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    clientName: '林*妤',
    designerId: 'endy',
    serviceName: '韓式微整潮剪 + 氣墊波浪燙',
    rating: 5,
    text: '第一次給 Endy 剪完頭髮真的太驚艷了！以前燙完都很容易垮掉，但 Endy 剪的線條感非常完美，燙完只要用手繞乾就好了，超好整理！店內裝潢很像美術館，推推！',
    date: '2026-05-20'
  },
  {
    id: '2',
    clientName: '張*豪',
    designerId: 'endy',
    serviceName: '韓式微整潮剪 + 漸層推剪',
    rating: 5,
    text: '找 Endy 剪髮好幾年了，技術沒話說。這次剪的韓系中分層次感很足，同事都說很有男神感（笑），細緻度拉滿。',
    date: '2026-06-02'
  },
  {
    id: '3',
    clientName: '陳*瑄',
    designerId: 'migo',
    serviceName: '藝境調色染髮設計 (仙氣霧灰棕)',
    rating: 5,
    text: 'Migo 染的色調太好看了，非常顯白！整個染髮過程完全沒有不舒服的藥水味，而且護髮完髮質比染之前還要好，身邊朋友都問我在哪裡染的，一生推的超強設計師！',
    date: '2026-06-08'
  },
  {
    id: '4',
    clientName: '李*琪',
    designerId: 'migo',
    serviceName: '高質感熱塑燙 (縮毛矯正 + 氣墊燙)',
    rating: 5,
    text: '我的自然捲超級嚴重又毛躁，幸好有 Migo 幫我做縮毛矯正搭配髮尾微捲！現在整過頭頂超級亮，髮尾又很柔軟，完全是一次重生的感覺！',
    date: '2026-06-11'
  }
];
