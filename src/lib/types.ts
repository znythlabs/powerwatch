export type AnnouncementType = 'scheduled' | 'emergency' | 'restoration' | 'rate_update';
export type UserTier = 'free' | 'premium';
export type Language = 'en' | 'fil';
export type ThemeMode = 'dark' | 'light' | 'system';
export type AlertStatus = 'clear' | 'warning' | 'danger';

export interface AffectedArea {
    barangay: string;
    zone: string | null;
    feeder?: string | null;
}

export interface Announcement {
    id: string;
    type: AnnouncementType;
    summary_en: string;
    summary_fil: string;
    scheduled_start: string;
    scheduled_end: string | null;
    reason: string;
    affected_areas: AffectedArea[];
    source_url: string;
    created_at: string;
    is_active?: boolean;
}

export interface Barangay {
    id: string;
    name: string;
    district: string;
    aliases?: string[];
}

export interface ElectricityRate {
    id?: string;
    rate_per_kwh: number;
    effective_date: string;
    generation_charge: number;
    transmission_charge: number;
    distribution_charge: number;
    others: {
        vat: number;
        system_loss: number;
        universal_charges: number;
        [key: string]: number;
    };
    previous_rate?: number;
}

export interface UserProfile {
    id: string;
    display_name: string;
    language: Language;
    tier: UserTier;
    fcm_token?: string;
}

export interface UserSubscription {
    id: string;
    user_id: string;
    barangay_id: string;
    barangay?: Barangay;
    notify_push: boolean;
}
