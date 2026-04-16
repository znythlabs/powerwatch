'use client';

import { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Button } from './button';


interface DateTimePickerProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    isOpen?: boolean;
    onToggle?: () => void;
}

export function DateTimePicker({ value, onChange, label, isOpen: controlledIsOpen, onToggle }: DateTimePickerProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

    const toggle = () => {
        if (onToggle) onToggle();
        else setInternalIsOpen(!internalIsOpen);
    };

    const close = () => {
        if (onToggle) onToggle(); // Close state logic usually handled by parent
        else setInternalIsOpen(false);
    };

    const dateValue = value ? new Date(value) : new Date();

    const [datePart, setDatePart] = useState(format(dateValue, 'yyyy-MM-dd'));
    const [hour, setHour] = useState(parseInt(format(dateValue, 'h')));
    const [minute, setMinute] = useState(Math.floor(dateValue.getMinutes() / 15) * 15);
    const [period, setPeriod] = useState(format(dateValue, 'a'));

    useEffect(() => {
        const h = period === 'PM' && hour < 12 ? hour + 12 : (period === 'AM' && hour === 12 ? 0 : hour);
        const [y, m, d] = datePart.split('-').map(Number);
        const newDate = new Date(y, m - 1, d, h, minute);
        onChange(newDate.toISOString());
    }, [datePart, hour, minute, period]);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);

    // Quick dates (Today + next 3 days)
    const quickDates = Array.from({ length: 4 }, (_, i) => addDays(new Date(), i));

    return (
        <div className="space-y-1.5 flex-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <div>
                <button
                    type="button"
                    onClick={toggle}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 flex items-center justify-between hover:border-brand/30 transition-all outline-none"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-icons-round text-amber-500 text-xl">calendar_month</span>
                        <div className="text-left">
                            <p className="text-[10px] text-slate-400 uppercase font-black leading-none mb-0.5">DATE & TIME</p>
                            <span className="text-slate-800">{format(dateValue, 'MMM d, h:mm a')}</span>
                        </div>
                    </div>
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop Overlay */}
                        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={close}></div>


                        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:absolute sm:top-full sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-0 w-[92vw] sm:w-[420px] bg-white rounded-[3rem] shadow-2xl shadow-slate-400/20 border border-slate-50 p-6 sm:p-8 z-[70] animate-slide-up origin-center sm:origin-top space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar sm:max-h-none sm:overflow-visible">




                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Select Date</p>
                                    {datePart !== format(new Date(), 'yyyy-MM-dd') && (
                                        <button
                                            type="button"
                                            onClick={() => setDatePart(format(new Date(), 'yyyy-MM-dd'))}
                                            className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors"
                                        >
                                            Today
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {quickDates.map((d, i) => {
                                        const dStr = format(d, 'yyyy-MM-dd');
                                        const isSelected = datePart === dStr;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setDatePart(dStr)}
                                                className={`flex flex-col items-center justify-center py-4 rounded-[1.5rem] border-2 transition-all ${isSelected
                                                    ? 'bg-amber-500 border-amber-500 text-white shadow-xl shadow-amber-200'
                                                    : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-100 hover:bg-white'
                                                    }`}
                                            >
                                                <span className="text-[9px] font-black uppercase tracking-widest mb-1">{format(d, 'EEE')}</span>
                                                <span className="text-lg font-black">{format(d, 'd')}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="relative pt-2">
                                    <input
                                        type="date"
                                        value={datePart}
                                        onChange={(e) => setDatePart(e.target.value)}
                                        className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-xs font-black text-slate-400 outline-none focus:border-brand focus:text-slate-900 transition-all text-center"
                                    />
                                    <p className="text-[9px] text-slate-300 text-center mt-2 font-bold uppercase tracking-widest italic">Optional: Pick Custom Date</p>
                                </div>
                            </div>


                            {/* Enhanced Time Selection */}
                            <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-12 gap-6">
                                    <div className="col-span-12 space-y-3">
                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest px-1 text-center">Set Exact Time</p>
                                        <div className="bg-slate-50 rounded-[2rem] p-4 flex items-center justify-center gap-4">
                                            <div className="flex flex-col items-center">
                                                <button type="button" onClick={() => setHour(hour === 12 ? 1 : hour + 1)} className="w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center"><span className="material-icons-round text-slate-300">expand_less</span></button>
                                                <span className="text-3xl font-black text-slate-900 w-12 text-center">{hour}</span>
                                                <button type="button" onClick={() => setHour(hour === 1 ? 12 : hour - 1)} className="w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center"><span className="material-icons-round text-slate-300">expand_more</span></button>
                                                <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">HOUR</p>
                                            </div>
                                            <span className="text-2xl font-black text-slate-200 mt-[-20px]">:</span>
                                            <div className="flex flex-col items-center">
                                                <button type="button" onClick={() => setMinute((minute + 15) % 60)} className="w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center"><span className="material-icons-round text-slate-300">expand_less</span></button>
                                                <span className="text-3xl font-black text-slate-900 w-12 text-center">{minute.toString().padStart(2, '0')}</span>
                                                <button type="button" onClick={() => setMinute(minute === 0 ? 45 : minute - 15)} className="w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center"><span className="material-icons-round text-slate-300">expand_more</span></button>
                                                <p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">MIN</p>
                                            </div>
                                            <div className="flex flex-col gap-2 ml-4">
                                                {['AM', 'PM'].map(p => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setPeriod(p)}
                                                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all ${period === p ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={close}
                                className="w-full bg-brand text-black hover:bg-brand/90 font-black rounded-[1.75rem] h-14 shadow-xl shadow-orange-200 text-sm tracking-widest"
                            >
                                CONFIRM SELECTION
                            </Button>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
