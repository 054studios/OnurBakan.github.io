import firestore from '@react-native-firebase/firestore';
import type { NewsItem } from '../types/news';

let seeded = false;

const SEED_NEWS: Omit<NewsItem, 'id' | 'createdAt'>[] = [
  {
    category: 'visa',
    title: "Bulgaristan Schengen'e Katıldı – Karayolu Kontrolleri Kaldırıldı",
    excerpt:
      "Bulgaristan Ocak 2025'ten itibaren tam Schengen üyesi oldu. Karayolu sınırlarında pasaport kontrolü artık yok — bekleme sürelerinde büyük düşüş bekleniyor.",
    source: 'eu.europa.eu',
    languages: ['TR', 'NL', 'DE'],
    isCommunity: false,
    publishedAt: firestore.Timestamp.fromDate(new Date('2025-01-01')),
  },
  {
    category: 'car',
    title: 'Türkiye Zorunlu Trafik Sigortası 2025 Tavan Fiyatları Güncellendi',
    excerpt:
      "Türkiye'ye giren araçlar için Türk Yeşil Kart veya sınırdan alınan zorunlu sigorta gerekli. 2025 tavan primleri yüzde 40 arttı — sınırdan alım için ekstra bütçe ayırın.",
    source: 'turkiye.gov.tr',
    languages: ['TR', 'NL'],
    isCommunity: false,
    publishedAt: firestore.Timestamp.fromDate(new Date('2025-02-10')),
  },
  {
    category: 'toll',
    title: 'AT / HU / BG Vinyetleri 2025 — Fiyat Listesi',
    excerpt:
      "Avusturya, Macaristan ve Bulgaristan için 2025 vinyeti ücretleri belirlendi. 10 günlük Avusturya vinyeti €11.50, 10 günlük Macaristan €15.80. Bulgaristan e-vinyeti web sitesinden alınabiliyor.",
    source: 'europa.eu/roads',
    languages: ['TR', 'NL', 'DE'],
    isCommunity: false,
    publishedAt: firestore.Timestamp.fromDate(new Date('2025-01-15')),
  },
  {
    category: 'tips',
    title: 'Silayolu Topluluğu — En Hızlı Rota Rehberi',
    excerpt:
      "Tecrübeli Silayolucuların önerisi: Kapıkule yerine Hamzabeyli – Lesovo sınırını tercih edin. Özellikle Cuma akşamı Kapıkule'de 6-8 saatlik kuyruk oluşabiliyor.",
    source: 'Silayolu Topluluğu',
    languages: ['TR'],
    isCommunity: true,
    publishedAt: firestore.Timestamp.fromDate(new Date('2025-03-20')),
  },
];

const SEED_ALERTS = [
  {
    id: 'alert-bg-schengen',
    message:
      "⚠️ Bulgaristan sınırında kimlik / pasaport kontrolü olmadığı doğrulandı. Araç belgelerinizi hazır bulundurun.",
    severity: 'info',
    expiresAt: '2025-12-31',
  },
];

export async function seedNewsIfNeeded(): Promise<void> {
  if (seeded) return;
  seeded = true;

  try {
    const snap = await firestore().collection('news').limit(1).get();
    if (!snap.empty) return;

    const batch = firestore().batch();

    for (const item of SEED_NEWS) {
      const ref = firestore().collection('news').doc();
      batch.set(ref, { ...item, createdAt: firestore.Timestamp.now() });
    }

    for (const alert of SEED_ALERTS) {
      const ref = firestore().collection('alerts').doc(alert.id);
      batch.set(ref, alert);
    }

    await batch.commit();
  } catch (err) {
    console.warn('[seedNews] error:', err);
    seeded = false;
  }
}
