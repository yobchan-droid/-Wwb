import { useState } from 'react';
import { SERVICES } from '../data';
import { Service } from '../types';
import { CircleDollarSign, Clock, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ServicesProps {
  onSelectService: (serviceId: string) => void;
}

export default function Services({ onSelectService }: ServicesProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: '所有項目 / All' },
    { value: 'cut', label: '精緻剪洗 / Cut' },
    { value: 'perm', label: '潮流燙髮 / Perm' },
    { value: 'color', label: '大師染髮 / Color' },
    { value: 'treatment', label: '舒壓深層洗 / Wash' },
  ];

  const filteredServices = activeCategory === 'all'
    ? SERVICES
    : SERVICES.filter(service => service.category === activeCategory);

  return (
    <section id="services" className="py-24 bg-artistic-bg/60 border-t border-b border-artistic-dark/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-[10px] font-sans font-bold tracking-[0.2em] text-artistic-accent border border-artistic-accent/20 px-4 py-1.5 rounded-none uppercase">
            Services Menu / 奢華服務項目
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-artistic-dark tracking-tight">
            洗剪燙染 · 專屬高奢美髮提案
          </h2>
          <div className="h-[1px] w-20 bg-artistic-accent mx-auto" />
          <p className="text-artistic-dark/75 font-sans font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            我們拒絕千篇一律的工業複製。所有服務均依據您的髮質狀態、頭蓋骨結構與膚色基調客製剪裁，並選用國際高端沙龍指定品牌藥劑，保護髮質韌度活性之時展演高奢藝術魅力。
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-12">
          <div className="flex items-center text-[10px] font-sans font-bold tracking-widest text-artistic-dark/40 mr-2 uppercase">
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            分類篩選 / Filter:
          </div>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-none text-xs font-sans tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeCategory === cat.value
                  ? 'bg-artistic-dark text-white font-bold border border-transparent shadow-xs'
                  : 'bg-white text-artistic-dark/70 hover:text-artistic-dark border border-artistic-dark/10 hover:border-artistic-dark/30'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Services Showcase Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service: Service) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                key={service.id}
                className="bg-white border border-artistic-dark/10 hover:border-artistic-accent/40 rounded-none overflow-hidden shadow-xs flex flex-col md:flex-row group transition-all duration-350"
              >
                {/* Hairstyle Photo Showcase */}
                <div className="md:w-5/12 relative overflow-hidden h-64 md:h-auto min-h-[240px]">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Aspect label */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 border border-artistic-dark/10 rounded-none shadow-xs">
                    <span className="text-[9px] font-sans font-bold text-artistic-dark tracking-widest uppercase">
                      {service.category === 'cut' ? '剪洗 / CUT' : service.category === 'perm' ? '燙髮 / PERM' : service.category === 'color' ? '染髮 / COLOR' : '洗整 / WASH'}
                    </span>
                  </div>
                </div>

                {/* Details Content */}
                <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.map((tag, idx) => (
                        <span key={idx} className="text-[9px] bg-artistic-bg border border-artistic-dark/5 px-2 py-0.5 rounded-none text-artistic-dark/55 font-sans">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-lg font-serif font-semibold text-artistic-dark group-hover:text-artistic-accent transition-colors">
                      {service.name}
                    </h3>

                    <p className="text-artistic-dark/70 text-xs leading-relaxed font-sans line-clamp-3">
                      {service.description}
                    </p>
                  </div>

                  {/* Pricing and Action Row */}
                  <div className="pt-4 border-t border-artistic-dark/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Price */}
                      <div className="flex items-center text-artistic-accent">
                        <CircleDollarSign className="w-3.5 h-3.5 mr-1" />
                        <span className="text-lg font-serif font-bold">NT${service.price.toLocaleString()}</span>
                        <span className="text-[10px] text-artistic-dark/50 ml-0.5 font-sans mt-1">起</span>
                      </div>
                      
                      {/* Duration */}
                      <div className="flex items-center text-artistic-dark/60 text-[10px] font-sans tracking-wider">
                        <Clock className="w-3.5 h-3.5 mr-1 text-artistic-accent/70" />
                        <span>約 {service.duration} 分鐘</span>
                      </div>
                    </div>

                    {/* Choose to Book Button */}
                    <button
                      id={`select-${service.id}`}
                      onClick={() => onSelectService(service.id)}
                      className="px-4 py-2.5 bg-artistic-dark hover:bg-neutral-800 text-white font-sans font-bold text-[10px] tracking-widest uppercase rounded-none border border-transparent hover:border-artistic-accent/30 transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>指定此項目預約</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
