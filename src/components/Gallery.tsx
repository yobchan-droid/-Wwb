import React, { useState } from 'react';
import { ZoomIn, Camera, Heart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryItem {
  id: string;
  title: string;
  designer: string;
  serviceType: string;
  image: string;
  likes: number;
}

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'cut' | 'perm' | 'color'>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [likedItems, setLikedItems] = useState<string[]>([]);

  const GALLERY_ITEMS: GalleryItem[] = [
    {
      id: 'gallery-1',
      title: '韓系流線鮑伯剪裁',
      designer: 'Endy',
      serviceType: 'cut',
      image: '/src/assets/images/service_korean_cut_1781318500488.jpg',
      likes: 124
    },
    {
      id: 'gallery-2',
      title: '柔霧雲朵燙髮',
      designer: 'Endy',
      serviceType: 'perm',
      image: '/src/assets/images/service_perm_1781318514087.jpg',
      likes: 198
    },
    {
      id: 'gallery-3',
      title: '迷霧灰銀手刷漸層染',
      designer: 'Endy',
      serviceType: 'color',
      image: '/src/assets/images/service_color_1781318529528.jpg',
      likes: 247
    },
    {
      id: 'gallery-4',
      title: '立體羽毛層次剪裁',
      designer: 'Endy',
      serviceType: 'cut',
      image: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=800&h=1000',
      likes: 89
    },
    {
      id: 'gallery-5',
      title: '韓式木馬捲氣墊燙',
      designer: 'Endy',
      serviceType: 'perm',
      image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800&h=1000',
      likes: 165
    },
    {
      id: 'gallery-6',
      title: '典雅茶褐極光單色染',
      designer: 'Endy',
      serviceType: 'color',
      image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&q=80&w=800&h=1000',
      likes: 142
    }
  ];

  const filteredItems = activeFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.serviceType === activeFilter);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening light-box
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter(item => item !== id));
    } else {
      setLikedItems([...likedItems, id]);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-artistic-bg/30 border-t border-b border-artistic-dark/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-[10px] font-sans font-bold tracking-[0.2em] text-artistic-accent border border-artistic-accent/20 px-4 py-1.5 rounded-none uppercase">
            Style Lookbook / 藝境成品型錄
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-artistic-dark tracking-tight">
            高質感客照實拍型錄
          </h2>
          <div className="h-[1px] w-20 bg-artistic-accent mx-auto" />
          <p className="text-artistic-dark/75 font-sans font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            日常可好整理、持久富含動人層次。以下作品皆為 1 號 Endy 操刀之實錄男性理髮、男士燙髮、與潮流彩染。點擊圖片可放大欣賞細節，尋找最適合您的完美造型提案。
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex justify-center space-x-3 mb-12 overflow-x-auto pb-4 scrollbar-thin">
          {[
            { value: 'all', label: '全部作品 / All' },
            { value: 'cut', label: '主要潮剪 / Cut' },
            { value: 'perm', label: '水亮燙髮 / Perm' },
            { value: 'color', label: '藝術彩染 / Color' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value as any)}
              className={`px-4 py-2 text-xs font-sans tracking-widest uppercase rounded-none border transition-all cursor-pointer flex-shrink-0 ${
                activeFilter === tab.value
                  ? 'bg-artistic-dark border-transparent text-white font-bold'
                  : 'border-artistic-dark/10 bg-white text-artistic-dark/65 hover:text-artistic-dark hover:border-artistic-dark/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const isLiked = likedItems.includes(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelectedImage(item)}
                  className="group bg-white border border-artistic-dark/10 rounded-none overflow-hidden shadow-xs aspect-[3/4] relative cursor-pointer"
                >
                  {/* Photo content */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Dark Vignette Hover Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-artistic-dark via-artistic-dark/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Top Header Labels */}
                  <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] font-sans tracking-widest uppercase font-bold text-white bg-artistic-accent px-2.5 py-1 rounded-none">
                      {item.serviceType === 'cut' ? '剪髮 / CUT' : item.serviceType === 'perm' ? '燙髮 / PERM' : '染髮 / COLOR'}
                    </span>
                    <span className="text-[9px] bg-white/95 text-artistic-dark font-sans px-2.5 py-1 rounded-none border border-artistic-dark/10">
                      主推: {item.designer}
                    </span>
                  </div>

                  {/* Hover icon details */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-3.5 bg-white border border-artistic-dark/10 rounded-full text-artistic-accent shadow-md">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Foot Description Info panel */}
                  <div className="absolute bottom-4 inset-x-4 flex items-end justify-between">
                    <div className="text-left">
                      <h4 className="text-sm font-serif font-semibold text-white tracking-wide">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-stone-200 font-sans mt-0.5">
                        主要負責 / {item.designer}
                      </p>
                    </div>

                    {/* Like button (interactive) */}
                    <button
                      onClick={(e) => handleLike(item.id, e)}
                      key={item.id}
                      className={`flex items-center space-x-1 p-2 rounded-none backdrop-blur-md border transition cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                          : 'bg-white/90 border-artistic-dark/10 text-artistic-dark hover:text-artistic-accent'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span className="text-xs font-mono font-bold">
                        {item.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Lightbox Overlay modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 bg-artistic-dark/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()} // prevent dismiss
                className="max-w-md w-full bg-white border border-artistic-dark/15 rounded-none overflow-hidden shadow-xl relative"
              >
                {/* Back button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-white text-artistic-dark hover:text-artistic-accent rounded-full border border-artistic-dark/10 cursor-pointer"
                >
                  ✕
                </button>

                <div className="aspect-[3/4]">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-sans tracking-widest uppercase text-artistic-accent">
                        {selectedImage.serviceType === 'cut' ? '韓式潮剪' : selectedImage.serviceType === 'perm' ? '專業燙髮' : '藝術染髮'}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-artistic-dark mt-1">
                        {selectedImage.title}
                      </h3>
                    </div>
                    
                    <div className="px-3 py-1 bg-artistic-bg rounded-none border border-artistic-dark/10">
                      <span className="text-xs font-bold text-artistic-dark">設計師: {selectedImage.designer}</span>
                    </div>
                  </div>

                  <p className="text-xs text-artistic-dark/75 font-sans leading-relaxed">
                    在 SCREEN HAIR SALON 進行的專人量身打造剪燙染。使用健康的、維護髮絲水分健康的藥劑，呈現出動人的蓬鬆空氣感與優雅色澤。我們承諾每一幀寫真均為顧客實拍，毫無虛假修圖。
                  </p>

                  <div className="flex justify-between items-center bg-artistic-bg p-3 border border-artistic-dark/10 rounded-none">
                    <span className="text-[10px] text-artistic-dark/50 font-sans flex items-center">
                      <Camera className="w-3.5 h-3.5 mr-1 text-artistic-accent" />
                      SONY α7 IV · Studio Setup
                    </span>
                    <button
                      onClick={(e) => handleLike(selectedImage.id, e)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 border transition cursor-pointer text-xs rounded-none ${
                        likedItems.includes(selectedImage.id)
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                          : 'bg-artistic-dark text-white hover:bg-neutral-800'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${likedItems.includes(selectedImage.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>收藏本件作品</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
