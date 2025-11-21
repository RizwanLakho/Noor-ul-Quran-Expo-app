/**
 * Quran TypeScript Type Definitions
 * Complete type safety for all Quran-related data structures
 */

// =====================================================
// BASE TYPES
// =====================================================

export type RevelationType = 'Meccan' | 'Medinan' | 'All';

export interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

// =====================================================
// SURAH & AYAH TYPES
// =====================================================

export interface Surah {
  surah_number: number;
  surah_name_arabic: string;
  surah_name_english: string;
  revelation_type: RevelationType;
  total_ayahs: number;
  created_at?: string;
  description?: string;
}

export interface Ayah {
  id: number;
  sura: number;
  aya: number;
  text: string;
  translation?: string;
  created_at?: string;
}

export interface SurahsResponse {
  success: boolean;
  total_surahs: number;
  surahs: Surah[];
}

export interface SurahDetailResponse {
  success: boolean;
  surah: Surah;
  ayahs: Ayah[];
}

export interface AyahDetailResponse {
  success: boolean;
  ayah: Ayah;
}

// =====================================================
// TRANSLATION & TAFSEER TYPES
// =====================================================

export interface Translation {
  id: number;
  ayah_id: number;
  translator_id: number;
  translator_name: string;
  translation_text: string;
  language: string;
}

export interface TranslationsResponse {
  success: boolean;
  ayah_id: number;
  translations: Translation[];
}

export interface Tafseer {
  id: number;
  ayah_id: number;
  mufassir_id: number;
  mufassir_name: string;
  tafseer_text: string;
  language: string;
}

export interface TafseerResponse {
  success: boolean;
  ayah_id: number;
  tafseer: Tafseer[];
}

// =====================================================
// METADATA TYPES - NEW
// =====================================================

export interface HizbQuarter {
  id: number;
  hizb_quarter_number: number;
  surah_number: number;
  ayah_number: number;
  hizb_number: number;
  quarter_in_hizb: number;
  surah_name_arabic?: string;
  surah_name_english?: string;
  created_at: string;
}

export interface HizbQuartersResponse {
  success: boolean;
  total: number;
  hizb_quarters: HizbQuarter[];
}

export interface Manzil {
  id: number;
  manzil_number: number;
  surah_number: number;
  ayah_number: number;
  manzil_name_arabic?: string;
  manzil_name_english?: string;
  surah_name_arabic?: string;
  surah_name_english?: string;
  created_at: string;
}

export interface ManzilsResponse {
  success: boolean;
  total: number;
  manzils: Manzil[];
}

export interface Ruku {
  id: number;
  ruku_number: number;
  surah_number: number;
  ayah_number: number;
  surah_name_arabic?: string;
  surah_name_english?: string;
  created_at: string;
}

export interface RukusResponse {
  success: boolean;
  total: number;
  rukus: Ruku[];
}

export interface Page {
  id: number;
  page_number: number;
  surah_number: number;
  ayah_number: number;
  juz_number?: number;
  end_surah_number?: number;
  end_ayah_number?: number;
  surah_name_arabic?: string;
  surah_name_english?: string;
  created_at: string;
}

export interface PagesResponse {
  success: boolean;
  total: number;
  pages: Page[];
}

export interface Sajda {
  id: number;
  sajda_number: number;
  surah_number: number;
  ayah_number: number;
  sajda_type: 'recommended' | 'obligatory';
  ayah_text?: string;
  surah_name_arabic?: string;
  surah_name_english?: string;
  created_at: string;
}

export interface SajdasResponse {
  success: boolean;
  total: number;
  sajdas: Sajda[];
}

export interface MetadataStats {
  total_hizb_quarters: string;
  total_hizbs: string;
  total_manzils: string;
  total_rukus: string;
  total_pages: string;
  total_sajdas: string;
  obligatory_sajdas: string;
  recommended_sajdas: string;
}

export interface MetadataStatsResponse {
  success: boolean;
  stats: MetadataStats;
}

export interface FindMetadataResponse {
  success: boolean;
  surah: number;
  ayah: number;
  hizb_quarter?: HizbQuarter;
  ruku?: Ruku;
  page?: Page;
}

// =====================================================
// SEARCH TYPES
// =====================================================

export interface SearchResult {
  type: 'ayah' | 'surah' | 'translation';
  id: number;
  text: string;
  surah_number?: number;
  ayah_number?: number;
  surah_name?: string;
  highlight?: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  total_results: number;
  results: SearchResult[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
  };
}
