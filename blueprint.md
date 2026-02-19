
# Wheeldrop AI Görüntü İşleme Uygulaması Blueprint

## 1. Genel Bakış

Bu belge, Wheeldrop AI uygulamasının geliştirme sürecini, mimarisini, tasarım kararlarını ve gelecek hedeflerini özetlemektedir. Wheeldrop, kullanıcıların bir araba fotoğrafı ile bir jant fotoğrafını birleştirerek, jantların arabada nasıl durduğunu yapay zeka destekli olarak görselleştirmelerini sağlayan bir web uygulamasıdır.

## 2. Mevcut Durum ve Özellikler (Versiyon 1.0)

### 2.1. Kullanıcı Arayüzü ve Tasarım

- **Ana Sayfa (`Landing.tsx`):** Modern, karanlık tema üzerine kurulu, neon sarı (`#DFFF00`) vurgu rengiyle dikkat çeken bir karşılama sayfası.
    - Şirket logosu, özellikler, çalışma prensibi ve fiyatlandırma gibi bölümlere hızlı erişim sağlayan bir navigasyon çubuğu içerir.
    - Kullanıcıları doğrudan uygulamanın ana panosuna yönlendiren bir "GET STARTED" butonu bulunur.
    - Hizmetin nasıl çalıştığını üç adımda (Yükle, Seç, İşle) açıklayan bir bölüm mevcuttur.
    - Farklı abonelik katmanlarını (Starter, Pro, Enterprise) ve özelliklerini listeleyen bir fiyatlandırma tablosu vardır.
- **Çalışma Alanı Panosu (`Dashboard.tsx`):** Kullanıcının görüntüleri yükleyip işleyebileceği ana arayüz.
    - **Sol Menü:** Uygulamanın ana bölümlerine (Wheel Studio, History, Settings vb.) navigasyon sağlar.
    - **Ana İçerik Alanı:**
        - Kullanıcının araba ve jant resimlerini sürükleyip bırakabileceği veya seçebileceği iki ana yükleme alanı.
        - İsteğe bağlı ayarlar ve işlem başlatma (GENERATE PREVIEW) butonu.
    - **Sağ Panel (Son İşlemler):** Tamamlanan görüntülerin bir galerisi olarak işlev görür.
- **Tasarım Dili:**
    - **Fontlar:** `Inter` (genel metinler) ve `Space Grotesk` (başlıklar).
    - **İkonografi:** `Material Icons Outlined`.
    - **Stil:** Tailwind CSS kullanılarak oluşturulmuş özel bir tasarım sistemi. Karanlık mod varsayılandır.

### 2.2. Teknik Yapı

- **Frontend:** React (Vite ile oluşturulmuş), TypeScript.
- **Routing:** `react-router-dom` kütüphanesi ile `/` (Landing) ve `/dashboard` (Dashboard) rotaları tanımlanmıştır.
- **Bağımlılıklar:**
    - `react`, `react-dom`
    - `react-router-dom`
    - `tailwindcss`

## 3. Backend Entegrasyon Planı

Bu bölüm, frontend uygulamasının daha önce tanımlanan backend API'si ile nasıl entegre edileceğini adım adım açıklamaktadır.

### 3.1. Gerekli Kütüphaneler

- `axios`: HTTP isteklerini yönetmek için.
- `@react-oauth/google`: Google ile OAuth 2.0 kimlik doğrulamasını kolaylaştırmak için.

### 3.2. Eylem Planı

1.  **Bağımlılıkların Yüklenmesi:** `npm install axios @react-oauth/google` komutu çalıştırılacak.

2.  **Kimlik Doğrulama (Authentication) Akışı:**
    - **`AuthContext` Oluşturma:** Kullanıcının kimlik durumunu (giriş yapıp yapmadığı) ve JWT (JSON Web Token) bilgisini uygulama genelinde yönetmek için bir React Context (`src/contexts/AuthContext.tsx`) oluşturulacak.
    - **Google ile Giriş:**
        - `App.tsx` dosyası, `GoogleOAuthProvider` ile sarmalanacak.
        - `Landing.tsx` sayfasındaki "Login" butonu, `@react-oauth/google` kütüphanesinden gelen `GoogleLogin` bileşeni ile değiştirilecek.
        - Kullanıcı Google ile başarılı bir şekilde giriş yaptığında, alınan `id_token` ile `POST /api/auth/google` endpoint'ine bir istek gönderilecek.
        - Backend'den dönen `access_token`, `AuthContext` aracılığıyla state'e ve `localStorage`'a kaydedilecek. `axios`'un varsayılan `Authorization` header'ı bu token ile ayarlanacak.
    - **Korumalı Rotalar:**
        - `/dashboard` gibi yalnızca giriş yapmış kullanıcıların erişebilmesi gereken rotaları korumak için bir `ProtectedRoute.tsx` bileşeni oluşturulacak. Bu bileşen, `AuthContext`'teki kullanıcı durumunu kontrol edecek.

3.  **Görüntü İşleme (Generation) Akışı (`Dashboard.tsx`):**
    - **State Yönetimi:** Araba ve jant için seçilen dosyaları tutmak üzere `useState` hook'ları kullanılacak (`carImage`, `rimImage`).
    - **Dosya Yükleme:**
        - "GENERATE PREVIEW" butonuna tıklandığında `handleGenerate` fonksiyonu tetiklenecek.
        - Bu fonksiyon, `multipart/form-data` formatında bir `FormData` nesnesi oluşturacak ve seçilen resimleri (`car_image`, `rim_image`) bu nesneye ekleyecek.
        - `axios` kullanılarak, `Authorization` header'ı ile birlikte `POST /api/generations/upload` endpoint'ine istek gönderilecek.
    - **AI İşlemini Başlatma:**
        - `/upload` isteğinden başarılı bir yanıt alındığında, dönen veriden `generation ID` (`id`) alınacak.
        - Bu `id` kullanılarak anında `POST /api/generations/{id}/process` endpoint'ine ikinci bir istek gönderilecek.
    - **Sonuçların Gösterimi:**
        - `/process` isteği devam ederken arayüzde bir yükleme göstergesi (örneğin, butonu devre dışı bırakıp bir spinner göstermek) görüntülenecek.
        - İşlem başarıyla tamamlandığında, dönen yanıttaki `result_image_url` alınacak ve sağ paneldeki "Recent Renders" bölümünde bir `<img>` etiketi aracılığıyla kullanıcıya gösterilecek.
        - Olası hatalar (örn. dosya yükleme hatası, işlem hatası) yakalanacak ve kullanıcıya bir bildirim gösterilecek.
