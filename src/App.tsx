import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AirVent,
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Clock,
  Facebook,
  Fan,
  Gauge,
  Home as HomeIcon,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  ThermometerSun,
  TimerReset,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import './index.css';

type Service = {
  id: number;
  category: 'ac' | 'hvac';
  title: string;
  slug: string;
  description: string;
  benefits: string[];
  process: string[];
  faqs: { q: string; a: string }[];
  icon: string;
  sort_order: number;
  featured: boolean;
};

type GalleryItem = {
  id: number;
  title: string;
  category: string;
  image_url: string;
  video_url: string | null;
  alt_text: string;
  location: string;
};

type Review = {
  id: number;
  name: string;
  location: string;
  rating: number;
  service: string;
  review_text: string;
  before_after: string | null;
  is_featured: boolean;
};

type BlogPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  read_time: string;
  created_at: string;
};

type FAQ = { id: number; page: string; question: string; answer: string; sort_order: number };
type SiteContent = { id: number; section: string; title: string; subtitle: string | null; body: string | null; items: string[] | null; sort_order: number };

type SiteData = {
  services: Service[];
  gallery: GalleryItem[];
  reviews: Review[];
  posts: BlogPost[];
  faqs: FAQ[];
  content: SiteContent[];
};

type LeadFormState = {
  name: string;
  phone: string;
  email: string;
  service: string;
  city: string;
  preferred_date: string;
  message: string;
};

