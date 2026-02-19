
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// The translations
// (tip move them in a JSON file and import them)
const resources = {
  en: {
    translation: {
        // Landing Page
        "landing_title": "The Ultimate AI Wheel Swap Tool for Your Car",
        "landing_subtitle": "Visualize any wheels on your car in seconds. Perfect for enthusiasts and professionals.",
        "landing_cta": "Try Now for Free",
        "landing_link": "View on GitHub",

        // Dashboard Page
        "input_configuration": "INPUT CONFIGURATION",
        "input_config_subtitle": "Upload high-quality side profile images for the best AI placement results.",
        "vehicle_profile": "Vehicle Profile",
        "required": "REQUIRED",
        "drop_side_profile": "Drop side profile here",
        "supports_png_jpg": "Supports PNG, JPG (Max 10MB)",
        "wheel_design": "Wheel Design",
        "upload_rim_photo": "Upload rim photo",
        "front_facing_preferred": "Front facing perspective preferred",
        "placement_settings": "PLACEMENT SETTINGS",
        "auto_detect_hubs": "Auto-detect hubs",
        "lower_suspension": "Lower suspension",
        "beta": "Beta",
        "generate_preview": "GENERATE PREVIEW",
        "generating": "GENERATING...",
        "recently_uploaded": "RECENTLY UPLOADED",
        "ready_for_visualization": "Ready for Visualization",
        "ready_for_vis_subtitle": "Upload your images on the left and click <1>GENERATE</1> to see the transformation.",
        "processing_image": "Processing Image...",
        "processing_subtitle": "Our AI is working its magic. This may take a moment.",
        "error_upload": "Please upload both a car and a rim image.",
        "error_generic": "An unexpected error occurred.",
        "logout": "Logout"
    }
  },
  tr: {
    translation: {
        // Landing Page
        "landing_title": "Aracınız İçin Mükemmel Yapay Zeka Jant Değiştirme Aracı",
        "landing_subtitle": "Hayalinizdeki jantları saniyeler içinde arabanızda görselleştirin. Meraklılar ve profesyoneller için mükemmel.",
        "landing_cta": "Hemen Ücretsiz Deneyin",
        "landing_link": "GitHub'da Görüntüle",

        // Dashboard Page
        "input_configuration": "GİRİŞ AYARLARI",
        "input_config_subtitle": "En iyi yapay zeka yerleştirme sonuçları için yüksek kaliteli yan profil resimleri yükleyin.",
        "vehicle_profile": "Araç Profili",
        "required": "GEREKLİ",
        "drop_side_profile": "Yan profil resmini buraya bırakın",
        "supports_png_jpg": "PNG, JPG destekler (Maks 10MB)",
        "wheel_design": "Jant Tasarımı",
        "upload_rim_photo": "Jant fotoğrafı yükle",
        "front_facing_preferred": "Önden görünüm tercih edilir",
        "placement_settings": "YERLEŞTİRME AYARLARI",
        "auto_detect_hubs": "Poyraları otomatik algıla",
        "lower_suspension": "Süspansiyonu alçalt",
        "beta": "Beta",
        "generate_preview": "ÖNİZLEME OLUŞTUR",
        "generating": "OLUŞTURULUYOR...",
        "recently_uploaded": "SON YÜKLENENLER",
        "ready_for_visualization": "Görselleştirmeye Hazır",
        "ready_for_vis_subtitle": "Dönüşümü görmek için soldaki resimlerinizi yükleyin ve <1>OLUŞTUR</1>'a tıklayın.",
        "processing_image": "Görüntü İşleniyor...",
        "processing_subtitle": "Yapay zekamız sihrini yapıyor. Bu biraz zaman alabilir.",
        "error_upload": "Lütfen hem bir araba hem de bir jant resmi yükleyin.",
        "error_generic": "Beklenmedik bir hata oluştu.",
        "logout": "Çıkış Yap"
    }
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'tr', // Use Turkish if detected language is not available
    debug: true,

    interpolation: {
      escapeValue: false // React already safes from xss
    },

    detection: {
        order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['cookie', 'localStorage'],
    }
  });

export default i18n;
