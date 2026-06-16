import { Calendar, Clock, MapPin, Phone, Scissors, Instagram, Facebook, Compass } from 'lucide-react';

interface FooterProps {
  onScrollTo: (id: string) => void;
}

export default function Footer({ onScrollTo }: FooterProps) {
  return (
    <footer id="footer" className="bg-artistic-dark text-white/70 border-t border-artistic-accent/35 pt-20 pb-10 text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 border border-artistic-accent/30 text-artistic-accent">
                <Scissors className="w-4 h-4 rotate-45" />
              </div>
              <span className="font-serif text-lg tracking-[0.15em] text-white">
                SCREEN <span className="text-artistic-accent font-light">Hair</span>
              </span>
            </div>
            
            <p className="text-white/60 leading-relaxed font-light font-sans text-[11px]">
              SCREEN HAIR SALON 林口店完美融合日韓美流精髓與高階美學工藝。我們與 1 號設計師 Endy 和 Migo 一同，致力於在一對一的極致奢雅沙龍體驗中，為您量身定制前所未見的完美秀髮表情。
            </p>

            <div className="flex space-x-2.5 pt-2">
              <a href="#instagram" className="p-2 border border-white/10 text-white/50 hover:text-artistic-accent hover:border-artistic-accent transition rounded-none">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="#facebook" className="p-2 border border-white/10 text-white/50 hover:text-artistic-accent hover:border-artistic-accent transition rounded-none">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Services Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-light tracking-[0.15em] text-xs uppercase border-b border-white/5 pb-2">
              主要服務項目 / Services
            </h4>
            
            <ul className="space-y-2.5 text-[11px] text-white/60">
              <li>
                <button onClick={() => onScrollTo('services')} className="hover:text-artistic-accent transition cursor-pointer text-left">
                  韓式微整潮剪 (含深層洗髮與吹整)
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('services')} className="hover:text-artistic-accent transition cursor-pointer text-left">
                  設計熱塑微捲燙 (氣墊燙/木馬燙)
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('services')} className="hover:text-artistic-accent transition cursor-pointer text-left">
                  命定藝境調色染髮 (大師調配款)
                </button>
              </li>
              <li>
                <button onClick={() => onScrollTo('services')} className="hover:text-artistic-accent transition cursor-pointer text-left">
                  黑曜光感極致結構式深層護髮
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Designers Availability */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-light tracking-[0.15em] text-xs uppercase border-b border-white/5 pb-2">
              指定藝術大師 / Stylists
            </h4>
            
            <div className="space-y-3.5 text-[11px]">
              <div className="text-left">
                <p className="font-semibold text-white">1 號 Endy 創意視覺總監 / 韓剪大師</p>
                <span className="text-[10px] text-artistic-accent tracking-widest font-sans uppercase">逢星期一、四固定公休 (LINE: end0708)</span>
              </div>

              <div className="text-left">
                <p className="font-semibold text-white">Migo 極致色彩大師 / 質感燙髮</p>
                <span className="text-[10px] text-artistic-accent tracking-widest font-sans uppercase">逢星期一、四固定公休</span>
              </div>
            </div>
          </div>

          {/* Col 4: Shop Address & Transit */}
          <div className="space-y-4">
            <h4 className="text-white font-serif font-light tracking-[0.15em] text-xs uppercase border-b border-white/5 pb-2">
              交通與聯絡指引 / Guide
            </h4>

            <div className="space-y-3 text-[11px] text-white/60">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-artistic-accent flex-shrink-0" />
                <span className="font-mono text-white">02-2609-6336 / 0987-590708</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-artistic-accent flex-shrink-0 mt-0.5" />
                <span className="leading-snug">新北市林口區文化二路一段156號2樓</span>
              </div>
              <div className="flex items-start space-x-2">
                <Compass className="w-3.5 h-3.5 text-artistic-accent flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  林口 A9 站附近，林口三井 OUTLET 對面商業圈。交通極其便捷。
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Brand Credits */}
        <div className="pt-8 border-t border-white/5 text-center flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-white/40">
          <p>© 2026 SCREEN HAIR SALON. All rights reserved. 林口頂級日韓美學沙龍殿堂.</p>
          
          <div className="flex space-x-6">
            <a href="#privacy" className="hover:text-artistic-accent transition">隱私政策 / Privacy</a>
            <a href="#terms" className="hover:text-artistic-accent transition">服務條款 / Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
