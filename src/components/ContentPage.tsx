import React from 'react';
import { motion } from 'motion/react';
import { Info, Shield, FileText, HelpCircle, Phone, Mail, MapPin, MessageSquare, Star, BadgeDollarSign, AlertTriangle, Car, UserPlus, Briefcase, Heart, Bus, Globe, Layout as LayoutIcon, Lock, Search, Clock } from 'lucide-react';

type ContentType = 'about' | 'gallery' | 'blog' | 'packages' | 'cars' | 'testimonials' | 'contact' | 'support' | 'policy' | 'deals' | 'terms' | 'privacy' | 'faq' | 'sitemap' | 'disclaimer' | 'security' | 'one-way' | 'round-trip' | 'local-full-day' | 'luxury-rental' | 'wedding-rental' | 'business-rental' | 'bus-hire' | 'cancel-booking' | 'pay-direct' | 'feedback' | 'register' | 'services';

interface ContentPageProps {
  type: ContentType;
}

export default function ContentPage({ type }: ContentPageProps) {
  const Section = ({ title, description, image, icon }: { title: string, description: string | React.ReactNode, image?: string, icon?: React.ReactNode }) => (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {icon && <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">{icon}</div>}
            <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          </div>
          <div className="text-lg text-zinc-600 leading-relaxed">
            {typeof description === 'string' ? <p>{description}</p> : description}
          </div>
        </div>
        {image && (
          <div className="relative aspect-video rounded-[40px] overflow-hidden shadow-2xl border border-zinc-100">
            <img src={image} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );

  const getContent = () => {
    switch (type) {
      case 'about':
        return {
          title: 'About Us',
          icon: <Info className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Our Story"
              image="https://picsum.photos/seed/about-us/800/600"
              description="CabGo is a leading provider of premium transportation services. Founded in 2016, we have grown from a small local startup to a nationwide network of professional drivers and high-quality vehicles. Our mission is to provide safe, reliable, and affordable rides for everyone, everywhere. We believe in the power of mobility to connect people and communities, and we are committed to making every journey a pleasant and seamless experience."
            />
          )
        };
      case 'contact':
        return {
          title: 'Contact Us',
          icon: <Phone className="text-orange-500" size={48} />,
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <p className="text-zinc-500">Have questions or need assistance? Our team is here to help you 24/7. We value your input and are always looking for ways to improve our service.</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Phone</p>
                      <p className="font-bold">+00 123 456 789</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Email</p>
                      <p className="font-bold">support@cabgo.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Address</p>
                      <p className="font-bold">123 Mobility Way, Tech City, TC 12345</p>
                    </div>
                  </div>
                </div>
                <div className="aspect-video rounded-3xl overflow-hidden border border-zinc-100 shadow-sm">
                  <img src="https://picsum.photos/seed/office/600/400" alt="Office" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                <h3 className="text-xl font-bold mb-6">Send us a message</h3>
                <form className="space-y-4">
                  <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"></textarea>
                  <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">Send Message</button>
                </form>
              </div>
            </div>
          )
        };
      case 'faq':
        return {
          title: 'Frequently Asked Questions',
          icon: <HelpCircle className="text-orange-500" size={48} />,
          content: (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  {[
                    { q: 'How do I book a ride?', a: 'You can book a ride through our mobile app or website by entering your pickup and drop-off locations.' },
                    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and digital wallets like Apple Pay and Google Pay.' },
                    { q: 'Can I cancel my booking?', a: 'Yes, you can cancel your booking through the app. Please refer to our cancellation policy for any potential fees.' },
                    { q: 'Are your drivers background checked?', a: 'Absolutely. All our drivers undergo rigorous background checks and vehicle inspections to ensure your safety.' }
                  ].map((item, i) => (
                    <div key={i} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <h4 className="font-bold mb-2 flex items-center gap-2">
                        <MessageSquare size={18} className="text-orange-500" />
                        {item.q}
                      </h4>
                      <p className="text-zinc-500 text-sm">{item.a}</p>
                    </div>
                  ))}
                </div>
                <div className="aspect-square rounded-[40px] overflow-hidden shadow-xl">
                  <img src="https://picsum.photos/seed/faq/600/600" alt="FAQ" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          )
        };
      case 'gallery':
        return {
          title: 'Our Gallery',
          icon: <Info className="text-orange-500" size={48} />,
          content: (
            <div className="space-y-12">
              <p className="text-lg text-zinc-600 text-center max-w-3xl mx-auto">Take a look at our premium fleet, professional drivers, and the beautiful destinations we serve every day.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden border border-zinc-100 shadow-sm">
                    <img src={`https://picsum.photos/seed/gal-${i}/400/300`} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                  </div>
                ))}
              </div>
            </div>
          )
        };
      case 'blog':
        return {
          title: 'Latest News & Blog',
          icon: <MessageSquare className="text-orange-500" size={48} />,
          content: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                    <img src={`https://picsum.photos/seed/blog-${i}/600/400`} alt="Blog" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">Travel • Feb 24, 2026</p>
                  <h3 className="text-xl font-bold mb-3">Top 10 Destinations for 2026</h3>
                  <p className="text-zinc-500 text-sm mb-4">Discover the most beautiful places to visit this year with our premium cab services. We've curated a list of must-visit spots...</p>
                  <button className="text-sm font-bold text-zinc-900 hover:text-orange-500 transition-colors">Read More →</button>
                </div>
              ))}
            </div>
          )
        };
      case 'packages':
        return {
          title: 'Hot Packages',
          icon: <Star className="text-orange-500" size={48} />,
          content: (
            <div className="space-y-12">
              <p className="text-lg text-zinc-600 text-center max-w-3xl mx-auto">Choose from our carefully curated travel packages designed to give you the best value for your money.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Weekend Getaway', price: '99', features: ['Round trip', 'City tour', '24h availability'], img: 'https://picsum.photos/seed/pkg1/400/300' },
                  { name: 'Airport Transfer', price: '45', features: ['Meet & Greet', 'Luggage help', 'Fixed price'], img: 'https://picsum.photos/seed/pkg2/400/300' },
                  { name: 'Business Day', price: '199', features: ['Full day hire', 'Premium car', 'Professional driver'], img: 'https://picsum.photos/seed/pkg3/400/300' }
                ].map((pkg, i) => (
                  <div key={i} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden text-center flex flex-col">
                    <div className="h-48">
                      <img src={pkg.img} alt={pkg.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                      <div className="text-4xl font-black text-orange-500 mb-6">${pkg.price}</div>
                      <ul className="space-y-3 mb-8 text-zinc-500 text-sm flex-1">
                        {pkg.features.map((f, j) => <li key={j}>{f}</li>)}
                      </ul>
                      <button className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-orange-500 transition-colors">Book Package</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        };
      case 'cars':
        return {
          title: 'Our Fleet',
          icon: <Car className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Premium Vehicles"
              image="https://picsum.photos/seed/fleet/800/600"
              description="We take pride in our diverse and well-maintained fleet. From fuel-efficient economy cars for city hops to luxurious sedans for business travel and spacious SUVs for family trips, we have the perfect vehicle for every occasion. All our cars are equipped with modern amenities, GPS tracking, and undergo regular safety inspections to ensure your comfort and safety."
            />
          )
        };
      case 'testimonials':
        return {
          title: 'Client Testimonials',
          icon: <Star className="text-orange-500" size={48} />,
          content: (
            <div className="space-y-12">
              <p className="text-lg text-zinc-600 text-center max-w-3xl mx-auto">Don't just take our word for it. Here's what our customers have to say about their experiences with CabGo.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm italic text-zinc-600 flex flex-col">
                    <div className="flex items-center gap-4 mb-6 not-italic">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user-${i}/100`} alt="User" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900">Happy Customer</h4>
                        <div className="flex text-orange-400"><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /></div>
                      </div>
                    </div>
                    <p className="flex-1">"The service was exceptional. The driver was professional, the car was spotless, and I reached my destination ahead of schedule. Highly recommended for anyone looking for reliable transport!"</p>
                  </div>
                ))}
              </div>
            </div>
          )
        };
      case 'support':
        return {
          title: 'Customer Support',
          icon: <HelpCircle className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="We're here to help"
              image="https://picsum.photos/seed/support-team/800/600"
              description="Our customer support team is available 24/7 to assist you with any queries, bookings, or issues you may have. Whether you need help with a current ride, have questions about our services, or need to report a lost item, we are just a call or message away. Our goal is to provide you with the best possible assistance in the shortest time."
            />
          )
        };
      case 'policy':
        return {
          title: 'Cancellation Policy',
          icon: <Shield className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Fair & Transparent"
              image="https://picsum.photos/seed/policy/800/600"
              description="We understand that plans can change. Our cancellation policy is designed to be fair to both our customers and our drivers. Cancellations made more than 2 hours before the scheduled pickup are free of charge. For later cancellations, a small fee may apply to compensate the driver for their time and fuel. We strive to make the process as easy as possible."
            />
          )
        };
      case 'deals':
        return {
          title: 'Deals & Offers',
          icon: <BadgeDollarSign className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Save on every ride"
              image="https://picsum.photos/seed/deals/800/600"
              description="Save more on your rides with our exclusive deals and seasonal offers. From first-ride discounts to loyalty rewards and referral bonuses, there are many ways to enjoy premium travel at even better prices. Sign up for our newsletter to stay updated on the latest promotions and never miss a chance to save on your next journey!"
            />
          )
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: <Shield className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Your data is safe"
              image="https://picsum.photos/seed/privacy/800/600"
              description="Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. We use your data to provide and improve our services, process payments, and communicate with you about your rides. We never sell your data to third parties and use industry-standard security measures."
            />
          )
        };
      case 'sitemap':
        return {
          title: 'Sitemap',
          icon: <FileText className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Navigate our site"
              image="https://picsum.photos/seed/sitemap/800/600"
              description="Our sitemap provides a structured overview of all the pages and services available on our website. Use it to quickly navigate to the information you need, from booking a ride to learning about our fleet and policies. We want your experience on our website to be as efficient as your rides with us."
            />
          )
        };
      case 'disclaimer':
        return {
          title: 'Disclaimer',
          icon: <AlertTriangle className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Legal Information"
              image="https://picsum.photos/seed/disclaimer/800/600"
              description="The information provided on this website is for general informational purposes only. While we strive to keep the information up to date and correct, we make no representations or warranties of any kind about the completeness, accuracy, or reliability of the website or the information contained on it. Use of the information is at your own risk."
            />
          )
        };
      case 'security':
        return {
          title: 'Security',
          icon: <Shield className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Safe & Secure"
              image="https://picsum.photos/seed/security/800/600"
              description="We take security seriously. Our platform uses industry-standard encryption and security protocols to protect your data and ensure safe transactions. We regularly monitor our systems for potential vulnerabilities and attacks, and we work with leading security experts to maintain the highest standards of safety for our users."
            />
          )
        };
      case 'one-way':
      case 'round-trip':
      case 'local-full-day':
      case 'luxury-rental':
      case 'wedding-rental':
      case 'business-rental':
      case 'bus-hire':
        const serviceTitles: Record<string, string> = {
          'one-way': 'One Way Trip',
          'round-trip': 'Round Trip',
          'local-full-day': 'Local Full Day Trip',
          'luxury-rental': 'Luxury Car Rental',
          'wedding-rental': 'Wedding Car Rental',
          'business-rental': 'Business Car Rental',
          'bus-hire': 'Bus Hire'
        };
        const serviceIcons: Record<string, React.ReactNode> = {
          'one-way': <Car />,
          'round-trip': <Globe />,
          'local-full-day': <Clock />,
          'luxury-rental': <Star />,
          'wedding-rental': <Heart />,
          'business-rental': <Briefcase />,
          'bus-hire': <Bus />
        };
        return {
          title: serviceTitles[type] || type,
          icon: <div className="text-orange-500">{serviceIcons[type] || <Car />}</div>,
          content: (
            <Section 
              title={`Premium ${serviceTitles[type] || type}`}
              image={`https://picsum.photos/seed/${type}/800/600`}
              description={`Our ${serviceTitles[type]?.toLowerCase() || type.replace('-', ' ')} service is designed to meet your specific travel needs. Whether you are planning a quick trip across town or need a specialized vehicle for a special event, we have you covered with professional drivers and high-quality vehicles. We ensure punctuality, comfort, and safety for every journey.`}
            />
          )
        };
      case 'cancel-booking':
        return {
          title: 'Cancel Booking',
          icon: <AlertTriangle className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Need to cancel?"
              image="https://picsum.photos/seed/cancel/800/600"
              description="Need to cancel your booking? You can do so through your dashboard or by contacting our support team. Please refer to our Cancellation Policy for information regarding potential fees. We understand that plans change and we aim to make the cancellation process as smooth as possible for you."
            />
          )
        };
      case 'pay-direct':
        return {
          title: 'Pay Direct',
          icon: <BadgeDollarSign className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Secure Payments"
              image="https://picsum.photos/seed/payment/800/600"
              description="Our Pay Direct feature allows you to settle your ride fare directly and securely through our platform. We support various payment methods including credit/debit cards, digital wallets, and more. Your transaction is protected by advanced encryption, ensuring your financial information remains private and safe."
            />
          )
        };
      case 'register':
        return {
          title: 'Register with CabGo',
          icon: <UserPlus className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Join our community"
              image="https://picsum.photos/seed/register/800/600"
              description="Create an account with CabGo today to enjoy a world of seamless travel. By registering, you can save your favorite locations, track your ride history, manage payments easily, and access exclusive member-only deals. Join thousands of happy riders and experience the best in modern transportation."
            />
          )
        };
      case 'services':
        return {
          title: 'Our Services',
          icon: <LayoutIcon className="text-orange-500" size={48} />,
          content: (
            <div className="space-y-12">
              <p className="text-lg text-zinc-600 text-center max-w-3xl mx-auto">We offer a wide range of transportation services tailored to meet your every need. From daily commutes to special events, CabGo is your reliable partner on the road.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { title: 'One Way Trip', icon: <Car />, desc: 'Simple and efficient point-to-point travel.' },
                  { title: 'Round Trip', icon: <Globe />, desc: 'Convenient return journeys for your day out.' },
                  { title: 'Local Full Day', icon: <Clock />, desc: 'Hire a car for the whole day for your local errands.' },
                  { title: 'Luxury Rental', icon: <Star />, desc: 'Travel in style with our premium luxury fleet.' },
                  { title: 'Wedding Rental', icon: <Heart />, desc: 'Make your special day even more memorable.' },
                  { title: 'Business Rental', icon: <Briefcase />, desc: 'Professional transport for your corporate needs.' }
                ].map((s, i) => (
                  <div key={i} className="p-8 bg-zinc-50 rounded-3xl border border-zinc-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 mb-6 shadow-sm">
                      {s.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                    <p className="text-zinc-500 text-sm">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        };
      case 'feedback':
        return {
          title: 'Feedback',
          icon: <MessageSquare className="text-orange-500" size={48} />,
          content: (
            <div className="max-w-4xl mx-auto space-y-12">
              <Section 
                title="We value your feedback"
                description="Your experience matters to us. Whether you had a great ride or think we can improve, we want to hear from you. Your feedback helps us maintain our high standards and provide better service to all our customers."
              />
              <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                <form className="space-y-4">
                  <div className="flex justify-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button key={i} type="button" className="text-amber-400 hover:scale-110 transition-transform">
                        <Star size={32} fill={i <= 4 ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Tell us about your experience..." 
                    rows={4} 
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none"
                  ></textarea>
                  <button className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">Submit Feedback</button>
                </form>
              </div>
            </div>
          )
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: <FileText className="text-orange-500" size={48} />,
          content: (
            <Section 
              title="Our Agreement"
              image="https://picsum.photos/seed/terms/800/600"
              description="By using CabGo, you agree to comply with our Terms & Conditions. These terms govern your use of our platform, including booking rides, payments, and user conduct. We reserve the right to update these terms at any time to reflect changes in our service or legal requirements. Please read them carefully to understand your rights and responsibilities."
            />
          )
        };
      default:
        const t = type as any;
        return {
          title: t.charAt(0).toUpperCase() + t.slice(1),
          icon: <Info className="text-orange-500" size={48} />,
          content: `This is the ${t} page. We are currently updating this section with more detailed information about our ${t} services. Please check back soon!`
        };
    }
  };

  const { title, icon, content } = getContent();

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mb-6">
          {icon}
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">{title}</h1>
        <div className="w-20 h-1.5 bg-orange-500 rounded-full"></div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="prose prose-zinc max-w-none"
      >
        {typeof content === 'string' ? (
          <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl mx-auto text-center">
            {content}
          </p>
        ) : (
          content
        )}
      </motion.div>
    </div>
  );
}