const emptyData: SiteData = { services: [], gallery: [], reviews: [], posts: [], faqs: [], content: [] };
const phoneNumber = '+919891765996';
const phoneNumberSecondary = '+919250604414';
const phoneDisplay = '+91 98917 65996';
const phoneSecondaryDisplay = '+91 92506 04414';
const whatsappNumber = '919891765996';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Prince Aircon, I want to book an AC / appliance service.')}`;
const facebookUrl = 'https://www.facebook.com/princeairconnoida';
const businessAddress = 'Shop No-10, City Plaza, Extension, Gaur City 2, Greater Noida, Uttar Pradesh 201009';
const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(businessAddress)}`;
const googleRating = { value: '4.9', reviews: '1,100+' };
const navItems = [
  ['Home', '/'],
  ['About', '/about'],
  ['AC Services', '/ac-services'],
  ['HVAC Solutions', '/hvac-solutions'],
  ['Gallery', '/gallery'],
  ['Reviews', '/reviews'],
  ['Blog', '/blog'],
  ['Contact', '/contact'],
];
const brands = ['Daikin', 'Voltas', 'LG', 'Samsung', 'Hitachi', 'Carrier', 'Blue Star', 'Panasonic', 'Lloyd'];
const areas = ['Gaur City 1', 'Gaur City 2', 'Noida Extension', 'Greater Noida West', 'Sector 16B & 16C', 'Techzone 4'];
const blogCategories = ['AC Maintenance', 'Energy Saving Tips', 'Summer Cooling', 'HVAC Guide', 'Indoor Air Quality', 'Buying Guide'];
const galleryFilters = ['all', 'installation', 'repair', 'commercial', 'residential', 'before-after', 'technician', 'video'];
const iconMap: Record<string, typeof Snowflake> = {
  snowflake: Snowflake,
  wrench: Wrench,
  fan: Fan,
  airvent: AirVent,
  gauge: Gauge,
  shield: ShieldCheck,
  building: Building2,
  home: HomeIcon,
  sparkles: Sparkles,
  zap: Zap,
  timer: TimerReset,
  award: Award,
};

// Fetch wrapper that guarantees a parsed JSON object or a clear error.
// It checks the response's content-type before calling res.json(), so a
// non-JSON response (e.g. the Vite dev server returning HTML or the raw
// source of an api/* function that never ran) produces an actionable
// message instead of a cryptic "Unexpected token ... is not valid JSON".
async function fetchJson<T = unknown>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = (await res.text().catch(() => '')).trim().replace(/\s+/g, ' ');
    const snippet = text.slice(0, 100);
    if (!res.ok) {
      throw new Error(`Request to ${input} failed (${res.status}). ${snippet}`);
    }
    throw new Error(
      `The API at ${input} did not return JSON. ` +
        `Make sure the api/ functions are running locally (see README: "npm run dev"). ` +
        (snippet ? `Received: "${snippet}"` : '')
    );
  }

  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    throw new Error(json?.error || `Request to ${input} failed (${res.status}).`);
  }
  return json;
}

function useSiteData() {
  const [data, setData] = useState<SiteData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const json = await fetchJson<SiteData>('/api/site-data');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

function contentBySection(content: SiteContent[], section: string) {
  return content.filter((item) => item.section === section);
}

function setMeta(title: string, description: string, path = '/') {
  document.title = `${title} | PRINCE AIRCON`;
  const ensure = (selector: string, attr: string, value: string) => {
    let el = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      if (selector.includes('property=')) el.setAttribute('property', selector.match(/\"(.+?)\"/)?.[1] || '');
      if (selector.includes('name=')) el.setAttribute('name', selector.match(/\"(.+?)\"/)?.[1] || '');
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };
  ensure('meta[name="description"]', 'content', description);
  ensure('meta[property="og:title"]', 'content', `${title} | PRINCE AIRCON`);
  ensure('meta[property="og:description"]', 'content', description);
  ensure('meta[property="og:type"]', 'content', 'website');
  ensure('meta[property="og:url"]', 'content', `${window.location.origin}${path}`);
}

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
      <div className="rounded-3xl bg-white p-8 shadow-xl text-center">
        <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#0D47A1]/20 border-t-[#FF9800]" />
        <p className="font-semibold text-[#0D47A1]">Loading PRINCE AIRCON services...</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-[55vh] flex items-center justify-center px-4">
      <div className="max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl">
        <ShieldCheck className="mx-auto mb-4 h-12 w-12 text-[#FF9800]" />
        <h2 className="text-2xl font-bold text-[#0D47A1]">We could not load content</h2>
        <p className="mt-2 text-slate-600">{message}</p>
        <button onClick={onRetry} className="mt-6 rounded-full bg-[#0D47A1] px-6 py-3 font-semibold text-white shadow-lg hover:bg-[#093575]">Try Again</button>
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <div className="bg-[#0D47A1] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-sm sm:flex-row">
          <span className="flex items-center gap-2 font-medium"><Zap className="h-4 w-4 text-[#FF9800]" /> Same Day AC & Appliance Service in Gaur City 2, Greater Noida West</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${phoneNumber}`} className="flex items-center gap-1 hover:text-[#FF9800]"><Phone className="h-4 w-4" /> {phoneDisplay}</a>
            <a href={`tel:${phoneNumberSecondary}`} className="hidden items-center gap-1 hover:text-[#FF9800] sm:flex"><Phone className="h-4 w-4" /> {phoneSecondaryDisplay}</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#FF9800]"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0D47A1] text-white shadow-lg shadow-blue-900/20"><Snowflake className="h-7 w-7" /></span>
            <span>
              <span className="block text-xl font-extrabold tracking-tight text-[#0D47A1]">PRINCE AIRCON</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#FF9800]">AC & HVAC Experts</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([label, path]) => (
              <NavLink key={path} to={path} className={({ isActive }) => `rounded-full px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-[#F5F7FA] text-[#0D47A1]' : 'text-slate-700 hover:bg-[#F5F7FA] hover:text-[#0D47A1]'}`}>{label}</NavLink>
            ))}
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/contact" className="rounded-full bg-[#FF9800] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-[#f08d00]">Book Service</Link>
            <a href={`tel:${phoneNumber}`} className="rounded-full border border-[#0D47A1] px-5 py-3 text-sm font-bold text-[#0D47A1] hover:bg-[#0D47A1] hover:text-white">Call Now</a>
          </div>
          <button className="rounded-2xl border border-slate-200 p-3 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-slate-100 bg-white lg:hidden">
              <div className="mx-auto grid max-w-7xl gap-2 px-4 py-4">
                {navItems.map(([label, path]) => <NavLink key={path} to={path} className="rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-[#F5F7FA]">{label}</NavLink>)}
                <Link to="/contact" className="rounded-2xl bg-[#FF9800] px-4 py-3 text-center font-bold text-white">Book Service</Link>
                <a href={`tel:${phoneNumber}`} className="rounded-2xl bg-[#0D47A1] px-4 py-3 text-center font-bold text-white">Call Now</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function Footer({ posts }: { posts: BlogPost[] }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    try {
      const data = await fetchJson<{ message?: string }>('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setEmail('');
      setStatus(data.message || 'Subscribed successfully.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Subscription failed.');
    }
  };
  return (
    <footer className="bg-[#071d42] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0D47A1]"><Snowflake /></span><div><h3 className="text-2xl font-extrabold">PRINCE AIRCON</h3><p className="text-sm text-blue-100">Professional AC Repair & HVAC Services</p></div></div>
          <p className="mt-5 leading-7 text-blue-100">Trusted local experts for AC repair, installation, servicing, gas filling, AC on rent and appliance repair across Gaur City 1 &amp; 2, Noida Extension and Greater Noida West.</p>
          <div className="mt-5 grid gap-2 text-sm text-blue-100">
            <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 hover:text-[#FF9800]"><Phone className="h-4 w-4 shrink-0" /> {phoneDisplay}</a>
            <a href={`tel:${phoneNumberSecondary}`} className="flex items-center gap-2 hover:text-[#FF9800]"><Phone className="h-4 w-4 shrink-0" /> {phoneSecondaryDisplay}</a>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {businessAddress}</p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3"><a className="rounded-full bg-[#FF9800] px-5 py-3 font-bold" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a className="rounded-full bg-white/10 px-5 py-3 font-bold" href={`tel:${phoneNumber}`}>Call Now</a><a className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-[#FF9800]" href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Prince Aircon on Facebook"><Facebook className="h-5 w-5" /></a></div>
        </div>
        <div><h4 className="mb-4 text-lg font-bold">Company</h4><div className="grid gap-2 text-blue-100">{navItems.map(([l, p]) => <Link key={p} to={p} className="hover:text-[#FF9800]">{l}</Link>)}<Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms-conditions">Terms & Conditions</Link><Link to="/sitemap">Sitemap</Link></div></div>
        <div><h4 className="mb-4 text-lg font-bold">Service Areas</h4><div className="grid gap-2 text-blue-100">{areas.map((area) => <span key={area}>{area}</span>)}</div></div>
        <div>
          <h4 className="mb-4 text-lg font-bold">Cooling Tips Newsletter</h4>
          <p className="mb-4 text-blue-100">Get seasonal AC maintenance and energy-saving tips.</p>
          <form onSubmit={subscribe} className="flex overflow-hidden rounded-2xl bg-white p-1"><input value={email} onChange={(e) => setEmail(e.target.value)} className="min-w-0 flex-1 px-4 text-slate-900 outline-none" placeholder="Email address" /><button className="rounded-xl bg-[#FF9800] px-4 py-3 font-bold">Join</button></form>
          {status && <p className="mt-3 text-sm text-blue-100">{status}</p>}
          <div className="mt-5 text-sm text-blue-100"><p className="font-semibold text-white">Latest Guide</p><p>{posts[0]?.title || 'AC Maintenance Guide'}</p></div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-sm text-blue-100">© {new Date().getFullYear()} PRINCE AIRCON. All rights reserved. Serving Gaur City 1 &amp; 2, Noida Extension, Greater Noida West and nearby areas.</div>
    </footer>
  );
}

function Layout({ children, posts }: { children: React.ReactNode; posts: BlogPost[] }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />
      <main>{children}</main>
      <Footer posts={posts} />
      <a href={whatsappUrl} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 grid h-16 w-16 place-items-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-700/30 transition hover:scale-105" aria-label="Chat on WhatsApp"><MessageCircle className="h-8 w-8" /></a>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle, center = true }: { eyebrow: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`mb-10 ${center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.25em] text-[#FF9800]">{eyebrow}</p>
      <h2 className="text-3xl font-extrabold tracking-tight text-[#0D47A1] md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg leading-8 text-slate-600">{subtitle}</p>}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F7FA] via-white to-blue-50">
      <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-[#FF9800]/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0D47A1] shadow-sm"><BadgeCheck className="h-4 w-4 text-[#FF9800]" /> Trusted AC & appliance experts in Gaur City 2</div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#082b63] md:text-6xl">AC Repair, Installation & Appliance Services in Greater Noida West</h1>
          <p className="mt-6 text-xl leading-9 text-slate-600">Fast, affordable and reliable AC installation, repair, maintenance and HVAC solutions for residential and commercial customers.</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row"><Link to="/contact" className="rounded-full bg-[#FF9800] px-8 py-4 text-center font-extrabold text-white shadow-xl shadow-orange-500/25 hover:bg-[#f08d00]">Book Service</Link><a href={`tel:${phoneNumber}`} className="rounded-full bg-[#0D47A1] px-8 py-4 text-center font-extrabold text-white shadow-xl shadow-blue-900/20 hover:bg-[#093575]">Call Now</a></div>
          <div className="mt-9 grid grid-cols-3 gap-4">
            {[[`${googleRating.value}★`, `${googleRating.reviews} Reviews`], [`${googleRating.reviews}`, 'Happy Customers'], ['Same Day', 'Service']].map(([a, b]) => <div key={b} className="rounded-3xl bg-white p-5 text-center shadow-lg"><p className="text-2xl font-extrabold text-[#0D47A1]">{a}</p><p className="text-sm font-semibold text-slate-500">{b}</p></div>)}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative">
          <div className="absolute -left-6 -top-6 rounded-3xl bg-[#0D47A1] p-5 text-white shadow-xl"><ThermometerSun className="h-8 w-8 text-[#FF9800]" /><p className="mt-2 font-bold">24/7 Emergency</p></div>
          <img className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl" src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80" alt="Technician repairing wall mounted air conditioner in Noida home" loading="eager" />
          <div className="absolute -bottom-6 right-6 rounded-3xl bg-white p-5 shadow-xl"><p className="font-extrabold text-[#0D47A1]">Certified Engineers</p><p className="text-sm text-slate-600">Genuine parts • Fair pricing</p></div>
        </motion.div>
      </div>
    </section>
  );
}

function StatsTrust() {
  const stats = [
    [`${googleRating.reviews}`, 'Trusted Customers', ShieldCheck],
    [`${googleRating.value}★`, `Google Rating (${googleRating.reviews} reviews)`, Star],
    ['45 min', 'Typical Response Time', Clock],
    ['9+', 'Premium Brands Serviced', Award],
  ];
  return <section className="bg-[#0D47A1] py-8 text-white"><div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([value, label, Icon]) => <motion.div whileHover={{ y: -4 }} key={String(label)} className="rounded-3xl bg-white/10 p-6 backdrop-blur"><Icon className="mb-3 h-7 w-7 text-[#FF9800]" /><p className="text-3xl font-extrabold">{String(value)}</p><p className="text-blue-100">{String(label)}</p></motion.div>)}</div></section>;
}

