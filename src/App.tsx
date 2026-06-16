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
    <div id="salon-app" className="min-h-screen bg-neutral-950 text-stone-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      
      {/* Header Sticky Navbar */}
      <Header onScrollTo={handleScrollTo} />

      {/* Main Single Page Sections */}
      <main className="flex-grow">
        
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

        {/* Smart Booking Form Section */}
        <BookingForm
          selectedDesignerId={selectedDesignerId}
          selectedServiceId={selectedServiceId}
          setSelectedDesignerId={setSelectedDesignerId}
          setSelectedServiceId={setSelectedServiceId}
        />

      </main>

      {/* Footer Details */}
      <Footer onScrollTo={handleScrollTo} />

    </div>
  );
}
