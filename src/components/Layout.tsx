import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Map as MapIcon, Phone, Mail, Facebook, Twitter, Linkedin, Instagram, Send, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Layout({ children, onNavigate }: { children: React.ReactNode, onNavigate?: (view: any) => void }) {
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', view: 'home' },
    { label: 'About Us', view: 'about' },
    { label: 'Gallery', view: 'gallery' },
    { label: 'Blog', view: 'blog' },
    { label: 'Hot Packages', view: 'packages' },
    { label: 'Our Cars', view: 'cars' },
    { label: 'Testimonials', view: 'testimonials' },
    { label: 'Contact Us', view: 'contact' },
  ];

  if (user?.role === 'rider') {
    navItems.splice(1, 0, { label: 'Favorites', view: 'favorites' });
    navItems.splice(2, 0, { label: 'History', view: 'history' });
  }

  const handleNavigate = (view: string) => {
    onNavigate?.(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-800">
      {/* Top Bar */}
      <div className="bg-[#1a1a1a] text-white py-2 px-6 hidden lg:block border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px] font-medium">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-white" />
              <span>Call Us. +00 123 456 789</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <button onClick={() => handleNavigate('faq')} className="hover:text-white transition-colors">Help</button>
            <span className="text-zinc-700">|</span>
            <button className="hover:text-white transition-colors">Referral Program</button>
            <span className="text-zinc-700">|</span>
            <button className="hover:text-white transition-colors">Loyalty</button>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Globe size={12} className="text-orange-500" />
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-transparent border-none focus:ring-0 cursor-pointer p-0 text-[11px] text-zinc-400 hover:text-white font-bold"
              >
                <option value="USD" className="text-black">USD ($)</option>
                <option value="EUR" className="text-black">EUR (€)</option>
                <option value="GBP" className="text-black">GBP (£)</option>
                <option value="INR" className="text-black">INR (₹)</option>
                <option value="JPY" className="text-black">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="bg-white border-b border-zinc-100 px-6 py-5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('home')}>
              <div className="text-3xl font-black tracking-tighter flex items-center">
                <span className="text-[#ff9800]">CAB</span>
                <span className="text-black ml-1">GO</span>
              </div>
            </div>
            
            <div className="hidden xl:flex items-center gap-6">
              {navItems.map((item) => (
                <button 
                  key={item.view}
                  onClick={() => handleNavigate(item.view)} 
                  className={`text-[13px] font-bold transition-colors ${item.view === 'home' ? 'text-white bg-[#29abe2] px-5 py-2 rounded shadow-sm' : 'text-zinc-700 hover:text-[#ff9800]'}`}
                >
                  {item.label}
                </button>
              ))}
              <button onClick={() => handleNavigate('cancel-booking')} className="text-[13px] font-bold text-zinc-700 hover:text-[#ff9800] transition-colors whitespace-nowrap">Cancel Booking</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              className="xl:hidden p-2 text-zinc-600 hover:text-[#ff9800] transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => handleNavigate('dashboard')} className="hidden md:block text-[13px] font-bold text-white bg-[#ff9800] px-6 py-2 rounded hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">Dashboard</button>
                <div className="hidden md:block h-8 w-[1px] bg-zinc-200 mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold leading-none">{user.name}</p>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-1">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-zinc-100 rounded-full border border-zinc-200 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => handleNavigate('profile')}>
                    {user.profile_pic ? (
                      <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-zinc-400" />
                    )}
                  </div>
                  <button onClick={logout} className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"><LogOut size={20} /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => handleNavigate('login')} className="text-[13px] font-bold text-white bg-[#ff9800] px-4 md:px-8 py-2 rounded hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">Login</button>
                <button onClick={() => handleNavigate('register')} className="hidden md:block text-[13px] font-bold text-white bg-[#29abe2] px-8 py-2 rounded hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20">Register</button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xl:hidden bg-white border-t border-zinc-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                {navItems.map((item) => (
                  <button 
                    key={item.view}
                    onClick={() => handleNavigate(item.view)} 
                    className="text-left text-[15px] font-bold text-zinc-700 hover:text-[#ff9800] transition-colors py-2 border-b border-zinc-50 last:border-0"
                  >
                    {item.label}
                  </button>
                ))}
                <button onClick={() => handleNavigate('cancel-booking')} className="text-left text-[15px] font-bold text-zinc-700 hover:text-[#ff9800] transition-colors py-2 border-b border-zinc-50">Cancel Booking</button>
                {!user && (
                  <button onClick={() => handleNavigate('register')} className="text-left text-[15px] font-bold text-[#29abe2] py-2">Register</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="min-h-[calc(100vh-400px)]">
        {children}
      </main>

      {/* Pre-Footer CTA */}
      <div className="bg-orange-500 py-12 px-6 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden bg-white">
              <img src="https://picsum.photos/seed/support/200" alt="Support" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Need help ? Call us on</h3>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  <span className="font-bold">(000) 12344565 from 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span className="font-medium">info@companyname.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-3xl font-serif italic mb-6">Find the best solution for you...</h3>
            <button onClick={() => onNavigate?.('contact')} className="bg-black text-white px-8 py-4 rounded text-xl font-bold hover:bg-zinc-900 transition-all">Request Quote</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#f5f5f5] pt-16 pb-8 px-6 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="text-lg font-bold mb-6 border-b-2 border-zinc-300 pb-2 inline-block">Important links</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button onClick={() => onNavigate?.('home')} className="hover:text-orange-500">Home</button></li>
                <li><button onClick={() => onNavigate?.('about')} className="hover:text-orange-500">About Us</button></li>
                <li><button onClick={() => onNavigate?.('gallery')} className="hover:text-orange-500">Gallery</button></li>
                <li><button onClick={() => onNavigate?.('blog')} className="hover:text-orange-500">Blog</button></li>
                <li><button onClick={() => onNavigate?.('packages')} className="hover:text-orange-500">Hot Packages</button></li>
                <li><button onClick={() => onNavigate?.('cars')} className="hover:text-orange-500">Our Cars</button></li>
                <li><button onClick={() => onNavigate?.('testimonials')} className="hover:text-orange-500">Testimonials</button></li>
                <li><button onClick={() => onNavigate?.('contact')} className="hover:text-orange-500">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 border-b-2 border-zinc-300 pb-2 inline-block">Customer Services</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button onClick={() => onNavigate?.('support')} className="hover:text-orange-500">Customer Support</button></li>
                <li><button onClick={() => onNavigate?.('cancel-booking')} className="hover:text-orange-500">Cancel Booking</button></li>
                <li><button onClick={() => onNavigate?.('policy')} className="hover:text-orange-500">Cancellation Policy</button></li>
                <li><button onClick={() => onNavigate?.('register')} className="hover:text-orange-500">Register</button></li>
                <li><button onClick={() => onNavigate?.('pay-direct')} className="hover:text-orange-500">Pay Direct</button></li>
                <li><button onClick={() => onNavigate?.('deals')} className="hover:text-orange-500">Deals and Offers</button></li>
              </ul>
            </div>
            <div>
              <h4 
                onClick={() => onNavigate?.('services')}
                className="text-lg font-bold mb-6 border-b-2 border-zinc-300 pb-2 inline-block cursor-pointer hover:text-orange-500 transition-colors"
              >
                Our Services
              </h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button onClick={() => onNavigate?.('one-way')} className="hover:text-orange-500">One way trip</button></li>
                <li><button onClick={() => onNavigate?.('round-trip')} className="hover:text-orange-500">Round Trip</button></li>
                <li><button onClick={() => onNavigate?.('local-full-day')} className="hover:text-orange-500">Local Full day trip</button></li>
                <li><button onClick={() => onNavigate?.('luxury-rental')} className="hover:text-orange-500">Luxury Car Rental</button></li>
                <li><button onClick={() => onNavigate?.('wedding-rental')} className="hover:text-orange-500">Wedding Car Rental</button></li>
                <li><button onClick={() => onNavigate?.('business-rental')} className="hover:text-orange-500">Business Car Rental</button></li>
                <li><button onClick={() => onNavigate?.('bus-hire')} className="hover:text-orange-500">Bus Hire</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 border-b-2 border-zinc-300 pb-2 inline-block">Feedback</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><button onClick={() => onNavigate?.('sitemap')} className="hover:text-orange-500">Sitemap</button></li>
                <li><button onClick={() => onNavigate?.('terms')} className="hover:text-orange-500">T & C</button></li>
                <li><button onClick={() => onNavigate?.('privacy')} className="hover:text-orange-500">Privacy Policy</button></li>
                <li><button onClick={() => onNavigate?.('disclaimer')} className="hover:text-orange-500">Disclaimer</button></li>
                <li><button onClick={() => onNavigate?.('security')} className="hover:text-orange-500">Security</button></li>
                <li><button onClick={() => onNavigate?.('faq')} className="hover:text-orange-500">FAQs</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-12 pb-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-500 rounded flex items-center justify-center text-white">
                  <Mail size={32} />
                </div>
                <div>
                  <h4 className="text-2xl font-black uppercase">Newsletter Sign Up</h4>
                  <p className="text-zinc-500 text-sm">Sign up today and keep up to date with all the latest offers!</p>
                </div>
              </div>
              <div className="flex w-full lg:w-auto max-w-md">
                <input type="email" placeholder="Your Email Address..." className="flex-1 px-6 py-4 bg-white border border-zinc-200 rounded-l focus:outline-none" />
                <button className="bg-orange-500 text-white px-6 py-4 rounded-r hover:bg-orange-600 transition-colors">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all mx-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all mx-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all mx-4" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] text-white py-4 px-6 -mx-6 -mb-8 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
            <p>Copyright © 2016 Company Name. All Rights Reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors"><Facebook size={14} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors"><Twitter size={14} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors"><Linkedin size={14} /></a>
              <a href="#" className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors"><Instagram size={14} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
