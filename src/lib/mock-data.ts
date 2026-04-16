import type { Announcement, Barangay, ElectricityRate } from './types';

export const mockBarangays: Barangay[] = [
    { id: '1', name: 'Apopong', district: 'District 1' },
    { id: '2', name: 'Baluan', district: 'District 2' },
    { id: '3', name: 'Batomelong', district: 'District 2' },
    { id: '4', name: 'Buayan', district: 'District 2' },
    { id: '5', name: 'Bula', district: 'District 1' },
    { id: '6', name: 'Calumpang', district: 'District 1' },
    { id: '7', name: 'City Heights', district: 'District 1' },
    { id: '8', name: 'Conel', district: 'District 2' },
    { id: '9', name: 'Dadiangas East', district: 'District 1' },
    { id: '10', name: 'Dadiangas North', district: 'District 1' },
    { id: '11', name: 'Dadiangas South', district: 'District 1' },
    { id: '12', name: 'Dadiangas West', district: 'District 1' },
    { id: '13', name: 'Fatima', district: 'District 2' },
    { id: '14', name: 'Labangal', district: 'District 1' },
    { id: '15', name: 'Lagao', district: 'District 1' },
    { id: '16', name: 'Ligaya', district: 'District 2' },
    { id: '17', name: 'Mabuhay', district: 'District 2' },
    { id: '18', name: 'San Isidro', district: 'District 2' },
    { id: '19', name: 'San Jose', district: 'District 2' },
    { id: '20', name: 'Siguel', district: 'District 2' },
    { id: '21', name: 'Sinawal', district: 'District 2' },
    { id: '22', name: 'Tambler', district: 'District 2' },
    { id: '23', name: 'Tinagacan', district: 'District 2' },
    { id: '24', name: 'Upper Labay', district: 'District 2' },
    { id: '25', name: 'Katangawan', district: 'District 2' },
];


// Helper to create future dates relative to now
function futureDate(hoursFromNow: number): string {
    const d = new Date();
    d.setHours(d.getHours() + hoursFromNow);
    return d.toISOString();
}

function pastDate(hoursAgo: number): string {
    const d = new Date();
    d.setHours(d.getHours() - hoursAgo);
    return d.toISOString();
}

const SOCOTECO_FB = 'https://www.facebook.com/socoteco2.EC';

export const mockAnnouncements: Announcement[] = [
    {
        id: '1',
        type: 'scheduled',
        summary_en:
            'NGCP scheduled power interruption on February 28, 2026 (Friday) from 8:00 AM to 5:00 PM affecting Barangay Lagao, Dadiangas South, and Calumpang for transmission line maintenance.',
        summary_fil:
            'May naka-schedule na brownout sa February 28, 2026 (Biyernes) mula 8:00 AM hanggang 5:00 PM sa Brgy. Lagao, Dadiangas South, at Calumpang para sa maintenance ng NGCP transmission lines.',
        scheduled_start: futureDate(6),
        scheduled_end: futureDate(15),
        reason: 'NGCP transmission line maintenance',
        affected_areas: [
            { barangay: 'Lagao', zone: 'Zone 3' },
            { barangay: 'Dadiangas South', zone: null },
            { barangay: 'Calumpang', zone: 'Purok 5-8' },
        ],
        source_url: SOCOTECO_FB,
        created_at: pastDate(2),
        is_active: true,
    },
    {
        id: '2',
        type: 'emergency',
        summary_en:
            'Emergency power interruption in Barangay Apopong due to a fallen power line caused by strong winds. SOCOTECO 2 crews are on site. Restoration estimated by 3:00 PM today.',
        summary_fil:
            'Emergency brownout sa Brgy. Apopong dahil sa nahulog na linya ng kuryente dulot ng malakas na hangin. Nasa lugar na ang mga crew ng SOCOTECO 2. Inaasahang mabalik ang kuryente bago mag-3:00 PM ngayong araw.',
        scheduled_start: pastDate(1),
        scheduled_end: futureDate(2),
        reason: 'Fallen power line due to strong winds',
        affected_areas: [{ barangay: 'Apopong', zone: null }],
        source_url: SOCOTECO_FB,
        created_at: pastDate(1),
        is_active: true,
    },
    {
        id: '3',
        type: 'rate_update',
        summary_en:
            'SOCOTECO 2 announces new electricity rate of ₱11.45 per kWh effective March 2026, a ₱0.32 increase from the previous month due to higher generation charges.',
        summary_fil:
            'Nag-anunsyo ang SOCOTECO 2 ng bagong rate ng kuryente na ₱11.45 per kWh simula March 2026, tumaas ng ₱0.32 kumpara sa nakaraang buwan dahil sa pagtaas ng generation charges.',
        scheduled_start: futureDate(96),
        scheduled_end: null,
        reason: 'Monthly rate adjustment — higher generation charges',
        affected_areas: [],
        source_url: SOCOTECO_FB,
        created_at: pastDate(24),
        is_active: true,
    },
    {
        id: '4',
        type: 'scheduled',
        summary_en:
            'SOCOTECO 2 scheduled power interruption on March 3, 2026 (Monday) from 6:00 AM to 2:00 PM in Barangay Bula, City Heights, and Dadiangas North for transformer upgrade.',
        summary_fil:
            'May naka-schedule na brownout sa March 3, 2026 (Lunes) mula 6:00 AM hanggang 2:00 PM sa Brgy. Bula, City Heights, at Dadiangas North para sa upgrade ng transformer.',
        scheduled_start: futureDate(30),
        scheduled_end: futureDate(38),
        reason: 'Transformer upgrade',
        affected_areas: [
            { barangay: 'Bula', zone: null },
            { barangay: 'City Heights', zone: 'Zone 1-2' },
            { barangay: 'Dadiangas North', zone: null },
        ],
        source_url: SOCOTECO_FB,
        created_at: pastDate(5),
        is_active: true,
    },
    {
        id: '5',
        type: 'restoration',
        summary_en:
            'Power has been fully restored in Barangay Labangal after emergency repairs were completed. Thank you for your patience.',
        summary_fil:
            'Nabalik na ang kuryente sa Brgy. Labangal pagkatapos ng emergency repairs. Salamat sa inyong pasensya.',
        scheduled_start: pastDate(48),
        scheduled_end: pastDate(44),
        reason: 'Emergency repairs completed',
        affected_areas: [{ barangay: 'Labangal', zone: null }],
        source_url: SOCOTECO_FB,
        created_at: pastDate(44),
        is_active: false,
    },
];