function ServicesGrid({ services, category, limit }: { services: Service[]; category?: 'ac' | 'hvac'; limit?: number }) {
  const filtered = services.filter((s) => !category || s.category === category).slice(0, limit || services.length);
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{filtered.map((service) => {
    const Icon = iconMap[service.icon] || Wrench;
    return <motion.article whileHover={{ y: -7 }} key={service.id} className="rounded-[1.75rem] border border-slate-100 bg-white p-7 shadow-lg shadow-slate-900/5"><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#F5F7FA] text-[#0D47A1]"><Icon className="h-7 w-7" /></div><h3 className="text-xl font-extrabold text-[#0D47A1]">{service.title}</h3><p className="mt-3 leading-7 text-slate-600">{service.description}</p><ul className="mt-5 grid gap-2">{service.benefits.slice(0, 3).map((b) => <li key={b} className="flex gap-2 text-sm font-medium text-slate-700"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#FF9800]" />{b}</li>)}</ul><Link to={category === 'hvac' ? '/hvac-solutions' : '/ac-services'} className="mt-6 inline-flex font-extrabold text-[#FF9800]">View Details</Link></motion.article>;
  })}</div>;
}

function WhyChoose() {
  const items = [
    ['Certified Engineers', 'Trained technicians for split AC, window AC and commercial HVAC.', BadgeCheck],
    ['Transparent Pricing', 'Clear diagnosis, upfront quote and no hidden service charges.', ShieldCheck],
    ['Genuine Spare Parts', 'Reliable replacement parts for long-lasting cooling performance.', Award],
    ['Fast Local Response', 'Quick service across Gaur City 1 & 2, Noida Extension and Greater Noida West.', TimerReset],
  ];
  return <section className="bg-[#F5F7FA] py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="Why choose us" title="Trustworthy service engineered for comfort" subtitle="PRINCE AIRCON combines local speed, technical discipline and customer-first communication." /> <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{items.map(([title, text, Icon]) => <div key={String(title)} className="rounded-3xl bg-white p-7 shadow-lg"><Icon className="mb-5 h-9 w-9 text-[#FF9800]" /><h3 className="text-lg font-extrabold text-[#0D47A1]">{String(title)}</h3><p className="mt-3 leading-7 text-slate-600">{String(text)}</p></div>)}</div></div></section>;
}

function Process() {
  const steps = [['Request Service', 'Call, WhatsApp or submit the appointment form.'], ['Expert Diagnosis', 'Technician checks cooling, gas pressure, coils and electricals.'], ['Upfront Quote', 'You approve transparent pricing before work starts.'], ['Repair & Testing', 'We complete service, test cooling and share care tips.']];
  return <section className="py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="How we work" title="A simple, professional service process" /><div className="grid gap-6 md:grid-cols-4">{steps.map(([title, text], i) => <div key={title} className="relative rounded-3xl border border-slate-100 bg-white p-7 shadow-lg"><span className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#0D47A1] font-extrabold text-white">{i + 1}</span><h3 className="font-extrabold text-[#0D47A1]">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section>;
}

function BrandsAreas() {
  return <section className="bg-white py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="Brands & locations" title="Brands we service across Gaur City 2 & Greater Noida West" subtitle="Daikin, Voltas, LG, Samsung, Hitachi, Carrier, Blue Star, Panasonic, Lloyd and more." /><div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-9">{brands.map((brand) => <div key={brand} className="rounded-2xl border border-slate-100 bg-[#F5F7FA] p-4 text-center font-extrabold text-[#0D47A1]">{brand}</div>)}</div><div className="mt-10 flex flex-wrap justify-center gap-3">{areas.map((area) => <span key={area} className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-[#0D47A1]"><MapPin className="mr-1 inline h-4 w-4 text-[#FF9800]" />{area}</span>)}</div></div></section>;
}

function AMCSection() {
  const plans = [['Essential AMC', 'For homes and small offices', '2 preventive services', 'Priority scheduling'], ['Premium AMC', 'For frequent AC users', '4 preventive services', 'Gas pressure checks'], ['Commercial AMC', 'For offices, shops and facilities', 'Custom visits', 'Dedicated support']];
  return <section className="bg-[#F5F7FA] py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="AMC plans" title="Annual Maintenance Contracts that prevent breakdowns" subtitle="Reduce energy bills, protect compressors and maintain healthy indoor air with planned maintenance." /><div className="grid gap-6 md:grid-cols-3">{plans.map(([name, desc, a, b]) => <div key={name} className="rounded-[2rem] bg-white p-8 shadow-xl"><h3 className="text-2xl font-extrabold text-[#0D47A1]">{name}</h3><p className="mt-2 text-slate-600">{desc}</p><div className="my-6 h-px bg-slate-100" /><p className="flex gap-2 font-semibold"><CheckCircle2 className="text-[#FF9800]" />{a}</p><p className="mt-3 flex gap-2 font-semibold"><CheckCircle2 className="text-[#FF9800]" />{b}</p><Link to="/contact" className="mt-7 block rounded-full bg-[#0D47A1] px-5 py-3 text-center font-bold text-white">Get AMC Quote</Link></div>)}</div></div></section>;
}

function Testimonials({ reviews }: { reviews: Review[] }) {
  const featured = reviews.filter((r) => r.is_featured).slice(0, 6);
  return <section className="py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="Customer testimonials" title={`Rated ${googleRating.value}★ by ${googleRating.reviews} customers across Greater Noida West`} /><div className="grid gap-6 md:grid-cols-3">{featured.map((review) => <article key={review.id} className="rounded-[1.75rem] bg-white p-7 shadow-xl shadow-slate-900/5"><div className="mb-4 flex text-[#FF9800]">{Array.from({ length: Math.round(review.rating) }).map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}</div><p className="leading-7 text-slate-700">“{review.review_text}”</p><div className="mt-6"><p className="font-extrabold text-[#0D47A1]">{review.name}</p><p className="text-sm text-slate-500">{review.service} • {review.location}</p></div></article>)}</div></div></section>;
}

function FAQAccordion({ faqs, page = 'home' }: { faqs: FAQ[]; page?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const list = faqs.filter((f) => f.page === page || (page === 'home' && f.page === 'general')).slice(0, 8);
  return <div className="mx-auto max-w-4xl">{list.map((faq, i) => <div key={faq.id} className="mb-4 rounded-3xl border border-slate-100 bg-white shadow-sm"><button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-6 text-left font-extrabold text-[#0D47A1]"><span>{faq.question}</span><ChevronDown className={`shrink-0 transition ${open === i ? 'rotate-180' : ''}`} /></button><AnimatePresence>{open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-6 pb-6 leading-7 text-slate-600">{faq.answer}</p></motion.div>}</AnimatePresence></div>)}</div>;
}

function StrongCTA() {
  return <section className="px-4 py-20"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#0D47A1] p-10 text-white shadow-2xl md:p-14"><div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="font-extrabold uppercase tracking-[0.25em] text-[#FF9800]">Need urgent cooling?</p><h2 className="mt-3 text-3xl font-extrabold md:text-5xl">Book a certified AC technician today.</h2><p className="mt-4 max-w-2xl text-blue-100">Same day AC repair, installation, servicing, gas filling, AC on rent and appliance repair across Gaur City 1 &amp; 2, Noida Extension and Greater Noida West.</p></div><div className="flex flex-col gap-3 sm:flex-row"><Link to="/contact" className="rounded-full bg-[#FF9800] px-8 py-4 text-center font-extrabold">Book Service</Link><a href={`tel:${phoneNumber}`} className="rounded-full bg-white px-8 py-4 text-center font-extrabold text-[#0D47A1]">Call Now</a></div></div></div></section>;
}

function HomePage({ data }: { data: SiteData }) {
  useEffect(() => setMeta('AC Repair & Appliance Services in Gaur City 2, Greater Noida West', 'Book Prince Aircon for AC repair, installation, servicing, gas filling, AC on rent and geyser, washing machine & refrigerator repair in Gaur City 1 & 2, Noida Extension and Greater Noida West.', '/'), []);
  return <><JsonLd data={localBusinessSchema(data.reviews)} /><Hero /><StatsTrust /><section className="py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="Our services" title="Complete AC repair and HVAC solutions" subtitle="From split AC repair and gas refilling to commercial HVAC installation and maintenance." /><ServicesGrid services={data.services} limit={6} /></div></section><WhyChoose /><Process /><BrandsAreas /><section className="py-20"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2"><div><SectionHeader eyebrow="Residential & commercial" title="Comfort solutions for homes, offices, factories and retail spaces" subtitle="Our team handles single-room AC service, multi-split installations, ducted HVAC, ventilation and AMC plans." center={false} /><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-3xl bg-[#F5F7FA] p-6"><HomeIcon className="mb-3 text-[#FF9800]" /><h3 className="font-extrabold text-[#0D47A1]">Residential Services</h3><p className="mt-2 text-sm text-slate-600">Apartments, villas, builder floors and societies.</p></div><div className="rounded-3xl bg-[#F5F7FA] p-6"><BriefcaseBusiness className="mb-3 text-[#FF9800]" /><h3 className="font-extrabold text-[#0D47A1]">Commercial Services</h3><p className="mt-2 text-sm text-slate-600">Offices, clinics, restaurants, showrooms and factories.</p></div></div></div><img className="rounded-[2rem] shadow-2xl" src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1100&q=80" alt="Commercial HVAC technician inspecting indoor unit" loading="lazy" /></div></section><AMCSection /><Testimonials reviews={data.reviews} /><section className="bg-[#F5F7FA] py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="FAQ" title="Common AC service questions" /><FAQAccordion faqs={data.faqs} /></div></section><StrongCTA /></>;
}

function AboutPage({ data }: { data: SiteData }) {
  useEffect(() => setMeta('About Us - Certified AC & Appliance Engineers', 'Learn about Prince Aircon, customer-first AC and home appliance service experts in Gaur City 2, Greater Noida West with certified engineers, genuine parts and transparent pricing.', '/about'), []);
  return <SubPageHero eyebrow="About PRINCE AIRCON" title="Experienced AC & appliance engineers serving Gaur City 2 & Greater Noida West" text="We are a local service company built around fast response, skilled diagnosis and honest communication." image="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80"><section className="py-20"><div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2"><div><SectionHeader center={false} eyebrow="Mission & vision" title="Reliable cooling, healthier air and better customer experiences" subtitle="Our mission is to make AC and HVAC service simple, transparent and dependable for every household and business in our service areas." /><p className="leading-8 text-slate-600">PRINCE AIRCON provides split AC repair, window AC repair, AC installation, gas refilling, deep cleaning, PCB repair, compressor support, duct work and commercial HVAC maintenance. Our customer-first approach means every visit includes proper inspection, clear explanations and workmanship-focused service.</p></div><div className="grid gap-5 sm:grid-cols-2">{['Certified engineers', 'Transparent pricing', 'Genuine spare parts', 'Fast response', 'Safety-first work', 'AMC expertise'].map((item) => <div key={item} className="rounded-3xl bg-[#F5F7FA] p-6"><CheckCircle2 className="mb-3 text-[#FF9800]" /><h3 className="font-extrabold text-[#0D47A1]">{item}</h3></div>)}</div></div></section><StatsTrust /><WhyChoose /><Testimonials reviews={data.reviews} /><StrongCTA /></SubPageHero>;
}

function SubPageHero({ eyebrow, title, text, image, children }: { eyebrow: string; title: string; text: string; image: string; children: React.ReactNode }) {
  return <><section className="bg-gradient-to-br from-[#F5F7FA] to-white py-16"><div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2"><div><p className="mb-3 font-extrabold uppercase tracking-[0.25em] text-[#FF9800]">{eyebrow}</p><h1 className="text-4xl font-extrabold tracking-tight text-[#0D47A1] md:text-6xl">{title}</h1><p className="mt-6 text-xl leading-9 text-slate-600">{text}</p><div className="mt-8 flex gap-3"><Link to="/contact" className="rounded-full bg-[#FF9800] px-6 py-3 font-bold text-white">Book Service</Link><a href={`tel:${phoneNumber}`} className="rounded-full bg-[#0D47A1] px-6 py-3 font-bold text-white">Call Now</a></div></div><img src={image} alt={title} loading="lazy" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl" /></div></section>{children}</>;
}

function ACServicesPage({ data }: { data: SiteData }) {
  useEffect(() => setMeta('AC Services - Split AC Repair, Gas Filling & Installation Noida', 'Detailed AC services including Split AC Repair, Window AC Repair, AC Installation Noida, AC Gas Filling Noida, deep cleaning, PCB and compressor repair.', '/ac-services'), []);
  const acServices = data.services.filter((s) => s.category === 'ac');
  return <SubPageHero eyebrow="AC Services" title="AC repair, installation, gas refilling and AMC in Noida" text="Professional service cards for every common cooling issue, delivered by trained local technicians." image="https://images.unsplash.com/photo-1631545806609-418d96bfb2f9?auto=format&fit=crop&w=1200&q=80"><section className="py-20"><div className="mx-auto max-w-7xl px-4"><div className="grid gap-8">{acServices.map((service) => <DetailedService key={service.id} service={service} />)}</div></div></section><section className="bg-[#F5F7FA] py-20"><SectionHeader eyebrow="AC FAQ" title="Answers before you book" /><FAQAccordion faqs={data.faqs} page="ac" /></section><StrongCTA /></SubPageHero>;
}

function DetailedService({ service }: { service: Service }) {
  const Icon = iconMap[service.icon] || Wrench;
  return <article id={service.slug} className="rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#F5F7FA] text-[#0D47A1]"><Icon className="h-8 w-8" /></div><h2 className="text-3xl font-extrabold text-[#0D47A1]">{service.title}</h2><p className="mt-4 leading-8 text-slate-600">{service.description}</p><Link to="/contact" className="mt-6 inline-block rounded-full bg-[#FF9800] px-6 py-3 font-bold text-white">Book {service.title}</Link></div><div className="grid gap-6 md:grid-cols-3"><div><h3 className="mb-3 font-extrabold text-[#0D47A1]">Benefits</h3>{service.benefits.map((b) => <p key={b} className="mb-2 flex gap-2 text-sm text-slate-700"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#FF9800]" />{b}</p>)}</div><div><h3 className="mb-3 font-extrabold text-[#0D47A1]">Process</h3>{service.process.map((p, i) => <p key={p} className="mb-2 text-sm text-slate-700"><b>{i + 1}.</b> {p}</p>)}</div><div><h3 className="mb-3 font-extrabold text-[#0D47A1]">Service FAQ</h3>{service.faqs.slice(0, 2).map((f) => <div key={f.q} className="mb-3"><p className="text-sm font-bold text-slate-800">{f.q}</p><p className="text-sm text-slate-600">{f.a}</p></div>)}</div></div></div></article>;
}

function HVACPage({ data }: { data: SiteData }) {
  useEffect(() => setMeta('HVAC Solutions - Commercial HVAC in Greater Noida West', 'HVAC installation, repair, duct installation, ventilation, office HVAC, factory HVAC and maintenance for businesses in Gaur City 2 and Greater Noida West.', '/hvac-solutions'), []);
  const hvac = data.services.filter((s) => s.category === 'hvac');
  return <SubPageHero eyebrow="HVAC Solutions" title="Commercial, industrial and office HVAC services" text="End-to-end HVAC installation, repair, ducting, ventilation and maintenance support for businesses in Greater Noida West." image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80"><section className="py-20"><div className="mx-auto max-w-7xl px-4"><ServicesGrid services={data.services} category="hvac" /></div></section><section className="bg-[#F5F7FA] py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="Industries served" title="HVAC expertise for high-performance facilities" /><div className="grid gap-5 md:grid-cols-5">{['Offices', 'Factories', 'Clinics', 'Restaurants', 'Showrooms'].map((item) => <div key={item} className="rounded-3xl bg-white p-6 text-center font-extrabold text-[#0D47A1] shadow-lg"><Building2 className="mx-auto mb-3 text-[#FF9800]" />{item}</div>)}</div></div></section><section className="py-20"><div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2"><div>{hvac.slice(0, 4).map((service) => <DetailedService key={service.id} service={service} />)}</div><LeadForm title="Request HVAC Enquiry" leadType="hvac_enquiry" services={hvac.map((s) => s.title)} /></div></section><StrongCTA /></SubPageHero>;
}

function GalleryPage({ data }: { data: SiteData }) {
  const [filter, setFilter] = useState('all');
  useEffect(() => setMeta('Gallery - AC Installation, Repair & HVAC Project Photos', 'Filter AC repair, installation, commercial HVAC, residential service, technician and before-after gallery from PRINCE AIRCON.', '/gallery'), []);
  const items = filter === 'all' ? data.gallery : data.gallery.filter((g) => g.category === filter);
  return <SubPageHero eyebrow="Gallery" title="Installation, repair and commercial HVAC project gallery" text="View real categories of our AC and appliance service work across Gaur City 2 and Greater Noida West." image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"><section className="py-20"><div className="mx-auto max-w-7xl px-4"><div className="mb-8 flex flex-wrap justify-center gap-3">{galleryFilters.map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-5 py-3 font-bold capitalize ${filter === f ? 'bg-[#0D47A1] text-white' : 'bg-[#F5F7FA] text-[#0D47A1]'}`}>{f.replace('-', ' ')}</button>)}</div><div className="grid gap-6 md:grid-cols-3">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl"><img src={item.image_url} alt={item.alt_text} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="p-5"><p className="text-xs font-extrabold uppercase tracking-widest text-[#FF9800]">{item.category}</p><h2 className="mt-2 font-extrabold text-[#0D47A1]">{item.title}</h2><p className="mt-1 text-sm text-slate-500">{item.location}</p>{item.video_url && <a className="mt-4 inline-flex font-bold text-[#FF9800]" href={item.video_url} target="_blank" rel="noreferrer">Watch project video</a>}</div></article>)}</div></div></section></SubPageHero>;
}

function ReviewsPage({ data, refetch }: { data: SiteData; refetch: () => void }) {
  useEffect(() => setMeta('Reviews - 4.9 Star Rated AC & Appliance Service', 'Read customer reviews, success stories and before-after cases for Prince Aircon — rated 4.9 stars by 1,100+ customers across Gaur City 2 and Greater Noida West.', '/reviews'), []);
  return <SubPageHero eyebrow="Reviews" title="Customer testimonials and service success stories" text="A 4.9-star service reputation built on punctual response, clean workmanship and reliable cooling results." image="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80"><section className="bg-[#F5F7FA] py-16"><div className="mx-auto max-w-7xl px-4 text-center"><p className="text-6xl font-extrabold text-[#0D47A1]">{googleRating.value}★</p><p className="mt-2 text-lg font-semibold text-slate-600">Google rating from {googleRating.reviews} customers for AC &amp; appliance service in Gaur City 2, Greater Noida West</p></div></section><Testimonials reviews={data.reviews} /><section className="py-20"><div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-2"><div className="grid gap-5">{data.reviews.map((r) => <div key={r.id} className="rounded-3xl bg-white p-6 shadow-lg"><h3 className="font-extrabold text-[#0D47A1]">{r.service} in {r.location}</h3><p className="mt-2 text-slate-600">{r.before_after || r.review_text}</p><p className="mt-3 font-semibold text-[#FF9800]">— {r.name}</p></div>)}</div><ReviewForm refetch={refetch} /></div></section><StrongCTA /></SubPageHero>;
}

function BlogPage({ data }: { data: SiteData }) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  useEffect(() => setMeta('Blog - AC Maintenance, Energy Saving & HVAC Guide', 'SEO-friendly AC maintenance, energy saving tips, summer cooling, HVAC guide, indoor air quality and buying guide articles.', '/blog'), []);
  const posts = data.posts.filter((p) => (category === 'all' || p.category === category) && `${p.title} ${p.excerpt}`.toLowerCase().includes(query.toLowerCase()));
  return <SubPageHero eyebrow="Blog CMS" title="AC maintenance, energy saving and HVAC guides" text="Helpful local SEO content for better cooling performance, lower bills and smarter buying decisions." image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80"><section className="py-20"><div className="mx-auto max-w-7xl px-4"><div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto]"><label className="flex items-center gap-3 rounded-2xl bg-[#F5F7FA] px-4"><Search className="text-[#0D47A1]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cooling tips" className="w-full bg-transparent py-4 outline-none" /></label><div className="flex flex-wrap gap-2"><button onClick={() => setCategory('all')} className={`rounded-full px-4 py-2 font-bold ${category === 'all' ? 'bg-[#0D47A1] text-white' : 'bg-[#F5F7FA]'}`}>All</button>{blogCategories.map((c) => <button key={c} onClick={() => setCategory(c)} className={`rounded-full px-4 py-2 font-bold ${category === c ? 'bg-[#0D47A1] text-white' : 'bg-[#F5F7FA]'}`}>{c}</button>)}</div></div><div className="grid gap-6 md:grid-cols-3">{posts.map((post) => <article key={post.id} className="overflow-hidden rounded-[1.75rem] bg-white shadow-xl"><img src={post.image_url} alt={`${post.title} by PRINCE AIRCON`} loading="lazy" className="aspect-[4/3] w-full object-cover" /><div className="p-6"><p className="text-sm font-bold text-[#FF9800]">{post.category} • {post.read_time}</p><h2 className="mt-3 text-xl font-extrabold text-[#0D47A1]">{post.title}</h2><p className="mt-3 leading-7 text-slate-600">{post.excerpt}</p><details className="mt-4"><summary className="cursor-pointer font-extrabold text-[#FF9800]">Read article</summary><p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{post.content}</p></details></div></article>)}</div></div></section></SubPageHero>;
}

function ContactPage({ data, refetch }: { data: SiteData; refetch: () => void }) {
  useEffect(() => setMeta('Contact - Book AC Repair & Appliance Service in Gaur City 2', 'Contact Prince Aircon at Shop No-10, City Plaza, Extension, Gaur City 2, Greater Noida. Call +91 98917 65996 or +91 92506 04414 to book AC repair, installation, gas filling and appliance service.', '/contact'), []);
  const serviceNames = data.services.map((s) => s.title);
  return <SubPageHero eyebrow="Contact" title="Book appointment or emergency AC service" text="Call, WhatsApp or submit the form. Our team will confirm your time slot quickly." image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"><section className="py-20"><div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_1.2fr]"><div className="space-y-5"><ContactCard icon={Phone} title="Call (Primary)" text={phoneDisplay} href={`tel:${phoneNumber}`} /><ContactCard icon={Phone} title="Call (Alternate)" text={phoneSecondaryDisplay} href={`tel:${phoneNumberSecondary}`} /><ContactCard icon={MessageCircle} title="WhatsApp" text={`Instant booking & support · ${phoneDisplay}`} href={whatsappUrl} /><ContactCard icon={MapPin} title="Address" text={businessAddress} href={mapsUrl} /><ContactCard icon={Facebook} title="Facebook" text="facebook.com/princeairconnoida" href={facebookUrl} />{/* TODO: Business Hours hidden until owner confirms opening hours — restore this card with the confirmed timings. <ContactCard icon={Clock} title="Business Hours" text="Mon-Sun: 8:00 AM - 10:00 PM | Emergency support available" /> */}</div><LeadForm title="Book Appointment" leadType="service_booking" services={serviceNames} onSuccess={refetch} /></div></section><section className="bg-[#F5F7FA] py-20"><div className="mx-auto max-w-7xl px-4"><SectionHeader eyebrow="Find us" title="Service coverage map" /><div className="overflow-hidden rounded-[2rem] shadow-2xl"><iframe title="PRINCE AIRCON Gaur City 2 Greater Noida service area map" src={`https://maps.google.com/maps?q=${encodeURIComponent(businessAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} className="h-[420px] w-full border-0" loading="lazy" /></div></div></section></SubPageHero>;
}

function ContactCard({ icon: Icon, title, text, href }: { icon: typeof Phone; title: string; text: string; href?: string }) {
  const body = <div className="flex gap-4 rounded-3xl bg-white p-6 shadow-lg"><Icon className="h-7 w-7 shrink-0 text-[#FF9800]" /><div><h3 className="font-extrabold text-[#0D47A1]">{title}</h3><p className="mt-1 text-slate-600">{text}</p></div></div>;
  return href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{body}</a> : body;
}

function LeadForm({ title, leadType, services, onSuccess }: { title: string; leadType: string; services: string[]; onSuccess?: () => void }) {
  const [form, setForm] = useState<LeadFormState>({ name: '', phone: '', email: '', service: services[0] || '', city: '', preferred_date: '', message: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => setForm((f) => ({ ...f, service: f.service || services[0] || '' })), [services]);
  const update = (field: keyof LeadFormState, value: string) => setForm((f) => ({ ...f, [field]: value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setStatus('');
    if (!form.name || !form.phone || !form.service || !form.city) return setError('Please fill name, phone, service and city.');
    setSubmitting(true);
    try {
      await fetchJson('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, lead_type: leadType }) });
      setStatus('Thank you. PRINCE AIRCON will contact you shortly.');
      setForm({ name: '', phone: '', email: '', service: services[0] || '', city: '', preferred_date: '', message: '' });
      onSuccess?.();
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong.'); } finally { setSubmitting(false); }
  };
  return <form onSubmit={submit} className="rounded-[2rem] bg-white p-7 shadow-2xl"><h2 className="text-3xl font-extrabold text-[#0D47A1]">{title}</h2><div className="mt-6 grid gap-4 md:grid-cols-2"><Input label="Name" value={form.name} onChange={(v) => update('name', v)} required /><Input label="Phone" value={form.phone} onChange={(v) => update('phone', v)} required /><Input label="Email" value={form.email} onChange={(v) => update('email', v)} type="email" /><label className="grid gap-2 text-sm font-bold text-slate-700">Service<select value={form.service} onChange={(e) => update('service', e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0D47A1]">{services.map((s) => <option key={s}>{s}</option>)}</select></label><Input label="City / Sector" value={form.city} onChange={(v) => update('city', v)} required /><Input label="Preferred Date" value={form.preferred_date} onChange={(v) => update('preferred_date', v)} type="date" /><label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">Message<textarea value={form.message} onChange={(e) => update('message', e.target.value)} className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0D47A1]" placeholder="Tell us your AC/HVAC issue" /></label></div>{error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}{status && <p className="mt-4 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">{status}</p>}<button disabled={submitting} className="mt-6 w-full rounded-full bg-[#FF9800] px-6 py-4 font-extrabold text-white disabled:opacity-60">{submitting ? 'Submitting...' : 'Submit Booking'}</button></form>;
}

function Input({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-bold text-slate-700">{label}<input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-[#0D47A1]" /></label>;
}

function ReviewForm({ refetch }: { refetch: () => void }) {
  const [form, setForm] = useState({ name: '', location: '', rating: '5', service: '', review_text: '' });
  const [message, setMessage] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    try {
      await fetchJson('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setMessage('Review submitted. Thank you for trusting PRINCE AIRCON.');
      setForm({ name: '', location: '', rating: '5', service: '', review_text: '' });
      refetch();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not submit review.');
    }
  };
  return <form onSubmit={submit} className="h-fit rounded-[2rem] bg-[#F5F7FA] p-7"><h2 className="text-3xl font-extrabold text-[#0D47A1]">Leave Review</h2><div className="mt-6 grid gap-4"><Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required /><Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} required /><Input label="Service" value={form.service} onChange={(v) => setForm({ ...form, service: v })} required /><label className="grid gap-2 text-sm font-bold text-slate-700">Rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label><label className="grid gap-2 text-sm font-bold text-slate-700">Review<textarea required value={form.review_text} onChange={(e) => setForm({ ...form, review_text: e.target.value })} className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3" /></label></div>{message && <p className="mt-4 text-sm font-semibold text-[#0D47A1]">{message}</p>}<button className="mt-6 rounded-full bg-[#0D47A1] px-6 py-3 font-bold text-white">Submit Review</button></form>;
}

function PolicyPage({ type }: { type: 'privacy' | 'terms' }) {
  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
  useEffect(() => setMeta(title, `${title} for PRINCE AIRCON AC and HVAC service website.`, `/${type === 'privacy' ? 'privacy-policy' : 'terms-conditions'}`), [title, type]);
  return <section className="bg-[#F5F7FA] py-20"><div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-xl"><h1 className="text-4xl font-extrabold text-[#0D47A1]">{title}</h1><div className="mt-8 space-y-6 leading-8 text-slate-600"><p>PRINCE AIRCON collects contact and service details only to respond to AC repair, AC installation, servicing, gas filling and appliance repair enquiries across Gaur City 1 &amp; 2, Noida Extension and Greater Noida West.</p><h2 className="text-2xl font-extrabold text-[#0D47A1]">Information & service use</h2><p>Customers should provide accurate contact, address and equipment details. Quotes may vary after technician inspection, spare part requirements or site conditions.</p><h2 className="text-2xl font-extrabold text-[#0D47A1]">Data protection</h2><p>Form submissions are stored securely in our database and used for appointment coordination, service follow-up, quality improvement and relevant maintenance reminders.</p><h2 className="text-2xl font-extrabold text-[#0D47A1]">Payments, warranties and liability</h2><p>Service warranty depends on the nature of work and parts used. PRINCE AIRCON is not liable for pre-existing equipment faults, unsafe wiring or third-party modifications.</p><h2 className="text-2xl font-extrabold text-[#0D47A1]">Contact</h2><p>For privacy or service terms questions, contact PRINCE AIRCON by phone, WhatsApp or the website contact form.</p></div></div></section>;
}

function SitemapPage({ data }: { data: SiteData }) {
  useEffect(() => setMeta('HTML Sitemap', 'HTML sitemap for PRINCE AIRCON pages, services and blog posts.', '/sitemap'), []);
  return <section className="py-20"><div className="mx-auto max-w-5xl px-4"><h1 className="text-5xl font-extrabold text-[#0D47A1]">Sitemap</h1><div className="mt-10 grid gap-8 md:grid-cols-3"><div><h2 className="mb-3 font-extrabold text-[#FF9800]">Pages</h2>{navItems.map(([l, p]) => <Link key={p} className="block py-1 text-[#0D47A1]" to={p}>{l}</Link>)}</div><div><h2 className="mb-3 font-extrabold text-[#FF9800]">Services</h2>{data.services.map((s) => <Link key={s.id} className="block py-1 text-[#0D47A1]" to={s.category === 'hvac' ? '/hvac-solutions' : '/ac-services'}>{s.title}</Link>)}</div><div><h2 className="mb-3 font-extrabold text-[#FF9800]">Blog</h2>{data.posts.map((p) => <Link key={p.id} className="block py-1 text-[#0D47A1]" to="/blog">{p.title}</Link>)}</div></div></div></section>;
}

function NotFoundPage() {
  useEffect(() => setMeta('404 - Page Not Found', 'The PRINCE AIRCON page you requested could not be found.', '/404'), []);
  return <section className="grid min-h-[65vh] place-items-center bg-[#F5F7FA] px-4 text-center"><div><p className="text-8xl font-extrabold text-[#FF9800]">404</p><h1 className="mt-4 text-4xl font-extrabold text-[#0D47A1]">Cooling page not found</h1><p className="mt-3 text-slate-600">The page may have moved. Book service or return home.</p><Link to="/" className="mt-8 inline-block rounded-full bg-[#0D47A1] px-7 py-4 font-bold text-white">Back to Home</Link></div></section>;
}

function localBusinessSchema(reviews: Review[]) {
  return { '@context': 'https://schema.org', '@type': 'HVACBusiness', name: 'Prince Aircon', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80', telephone: [phoneNumber, phoneNumberSecondary], areaServed: areas, address: { '@type': 'PostalAddress', streetAddress: 'Shop No-10, City Plaza, Extension, Gaur City 2', addressLocality: 'Greater Noida', addressRegion: 'Uttar Pradesh', postalCode: '201009', addressCountry: 'IN' }, aggregateRating: { '@type': 'AggregateRating', ratingValue: googleRating.value, reviewCount: Math.max(reviews.length, 1100) }, priceRange: '₹₹', sameAs: [facebookUrl, whatsappUrl] };
}

function AppRoutes() {
  const { data, loading, error, refetch } = useSiteData();
  const faqSchema = useMemo(() => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: data.faqs.slice(0, 8).map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) }), [data.faqs]);
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  return <Layout posts={data.posts}><JsonLd data={faqSchema} /><Routes><Route path="/" element={<HomePage data={data} />} /><Route path="/about" element={<AboutPage data={data} />} /><Route path="/ac-services" element={<ACServicesPage data={data} />} /><Route path="/hvac-solutions" element={<HVACPage data={data} />} /><Route path="/gallery" element={<GalleryPage data={data} />} /><Route path="/reviews" element={<ReviewsPage data={data} refetch={refetch} />} /><Route path="/blog" element={<BlogPage data={data} />} /><Route path="/contact" element={<ContactPage data={data} refetch={refetch} />} /><Route path="/privacy-policy" element={<PolicyPage type="privacy" />} /><Route path="/terms-conditions" element={<PolicyPage type="terms" />} /><Route path="/sitemap" element={<SitemapPage data={data} />} /><Route path="*" element={<NotFoundPage />} /></Routes></Layout>;
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
