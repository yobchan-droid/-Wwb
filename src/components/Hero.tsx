import { Calendar, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onScrollTo: (id: string) => void;
}

export default function Hero({ onScrollTo }: HeroProps) {
  // Check if open now (11:00 - 19:00)
  const isCurrentlyOpen = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 11 && hours < 19;
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-artistic-bg pt-24 pb-16 lg:pb-24 overflow-hidden">
      {/* Background Image with Elegant Artistic Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/src/assets/images/salon_hero_1781318443099.jpg"
          alt="SCREEN Hair Salon luxury interior"
          className="w-full h-full object-cover object-center filter grayscale brightness-110 opacity-15"
          referrerPolicy="no-referrer"
        />
        {/* Subtle color wash that matches the cream theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-artistic-bg/50 via-artistic-bg/80 to-artistic-bg" />
      </div>

      {/* Decorative Line Ornaments reflecting Artistic Flair */}
      <div className="absolute top-1/4 right-0 w-1/3 h-[1px] bg-artistic-accent/20 hidden lg:block" />
      <div className="absolute bottom-1/4 left-0 w-1/4 h-[1px] bg-artistic-accent/20 hidden lg:block" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Status indicator - editorial pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2.5 px-4 py-1.5 bg-white border border-artistic-dark/10 rounded-none shadow-xs"
            >
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isCurrentlyOpen() ? 'bg-emerald-400' : 'bg-artistic-accent'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isCurrentlyOpen() ? 'bg-emerald-500' : 'bg-artistic-accent'}`}></span>
              </span>
              <span className="text-[10px] font-sans font-bold text-artistic-dark/75 tracking-[0.15em] uppercase">
                {isCurrentlyOpen() ? '現正營業 / Open Now (11:00 - 19:00)' : '公休或非營業 / Off-hours'}
              </span>
            </motion.div>

            {/* Captivating Headers */}
            <div className="space-y-4">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="text-artistic-accent font-serif text-sm sm:text-base font-semibold tracking-widest uppercase italic"
              >
                — SCREEN HAIR SALON / 林口頂級工藝沙龍
              </motion.p>
              
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-artistic-dark leading-[1.125] tracking-tight"
              >
                重塑沙龍美學<br />
                <span className="font-serif italic text-artistic-accent">
                  定義您的獨特秀髮表情
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-artistic-dark/80 text-sm sm:text-base max-w-2xl font-light leading-relaxed font-sans"
              >
                由斯古林 1 號主辦設計師 <span className="text-artistic-dark font-semibold border-b border-artistic-accent/30 hover:border-artistic-accent transition-colors">Endy</span> 執掌，主打客製化男士燙髮（羊毛捲、小紅書爆款、日韓系列、前刺、火焰前刺等）、潮流防禦染髮（設計師挑染、霧感色彩）、男士造型精緻剪洗與舒壓洗護。將每一次修整細細雕琢，喚醒您的魅力。
              </motion.p>
            </div>

            {/* Core CTA Actions */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                id="hero-cta-booking"
                onClick={() => onScrollTo('booking')}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-artistic-dark hover:bg-neutral-800 text-white font-sans font-bold rounded-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer text-xs tracking-[0.2em] uppercase"
              >
                <Calendar className="w-4 h-4" />
                <span>立即指定預約 / BOOK NOW</span>
              </button>
              
              <button
                id="hero-cta-services"
                onClick={() => onScrollTo('services')}
                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white hover:bg-artistic-bg text-artistic-dark font-sans font-bold rounded-none border border-artistic-dark/15 hover:border-artistic-dark transition-all duration-300 cursor-pointer text-xs tracking-[0.2em]"
              >
                <span>探索精緻服務 / SERVICES</span>
              </button>
            </motion.div>

            {/* USP Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2 border-t border-artistic-dark/10 max-w-lg"
            >
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-artistic-accent flex-shrink-0" />
                <span className="text-xs font-medium text-artistic-dark/70 font-sans">日本/歐美沙龍名品藥劑</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-artistic-accent flex-shrink-0" />
                <span className="text-xs font-medium text-artistic-dark/70 font-sans">全程一對一專責服務</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-artistic-accent flex-shrink-0" />
                <span className="text-xs font-medium text-artistic-dark/70 font-sans">客製化膚色/骨骼剪裁</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Info Box Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-12 xl:col-span-5 h-full flex flex-col justify-center mt-6 lg:mt-0"
          >
            <div className="bg-white border border-artistic-dark/10 rounded-none p-8 space-y-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-artistic-accent" />
              <h3 className="text-lg font-serif italic font-semibold text-artistic-dark tracking-wide border-b border-artistic-dark/10 pb-4">
                沙龍資訊與服務指引 / Salon Info
              </h3>

              <div className="space-y-5">
                {/* Hours */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-artistic-bg text-artistic-accent rounded-none">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-sans font-bold tracking-[0.18em] text-artistic-dark/50 uppercase">Operating Hours</h4>
                    <p className="text-sm font-semibold text-artistic-dark mt-1">每日 AM 11:00 – PM 07:00</p>
                    <p className="text-xs text-artistic-dark/60 mt-0.5">預約保留 15 分鐘，每週一、四設計師固定公休</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-artistic-bg text-artistic-accent rounded-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-sans font-bold tracking-[0.18em] text-artistic-dark/50 uppercase">Location Address</h4>
                    <p className="text-sm font-semibold text-artistic-dark mt-1">新北市林口區文化二路一段156號2樓</p>
                    <p className="text-xs text-artistic-dark/60 mt-0.5">林口 A9 站步行，林口三井 OUTLET 對面特區</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-artistic-bg text-artistic-accent rounded-none">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-sans font-bold tracking-[0.18em] text-artistic-dark/50 uppercase">Consultation Line</h4>
                    <p className="text-sm font-semibold text-artistic-dark mt-1">02-26096336 / 0987-590708</p>
                    <p className="text-xs text-artistic-dark/60 mt-0.5">預約與造型諮詢，歡迎直撥專線或加 LINE: end0708</p>
                  </div>
                </div>
              </div>

              {/* Minimal Review Score Summary */}
              <div className="bg-artistic-bg/50 p-4 border border-artistic-dark/5 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-serif font-bold text-artistic-dark">4.9</span>
                  <span className="text-artistic-accent text-sm ml-1.5">★★★★★</span>
                </div>
                <span className="text-xs text-artistic-dark/70 font-sans tracking-wide">
                  260+ 位顧客五星真實滿意回饋
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
