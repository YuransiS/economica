'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MousePointer2, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Calendar,
  Clock,
  ChevronRight,
  User,
  Phone,
  ArrowRight,
  Activity,
  History,
  Tag,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  DollarSign,
  Copy,
  Check,
  ExternalLink,
  Send,
  LogOut
} from 'lucide-react';

interface Lead {
  date?: string;
  name?: string;
  phone?: string;
  telegram?: string;
  tariff?: string;
  orderId?: string;
  status?: string;
  visitorId?: string;
  "Дата та час": string;
  "Ім'я": string;
  "Телефон": string;
  "Telegram": string;
  "Тариф": string;
  "Номер замовлення": string;
  "Статус оплати": string;
  "Visitor ID": string;
  "Customer Journey": string;
  "First UTM Source": string;
  "Last UTM Source": string;
  _sheet: string;
  _originalData?: any;
  [key: string]: any;
}

interface Traffic {
  date?: string;
  visitorId?: string;
  "Дата та час": string;
  "Visitor ID": string;
  "Шлях": string;
  "IP": string;
  "User Agent": string;
  "UTM Source": string;
  [key: string]: any;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);
  const [localComment, setLocalComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      setLeads(data.leads || []);
      setTraffic(data.traffic || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Analytics & Filtering Logic ---
  const [filterDate, setFilterDate] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLeadsAdvanced = leads
    .filter(l => {
      // Search
      const searchLower = search.toLowerCase();
      const name = (l.name || l["Ім'я"] || '').toString().toLowerCase();
      const phone = (l.phone || l["Телефон"] || '').toString();
      const vId = (l.visitorId || l["Visitor ID"] || '').toString();
      if (search && !name.includes(searchLower) && !phone.includes(search) && !vId.includes(search)) return false;

      // Date
      const dateObj = new Date(l.date || l["Дата"] || l["Дата та час"] || 0);
      const now = new Date();
      if (filterDate === 'today' && now.toDateString() !== dateObj.toDateString()) return false;
      if (filterDate === 'week' && (now.getTime() - dateObj.getTime()) > 7 * 24 * 60 * 60 * 1000) return false;
      if (filterDate === 'month' && (now.getTime() - dateObj.getTime()) > 30 * 24 * 60 * 60 * 1000) return false;

      // Status
      const hasStatusColumn = l.status !== undefined || l["Статус оплати"] !== undefined || l["Статус"] !== undefined;
      const status = (l.status || l["Статус оплати"] || l["Статус"])?.toString().toLowerCase() || '';
      if (filterStatus === 'paid' && !status.includes('оплачено')) return false;
      if (filterStatus === 'unpaid') {
        if (!hasStatusColumn) return false;
        if (status.includes('оплачено')) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || a["Дата"] || a["Дата та час"] || 0).getTime();
      const dateB = new Date(b.date || b["Дата"] || b["Дата та час"] || 0).getTime();
      return dateB - dateA;
    });

  // Unique leads grouping
  const normalizePhone = (p: any) => p?.toString().replace(/\D/g, '') || '';
  const normalizeTg = (t: any) => t?.toString().toLowerCase().replace('@', '').trim() || '';

  const uniqueLeads: (Lead & { _allSheets: string[] })[] = [];
  const seenIdentifiers = new Map<string, any>();
  
  filteredLeadsAdvanced.forEach(l => {
    const phone = normalizePhone(l.phone || l["Телефон"]);
    const tg = normalizeTg(l.telegram || l["Telegram"] || l["Телеграм"] || l["Телега"]);
    const identifier = phone || tg || l.visitorId || l["Visitor ID"];
    
    if (identifier) {
      if (!seenIdentifiers.has(identifier)) {
        const leadWithSheets = { ...l, _allSheets: [l._sheet], _selectionId: identifier };
        seenIdentifiers.set(identifier, leadWithSheets);
        uniqueLeads.push(leadWithSheets);
      } else {
        const existing = seenIdentifiers.get(identifier);
        if (existing && !existing._allSheets.includes(l._sheet)) {
          existing._allSheets.push(l._sheet);
        }
      }
    } else {
      const fallbackId = `temp-${Math.random()}`;
      uniqueLeads.push({ ...l, _allSheets: [l._sheet], _selectionId: fallbackId });
    }
  });

  const leadsToday = uniqueLeads.filter(l => {
    const d = new Date(l.date || l["Дата"] || l["Дата та час"]);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const getStatusColor = (status: any) => {
    const s = (status || '').toString().toLowerCase().trim();
    if (s.includes('не оплачено')) return 'text-white/20'; // Grayish
    if (s.includes('оплачено')) return 'text-[#81D8D0] shadow-[0_0_10px_rgba(129,216,208,0.2)]';
    if (s.includes('відхилено') || s.includes('скасовано') || s.includes('rejected')) return 'text-rose-500 font-medium'; // Clear Red
    if (s.includes('бронь') || s.includes('очікує')) return 'text-amber-400/80'; // Yellowish
    return 'text-white/40'; // Default
  };

  const getLeadRevenue = (lead: Lead) => {
    const status = (lead.status || lead["Статус оплати"] || lead["Статус"])?.toString().toLowerCase() || '';
    if (!status.includes('оплачено') && !status.includes('бронь')) return { uah: 0, usd: 0, isPro: false, isVip: false };
    
    const tariff = (lead.tariff || lead["Тариф"] || lead["Пакет"])?.toString() || '';
    
    if (tariff.toUpperCase().includes('VIP') || tariff.toUpperCase().includes('ВІП')) return { uah: 0, usd: 39, isPro: false, isVip: true };
    if (tariff.toUpperCase().includes('PRO') || tariff.toUpperCase().includes('ПРО')) return { uah: 0, usd: 19, isPro: true, isVip: false };
    
    if (tariff.includes('Invest Baby')) return { uah: 490, usd: 0, isPro: false, isVip: false };
    if (tariff.includes('Business Baby')) return { uah: 890, usd: 0, isPro: false, isVip: false };
    if (tariff.includes('Finance Baby')) return { uah: 1990, usd: 0, isPro: false, isVip: false };
    
    // Default for bookings or unknown paid leads
    return { uah: 1000, usd: 0, isPro: false, isVip: false }; 
  };

  const revenueStats = filteredLeadsAdvanced.reduce((acc, lead) => {
    const { uah, usd, isPro, isVip } = getLeadRevenue(lead);
    acc.uah += uah;
    acc.usd += usd;
    if (isPro) acc.proCount++;
    if (isVip) acc.vipCount++;
    return acc;
  }, { uah: 0, usd: 0, proCount: 0, vipCount: 0 });

  const getUtmStats = (field: string) => {
    const stats = filteredLeadsAdvanced.reduce((acc, lead) => {
      const val = lead[field] || lead[field.toLowerCase()] || 'Direct / Unknown';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const [activeUtmTab, setActiveUtmTab] = useState('utm_source');

  const [updating, setUpdating] = useState(false);

  const updateLeadStatus = async (newStatus: string) => {
    if (!selectedLead) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          targetSheet: selectedLead._sheet,
          orderId: selectedLead.orderId || selectedLead["Номер замовлення"] || selectedLead.visitorId,
          status: newStatus
        })
      });
      const result = await res.json();
      if (result.result === 'success') {
        setLeads(prev => prev.map(l => 
          (l.orderId === selectedLead.orderId && l.orderId) || (l.visitorId === selectedLead.visitorId)
            ? { ...l, status: newStatus, "Статус оплати": newStatus } 
            : l
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const saveComment = async () => {
    if (!selectedLead) return;
    setSavingComment(true);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_comment',
          targetSheet: selectedLead._sheet,
          orderId: selectedLead.orderId || selectedLead["Номер замовлення"] || selectedLead.visitorId,
          comment: localComment
        })
      });
      const result = await res.json();
      if (result.result === 'success') {
        setLeads(prev => prev.map(l => 
          (l.orderId === selectedLead.orderId && l.orderId) || (l.visitorId === selectedLead.visitorId)
            ? { ...l, comment: localComment, "Коментар": localComment } 
            : l
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingComment(false);
    }
  };

  useEffect(() => {
    if (selectedLead) {
      setLocalComment(selectedLead.comment || selectedLead["Коментар"] || '');
    }
  }, [selectedVisitorId]);

  const [filterSource, setFilterSource] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  const finalFilteredLeads = uniqueLeads.filter(l => {
    if (filterSource !== 'all' && !l._allSheets.includes(filterSource)) return false;
    if (filterPlan !== 'all') {
      const plan = (l.tariff || l["Тариф"] || l["Пакет"] || '').toUpperCase();
      if (!plan.includes(filterPlan)) return false;
    }
    return true;
  });

  const selectedLead = uniqueLeads.find(l => l._selectionId === selectedVisitorId);
  const visitorTraffic = traffic.filter(t => {
    const vId = t.visitorId || t["Visitor ID"];
    return vId === selectedVisitorId || vId === selectedLead?.visitorId || vId === selectedLead?.["Visitor ID"];
  });

  // Group traffic by session (simplified: same day)
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('uk-UA');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4E0000] border-t-[#81D8D0]" />
          <p className="text-white/50 font-medium animate-pulse">Завантаження аналітики...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-montserrat">
      {/* Header & Filters */}
      <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center justify-between xl:justify-start gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
              Economica <span className="text-[#81D8D0]">Insights</span>
            </h1>
            <p className="text-white/40 mt-1">Панель керування лідами та розширена аналітика</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-3 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-2xl text-white/40 hover:text-red-500 transition-all active:scale-95"
            title="Вийти"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <select 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-[#81D8D0]/50 text-sm font-bold text-white/80"
          >
            <option value="all" className="bg-[#050505]">За весь час</option>
            <option value="today" className="bg-[#050505]">За сьогодні</option>
            <option value="week" className="bg-[#050505]">За тиждень</option>
            <option value="month" className="bg-[#050505]">За місяць</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-[#81D8D0]/50 text-sm font-bold text-white/80"
          >
            <option value="all" className="bg-[#050505]">Всі статуси</option>
            <option value="paid" className="bg-[#050505]">Лише оплачені</option>
            <option value="unpaid" className="bg-[#050505]">Не оплачені</option>
          </select>

          <select 
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-[#81D8D0]/50 text-sm font-bold text-white/80"
          >
            <option value="all" className="bg-[#050505]">Всі джерела</option>
            {[...new Set(uniqueLeads.flatMap(l => l._allSheets))].map(s => (
              <option key={s} value={s} className="bg-[#050505]">{s}</option>
            ))}
          </select>

          <select 
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:border-[#81D8D0]/50 text-sm font-bold text-white/80"
          >
            <option value="all" className="bg-[#050505]">Всі тарифи</option>
            <option value="PRO" className="bg-[#050505]">PRO</option>
            <option value="VIP" className="bg-[#050505]">VIP</option>
          </select>

          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-[#81D8D0] transition-colors" />
            <input 
              type="text" 
              placeholder="Пошук по імені, телефону чи ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#81D8D0]/50 focus:ring-1 focus:ring-[#81D8D0]/20 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<Users className="text-[#81D8D0]" />}
          label="Унікальних лідів"
          value={uniqueLeads.length}
          sub={`З ${filteredLeadsAdvanced.length} заявок`}
        />
        <StatCard 
          icon={<DollarSign className="text-yellow-400" />}
          label="Дохід (USD)"
          value={`$${revenueStats.usd.toLocaleString()}`}
          sub="PRO та VIP тарифи"
        />
        <StatCard 
          icon={<CreditCard className="text-purple-400" />}
          label="Ліди сьогодні"
          value={leadsToday}
          sub="Нові унікальні контакти"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#4E0000] flex items-center justify-center text-[#FBCBDA]">
              <span className="font-black">P</span>
            </div>
            <div>
              <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs mb-1">PRO Тарифи ($19)</h4>
              <p className="text-3xl font-black text-[#FBCBDA]">{revenueStats.proCount}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#FBCBDA]/50 uppercase tracking-wider mb-1">Сума</p>
            <p className="text-2xl font-black">${revenueStats.proCount * 19}</p>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#81D8D0]/10 flex items-center justify-center text-[#81D8D0]">
              <span className="font-black">V</span>
            </div>
            <div>
              <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs mb-1">VIP Тарифи ($39)</h4>
              <p className="text-3xl font-black text-[#81D8D0]">{revenueStats.vipCount}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-[#81D8D0]/50 uppercase tracking-wider mb-1">Сума</p>
            <p className="text-2xl font-black">${revenueStats.vipCount * 39}</p>
          </div>
        </div>
      </div>

      {/* Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <BarChart3 className="text-[#81D8D0]" size={20} />
              <h3 className="text-lg font-bold uppercase tracking-wider">Трекери лідів (UTM)</h3>
            </div>
            <div className="flex bg-black/40 rounded-xl p-1 p-1">
              {[
                { id: 'utm_source', label: 'Джерело' },
                { id: 'utm_campaign', label: 'Кампанія' },
                { id: 'utm_medium', label: 'Тип' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveUtmTab(tab.id)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all ${activeUtmTab === tab.id ? 'bg-[#4E0000] text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {getUtmStats(activeUtmTab).map(([name, count]) => (
              <div key={name} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-white/60 truncate max-w-[200px]">{name}</span>
                  <span className="text-[#81D8D0]">{count} лідів</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / Math.max(1, filteredLeadsAdvanced.length)) * 100}%` }}
                    className="h-full bg-gradient-to-r from-[#4E0000] to-[#81D8D0] rounded-full"
                  />
                </div>
              </div>
            ))}
            {filteredLeadsAdvanced.length === 0 && <p className="text-center py-10 text-white/20 italic">Дані для аналізу відсутні</p>}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <PieChartIcon className="text-green-400" size={20} />
            <h3 className="text-lg font-bold uppercase tracking-wider">Розподіл за типом</h3>
          </div>
          
          <div className="space-y-6 flex-1">
            {[...new Set(filteredLeadsAdvanced.map(l => l._sheet))].map(sheet => {
              const count = filteredLeadsAdvanced.filter(l => l._sheet === sheet).length;
              const percentage = ((count / Math.max(1, filteredLeadsAdvanced.length)) * 100).toFixed(0);
              return (
                <div key={sheet} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#81D8D0]/20 transition-colors">
                  <div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-tighter mb-1">{sheet}</p>
                    <p className="font-black text-xl">{count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#81D8D0] font-bold">{percentage}%</p>
                    <p className="text-[9px] text-white/20 uppercase font-bold">Частка</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-bold uppercase tracking-wider text-sm text-white/60">Список користувачів</h2>
            <button onClick={fetchData} className="text-xs text-[#81D8D0] hover:underline font-bold">Оновити дані</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white/30 text-xs uppercase font-bold">
                  <th className="px-6 py-4">Користувач</th>
                  <th className="px-6 py-4">Контакти</th>
                  <th className="px-6 py-4">Тариф / Статус</th>
                  <th className="px-6 py-4">Остання дія</th>
                  <th className="px-6 py-4 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {finalFilteredLeads.map((lead, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setSelectedVisitorId(lead._selectionId)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4E0000] to-black border border-white/10 flex items-center justify-center text-white font-bold">
                          {(lead.name || lead["Ім'я"])?.[0] || <User size={20} />}
                        </div>
                        <div>
                          <p className="font-bold">{lead.name || lead["Ім'я"] || 'Невідомо'}</p>
                          <p className="text-[10px] text-white/20 font-mono uppercase">{(lead.visitorId || lead["Visitor ID"])?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Phone Row */}
                        <div className="flex items-center gap-2 group/phone">
                          <span className="text-sm font-medium text-white/80">{lead.phone || lead["Телефон"] || '—'}</span>
                          {lead.phone && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const p = lead.phone || lead["Телефон"];
                                if (p) {
                                  navigator.clipboard.writeText(p.toString());
                                }
                              }}
                              className="opacity-0 group-hover/phone:opacity-100 transition-opacity p-1 hover:text-[#81D8D0]"
                              title="Копіювати номер"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                        
                        {/* Telegram Row */}
                        <div>
                          {(() => {
                            const tg = lead.telegram || lead["Telegram"] || lead["Телеграм"] || lead["Телега"];
                            if (!tg || tg === '—') return null;
                            const cleanTg = tg.toString().replace('@', '').trim();
                            return (
                              <a 
                                href={`https://t.me/${cleanTg}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-[#81D8D0] hover:text-white transition-colors text-xs font-medium"
                              >
                                <Send size={12} className="opacity-50" />
                                {tg}
                              </a>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white/80 border border-white/5">
                          {lead.tariff || lead["Тариф"] || lead["Пакет"] || '—'}
                        </div>
                        {lead.status !== undefined || lead["Статус оплати"] !== undefined || lead["Статус"] !== undefined ? (
                          <p className={`text-xs font-bold ${getStatusColor(lead.status || lead["Статус оплати"] || lead["Статус"])}`}>
                            {lead.status || lead["Статус оплати"] || lead["Статус"] || 'Очікує'}
                          </p>
                        ) : (
                          <p className="text-[10px] uppercase font-bold text-white/20 tracking-wider">—</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <Clock size={14} />
                        {formatDate(lead.date || lead["Дата"] || lead["Дата та час"])}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                      <div className="text-right">
                          <div className="flex flex-wrap justify-end gap-1 mb-1">
                            {lead._allSheets.map(s => (
                              <span key={s} className="block text-[8px] text-white/40 bg-white/5 px-1 rounded uppercase tracking-tighter font-bold">{s}</span>
                            ))}
                          </div>
                          <span className="block text-[9px] text-white/10 font-mono">#{lead.orderId || lead["Номер замовлення"] || 'N/A'}</span>
                          {(lead.comment || lead["Коментар"]) && (
                            <span title="Є коментар">
                              <Activity size={10} className="text-[#81D8D0] mt-1" />
                            </span>
                          )}
                        </div>
                        <button className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-[#81D8D0] group-hover:text-black transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Card Modal */}
      <AnimatePresence>
        {selectedVisitorId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVisitorId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#0F0F0F] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]"
            >
              {/* Left Column: User Info */}
              <div className="w-full md:w-[350px] bg-white/5 p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/10 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#4E0000] to-black border border-white/20 flex items-center justify-center text-2xl font-bold">
                    {selectedLead?.["Ім'я"]?.[0] || 'U'}
                  </div>
                  {(selectedLead?.status !== undefined || selectedLead?.["Статус оплати"] !== undefined || selectedLead?.["Статус"] !== undefined) && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">Статус</p>
                      <select 
                        value={selectedLead?.status || selectedLead?.["Статус оплати"] || selectedLead?.["Статус"] || ''} 
                        disabled={updating}
                        onChange={(e) => updateLeadStatus(e.target.value)}
                        className="bg-transparent text-sm font-bold appearance-none cursor-pointer focus:outline-none text-right block w-full"
                      >
                        <option value="Оплачено" className="bg-[#0F0F0F] text-green-400">Оплачено</option>
                        <option value="Не оплачено" className="bg-[#0F0F0F] text-red-400">Не оплачено</option>
                        <option value="Відхилено" className="bg-[#0F0F0F] text-red-600">Відхилено</option>
                        <option value="Скасовано" className="bg-[#0F0F0F] text-red-600">Скасовано</option>
                        {!(selectedLead?.status || selectedLead?.["Статус оплати"] || selectedLead?.["Статус"]) && (
                          <option value="" className="bg-[#0F0F0F] text-orange-400">Очікує</option>
                        )}
                      </select>
                      {updating && <div className="h-0.5 w-full bg-[#81D8D0] animate-pulse mt-1" />}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black uppercase leading-none">{selectedLead?.name || selectedLead?.["Ім'я"] || 'Anonymous User'}</h3>
                    <p className="text-white/30 text-[10px] mt-2 font-mono">{selectedVisitorId}</p>
                  </div>

                  <div className="space-y-3">
                    <InfoRow 
                      icon={<Phone size={16} />} 
                      label="Телефон" 
                      value={selectedLead?.phone || selectedLead?.["Телефон"] || '—'} 
                      isCopyable
                    />
                    <InfoRow 
                      icon={<Send size={16} />} 
                      label="Telegram" 
                      value={selectedLead?.telegram || selectedLead?.["Telegram"] || selectedLead?.["Телеграм"] || '—'} 
                      isTelegram
                      color="text-[#81D8D0]" 
                    />
                    <InfoRow icon={<Tag size={16} />} label="Тариф" value={selectedLead?.tariff || selectedLead?.["Тариф"] || '—'} />
                  </div>

                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="pt-6 border-t border-white/10 space-y-6">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-white/30 mb-3 tracking-widest">UTM Джерела</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedLead?.utm_source || selectedLead?.["Last UTM Source"]) && <Badge text={selectedLead.utm_source || selectedLead["Last UTM Source"]} />}
                          {(selectedLead?.utm_medium || selectedLead?.["Last UTM Medium"]) && <Badge text={selectedLead.utm_medium || selectedLead["Last UTM Medium"]} />}
                          {(selectedLead?.utm_campaign || selectedLead?.["Last UTM Campaign"]) && <Badge text={selectedLead.utm_campaign || selectedLead["Last UTM Campaign"]} />}
                        </div>
                      </div>

                      {(selectedLead?.journey || selectedLead?.["Customer Journey"]) && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-white/30 mb-3 tracking-widest">Шлях клієнта (GAS)</p>
                          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                            <p className="text-xs text-white/60 leading-relaxed italic font-medium">
                              {selectedLead.journey || selectedLead["Customer Journey"]}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <p className="text-[10px] uppercase font-bold text-white/30 mb-3 tracking-widest">Нотатки менеджера</p>
                        <div className="relative group">
                          <textarea 
                            value={localComment}
                            onChange={(e) => setLocalComment(e.target.value)}
                            placeholder="Додайте коментар по клієнту..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/80 focus:outline-none focus:border-[#81D8D0]/50 min-h-[100px] resize-none transition-all"
                          />
                          <button 
                            onClick={saveComment}
                            disabled={savingComment || localComment === (selectedLead?.comment || selectedLead?.["Коментар"] || '')}
                            className="absolute bottom-3 right-3 px-4 py-2 bg-[#81D8D0] text-black text-[10px] font-bold rounded-xl opacity-0 group-focus-within:opacity-100 disabled:opacity-0 transition-all hover:scale-105 active:scale-95"
                          >
                            {savingComment ? 'Збереження...' : 'Зберегти'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                <button 
                  onClick={() => setSelectedVisitorId(null)}
                  className="mt-auto pt-8 w-full text-center text-white/30 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
                >
                  Закрити картку
                </button>
              </div></div>

              {/* Right Column: Timeline & Journey */}
              <div className="flex-1 p-8 overflow-y-auto bg-black/40">
                <div className="flex items-center gap-4 mb-8">
                  <Activity className="text-[#81D8D0]" size={20} />
                  <h3 className="text-lg font-bold uppercase tracking-wider">Історія взаємодії</h3>
                </div>

                <div className="space-y-8 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" />

                  {/* Combined Timeline: Traffic + ALL matching Lead Events */}
                  {([...visitorTraffic, ...filteredLeadsAdvanced.filter(l => {
                    const phone = normalizePhone(l.phone || l["Телефон"]);
                    const tg = normalizeTg(l.telegram || l["Telegram"] || l["Телеграм"] || l["Телега"]);
                    const identifier = phone || tg || l.visitorId || l["Visitor ID"];
                    return identifier === selectedVisitorId;
                  })] as any[])
                    .sort((a, b) => new Date(b.date || b["Дата та час"] || b["Дата"] || 0).getTime() - new Date(a.date || a["Дата та час"] || a["Дата"] || 0).getTime())
                    .map((event, i) => {
                      const isLead = event._sheet;
                      return (
                        <div key={i} className="relative pl-10">
                          <div className={`absolute left-0 top-1 h-8 w-8 rounded-full border border-white/20 flex items-center justify-center z-10 ${isLead ? 'bg-[#4E0000] border-[#4E0000]' : 'bg-[#151515]'}`}>
                            {isLead ? <CreditCard size={14} /> : <MousePointer2 size={14} />}
                          </div>
                          <div>
                            <p className="text-[10px] text-white/30 font-bold mb-1">{formatDate(event.date || event["Дата та час"] || event["Дата"])}</p>
                            {isLead ? (
                              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="font-bold text-sm">Створення заявки</p>
                                <p className="text-xs text-white/50 mt-1">Аркуш: {event._sheet}</p>
                                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[#81D8D0]">
                                  <ArrowRight size={12} /> {event.tariff || event["Тариф"] || event["Пакет"]} | {event.status || event["Статус оплати"] || event["Статус"]}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <div>
                                  <p className="font-medium text-sm text-white/80">Перегляд сторінки</p>
                                  <p className="text-xs text-white/30 font-mono">{event.path || event["Шлях"]}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ExternalLink size={14} className="text-white/20" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                  {visitorTraffic.length === 0 && !selectedLead && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/20">
                      <History size={48} className="mb-4 opacity-50" />
                      <p className="font-bold uppercase tracking-widest text-xs">Історія порожня</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, sub: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
          {icon}
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-black">{value}</p>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  color = "text-white/70", 
  isCopyable = false,
  isTelegram = false
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  color?: string,
  isCopyable?: boolean,
  isTelegram?: boolean
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value && value !== '—') {
      navigator.clipboard.writeText(value.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tgLink = isTelegram && value && value !== '—' 
    ? `https://t.me/${value.toString().replace('@', '').trim()}` 
    : null;

  return (
    <div className="flex items-center gap-3 group/info">
      <div className="text-white/20">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] uppercase font-bold text-white/20 tracking-tighter leading-none mb-1">{label}</p>
        <div className="flex items-center gap-2">
          {tgLink ? (
            <a 
              href={tgLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`text-sm font-medium ${color} hover:text-white transition-colors truncate flex items-center gap-1.5`}
            >
              {value}
              <ExternalLink size={10} className="opacity-40" />
            </a>
          ) : (
            <p className={`text-sm font-medium ${color} truncate`}>{value}</p>
          )}

          {isCopyable && value && value !== '—' && (
            <button 
              onClick={handleCopy}
              className="p-1 hover:bg-white/5 rounded transition-colors"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} className="text-white/10 hover:text-white/40 transition-opacity" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-bold text-white/40 border border-white/10">
      {text}
    </span>
  );
}
