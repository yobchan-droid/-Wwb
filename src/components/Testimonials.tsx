import React, { useState, useEffect } from 'react';
import { TESTIMONIALS } from '../data';
import { Testimonial } from '../types';
import { Star, MessageSquarePlus, Smile, User, ThumbsUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Testimonials() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [clientName, setClientName] = useState('');
  const [selectedDesigner, setSelectedDesigner] = useState('endy');
  const [serviceName, setServiceName] = useState('韓式骨骼修飾剪裁');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  // Load reviews on Mount
  useEffect(() => {
    const stored = localStorage.getItem('aura_testimonials');
    if (stored) {
      try {
        setReviews(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored testimonials', e);
      }
    } else {
      setReviews(TESTIMONIALS);
    }
  }, []);

  const saveReviews = (newReviews: Testimonial[]) => {
    setReviews(newReviews);
    localStorage.setItem('aura_testimonials', JSON.stringify(newReviews));
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !reviewText) {
      alert('請填寫姓名與評論內文。');
      return;
    }

    const newReview: Testimonial = {
      id: `REV-${Date.now()}`,
      clientName: clientName.charAt(0) + '*' + (clientName.length > 2 ? clientName.charAt(clientName.length - 1) : ''),
      designerId: selectedDesigner,
      serviceName,
      rating,
      text: reviewText,
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newReview, ...reviews];
    saveReviews(updated);
    
    // Clear and hide Form
    setClientName('');
    setReviewText('');
    setRating(5);
    setShowAddReview(false);
  };

  return (
    <section id="testimonials" className="py-24 bg-artistic-bg border-t border-b border-artistic-dark/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-[10px] font-sans font-bold tracking-[0.2em] text-artistic-accent border border-artistic-accent/20 px-4 py-1.5 rounded-none uppercase">
            Testimonials / 五星真摯口碑
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-artistic-dark tracking-tight">
            顧客真實好評回饋
          </h2>
          <div className="h-[1px] w-20 bg-artistic-accent mx-auto" />
          <p className="text-artistic-dark/75 font-sans font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            每一次的剪裁都有手心溫度，每一款調色都有獨特靈魂。我們用心聆聽每位來訪者的期待，用紮實的精準美學底蘊為您刻畫美麗。歡迎在此發表您在 SCREEN HAIR SALON 的滿意心得！
          </p>
        </div>

        {/* Reviews Summary Stats & Trigger Button */}
        <div className="max-w-5xl mx-auto mb-12 bg-white border border-artistic-dark/15 p-6 rounded-none flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center space-x-6 text-left">
            <div>
              <span className="text-4xl font-serif font-bold text-artistic-dark">4.9</span>
              <span className="text-[10px] text-artistic-dark/40 uppercase font-sans block tracking-wider mt-0.5">Applet Rating / 綜合評鑑</span>
            </div>
            
            <div className="h-12 w-px bg-artistic-dark/10 hidden md:block" />

            <div className="space-y-1">
              {/* Star line */}
              <div className="flex text-artistic-accent">
                <Star className="w-4 h-4 fill-artistic-accent" />
                <Star className="w-4 h-4 fill-artistic-accent" />
                <Star className="w-4 h-4 fill-artistic-accent" />
                <Star className="w-4 h-4 fill-artistic-accent" />
                <Star className="w-4 h-4 fill-artistic-accent" />
              </div>
              <p className="text-xs text-artistic-dark/85 font-sans">
                累積 <strong>{reviews.length + 120}</strong> 位台北時尚貴賓親身有感推薦
              </p>
            </div>
          </div>

          <button
            id="toggle-add-review-btn"
            onClick={() => setShowAddReview(!showAddReview)}
            className="flex items-center space-x-2 px-5 py-3 text-xs tracking-widest uppercase font-sans font-bold text-white bg-artistic-dark hover:bg-neutral-800 rounded-none transition duration-300 shadow-md cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4 text-white" />
            <span>{showAddReview ? '關閉填寫欄位 / CLOSE FORM' : '撰寫美髮好評 / WRITE REVIEW'}</span>
          </button>
        </div>

        {/* Collapsible Add Review Form */}
        <AnimatePresence>
          {showAddReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-xl mx-auto overflow-hidden mb-12 bg-white p-6 rounded-none border border-artistic-dark/10 shadow-sm"
            >
              <form onSubmit={handleAddReviewSubmit} className="space-y-4 text-left">
                <h3 className="text-sm font-serif italic text-artistic-dark tracking-widest uppercase flex items-center space-x-2 border-b border-artistic-dark/5 pb-2">
                  <Smile className="w-4 h-4 text-artistic-accent" />
                  <span>分享您在 SCREEN HAIR 的專屬體驗</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-artistic-dark/75">您的暱稱 / 姓名</label>
                    <input
                      id="review-client-name"
                      type="text"
                      placeholder="例：陳小姐"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none px-3 py-2 text-xs focus:border-artistic-accent focus:outline-none transition animate-none"
                      required
                    />
                  </div>

                  {/* Designer Select */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-artistic-dark/75">指定設計師</label>
                    <select
                      id="review-designer-select"
                      value={selectedDesigner}
                      onChange={(e) => setSelectedDesigner(e.target.value)}
                      className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none px-3 py-2 text-xs focus:border-artistic-accent focus:outline-none transition"
                    >
                      <option value="endy">Endy 創意總監 / 精緻剪燙染</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Service Text input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-artistic-dark/75">所體驗服務項目</label>
                    <input
                      id="review-service-name"
                      type="text"
                      placeholder="例：韓式極致剪髮 + 鎖水燙"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none px-3 py-2 text-xs focus:border-artistic-accent focus:outline-none transition animate-none"
                      required
                    />
                  </div>

                  {/* Rating Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-artistic-dark/75">給予評分 (星級)</label>
                    <div className="flex items-center space-x-1 border border-artistic-dark/10 bg-artistic-bg p-1 px-2.5 max-w-fit">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-artistic-accent hover:scale-110 transition p-1 cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= rating ? 'fill-artistic-accent text-artistic-accent' : 'text-artistic-dark/20'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-artistic-dark/75">撰寫評論內容 *</label>
                  <textarea
                    id="review-content"
                    placeholder="請分享您對設計師專業裁剪藝術度、店內法式茶品、藥水零刺鼻度與好感體驗成果..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none px-3 py-2 text-xs focus:border-artistic-accent focus:outline-none transition resize-none"
                    required
                  />
                </div>

                <button
                  id="submit-review-btn"
                  type="submit"
                  className="w-full py-2.5 bg-artistic-dark hover:bg-neutral-800 text-white font-sans font-bold text-xs uppercase tracking-widest rounded-none transition sm:w-auto sm:px-6 cursor-pointer"
                >
                  發表好評回饋 / POST COMMENT
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Testimonials Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left">
          {reviews.map((rev, index) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white border border-artistic-dark/10 p-6 rounded-none relative flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div className="space-y-3.5">
                {/* Rating headers */}
                <div className="flex items-center justify-between border-b border-artistic-dark/5 pb-2.5">
                  <div className="flex space-x-1 text-artistic-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-artistic-accent text-artistic-accent' : 'text-artistic-dark/10'}`}
                      />
                    ))}
                  </div>
                  
                  <span className="text-[10px] font-sans text-artistic-dark/45 flex items-center tracking-wide">
                    <Calendar className="w-3 h-3 text-artistic-accent/60 mr-1" />
                    {rev.date}
                  </span>
                </div>

                <p className="text-artistic-dark/80 text-xs sm:text-sm font-light leading-relaxed font-sans italic">
                  「{rev.text}」
                </p>
              </div>

              {/* Bottom Client credentials */}
              <div className="flex justify-between items-center bg-artistic-bg/50 p-3 rounded-none border border-artistic-dark/5 pt-2.5 mt-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white border border-artistic-dark/15 text-artistic-accent">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-serif font-semibold text-artistic-dark">{rev.clientName}</h5>
                    <p className="text-[9px] text-artistic-dark/50 font-sans mt-0.5">預約貴賓</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] bg-white text-artistic-dark font-sans font-medium px-2 py-0.5 rounded-none border border-artistic-dark/10">
                    設計師: {rev.designerId === 'endy' ? 'Endy' : 'Endy'}
                  </span>
                  <p className="text-[9px] text-artistic-dark/50 mt-1 truncate max-w-[150px] font-sans">
                    {rev.serviceName}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
