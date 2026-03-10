import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Car, Calendar, Clock, Users, UserCheck, ShieldCheck, BadgeDollarSign, Headphones, Star, ChevronLeft, ChevronRight, Quote, X, CheckCircle2 } from 'lucide-react';
import LocationInput from './LocationInput';

export default function LandingPage({ onSearch, onBook }: { onSearch?: (data?: any) => void, onBook?: (data?: any) => void }) {
  const [location, setLocation] = useState('');
  const [carType, setCarType] = useState('Economy');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [members, setMembers] = useState('');
  const [driverAge, setDriverAge] = useState('21 - 30');

  const [isSearching, setIsSearching] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);
  const [processingFeature, setProcessingFeature] = useState<number | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const handleFeatureClick = (index: number) => {
    setProcessingFeature(index);
    setTimeout(() => {
      setProcessingFeature(null);
      setSelectedFeature(index);
    }, 1200);
  };

  const featureProcesses = [
    {
      title: "Reliable Service Process",
      steps: [
        { name: "Background Check", desc: "Every driver undergoes a rigorous 10-point background verification." },
        { name: "Professional Training", desc: "Drivers complete our proprietary hospitality and safety training." },
        { name: "Real-time Monitoring", desc: "Our 24/7 control center monitors every ride for safety and timing." },
        { name: "On-time Guarantee", desc: "If we're more than 5 minutes late, your next ride is on us." }
      ]
    },
    {
      title: "Lowest Prices Process",
      steps: [
        { name: "Dynamic Optimization", desc: "Our algorithms find the most efficient routes to keep costs low." },
        { name: "Zero Hidden Fees", desc: "What you see is what you pay. No surprise surcharges or hidden costs." },
        { name: "Fuel Efficiency", desc: "Our modern fleet ensures minimal fuel consumption and lower rates." },
        { name: "Price Matching", desc: "We constantly monitor competitors to ensure we offer the best value." }
      ]
    },
    {
      title: "24/7 Support Process",
      steps: [
        { name: "Instant Response", desc: "Connect with a human agent in under 30 seconds, any time of day." },
        { name: "Expert Resolution", desc: "Our support team is empowered to resolve 95% of issues on the first call." },
        { name: "Global Coverage", desc: "Support available in 12 languages across all our operating regions." },
        { name: "Proactive Assistance", desc: "We reach out to you if we detect any delays or issues with your ride." }
      ]
    },
    {
      title: "Best Cars Process",
      steps: [
        { name: "Weekly Maintenance", desc: "Every vehicle undergoes a full mechanical inspection every 7 days." },
        { name: "Daily Deep Clean", desc: "Cars are professionally sanitized and detailed before every shift." },
        { name: "Modern Amenities", desc: "All vehicles are under 3 years old and equipped with the latest tech." },
        { name: "Safety First", desc: "Equipped with advanced safety features and real-time GPS tracking." }
      ]
    }
  ];

  const handleBook = (id: number) => {
    setBookingId(id);
    const mockId = Math.floor(Math.random() * 1000000);
    setTimeout(() => {
      setBookingId(null);
      setBookingConfirmed(`CAB-${mockId}`);
      
      // Delay before transitioning to dashboard
      setTimeout(() => {
        setBookingConfirmed(null);
        if (onBook) {
          onBook();
        } else {
          alert('Booking process started...');
        }
      }, 2000);
    }, 1500);
  };

  const handleSearch = () => {
    setIsSearching(true);
    const searchData = {
      location,
      carType,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      members,
      driverAge
    };
    console.log('Searching for:', searchData);
    
    // Simulate a brief processing delay
    setTimeout(() => {
      setIsSearching(false);
      if (onSearch) {
        onSearch(searchData);
      } else {
        alert(`Searching for cabs in ${location || 'your area'}...`);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/cabhero/1920/1080" 
            alt="Hero" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-black mb-4 tracking-tight"
          >
            Lorem Ipsum is simply dummy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-medium mb-12 opacity-90"
          >
            Lorem Ipsum is simply dummy text
          </motion.p>

          {/* Booking Form Overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-black/60 backdrop-blur-md p-10 rounded-xl border border-white/10 max-w-6xl mx-auto shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 mb-10">
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Location</label>
                <div className="relative">
                  <select 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none appearance-none pr-12 cursor-pointer"
                  >
                    <option value="">Select Location</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="New York">New York</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Houston">Houston</option>
                    <option value="Phoenix">Phoenix</option>
                    <option value="Philadelphia">Philadelphia</option>
                    <option value="San Antonio">San Antonio</option>
                    <option value="San Diego">San Diego</option>
                    <option value="Dallas">Dallas</option>
                    <option value="San Jose">San Jose</option>
                    <option value="Austin">Austin</option>
                    <option value="Jacksonville">Jacksonville</option>
                    <option value="Fort Worth">Fort Worth</option>
                    <option value="Columbus">Columbus</option>
                    <option value="Charlotte">Charlotte</option>
                    <option value="Indianapolis">Indianapolis</option>
                    <option value="Seattle">Seattle</option>
                    <option value="Denver">Denver</option>
                    <option value="Washington D.C.">Washington D.C.</option>
                    <option value="Boston">Boston</option>
                    <option value="Nashville">Nashville</option>
                    <option value="Las Vegas">Las Vegas</option>
                    <option value="Miami">Miami</option>
                    <option disabled className="bg-zinc-100 font-bold">--- India ---</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Surat">Surat</option>
                    <option value="Pune">Pune</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Lucknow">Lucknow</option>
                    <option value="Kanpur">Kanpur</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Indore">Indore</option>
                    <option value="Thane">Thane</option>
                    <option value="Bhopal">Bhopal</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Patna">Patna</option>
                    <option value="Vadodara">Vadodara</option>
                  </select>
                  <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Type</label>
                <div className="relative">
                  <select 
                    value={carType}
                    onChange={(e) => setCarType(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none appearance-none pr-12 cursor-pointer"
                  >
                    <option>Economy</option>
                    <option>Business</option>
                    <option>Luxury</option>
                  </select>
                  <Car size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Pick up date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none pr-12 placeholder:text-zinc-400" 
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Pick up time</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none pr-12 placeholder:text-zinc-400" 
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Return date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none pr-12 placeholder:text-zinc-400" 
                  />
                  <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Return time</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none pr-12 placeholder:text-zinc-400" 
                  />
                  <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Members</label>
                <div className="relative">
                  <select 
                    value={members}
                    onChange={(e) => setMembers(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none appearance-none pr-12 cursor-pointer"
                  >
                    <option value="">Members</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Member' : 'Members'}</option>
                    ))}
                  </select>
                  <Users size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="text-left">
                <label className="block text-[11px] font-black text-[#ff9800] uppercase tracking-[0.2em] mb-3">Drivers age</label>
                <div className="relative">
                  <select 
                    value={driverAge}
                    onChange={(e) => setDriverAge(e.target.value)}
                    className="w-full bg-white text-zinc-800 px-5 py-3.5 rounded-md text-sm font-medium focus:outline-none appearance-none pr-12 cursor-pointer"
                  >
                    <option>21 - 30</option>
                    <option>31 - 40</option>
                    <option>41 - 50</option>
                    <option>50+</option>
                  </select>
                  <UserCheck size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#ff9800] text-white px-16 py-4 rounded-md font-black uppercase tracking-[0.15em] hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/40 text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed min-w-[240px]"
              >
                {isSearching ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Search Now'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Why Choose Us?</h2>
            <div className="w-20 h-1.5 bg-[#ff9800] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { 
                icon: <Car size={24} />, 
                title: "Reliable Service", 
                desc: "We provide professional and on-time taxi services for all your needs.",
                image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=600"
              },
              { 
                icon: <BadgeDollarSign size={24} />, 
                title: "Lowest Prices", 
                desc: "Enjoy the most competitive rates in the market without compromising quality.",
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600"
              },
              { 
                icon: <Headphones size={24} />, 
                title: "24/7 Support", 
                desc: "Our dedicated support team is available around the clock to assist you.",
                image: "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=600"
              },
              { 
                icon: <ShieldCheck size={24} />, 
                title: "Best Cars", 
                desc: "Our fleet consists of well-maintained, clean, and modern vehicles.",
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=600"
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleFeatureClick(i)}
                className="flex flex-col group cursor-pointer bg-zinc-50 rounded-[32px] overflow-hidden border border-zinc-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="h-48 w-full overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-[#ff9800] shadow-lg">
                    {processingFeature === i ? (
                      <div className="w-6 h-6 border-2 border-[#ff9800] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      item.icon
                    )}
                  </div>
                </div>
                <div className="p-8 text-center">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-[#ff9800] transition-colors">{item.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
                  {processingFeature === i && (
                    <p className="text-[10px] font-bold text-[#ff9800] uppercase tracking-widest mt-4 animate-pulse">Processing...</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / The Process Section */}
      <section className="py-24 bg-zinc-900 text-white px-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">How it Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Getting a ride with CabGo is simple, fast, and secure. Follow these four easy steps to get started.</p>
            <div className="w-20 h-1.5 bg-[#ff9800] mx-auto rounded-full mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-12 left-24 right-24 h-0.5 bg-zinc-800 z-0"></div>
            
            {[
              { step: "01", title: "Search for a Ride", desc: "Enter your pickup and destination locations to see available cabs near you." },
              { step: "02", title: "Choose your Cab", desc: "Select from our range of Economy, Business, or Luxury vehicles that fit your budget." },
              { step: "03", title: "Confirm Booking", desc: "Review your ride details and confirm your booking with a single tap." },
              { step: "04", title: "Arrive Safely", desc: "Track your driver in real-time and enjoy a comfortable, safe journey to your destination." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-3xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl font-black text-[#ff9800] mb-8 group-hover:bg-[#ff9800] group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-[#ff9800] transition-colors">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-[#ff9800] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
            >
              Start Your Journey Now
            </button>
          </div>
        </div>
      </section>

      {/* Choose your Cab Section */}
      <section className="py-24 bg-zinc-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-4xl font-black mb-4">Choose your Cab</h2>
              <div className="w-20 h-1.5 bg-[#ff9800] rounded-full"></div>
            </div>
            <div className="flex gap-2">
              <button className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-[#ff9800] hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <button className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-[#ff9800] hover:text-white transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "Economy Class", price: "12", image: "https://picsum.photos/seed/car1/400/250", specs: ["4 Seats", "2 Bags", "AC", "5 min away"] },
              { name: "Business Class", price: "45", image: "https://picsum.photos/seed/car2/400/250", specs: ["4 Seats", "3 Bags", "AC", "Wifi"] },
              { name: "Luxury Class", price: "85", image: "https://picsum.photos/seed/car3/400/250", specs: ["4 Seats", "4 Bags", "AC", "Wifi", "Drinks"] }
            ].map((car, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100 hover:shadow-xl transition-all group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-[#ff9800] text-white px-4 py-1 rounded-full font-bold text-sm">
                    ${car.price}/km
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-4">{car.name}</h3>
                  <div className="flex flex-wrap gap-3 mb-8">
                    {car.specs.map((spec, j) => (
                      <span key={j} className="text-[10px] font-bold uppercase tracking-widest bg-zinc-50 text-zinc-400 px-3 py-1 rounded border border-zinc-100">{spec}</span>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleBook(i)}
                    disabled={bookingId === i}
                    className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold hover:bg-[#ff9800] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {bookingId === i ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Book Now'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-16">What our people are saying</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 rounded-full border-8 border-zinc-100 overflow-hidden flex-shrink-0">
              <img src="https://picsum.photos/seed/user-test/300" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="text-left relative">
              <Quote size={48} className="text-orange-500 absolute -top-4 -left-12 opacity-20" />
              <p className="text-zinc-500 italic leading-relaxed mb-8">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>
              <div>
                <h4 className="text-xl font-bold text-orange-500">John Smith Founder</h4>
                <p className="text-zinc-400 text-sm">& CEO, Company Name</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-orange-500' : 'bg-zinc-300'}`}></div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Destination Section */}
      <section className="py-24 bg-[#f9f9f9] px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-16">Find Destination</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="group relative aspect-video overflow-hidden rounded-lg cursor-pointer">
                <img 
                  src={`https://picsum.photos/seed/dest-${i}/400/300`} 
                  alt="Destination" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-bold text-sm">Lorem Ipsum is simply</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Process Modal */}
      <AnimatePresence>
        {bookingConfirmed && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="animate-bounce" />
              </div>
              <h2 className="text-3xl font-black mb-2">Booking Confirmed!</h2>
              <p className="text-zinc-500 mb-8">Your ride has been successfully booked. We're redirecting you to your dashboard.</p>
              
              <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 mb-8">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-mono mb-1">Booking ID</p>
                <p className="text-2xl font-black text-zinc-900">{bookingConfirmed}</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-orange-500 font-bold text-sm">
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                Redirecting...
              </div>
            </motion.div>
          </div>
        )}

        {selectedFeature !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                      {[<Car size={28} />, <BadgeDollarSign size={28} />, <Headphones size={28} />, <ShieldCheck size={28} />][selectedFeature]}
                    </div>
                    <h2 className="text-2xl font-black">{featureProcesses[selectedFeature].title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedFeature(null)}
                    className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  {featureProcesses[selectedFeature].steps.map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-black group-hover:bg-orange-500 transition-colors">
                          {i + 1}
                        </div>
                        {i < 3 && <div className="w-0.5 h-full bg-zinc-100 my-2"></div>}
                      </div>
                      <div className="pb-4">
                        <h4 className="font-bold text-lg mb-1 group-hover:text-orange-500 transition-colors">{step.name}</h4>
                        <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12">
                  <button 
                    onClick={() => setSelectedFeature(null)}
                    className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-orange-500 transition-all shadow-xl shadow-orange-500/10"
                  >
                    Got it, thanks!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
