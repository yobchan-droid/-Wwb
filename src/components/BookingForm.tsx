import React, { useState, useEffect } from 'react';
import { DESIGNERS, SERVICES } from '../data';
import { Appointment, Designer, Service } from '../types';
import { Calendar, Clock, User, Phone, FileText, CheckCircle, Trash2, CalendarCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingFormProps {
  selectedDesignerId: string;
  selectedServiceId: string;
  setSelectedDesignerId: (id: string) => void;
  setSelectedServiceId: (id: string) => void;
}

export default function BookingForm({
  selectedDesignerId,
  selectedServiceId,
  setSelectedDesignerId,
  setSelectedServiceId,
}: BookingFormProps) {
  // Form State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  
  // Appoint State & Success Tracking
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [latestBooking, setLatestBooking] = useState<Appointment | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar View Date State
  const [calendarDate, setCalendarDate] = useState('');

  // Anonymizing Help Functions
  const anonymizeName = (name: string): string => {
    if (!name) return '貴賓';
    const n = name.trim();
    if (n.length <= 1) return n;
    if (n.length === 2) return n[0] + '*';
    return n[0] + '*'.repeat(n.length - 2) + n[n.length - 1];
  };

  const anonymizePhone = (phone: string): string => {
    if (!phone) return '';
    const p = phone.trim();
    if (p.length < 7) return p;
    return p.substring(0, 4) + '***' + p.substring(p.length - 3); // e.g. 0912***678
  };

  // Database Connection states
  const [dbStatus, setDbStatus] = useState<{ configured: boolean; provider: string; sqlSetup?: string; supabaseUrl?: string } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // Sync chosen booking form date into calendar agenda view
  useEffect(() => {
    if (selectedDate) {
      setCalendarDate(selectedDate);
    }
  }, [selectedDate]);

  // Load existing bookings on Mount
  useEffect(() => {
    // 1. Fetch DB connection status
    fetch('/api/db-status')
      .then(res => res.json())
      .then(data => setDbStatus(data))
      .catch(err => console.error("Could not fetch database status:", err));

    const localStoredRaw = localStorage.getItem('aura_appointments');
    let localAppointments: Appointment[] = [];
    if (localStoredRaw) {
      try {
        localAppointments = JSON.parse(localStoredRaw);
        setAppointments(localAppointments);
      } catch (e) {
        console.error('Failed to parse localStorage appointments', e);
      }
    }

    // 2. Fetch remote appointments
    fetch('/api/appointments')
      .then(res => {
        if (!res.ok) throw new Error("API response not ok");
        return res.json();
      })
      .then(remoteAppts => {
        if (remoteAppts && Array.isArray(remoteAppts)) {
          setAppointments(remoteAppts);
          localStorage.setItem('aura_appointments', JSON.stringify(remoteAppts));
        } else if (localAppointments.length > 0) {
          // Sync client local items to server!
          fetch('/api/sync-cache', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appointments: localAppointments })
          }).catch(e => console.warn("Failed to sync cache to server", e));
        }
      })
      .catch(err => {
        console.warn("Could not fetch server appointments, using local storage cache fallback:", err);
      });

    // Initialize default calendar view date to today
    setCalendarDate(getMinDateString());
  }, []);

  // Save bookings helper
  const saveAppointments = (newAppts: Appointment[]) => {
    setAppointments(newAppts);
    localStorage.setItem('aura_appointments', JSON.stringify(newAppts));
  };

  const activeDesigner = DESIGNERS.find((d) => d.id === selectedDesignerId);
  const activeService = SERVICES.find((s) => s.id === selectedServiceId);

  // Validate if Designer is working on the selected day
  const getIsDayWorking = (): { isWorking: boolean; errorText: string } => {
    if (!selectedDate || !selectedDesignerId || !activeDesigner) {
      return { isWorking: true, errorText: '' };
    }
    
    // JS Date.getDay(): 0 = Sun, 1 = Mon ... 6 = Sat
    const dateObj = new Date(selectedDate);
    let dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0) dayOfWeek = 7; // Map Sunday to 7
    
    const isWorking = activeDesigner.workDays.includes(dayOfWeek);
    if (!isWorking) {
      const daysOffNames = {
        endy: '星期一、四',
      };
      const dayOffName = daysOffNames[selectedDesignerId as 'endy'] || '固定公休日';
      return {
        isWorking: false,
        errorText: `⚠️ ${activeDesigner.name} 設計師於 ${dayOffName} 固定公休休假中，請更換其他日期。`
      };
    }
    return { isWorking: true, errorText: '' };
  };

  const { isWorking: isDayAvailable, errorText: dayAvailableError } = getIsDayWorking();

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDesignerId || !selectedServiceId || !selectedDate || !selectedTime || !clientName || !clientPhone) {
      alert('請填寫所有必要預約資訊。');
      return;
    }

    if (!isDayAvailable) {
      alert('所選取日期設計師休假中，請選擇其餘工作時段。');
      return;
    }

    setIsSubmitting(true);

    // Double-booking defense validation
    const isAlreadyBooked = appointments.some(
      (appt) =>
        appt.designerId === selectedDesignerId &&
        appt.date === selectedDate &&
        appt.timeSlot === selectedTime
    );

    if (isAlreadyBooked) {
      alert('⚠️ 很抱歉，此時段已被其他人預約，請重新選取其他空檔時段，謝謝！');
      setIsSubmitting(false);
      return;
    }

    const newAppointment: Appointment = {
      id: `APT-${Date.now()}`,
      clientName,
      clientPhone,
      designerId: selectedDesignerId,
      serviceId: selectedServiceId,
      date: selectedDate,
      timeSlot: selectedTime,
      notes: notes || undefined,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppointment)
    })
      .then(res => {
        if (!res.ok) throw new Error("API storage failed");
        return res.json();
      })
      .then(() => {
        const updatedAppts = [newAppointment, ...appointments];
        saveAppointments(updatedAppts);
        setLatestBooking(newAppointment);
        setShowSuccess(true);
        setIsSubmitting(false);
        
        // Reset form variables (except selection)
        setClientName('');
        setClientPhone('');
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
      })
      .catch(err => {
        console.warn("Could not write appointment to Supabase - saving locally instead:", err);
        const updatedAppts = [newAppointment, ...appointments];
        saveAppointments(updatedAppts);
        setLatestBooking(newAppointment);
        setShowSuccess(true);
        setIsSubmitting(false);
        
        // Reset form variables (except selection)
        setClientName('');
        setClientPhone('');
        setSelectedDate('');
        setSelectedTime('');
        setNotes('');
      });
  };

  // Delete/Cancel reservation
  const handleCancelAppointment = (id: string) => {
    const targetAppt = appointments.find((appt) => appt.id === id);
    if (!targetAppt) return;

    const password = prompt('為了安全性驗證，請輸入預約時登記之「電話號碼」作爲確認密碼：');
    if (password === null) return; // User clicked Cancel in prompt

    if (password.trim() !== targetAppt.clientPhone.trim()) {
      alert('❌ 密碼與預約電話號碼不符，無法取消預約！');
      return;
    }

    if (confirm('確定要取消此美髮預約登記嗎？取消後無法恢復。')) {
      fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      })
        .then(res => {
          if (!res.ok) throw new Error("API delete failed");
        })
        .catch(err => console.error("Could not delete from DB, running local deletion fallback:", err))
        .finally(() => {
          const filtered = appointments.filter((appt) => appt.id !== id);
          saveAppointments(filtered);
        });
    }
  };

  // Get current date string (YYYY-MM-DD) for min date constraint
  const getMinDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Build helper to link Designer names & Service names in lists
  const getDesignerName = (id: string) => {
    const d = DESIGNERS.find((item) => item.id === id);
    return d ? d.name : '未指定';
  };

  const getServiceName = (id: string) => {
    const s = SERVICES.find((item) => item.id === id);
    return s ? s.name.split(' (')[0] : '精緻美髮項目';
  };

  const getServicePriceLabel = (id: string) => {
    const s = SERVICES.find((item) => item.id === id);
    return s ? `NT$${s.price.toLocaleString()}` : '';
  };

  return (
    <section id="booking" className="py-24 bg-white border-t border-b border-artistic-dark/10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="inline-block text-[10px] font-sans font-bold tracking-[0.2em] text-artistic-accent border border-artistic-accent/20 px-4 py-1.5 rounded-none uppercase">
            Reservation System / 24H 線上預約
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-artistic-dark tracking-tight">
            線上即時專屬席位預約
          </h2>
          <div className="h-[1px] w-20 bg-artistic-accent mx-auto" />
          <p className="text-artistic-dark/75 font-sans font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            只需一分鐘，線上選定您的主辦設計師與期望蛻變項目。我們後台系統會即刻為您排定獨立時段並妥善保留專屬席位，免去來回信件溝通。
          </p>
        </div>

        {/* Supabase Status / Configuration Info */}
        <div className="max-w-xl mx-auto mb-12 -mt-8 flex flex-col items-center">
          {dbStatus && dbStatus.configured ? (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-none font-sans font-medium text-center shadow-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>☁️ 已安全連線至 Supabase 雲端資料庫 (專案位址: {dbStatus.supabaseUrl || "預案網域"})</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 w-full">
              <div className="flex items-center justify-center space-x-2 text-xs text-amber-700 bg-amber-50/70 border border-amber-100/80 px-4 py-2 rounded-none font-sans font-medium w-full max-w-md shadow-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>📦 系統目前運行於本地快取模式。</span>
                <button 
                  onClick={() => setShowSqlGuide(!showSqlGuide)}
                  className="underline font-bold text-amber-800 hover:text-amber-950 transition cursor-pointer ml-1"
                >
                  【點選此處啟用 Supabase 雲端儲存】
                </button>
              </div>

              {showSqlGuide && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-artistic-bg border border-artistic-dark/10 p-5 text-left text-xs font-sans w-full max-w-xl text-artistic-dark space-y-3 shadow-sm"
                >
                  <p className="font-semibold text-artistic-dark border-b border-artistic-dark/5 pb-1">🔧 如何啟用您的 Supabase 雲端永久儲存：</p>
                  <ol className="list-decimal list-inside space-y-1.5 text-artistic-dark/80">
                    <li>請前往 <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-semibold text-artistic-accent">Supabase.com</a> 註冊並建立一個新的 PostgreSQL 資料庫專案。</li>
                    <li>前往此平台的 <strong>Settings（設定）中的 Secrets（密鑰環境變數）</strong>，建立兩個對應環境變數：
                      <ul className="list-disc list-inside pl-4 mt-1 font-mono text-[11px] text-artistic-accent space-y-0.5">
                        <li><code>SUPABASE_URL</code> : 您的專案 API 網址 (Project URL)</li>
                        <li><code>SUPABASE_KEY</code> : 您的專案金鑰 (Project API key / anon)</li>
                      </ul>
                    </li>
                    <li>在您的 Supabase 控制台的 <strong>SQL Editor</strong> 中點擊「New Query」並執行以下 DDL 結構語法以建立資料庫表結構：</li>
                  </ol>
                  <pre className="bg-artistic-dark text-white font-mono p-3 rounded-none overflow-x-auto text-[10px] leading-relaxed max-h-48 select-all">
                    {dbStatus?.sqlSetup || `-- 建立資料預約與評價表...`}
                  </pre>
                  <p className="text-[10px] text-artistic-accent font-medium">✨ 設定完成並重啟或重新載入後，系統將全自動將隨性剪裁、燙染等所有預約記錄永久對接 Supabase 安全永久儲存！</p>
                </motion.div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Main Booking Interface */}
          <div className="lg:col-span-7 bg-white border border-artistic-dark/15 p-6 sm:p-8 rounded-none shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-artistic-accent" />

            <AnimatePresence mode="wait">
              {!showSuccess ? (
                // BOOKING WIZARD FORM
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-serif font-normal text-artistic-dark flex items-center space-x-2 border-b border-artistic-dark/5 pb-3">
                    <CalendarCheck className="w-5 h-5 text-artistic-accent" />
                    <span>線上席位預約單 / Form</span>
                  </h3>
                  
                  {/* Step 1: Services Selection */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-sans tracking-widest font-bold text-artistic-dark/45 uppercase">
                      1. 選擇完美造型項目 / Select Service
                    </label>
                    <select
                      id="booking-service-select"
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none px-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition"
                      required
                    >
                      <option value="" disabled>-- 請選取美髮服務項目 --</option>
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name.split(' (')[0]} (NT${s.price.toLocaleString()}起) — 約{s.duration}分鐘
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Designer Selection */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-sans tracking-widest font-bold text-artistic-dark/45 uppercase">
                      2. 指定藝術設計師 / Choose Artist
                    </label>
                    <select
                      id="booking-designer-select"
                      value={selectedDesignerId}
                      onChange={(e) => {
                        setSelectedDesignerId(e.target.value);
                        setSelectedTime(''); // reset time if designer changes
                      }}
                      className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none px-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition"
                      required
                    >
                      <option value="" disabled>-- 請選取主辦設計師 --</option>
                      {DESIGNERS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.title.split(' / ')[0]}) (★{d.rating}) — 週一、四公休
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 3: Date & Calendar Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-sans tracking-widest font-bold text-artistic-dark/45 uppercase">
                        3. 挑選預約日期 / Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-3.5 text-artistic-accent w-4 h-4 pointer-events-none" />
                        <input
                          id="booking-date-picker"
                          type="date"
                          min={getMinDateString()}
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime(''); // Reset time whenever date changes
                          }}
                          className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none pl-11 pr-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>

                    {/* Step 4: Time Slot Selector */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-sans tracking-widest font-bold text-artistic-dark/45 uppercase">
                        4. 選擇預定時段 / Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-3.5 text-artistic-accent w-4 h-4 pointer-events-none" />
                        <select
                          id="booking-time-select"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none pl-11 pr-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!selectedDate || !selectedDesignerId || !isDayAvailable}
                          required
                        >
                          <option value="">-- {selectedDate ? '請選擇時間' : '請先選取日期'} --</option>
                          {activeDesigner?.availableTimes.map((time) => {
                            const isBooked = appointments.some(
                              (appt) =>
                                appt.designerId === selectedDesignerId &&
                                appt.date === selectedDate &&
                                appt.timeSlot === time
                            );
                            return (
                              <option key={time} value={time} disabled={isBooked}>
                                {time} {isBooked ? ' (🔒 已被預約 / Booked)' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Designer Off Indicator Alert */}
                  {dayAvailableError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 rounded-none bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 font-sans"
                    >
                      {dayAvailableError}
                    </motion.div>
                  )}

                  {/* Customer Information (Name, Phone, Notes) */}
                  <div className="border-t border-artistic-dark/10 pt-5 space-y-4">
                    <h4 className="text-[10px] font-sans tracking-widest text-artistic-dark/45 uppercase font-bold">
                      5. 顧客聯絡資料 / Contact details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Customer Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-artistic-dark/75 font-bold">預約貴賓姓名 *</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-3.5 w-4 h-4 text-artistic-accent/70" />
                          <input
                            id="booking-client-name"
                            type="text"
                            placeholder="例：王小明"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none pl-11 pr-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition"
                            required
                          />
                        </div>
                      </div>

                      {/* Customer Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs text-artistic-dark/75 font-bold">聯絡手機號碼 *</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-artistic-accent/70" />
                          <input
                            id="booking-client-phone"
                            type="tel"
                            placeholder="例：0912345678"
                            pattern="09[0-9]{8}"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                            maxLength={10}
                            className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none pl-11 pr-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-artistic-dark/40">需為10碼手機號碼，如 0912345678</p>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="space-y-1.5">
                      <label className="text-xs text-artistic-dark/75 font-bold">特別需求與留言備註 (選填)</label>
                      <div className="relative">
                        <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-artistic-accent/70" />
                        <textarea
                          id="booking-client-notes"
                          placeholder="例：頭皮較為敏感、希望能專注安靜剪剪、不愛推銷、或有漂髮需要提早說明..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="w-full bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none pl-11 pr-4 py-3 text-sm focus:border-artistic-accent focus:outline-none transition resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission and summary */}
                  <div className="pt-4 border-t border-artistic-dark/10">
                    <button
                      id="booking-submit-button"
                      type="submit"
                      disabled={isSubmitting || !selectedDesignerId || !selectedServiceId || !selectedDate || !selectedTime || !isDayAvailable}
                      className="w-full py-4 rounded-none bg-artistic-dark hover:bg-neutral-800 text-white font-sans font-bold tracking-widest text-xs uppercase shadow-sm transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>正在排定您的尊榮席位...</span>
                        </>
                      ) : (
                        <span>送出美髮席位預約 / SUBMIT RESERVATION</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // BOOKING SUCCESS VOUCHER CARD
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="inline-flex p-3 bg-emerald-500/15 rounded-none border border-emerald-500/20 text-emerald-600">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-serif font-normal text-artistic-dark">🎉 預約席位已排定！</h3>
                    <p className="text-xs text-artistic-dark/60 tracking-wider">感謝您的預訂，我們誠摯地期待與您在 SCREEN HAIR SALON 相遇</p>
                  </div>

                  {/* Vintage Salon Ticket / Voucher Design */}
                  <div className="bg-artistic-bg border border-artistic-dark/15 rounded-none p-6 relative overflow-hidden text-left max-w-md mx-auto shadow-sm">
                    <div className="absolute top-0 right-0 p-3 bg-artistic-accent/10 rounded-bl-none border-l border-b border-artistic-dark/10">
                      <span className="text-[9px] font-sans font-bold text-artistic-accent tracking-widest uppercase">SCREEN VIP PASS</span>
                    </div>
                    
                    <div className="text-center pb-4 border-b border-dashed border-artistic-dark/20">
                      <span className="text-xl font-serif font-bold text-artistic-accent tracking-wider">
                        {latestBooking?.id}
                      </span>
                      <p className="text-[10px] text-artistic-dark/40 mt-1 uppercase font-mono">Receipt Code / 預約代碼</p>
                    </div>

                    <div className="pt-4 space-y-3.5 text-xs text-artistic-dark/80">
                      <div className="flex justify-between">
                        <span className="text-artistic-dark/60">預約貴賓:</span>
                        <span className="font-semibold text-artistic-dark">
                          {latestBooking ? anonymizeName(latestBooking.clientName) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-artistic-dark/60">聯絡電話:</span>
                        <span className="font-semibold text-artistic-dark">
                          {latestBooking ? anonymizePhone(latestBooking.clientPhone) : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-artistic-dark/60">指定大師:</span>
                        <span className="font-bold text-artistic-accent">
                          {getDesignerName(latestBooking?.designerId || '')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-artistic-dark/60">指定項目:</span>
                        <span className="font-medium text-artistic-dark truncate max-w-[200px]">
                          {getServiceName(latestBooking?.serviceId || '')}
                        </span>
                      </div>
                      <div className="flex justify-between text-base border-t border-artistic-dark/10 pt-3">
                        <span className="text-artistic-dark/60 font-serif">預計消費:</span>
                        <span className="font-serif font-bold text-artistic-accent">
                          {getServicePriceLabel(latestBooking?.serviceId || '')}
                        </span>
                      </div>
                      <div className="flex justify-between bg-white p-3 rounded-none border border-artistic-dark/10">
                        <span className="text-artistic-dark/60 flex items-center text-xs">
                          <Calendar className="w-3.5 h-3.5 text-artistic-accent mr-1" />
                          預定席位時段:
                        </span>
                        <span className="font-bold text-artistic-dark text-xs font-mono">
                          {latestBooking?.date} {latestBooking?.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Aesthetic Tear Lines */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-artistic-dark/15" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-artistic-dark/15" />
                  </div>

                  <p className="text-xs text-artistic-dark/60 leading-relaxed font-sans max-w-sm mx-auto">
                    溫馨提示：請在預約時間前 10 分鐘抵達。若需異動您的預約，請至少提前 1 小時與我們電話聯繫以方便排定保留。
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      id="close-success-booking"
                      onClick={() => setShowSuccess(false)}
                      className="px-6 py-2.5 rounded-none text-xs tracking-wider bg-transparent hover:bg-artistic-bg text-artistic-dark font-sans font-bold border border-artistic-dark/20 transition cursor-pointer"
                    >
                      進行下一筆預約
                    </button>
                    
                    <button
                      onClick={() => {
                        const target = document.getElementById('my-appointments');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-6 py-2.5 rounded-none text-xs tracking-wider bg-artistic-dark hover:bg-neutral-800 text-white font-sans font-bold shadow-xs transition cursor-pointer"
                    >
                      查看我的預約紀錄
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Quick Guide & Side Info panel */}
          <div className="lg:col-span-5 space-y-8">
            {/* Elegant notice card */}
            <div className="bg-white border border-artistic-dark/15 p-6 rounded-none space-y-4 shadow-xs">
              <h4 className="text-base font-serif font-normal text-artistic-dark flex items-center space-x-2 border-b border-artistic-dark/5 pb-2">
                <HelpCircle className="w-5 h-5 text-artistic-accent" />
                <span>預約專屬權益指引</span>
              </h4>
              <ul className="space-y-4 text-xs text-artistic-dark/85 leading-relaxed font-sans">
                <li className="flex items-start">
                  <span className="text-artistic-accent font-serif font-bold mr-2">01.</span>
                  <span><strong>免費前置頭皮檢測：</strong>凡透過此線上系統預約剪、燙、染之首訪貴賓，到店享有免費「頭皮養護智能檢測」乙次。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-artistic-accent font-serif font-bold mr-2">02.</span>
                  <span><strong>預約變動與保留：</strong>一般預約為您於現場保留 15 分鐘。若您行程有延誤，歡迎直接與我們美髮沙龍連繫。</span>
                </li>
              </ul>
            </div>

            {/* Simulated Live Active Status panel */}
            <div className="bg-white border border-artistic-dark/15 p-6 rounded-none text-left space-y-4.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-sans tracking-widest text-artistic-dark/40 uppercase font-bold">Designer Duty Status</h4>
                <div className="h-2 w-2 bg-emerald-600 rounded-full animate-ping" />
              </div>

              <div className="space-y-3 text-xs">
                {/* Endy status */}
                <div className="flex items-center justify-between p-2.5 rounded-none bg-artistic-bg/60 border border-artistic-dark/5">
                  <span className="font-semibold text-artistic-dark">1 號 Endy 設計師 / 大師</span>
                  <span className="text-emerald-700 font-medium">⚫ 週一、四公休，每日開放 9 時段</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* DAILY AGENDA CALENDAR BOARD */}
        <div id="booking-calendar" className="mt-20 max-w-6xl mx-auto pt-10 border-t border-artistic-dark/15 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-normal text-artistic-dark flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-artistic-accent" />
                <span>斯古林席位 • 每日預約時段行事曆</span>
              </h3>
              <p className="text-xs text-artistic-dark/60 font-sans">
                即時掌握預約狀況。可自行選取日期，查詢 1 號設計師 Endy 的當日預約行程。
              </p>
            </div>

            {/* Date Picker Controls for Calendar Board */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-artistic-dark/75 font-sans whitespace-nowrap">
                選取查詢日期：
              </span>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-artistic-accent w-4 h-4 pointer-events-none" />
                <input
                  type="date"
                  min={getMinDateString()}
                  value={calendarDate}
                  onChange={(e) => setCalendarDate(e.target.value)}
                  className="bg-artistic-bg border border-artistic-dark/15 text-artistic-dark rounded-none pl-9 pr-4 py-2 text-xs focus:border-artistic-accent focus:outline-none transition font-sans"
                />
              </div>
            </div>
          </div>

          {/* Daily Schedule Slots */}
          {(() => {
            if (!calendarDate) {
              return (
                <div className="text-center p-6 bg-artistic-bg/40 border border-dashed border-artistic-dark/10">
                  <p className="text-xs text-artistic-dark/50 font-sans">請選取日期以載入每日預約時段</p>
                </div>
              );
            }
            
            // Calculate if selected calendar date is working
            const calendarDateObj = new Date(calendarDate);
            let calendarDayOfWeek = calendarDateObj.getDay();
            if (calendarDayOfWeek === 0) calendarDayOfWeek = 7; // Sunday maps to 7
            
            const isCalendarWorkDay = activeDesigner?.workDays.includes(calendarDayOfWeek);
            const daysOffNames = {
              endy: '星期一、四',
            };
            const calendarDayOffName = daysOffNames[selectedDesignerId as 'endy'] || '固定公休日';

            if (!isCalendarWorkDay) {
              return (
                <div className="bg-rose-500/5 border border-rose-500/10 p-8 text-center rounded-none font-sans">
                  <span className="text-artistic-accent text-lg block mb-2 font-serif font-bold">💤 固定公休店休中 / Stylist Off-duty</span>
                  <p className="text-xs text-artistic-dark/85">
                    設計師 <strong>{activeDesigner?.name}</strong> 於 {calendarDate} ({calendarDayOffName}) 固定安排放假。
                  </p>
                  <p className="text-[11px] text-artistic-dark/50 mt-1.5">
                    歡迎選用其他正常營業工作日（每週二、三、五、六、日）前來理髮預定！
                  </p>
                </div>
              );
            }

            // Normal working day list of hours
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
                {activeDesigner?.availableTimes.map((time) => {
                  const bookedAppt = appointments.find(
                    (appt) =>
                      appt.designerId === selectedDesignerId &&
                      appt.date === calendarDate &&
                      appt.timeSlot === time
                  );

                  return (
                    <div
                      key={time}
                      className={`border p-4 transition-all duration-300 relative flex flex-col justify-between min-h-[95px] ${
                        bookedAppt
                          ? 'bg-neutral-50/70 border-neutral-200/50 opacity-80'
                          : 'bg-white border-artistic-dark/10 hover:border-artistic-accent shadow-2xs hover:shadow-xs group'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="flex items-center text-xs font-bold text-artistic-dark font-mono">
                          <Clock className={`w-3.5 h-3.5 mr-1.5 ${bookedAppt ? 'text-artistic-dark/35' : 'text-artistic-accent'}`} />
                          {time}
                        </span>

                        {bookedAppt ? (
                          <span className="text-[9px] bg-neutral-100 text-neutral-600 font-bold px-2 py-0.5 rounded-none border border-neutral-200 uppercase tracking-wider font-sans">
                            已被佔用 / Booked
                          </span>
                        ) : (
                          <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-none border border-emerald-200/60 uppercase tracking-wider font-sans">
                            開放預定 / Available
                          </span>
                        )}
                      </div>

                      <div className="mt-3.5 text-xs leading-relaxed">
                        {bookedAppt ? (
                          <div className="space-y-0.5">
                            <p className="text-artistic-dark/80 font-semibold text-xs">
                              預約客：<span className="text-artistic-dark">{anonymizeName(bookedAppt.clientName)}</span>
                            </p>
                            <p className="text-[10px] text-artistic-dark/50 font-light truncate">
                              項目：{getServiceName(bookedAppt.serviceId)}
                            </p>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center w-full">
                            <span className="text-artistic-dark/45 text-[11px] italic">時段開放預定中</span>
                            <button
                              onClick={() => {
                                setSelectedDate(calendarDate);
                                setSelectedTime(time);
                                // Scroll smoothly to the booking form element
                                const elem = document.getElementById('booking-service-select');
                                if (elem) {
                                  elem.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="text-[11px] font-bold text-artistic-accent hover:text-artistic-dark border-b border-dashed border-artistic-accent hover:border-artistic-dark transition duration-350 pb-0.5 cursor-pointer"
                            >
                              選此時段 ➔
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Dynamic Reservations Console History */}
        <div id="my-appointments" className="mt-16 max-w-6xl mx-auto pt-10 border-t border-artistic-dark/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
            <div>
              <h3 className="text-xl font-serif font-normal text-artistic-dark flex items-center space-x-2">
                <span>我的美髮預約登記紀錄</span>
                <span className="px-2.5 py-0.5 rounded-none bg-artistic-dark text-[10px] text-white font-sans font-bold">
                  {appointments.length} 筆
                </span>
              </h3>
              <p className="text-xs text-artistic-dark/45 mt-1">本地保留紀錄（資料儲存於您目前的瀏覽器中，安全保密）</p>
              <p className="text-xs text-rose-700/80 mt-1 font-medium select-none">
                💡 溫馨提示：取消預約時，系統會要求輸入您登記之「電話號碼」作為驗證密碼。
              </p>
            </div>

            {appointments.length > 0 && (
              <button
                onClick={() => {
                  const password = prompt('請輸入管理密碼以清空所有預約登記：');
                  if (password === null) return;
                  
                  if (password !== '0987') {
                    alert('❌ 密碼錯誤，無法清空預約！');
                    return;
                  }

                  if (confirm('確定要清空所有的歷史預約登記嗎？此操作無法恢復。')) {
                    saveAppointments([]);
                  }
                }}
                className="text-xs text-artistic-dark/50 hover:text-rose-600 transition flex items-center space-x-1 self-start sm:self-center cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空所有紀錄</span>
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {appointments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-artistic-dark/15 rounded-none p-12 text-center shadow-xs"
              >
                <div className="text-artistic-accent text-3xl mb-3">🪮</div>
                <p className="text-sm text-artistic-dark font-serif font-semibold">目前尚無預約登記紀錄。</p>
                <p className="text-xs text-artistic-dark/60 mt-1">歡迎填寫上方預約單，指定 1 號設計師 Endy 為您服務！</p>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appt) => (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-artistic-dark/10 p-5 rounded-none shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-[4px] h-full bg-artistic-accent" />
                    
                    <div className="space-y-2.5 text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-sans font-bold text-artistic-accent px-2 py-0.5 rounded-none bg-artistic-accent/5 border border-artistic-accent/10">
                          {appt.id}
                        </span>
                        
                        <button
                          id={`cancel-btn-${appt.id}`}
                          onClick={() => handleCancelAppointment(appt.id)}
                          className="text-artistic-dark/40 hover:text-rose-600 transition p-1 cursor-pointer"
                          title="取消預約"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1 font-sans">
                        <h4 className="font-bold text-artistic-dark flex items-center">
                          <span>{anonymizeName(appt.clientName)}</span>
                          <span className="text-xs text-artistic-dark/45 font-mono ml-2">({anonymizePhone(appt.clientPhone)})</span>
                        </h4>
                        <p className="text-xs text-artistic-dark/80">
                          指定項目：<strong className="text-artistic-dark font-semibold">{getServiceName(appt.serviceId)}</strong>
                        </p>
                        <p className="text-xs text-artistic-dark/80">
                          預約大師：<strong className="text-artistic-accent font-semibold">{getDesignerName(appt.designerId)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-artistic-dark/5 pt-3 text-xs">
                      <div className="text-artistic-dark/60 font-sans flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-artistic-accent mr-1" />
                        {appt.date}
                      </div>

                      <div className="text-white font-sans font-bold flex items-center bg-artistic-dark px-2 py-1 rounded-none">
                        <Clock className="w-3.5 h-3.5 text-artistic-accent mr-1" />
                        {appt.timeSlot}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}
