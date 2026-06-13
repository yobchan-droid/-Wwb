import { DESIGNERS } from '../data';
import { Designer } from '../types';
import { CalendarRange, Award, CheckCircle2, Star, ThumbsUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface DesignersProps {
  onSelectDesigner: (designerId: string) => void;
}

export default function Designers({ onSelectDesigner }: DesignersProps) {
  // Convert weekday number to localized text (1 = 一, 7 = 日)
  const getWeekdayString = (num: number) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return days[num % 7];
  };

  // Convert array of active workdays to simple text listing days off
  const getDaysOffString = (workDays: number[]) => {
    const allDays = [1, 2, 3, 4, 5, 6, 7];
    const offDays = allDays.filter(day => !workDays.includes(day));
    if (offDays.length === 0) return '全年無休';
    return `每週（${offDays.map(d => getWeekdayString(d)).join('、')}）固定公休`;
  };

  return (
    <section id="designers" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-[10px] font-sans font-bold tracking-[0.2em] text-artistic-accent border border-artistic-accent/20 px-4 py-1.5 rounded-none uppercase">
            Artist Team / 頂尖大師陣容
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-artistic-dark tracking-tight">
            遇見您的專屬美髮藝術剪裁師
          </h2>
          <div className="h-[1px] w-20 bg-artistic-accent mx-auto" />
          <p className="text-artistic-dark/75 font-sans font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto pb-2">
            我們擁有些獨自專精、具靈魂深度的美髮藝術大師。無論是追求精準骨骼修飾的高質感韓式潮剪，或是渴望尋找屬於您的特調命定髮色，Endy 與 Migo 都會認真聆聽您的造型渴望。
          </p>
        </div>

        {/* Designers Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {DESIGNERS.map((designer: Designer, idx: number) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              key={designer.id}
              className="bg-artistic-bg/30 border border-artistic-dark/10 hover:border-artistic-accent/30 rounded-none p-6 sm:p-8 flex flex-col sm:flex-row gap-8 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-artistic-accent/5 rounded-full blur-xl group-hover:bg-artistic-accent/10 transition-all" />
              
              {/* Designer Avatar Portrait */}
              <div className="w-full sm:w-5/12 flex-shrink-0 flex flex-col items-center">
                <div className="relative aspect-square w-48 sm:w-full max-w-[220px] rounded-none overflow-hidden border border-artistic-dark/10 shadow-xs">
                  <img
                    src={designer.avatar}
                    alt={designer.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 border border-artistic-dark/10 rounded-none flex items-center space-x-1">
                    <Star className="w-3 h-3 text-artistic-accent fill-artistic-accent" />
                    <span className="text-xs font-sans font-bold text-artistic-dark">{designer.rating}</span>
                  </div>
                </div>

                {/* Performance stats below photo */}
                <div className="mt-4 flex items-center justify-between space-x-4 text-xs font-sans tracking-wide border-t border-artistic-dark/10 pt-3 w-full max-w-[220px]">
                  <span className="text-artistic-dark/60 flex items-center">
                    <ThumbsUp className="w-3.5 h-3.5 text-artistic-accent mr-1" />
                    好評率 99%
                  </span>
                  <span className="text-artistic-dark/50 font-sans">
                    {designer.reviewCount}+ 次預約
                  </span>
                </div>
              </div>

              {/* Designer Details Bio */}
              <div className="w-full sm:w-7/12 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-serif font-normal text-artistic-dark group-hover:text-artistic-accent transition-colors">
                      {designer.name}
                    </h3>
                    <p className="text-[10px] font-sans text-artistic-accent tracking-widest uppercase font-bold mt-1.5">
                      {designer.title}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-artistic-dark/75 font-sans">
                    {designer.bio}
                  </p>

                  {/* Certification / Award Row */}
                  <div className="flex items-center space-x-2 text-[11px] text-artistic-dark/80 bg-white p-2.5 rounded-none border border-artistic-dark/5 font-sans">
                    <Award className="w-4 h-4 text-artistic-accent flex-shrink-0" />
                    <span className="line-clamp-1">{designer.experience}</span>
                  </div>

                  {/* Specialties List */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-sans font-bold tracking-widest text-artistic-dark/40 uppercase">Specialties / 專精領域</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {designer.specialties.map((spec, sIdx) => (
                        <span key={sIdx} className="text-[11px] font-sans font-medium bg-artistic-accent/5 text-artistic-accent border border-artistic-accent/15 px-2.5 py-0.5 rounded-none">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Work Schedule List */}
                  <div className="pt-2 border-t border-artistic-dark/10">
                    <div className="flex items-center space-x-2 text-xs text-artistic-dark/60">
                      <CalendarRange className="w-3.5 h-3.5 text-artistic-accent flex-shrink-0" />
                      <span className="font-semibold text-rose-600/90">{getDaysOffString(designer.workDays)}</span>
                    </div>
                  </div>
                </div>

                {/* CTA Booking Lock */}
                <button
                  id={`book-designer-${designer.id}`}
                  onClick={() => onSelectDesigner(designer.id)}
                  className="w-full py-3 bg-artistic-dark hover:bg-neutral-800 text-white font-sans font-bold text-xs tracking-widest uppercase rounded-none border border-transparent hover:border-artistic-accent/30 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>指定 {designer.name} 設計師預約</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
