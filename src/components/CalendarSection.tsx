import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Building2,
  Tag,
  Search,
  Bell,
  BellRing,
  Filter,
  ExternalLink,
  Sparkles,
  Flame,
  Radio,
  Trophy,
  Mic,
  Music,
  Eye,
  EyeOff,
  Settings,
  X,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarCategory, CalendarEvent } from '../types';
import { AppSection } from './Navbar';

interface CalendarSectionProps {
  onNavigateToSection?: (section: AppSection) => void;
}

export const CalendarSection: React.FC<CalendarSectionProps> = ({ onNavigateToSection }) => {
  const {
    currentUser,
    userProfile,
    survivals,
    releases,
    awards,
    showToast,
    primaryButtonColor
  } = useApp();

  const isAdmin = userProfile.accountType === 'admin';

  // Calendar events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 10, 1)); // Default Nov 2026

  // View state
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'upcoming' | 'timeline'>('month');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual Event Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState<CalendarCategory>('especial');
  const [eventStartDate, setEventStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventTime, setEventTime] = useState('18:00');
  const [eventCompany, setEventCompany] = useState('YM-ki Records');
  const [eventRelatedLink, setEventRelatedLink] = useState('');
  const [eventRelatedSection, setEventRelatedSection] = useState('foros');
  const [eventIsPrivate, setEventIsPrivate] = useState(false);

  // Reminder preferences modal
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [pref24h, setPref24h] = useState(userProfile.calendarPreferences?.notify24hBefore ?? true);
  const [pref1h, setPref1h] = useState(userProfile.calendarPreferences?.notify1hBefore ?? true);
  const [prefStart, setPrefStart] = useState(userProfile.calendarPreferences?.notifyOnStart ?? true);
  const [prefEnd, setPrefEnd] = useState(userProfile.calendarPreferences?.notifyOnEnd ?? false);
  const [prefTimeZone, setPrefTimeZone] = useState(
    userProfile.calendarPreferences?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  // Subscribed event IDs
  const [subscribedEvents, setSubscribedEvents] = useState<string[]>(
    userProfile.subscribedEventIds || []
  );

  // Fetch calendar events
  const loadEvents = async () => {
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        if (data.events) {
          setEvents(data.events);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Compute all unified events: automated from modules + manual
  const allUnifiedEvents = useMemo(() => {
    const list: CalendarEvent[] = [...events];

    // Automate from Releases
    releases.forEach((rel) => {
      const exists = list.some((e) => e.sourceId === rel.id && e.sourceModule === 'releases');
      if (!exists && rel.releaseDate) {
        list.push({
          id: 'auto-rel-' + rel.id,
          name: `Lanzamiento: ${rel.title} - ${rel.artist}`,
          image: rel.thumbnail || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400',
          description: rel.description || 'Lanzamiento musical oficial en YM-ki Records.',
          category: 'album',
          startDate: rel.releaseDate.split('T')[0],
          endDate: rel.releaseDate.split('T')[0],
          time: '00:00',
          company: 'YM-ki Records',
          relatedSection: 'lanzamientos',
          isPrivate: false,
          createdBy: 'Sistema',
          isAutomated: true,
          sourceModule: 'releases',
          sourceId: rel.id,
          createdAt: rel.createdAt || new Date().toISOString()
        });
      }
    });

    // Automate from Survivals
    survivals.forEach((surv) => {
      const exists = list.some((e) => e.sourceId === surv.id && e.sourceModule === 'survival');
      if (!exists) {
        list.push({
          id: 'auto-surv-' + surv.id,
          name: `Survival: ${surv.title}`,
          image: surv.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
          description: surv.description || 'Competencia oficial de talentos.',
          category: 'survival',
          startDate: surv.createdAt ? surv.createdAt.split('T')[0] : '2026-11-01',
          endDate: '2026-12-15',
          time: '20:00',
          company: 'YM-ki Studios',
          relatedSection: 'survival',
          isPrivate: false,
          createdBy: surv.createdBy || 'Sistema',
          isAutomated: true,
          sourceModule: 'survival',
          sourceId: surv.id,
          createdAt: surv.createdAt || new Date().toISOString()
        });
      }
    });

    // Automate from Awards
    awards.forEach((aw) => {
      const exists = list.some((e) => e.sourceId === aw.id && e.sourceModule === 'awards');
      if (!exists && aw.startDate) {
        list.push({
          id: 'auto-aw-' + aw.id,
          name: aw.title,
          image: aw.banner || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
          description: aw.description || 'Gala de premiación anual oficial.',
          category: 'premiacion',
          startDate: aw.startDate.split('T')[0],
          endDate: aw.endDate ? aw.endDate.split('T')[0] : aw.startDate.split('T')[0],
          time: '21:00',
          company: 'YM-ki Records',
          relatedSection: 'premiaciones',
          isPrivate: false,
          createdBy: aw.createdBy || 'Sistema',
          isAutomated: true,
          sourceModule: 'awards',
          sourceId: aw.id,
          createdAt: aw.createdAt || new Date().toISOString()
        });
      }
    });

    return list;
  }, [events, releases, survivals, awards]);

  // Companies list for filter
  const companiesList = useMemo(() => {
    const set = new Set<string>();
    allUnifiedEvents.forEach((e) => {
      if (e.company) set.add(e.company);
    });
    return Array.from(set);
  }, [allUnifiedEvents]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allUnifiedEvents.filter((ev) => {
      if (ev.isPrivate && !isAdmin && ev.createdBy !== currentUser) return false;
      if (selectedCategory !== 'all' && ev.category !== selectedCategory) return false;
      if (selectedCompany !== 'all' && ev.company !== selectedCompany) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = ev.name.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchComp = ev.company.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchComp) return false;
      }
      return true;
    });
  }, [allUnifiedEvents, selectedCategory, selectedCompany, searchQuery, isAdmin, currentUser]);

  const handleToggleSubscribe = async (eventId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/calendar/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser, eventId })
      });
      const data = await res.json();
      if (data.success) {
        setSubscribedEvents(data.subscribedEventIds || []);
        showToast(
          data.subscribed
            ? '🔔 Recordatorio programado para este evento.'
            : '🔕 Recordatorio cancelado.'
        );
      }
    } catch {
      showToast('Error al modificar recordatorio.');
    }
  };

  const handleSavePreferences = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/calendar/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          preferences: {
            notify24hBefore: pref24h,
            notify1hBefore: pref1h,
            notifyOnStart: prefStart,
            notifyOnEnd: prefEnd,
            timeZone: prefTimeZone
          }
        })
      });
      showToast('Preferencias de recordatorios guardadas.');
      setIsPreferencesModalOpen(false);
    } catch {
      showToast('Error al guardar preferencias.');
    }
  };

  const handleCreateEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim() || !eventStartDate) {
      showToast('Completa el nombre y la fecha.');
      return;
    }

    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: eventName,
          image: eventImage,
          description: eventDescription,
          category: eventCategory,
          startDate: eventStartDate,
          endDate: eventEndDate || eventStartDate,
          time: eventTime,
          company: eventCompany,
          relatedLink: eventRelatedLink,
          relatedSection: eventRelatedSection,
          isPrivate: eventIsPrivate,
          createdBy: currentUser
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Evento añadido al calendario oficial.');
        setIsCreateModalOpen(false);
        loadEvents();
      } else {
        showToast(data.error || 'Error al crear evento.');
      }
    } catch {
      showToast('Error de conexión.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('¿Eliminar este evento del calendario?')) return;
    try {
      await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
      showToast('Evento eliminado.');
      loadEvents();
    } catch {
      showToast('Error al eliminar evento.');
    }
  };

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const getEventsForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter((ev) => {
      const start = ev.startDate.split('T')[0];
      const end = ev.endDate ? ev.endDate.split('T')[0] : start;
      return dayStr >= start && dayStr <= end;
    });
  };

  const getCategoryColor = (cat: CalendarCategory) => {
    switch (cat) {
      case 'album':
      case 'comeback':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'survival':
      case 'ronda':
      case 'episodio':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'premiacion':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'audicion':
      case 'convocatoria':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'concierto':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <CalendarIcon className="w-4 h-4 text-indigo-400" /> Calendario Centralizado Automatizado
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Agenda Oficial de YM-ki Records
            </h1>
            <p className="text-sm text-slate-300">
              Todos los lanzamientos, comebacks, convocatorias, rondas de survival, episodios,
              galas de premios y eventos empresariales sincronizados en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-indigo-400" /> Recordatorios ({prefTimeZone})
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Añadir Evento Manual
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Views, Month Switcher, Filters */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-black text-white tracking-wide min-w-[160px] text-center">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 overflow-x-auto">
          {[
            { id: 'month', label: 'Vista Mensual' },
            { id: 'week', label: 'Semanal' },
            { id: 'upcoming', label: 'Próximos' },
            { id: 'timeline', label: 'Cronológico' }
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                viewMode === v.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar evento..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
          >
            <option value="all">Todas las Categorías</option>
            <option value="album">Lanzamientos & Álbumes</option>
            <option value="survival">Survival Shows & Rondas</option>
            <option value="premiacion">Premiaciones</option>
            <option value="convocatoria">Convocatorias & Audiciones</option>
            <option value="empresa">Eventos Empresariales</option>
            <option value="concierto">Conciertos Virtuales</option>
            <option value="especial">Especiales & Comebacks</option>
          </select>

          {companiesList.length > 0 && (
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:outline-none"
            >
              <option value="all">Todas las Empresas</option>
              {companiesList.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* VIEW: MONTHLY GRID */}
      {viewMode === 'month' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
              <span key={day} className="text-xs font-black uppercase text-indigo-400">
                {day}
              </span>
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={'empty-' + idx} className="min-h-[100px] p-2 bg-slate-950/40 rounded-2xl border border-slate-800/40 opacity-30" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={'day-' + day}
                  className={`min-h-[110px] p-2 rounded-2xl border flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-lg ${
                        isToday ? 'bg-indigo-600 text-white shadow' : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-500">
                        {dayEvents.length} ev.
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 mt-1 overflow-y-auto max-h-[85px] scrollbar-none">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => {
                          if (ev.relatedSection && onNavigateToSection) {
                            onNavigateToSection(ev.relatedSection as AppSection);
                          }
                        }}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold truncate cursor-pointer transition active:scale-95 flex items-center justify-between gap-1 ${getCategoryColor(
                          ev.category
                        )}`}
                        title={`${ev.name} - ${ev.time || ''}`}
                      >
                        <span className="truncate">{ev.name}</span>
                        {subscribedEvents.includes(ev.id) && (
                          <BellRing className="w-2.5 h-2.5 text-amber-300 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: UPCOMING & TIMELINE CARDS */}
      {(viewMode === 'upcoming' || viewMode === 'timeline' || viewMode === 'week') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              No hay eventos programados con los filtros seleccionados.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const isSubscribed = subscribedEvents.includes(ev.id);
              return (
                <div
                  key={ev.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition group"
                >
                  <div className="relative h-40 overflow-hidden bg-slate-950">
                    <img
                      src={ev.image}
                      alt={ev.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <span
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${getCategoryColor(
                        ev.category
                      )}`}
                    >
                      {ev.category}
                    </span>

                    {ev.isAutomated && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-900/80 text-cyan-300 border border-cyan-500/30">
                        ⚡ Automático
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-bold text-indigo-300">
                          <CalendarIcon className="w-3.5 h-3.5" /> {ev.startDate}
                          {ev.endDate && ev.endDate !== ev.startDate && ` - ${ev.endDate}`}
                        </span>
                        {ev.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {ev.time}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                        {ev.name}
                      </h3>

                      <p className="text-xs text-slate-300 line-clamp-2">{ev.description}</p>

                      <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ev.company}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleSubscribe(ev.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                          isSubscribed
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isSubscribed ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        {isSubscribed ? 'Recordatorio Activo' : 'Avisarme'}
                      </button>

                      <div className="flex items-center gap-2">
                        {ev.relatedSection && onNavigateToSection && (
                          <button
                            onClick={() => onNavigateToSection(ev.relatedSection as AppSection)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow transition cursor-pointer"
                          >
                            Ir a Sección <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        {isAdmin && !ev.isAutomated && (
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: MANUAL EVENT CREATION */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateEventSubmit}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" /> Crear Evento en Calendario
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Nombre del Evento *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
                placeholder="ej: Concierto Virtual de Aniversario"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Imagen / Miniatura URL</label>
              <input
                type="url"
                value={eventImage}
                onChange={(e) => setEventImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descripción</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                rows={2}
                placeholder="Detalles sobre el evento..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="album">Lanzamiento de Álbum</option>
                  <option value="comeback">Comeback</option>
                  <option value="audicion">Audiciones</option>
                  <option value="convocatoria">Convocatoria</option>
                  <option value="survival">Survival</option>
                  <option value="premiacion">Premiaciones</option>
                  <option value="empresa">Evento de Empresa</option>
                  <option value="concierto">Concierto Virtual</option>
                  <option value="especial">Evento Especial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Empresa Organizadora</label>
                <input
                  type="text"
                  value={eventCompany}
                  onChange={(e) => setEventCompany(e.target.value)}
                  placeholder="ej: YM-ki Records"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Fecha Inicio *</label>
                <input
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Hora</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Sección Vinculada</label>
                <select
                  value={eventRelatedSection}
                  onChange={(e) => setEventRelatedSection(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="foros">Foros Comunitarios</option>
                  <option value="lanzamientos">Lanzamientos Oficiales</option>
                  <option value="survival">Survival Shows</option>
                  <option value="premiaciones">Premiaciones</option>
                  <option value="audiciones">Audiciones</option>
                  <option value="tienda">Tienda Oficial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Visibilidad</label>
                <select
                  value={eventIsPrivate ? 'private' : 'public'}
                  onChange={(e) => setEventIsPrivate(e.target.value === 'private')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="public">Público (Toda la comunidad)</option>
                  <option value="private">Privado (Solo organizadores)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
              >
                Publicar Evento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PREFERENCIAS DE RECORDATORIOS Y ZONA HORARIA */}
      {isPreferencesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" /> Preferencias de Recordatorios
              </h3>
              <button
                onClick={() => setIsPreferencesModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Personaliza con cuánta anticipación deseas recibir notificaciones de los eventos a los
              que te suscribas:
            </p>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={pref24h}
                  onChange={(e) => setPref24h(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="font-bold text-white block">24 horas antes del evento</span>
                  <span className="text-[11px] text-slate-400">Recordatorio con un día de antelación</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={pref1h}
                  onChange={(e) => setPref1h(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="font-bold text-white block">1 hora antes del evento</span>
                  <span className="text-[11px] text-slate-400">Aviso para preparar tu asistencia</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefStart}
                  onChange={(e) => setPrefStart(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="font-bold text-white block">Al comenzar el evento</span>
                  <span className="text-[11px] text-slate-400">Notificación inmediata de inicio</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefEnd}
                  onChange={(e) => setPrefEnd(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <div>
                  <span className="font-bold text-white block">Al finalizar el evento</span>
                  <span className="text-[11px] text-slate-400">Resumen y aviso de cierre</span>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Zona Horaria Configurada
                </label>
                <input
                  type="text"
                  value={prefTimeZone}
                  onChange={(e) => setPrefTimeZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Se ajusta automáticamente a la hora local para evitar desfases.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPreferencesModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