export const mockCurrentRate: ElectricityRate = {
    rate_per_kwh: 11.45,
    effective_date: '2026-03-01',
    generation_charge: 5.12,
    transmission_charge: 1.23,
    distribution_charge: 2.45,
    others: { vat: 1.37, system_loss: 0.89, universal_charges: 0.39 },
    previous_rate: 11.13,
};

export const mockRateHistory: ElectricityRate[] = [
    { rate_per_kwh: 10.21, effective_date: '2025-04-01', generation_charge: 4.52, transmission_charge: 1.18, distribution_charge: 2.31, others: { vat: 1.12, system_loss: 0.72, universal_charges: 0.36 } },
    { rate_per_kwh: 10.45, effective_date: '2025-05-01', generation_charge: 4.61, transmission_charge: 1.19, distribution_charge: 2.35, others: { vat: 1.18, system_loss: 0.76, universal_charges: 0.36 } },
    { rate_per_kwh: 10.38, effective_date: '2025-06-01', generation_charge: 4.55, transmission_charge: 1.19, distribution_charge: 2.34, others: { vat: 1.16, system_loss: 0.78, universal_charges: 0.36 } },
    { rate_per_kwh: 10.67, effective_date: '2025-07-01', generation_charge: 4.72, transmission_charge: 1.2, distribution_charge: 2.38, others: { vat: 1.21, system_loss: 0.8, universal_charges: 0.36 } },
    { rate_per_kwh: 10.89, effective_date: '2025-08-01', generation_charge: 4.85, transmission_charge: 1.21, distribution_charge: 2.4, others: { vat: 1.25, system_loss: 0.82, universal_charges: 0.36 } },
    { rate_per_kwh: 10.95, effective_date: '2025-09-01', generation_charge: 4.88, transmission_charge: 1.21, distribution_charge: 2.41, others: { vat: 1.27, system_loss: 0.82, universal_charges: 0.36 } },
    { rate_per_kwh: 11.02, effective_date: '2025-10-01', generation_charge: 4.92, transmission_charge: 1.22, distribution_charge: 2.42, others: { vat: 1.28, system_loss: 0.82, universal_charges: 0.36 } },
    { rate_per_kwh: 10.78, effective_date: '2025-11-01', generation_charge: 4.75, transmission_charge: 1.2, distribution_charge: 2.39, others: { vat: 1.24, system_loss: 0.84, universal_charges: 0.36 } },
    { rate_per_kwh: 10.92, effective_date: '2025-12-01', generation_charge: 4.84, transmission_charge: 1.21, distribution_charge: 2.41, others: { vat: 1.26, system_loss: 0.84, universal_charges: 0.36 } },
    { rate_per_kwh: 11.05, effective_date: '2026-01-01', generation_charge: 4.94, transmission_charge: 1.22, distribution_charge: 2.43, others: { vat: 1.28, system_loss: 0.82, universal_charges: 0.36 } },
    { rate_per_kwh: 11.13, effective_date: '2026-02-01', generation_charge: 4.98, transmission_charge: 1.22, distribution_charge: 2.44, others: { vat: 1.3, system_loss: 0.83, universal_charges: 0.36 } },
    { rate_per_kwh: 11.45, effective_date: '2026-03-01', generation_charge: 5.12, transmission_charge: 1.23, distribution_charge: 2.45, others: { vat: 1.37, system_loss: 0.89, universal_charges: 0.39 } },
];
