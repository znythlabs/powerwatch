'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Announcement, Barangay, ElectricityRate, Language, ThemeMode, UserTier } from './types';
import { mockAnnouncements, mockBarangays, mockCurrentRate, mockRateHistory } from './mock-data';
import { supabase } from './supabase';

interface AppState {
    // User
    language: Language;
    theme: ThemeMode;
    tier: UserTier;
    isAuthenticated: boolean;

    // Areas
    allBarangays: Barangay[];
    monitoredAreas: Barangay[];

    // Data
    announcements: Announcement[];
    currentRate: ElectricityRate | null;
    rateHistory: ElectricityRate[];

    // Loading states
    isLoading: boolean;
    lastFetched: number | null;

    // Actions
    setLanguage: (lang: Language) => void;
    setTheme: (theme: ThemeMode) => void;
    addArea: (barangay: Barangay) => void;
    removeArea: (id: string) => void;
    setAuthenticated: (val: boolean) => void;
    setTier: (tier: UserTier) => void;

    // Supabase fetch actions
    fetchBarangays: () => Promise<void>;
    fetchAnnouncements: () => Promise<void>;
    fetchRates: () => Promise<void>;
    fetchAll: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Defaults (mock data as instant fallback)
            language: 'en',
            theme: 'dark',
            tier: 'free',
            isAuthenticated: false,

            allBarangays: mockBarangays,
            monitoredAreas: [mockBarangays[14]], // Default: Lagao

            announcements: mockAnnouncements,
            currentRate: mockCurrentRate,
            rateHistory: mockRateHistory,

            isLoading: false,
            lastFetched: null,

            // Actions
            setLanguage: (language) => set({ language }),
            setTheme: (theme) => set({ theme }),
            addArea: (barangay) => {
                const { monitoredAreas, tier } = get();
                const maxAreas = tier === 'premium' ? 10 : 1;
                if (monitoredAreas.length >= maxAreas) return;
                if (monitoredAreas.some((a) => a.id === barangay.id)) return;
                set({ monitoredAreas: [...monitoredAreas, barangay] });
            },
            removeArea: (id) => {
                const { monitoredAreas } = get();
                set({ monitoredAreas: monitoredAreas.filter((a) => a.id !== id) });
            },
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            setTier: (tier) => set({ tier }),

            // --- Supabase Fetch Actions ---

            fetchBarangays: async () => {
                try {
                    const { data, error } = await supabase
                        .from('barangays')
                        .select('id, name, district, aliases')
                        .order('name');

                    if (error) throw error;
                    if (data && data.length > 0) {
                        const barangays: Barangay[] = data.map((b) => ({
                            id: b.id,
                            name: b.name,
                            district: b.district,
                            aliases: b.aliases ?? undefined,
                        }));
                        set({ allBarangays: barangays });
                    }
                } catch (err) {
                    console.error('[PowerWatch] Failed to fetch barangays:', err);
                    // Keep mock data as fallback — already set as default
                }
            },

            fetchAnnouncements: async () => {
                try {
                    // Fetch announcements with their affected areas
                    const { data, error } = await supabase
                        .from('announcements')
                        .select(`
                            id, type, summary_en, summary_fil,
                            scheduled_start, scheduled_end,
                            reason, source_url, created_at, is_active,
                            affected_areas (barangay, zone, feeder)
                        `)
                        .eq('is_active', true)
                        .order('scheduled_start', { ascending: false })
                        .limit(50);

                    if (error) throw error;
                    if (data && data.length > 0) {
                        const announcements: Announcement[] = data.map((a) => ({
                            id: a.id,
                            type: a.type,
                            summary_en: a.summary_en,
                            summary_fil: a.summary_fil,
                            scheduled_start: a.scheduled_start,
                            scheduled_end: a.scheduled_end,
                            reason: a.reason,
                            source_url: a.source_url,
                            created_at: a.created_at,
                            is_active: a.is_active,
                            affected_areas: (a.affected_areas ?? []).map((aa: { barangay: string; zone: string | null; feeder: string | null }) => ({
                                barangay: aa.barangay,
                                zone: aa.zone,
                                feeder: aa.feeder ?? null,
                            })),
                        }));
                        set({ announcements });
                    }
                    // If no data, keep mock announcements for demo
                } catch (err) {
                    console.error('[PowerWatch] Failed to fetch announcements:', err);
                }
            },

            fetchRates: async () => {
                try {
                    const { data, error } = await supabase
                        .from('electricity_rates')
                        .select('*')
                        .order('effective_date', { ascending: false })
                        .limit(12);

                    if (error) throw error;
                    if (data && data.length > 0) {
                        const rates: ElectricityRate[] = data.map((r, i) => ({
                            id: r.id,
                            rate_per_kwh: Number(r.rate_per_kwh),
                            effective_date: r.effective_date,
                            generation_charge: Number(r.generation_charge),
                            transmission_charge: Number(r.transmission_charge),
                            distribution_charge: Number(r.distribution_charge),
                            others: (r.others as ElectricityRate['others']) ?? {
                                vat: 0,
                                system_loss: 0,
                                universal_charges: 0,
                            },
                            previous_rate: data[i + 1]
                                ? Number(data[i + 1].rate_per_kwh)
                                : undefined,
                        }));

                        set({
                            currentRate: rates[0] ?? null,
                            rateHistory: rates,
                        });
                    }
                } catch (err) {
                    console.error('[PowerWatch] Failed to fetch rates:', err);
                }
            },

            fetchAll: async () => {
                const { fetchBarangays, fetchAnnouncements, fetchRates } = get();
                set({ isLoading: true });
                try {
                    await Promise.all([
                        fetchBarangays(),
                        fetchAnnouncements(),
                        fetchRates(),
                    ]);
                    set({ lastFetched: Date.now() });
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'powerwatch-storage',
            partialize: (state) => ({
                language: state.language,
                theme: state.theme,
                tier: state.tier,
                monitoredAreas: state.monitoredAreas,
                // Offline cache — persist fetched data for offline viewing
                announcements: state.announcements,
                currentRate: state.currentRate,
                rateHistory: state.rateHistory,
                allBarangays: state.allBarangays,
                lastFetched: state.lastFetched,
            }),
        }
    )
);
