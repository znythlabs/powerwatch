'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Announcement, AnnouncementType } from '@/lib/types';
import Link from 'next/link';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

export default function ManualSchedulesPage() {
    const { t } = useTranslation();
    const customAnnouncements = useAppStore((s) => s.customAnnouncements);
    const addCustomAnnouncement = useAppStore((s) => s.addCustomAnnouncement);
    const removeCustomAnnouncement = useAppStore((s) => s.removeCustomAnnouncement);
    const allBarangays = useAppStore((s) => s.allBarangays);

    const [form, setForm] = useState({
        id: undefined as string | undefined,
        type: 'scheduled' as AnnouncementType,
        summary_en: '',
        scheduled_start: new Date().toISOString(),
        scheduled_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        reason: '',
        source_url: '',
        selectedBarangays: [] as string[],
    });


    const [isAdding, setIsAdding] = useState(false);
    const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newAnnouncement: Announcement = {
            id: form.id || `custom-${crypto.randomUUID()}`,
            type: form.type,
            summary_en: form.summary_en,
            summary_fil: form.summary_en, // Use same for demo
            scheduled_start: form.scheduled_start,
            scheduled_end: form.scheduled_end || null,
            reason: form.reason || 'Manual Input',
            affected_areas: form.selectedBarangays.map(b => ({ barangay: b, zone: null })),
            source_url: form.source_url,
            created_at: new Date().toISOString(),
            is_active: true,
        };

        if (form.id) {
            removeCustomAnnouncement(form.id);
        }
        addCustomAnnouncement(newAnnouncement);
        setIsAdding(false);
        setActivePicker(null);
        setForm({
            id: undefined,
            type: 'scheduled',
            summary_en: '',
            scheduled_start: new Date().toISOString(),
            scheduled_end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            reason: '',
            source_url: '',
            selectedBarangays: [],
        });
    };

    const toggleBarangay = (name: string) => {
        setForm(prev => ({
            ...prev,
            selectedBarangays: prev.selectedBarangays.includes(name)
                ? prev.selectedBarangays.filter(n => n !== name)
                : [...prev.selectedBarangays, name]
        }));
    };

    // Ensure Katangawan is in allBarangays if it was missing from persisted state
    const displayBarangays = allBarangays.some(b => b.name === 'Katangawan')
        ? allBarangays
        : [...allBarangays, { id: 'temp-kat', name: 'Katangawan', district: 'District 2' }];



    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <Link href="/settings" className="text-slate-400 flex items-center gap-1 text-[10px] font-black mb-1 hover:text-slate-600 transition-colors uppercase tracking-widest">
                        <span className="material-icons-round text-sm">arrow_back</span>
                        Settings
                    </Link>
                    <h1 className="font-heading text-2xl font-black text-slate-900 tracking-tight">Manual Overrides</h1>
                </div>
                {!isAdding && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-brand text-black font-black h-11 px-6 rounded-2xl shadow-lg shadow-orange-200"
                    >
                        <span className="material-icons-round mr-1 text-lg">add</span>
                        NEW
                    </Button>
                )}
            </div>

            {isAdding && (
                <section className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200 border border-slate-50 animate-slide-up space-y-10 overflow-visible relative">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-heading font-black text-2xl text-slate-900 tracking-tight">Schedule Override</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manual Data Entry</p>
                        </div>
                        <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
                            <span className="material-icons-round text-xl">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Event Category</label>
                            <div className="flex gap-3">
                                {['scheduled', 'emergency', 'info'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm({ ...form, type: type as any })}
                                        className={`flex-1 py-4 rounded-[1.25rem] text-[10px] font-black capitalize transition-all border-2 ${form.type === type
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Case Summary</label>
                            <textarea
                                required
                                rows={3}
                                value={form.summary_en}
                                onChange={e => setForm({ ...form, summary_en: e.target.value })}
                                placeholder="Describe the power situation..."
                                className="w-full bg-slate-50 border-0 rounded-[2rem] px-6 py-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-brand outline-none transition-all resize-none shadow-inner"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">FB Post Link (Optional)</label>
                            <input
                                type="url"
                                value={form.source_url}
                                onChange={e => setForm({ ...form, source_url: e.target.value })}
                                placeholder="https://facebook.com/..."
                                className="w-full bg-slate-50 border-0 rounded-[2rem] px-6 py-5 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-brand outline-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="relative">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <DateTimePicker
                                    label="Start Time"
                                    value={form.scheduled_start}
                                    onChange={(val) => setForm({ ...form, scheduled_start: val })}
                                    isOpen={activePicker === 'start'}
                                    onToggle={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                                />
                                <DateTimePicker
                                    label="End Time"
                                    value={form.scheduled_end || ''}
                                    onChange={(val) => setForm({ ...form, scheduled_end: val })}
                                    isOpen={activePicker === 'end'}
                                    onToggle={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                                />
                            </div>
                        </div>


                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">Scope ({form.selectedBarangays.length} AREAS)</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 no-scrollbar bg-slate-50/50 rounded-[2rem] border border-slate-100/50">
                                {displayBarangays.map(b => (
                                    <button
                                        key={`${b.id}-${b.name}`}
                                        type="button"
                                        onClick={() => toggleBarangay(b.name)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${form.selectedBarangays.includes(b.name)
                                            ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100'
                                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {b.name}
                                    </button>
                                ))}
                            </div>
                        </div>


                        <Button type="submit" className="w-full bg-slate-900 text-white font-black h-14 rounded-3xl shadow-xl shadow-slate-300 text-sm tracking-widest mt-4">
                            PUBLISH OVERRIDE
                        </Button>
                    </form>
                </section>
            )}


            {/* List */}
            <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Custom Overrides</h3>
                {customAnnouncements.length === 0 ? (
                    <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl py-12 text-center space-y-2">
                        <span className="material-icons-round text-3xl text-slate-200">event_busy</span>
                        <p className="text-sm font-bold text-slate-400">No manual schedules added yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {customAnnouncements.map(a => (
                            <div key={a.id} className="bg-white rounded-[2rem] p-4 shadow-soft border border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                        <span className="material-icons-round text-slate-400 text-lg">
                                            {a.type === 'scheduled' ? 'calendar_today' : 'warning'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-slate-800">{a.summary_en}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge variant="secondary" className="text-[8px] h-4 bg-slate-100 text-slate-500 font-bold uppercase">{a.type}</Badge>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(a.scheduled_start).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => {
                                            setForm({
                                                id: a.id,
                                                type: a.type,
                                                summary_en: a.summary_en,
                                                scheduled_start: a.scheduled_start,
                                                scheduled_end: a.scheduled_end || '',
                                                reason: a.reason || '',
                                                source_url: a.source_url || '',
                                                selectedBarangays: (a.affected_areas || []).map(area => area.barangay),
                                            });
                                            setIsAdding(true);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="p-2 text-slate-200 hover:text-brand transition-colors"
                                        title="Edit Manual Override"
                                    >
                                        <span className="material-icons-round text-sm">edit</span>
                                    </button>
                                    <button
                                        onClick={() => removeCustomAnnouncement(a.id)}
                                        className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <span className="material-icons-round text-sm">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <section className="bg-amber-50 rounded-3xl p-5 border border-amber-100/50">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <span className="material-icons-round text-amber-600 text-xl">help_outline</span>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800">What are manual schedules?</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            These are local overrides that will appear on your dashboard and history.
                            Use them to test the app's alerts or to track outages that aren't yet in the official SOCOTECO 2 database.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
