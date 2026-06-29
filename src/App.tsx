import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Designers from './components/Designers';
import Gallery from './components/Gallery';
import Testimonials from './components/Testimonials';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';

export default function App() {
  // Sync selection states between listing items and booking wizard
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('endy');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('mens_cut_wash');

  // Smooth scroll handler
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Select service and auto scroll to reservation form
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    handleScrollTo('booking');
  };

  // Select designer and auto scroll to reservation form
  const handleSelectDesigner = (designerId: string) => {
    setSelectedDesignerId(designerId);
    handleScrollTo('booking');
  };

  return (
    <div id="salon-app" className="min-h-screen bg-cosmetic-cyber text-artistic-dark flex flex-col font-sans selection:bg-artistic-accent selection:text-white relative overflow-hidden">
      
      {/* High-tech Cosmetic Ambient Glow Backdrops */}
      <div className="absolute top-[10%] left-[-15%] w-[60vw] h-[60vw] rounded-full cosmetic-aurora-glow pointer-events-none z-0" />
      <div className="absolute top-[45%] right-[-15%] w-[50vw] h-[50vw] rounded-full cosmetic-aurora-blue pointer-events-none z-0" />
      <div className="absolute bottom-[15%] left-[5%] w-[45vw] h-[45vw] rounded-full cosmetic-aurora-glow pointer-events-none z-0" />

      {/* Header Sticky Navbar */}
      <Header onScrollTo={handleScrollTo} />

      {/* Main Single Page Sections */}
      <main className="flex-grow">
        
        {/* Smart Booking Form Section */}
        <BookingForm
          selectedDesignerId={selectedDesignerId}
          selectedServiceId={selectedServiceId}
          setSelectedDesignerId={setSelectedDesignerId}
          setSelectedServiceId={setSelectedServiceId}
        />

        {/* Hero Welcome banner */}
        <Hero onScrollTo={handleScrollTo} />

        {/* Services Menu Section */}
        <Services onSelectService={handleSelectService} />

        {/* Designer Profile Section */}
        <Designers onSelectDesigner={handleSelectDesigner} />

        {/* Lookbook Gallery Grid Section */}
        <Gallery />

        {/* Customer Feedbacks Testimonials */}
        <Testimonials />

      </main>

      {/* Footer Details */}
      <Footer onScrollTo={handleScrollTo} />

    </div>
  );
}
