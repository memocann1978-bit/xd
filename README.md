# MODLOFF Discord Bot

Discord.js v14 tabanlı, modüler topluluk yönetimi ve moderasyon botu.

## Mevcut sistemler

- Üye kayıt ve yeniden kayıt akışı
- Moderasyon: kick, ban, timeout, timeout kaldırma ve mesaj temizleme
- Ticket: özel destek kanalı oluşturma ve kapatma
- Guard: interaktif güvenlik ayar paneli
- Slash komutları: ping, sunucu bilgisi ve komut yardımı
- Davet takibi, üye giriş/çıkış olayları ve istatistik altyapısı

Bu liste geliştirme dalında bulunan özellikleri gösterir; her özelliğin gerçek Discord sunucusunda uçtan uca doğrulanması ayrıca gereklidir.
## Gereksinimler

- Node.js 18.18 veya üzeri (önerilen: Node.js 20 LTS)
- MongoDB bağlantısı (veritabanı kullanan modüller için)
- Discord Developer Portal üzerinden oluşturulmuş bot uygulamaları; Bot sekmesinde Server Members, Message Content ve Presence privileged intent'leri etkin olmalıdır.

## Kurulum

1. Depoyu klonlayın ve proje klasörüne girin.
2. `npm install` komutunu çalıştırın.
3. `Global/Settings/_system.json` içindeki `Login.Moderation`, `Login.Executive` ve `Login.Voucher` alanlarına ilgili bot tokenlarını yazın.
4. Aynı dosyada `Settings.Database.MongoURL`, `Settings.guildID`, `Settings.root` ve `Settings.prefix` alanlarını yapılandırın.
5. `npm run check` ile JavaScript sözdizimini doğrulayın; `npm test` ile regresyon testlerini çalıştırın.
6. `npm start` ile PM2 üzerinden Moderation, Executive ve Voucher servislerini başlatın. Tek servis için `npm run start:moderation`, `npm run start:executive` veya `npm run start:voucher` kullanın.

## Güvenlik

- Bot tokenları ve MongoDB URI `_system.json` içinde düz metin tutulur. Bu dosyayı GitHub'a, ekran görüntülerine veya başkalarına göndermeyin; herkese açık depoda yalnızca boş şablon değerleri bulunsun.
- Daha önce sızmış olabilecek tokenları Discord Developer Portal üzerinden sıfırlayın.
- `eval` komutları varsayılan olarak devre dışıdır. Üretim ortamında açılması önerilmez.
- Botun ihtiyaç duyduğu ayrıcalıklı Gateway Intents değerlerini Discord Developer Portal > Bot bölümünden etkinleştirin.
- MongoDB kullanan özellikler için `MONGODB_URI` zorunludur.

## Geliştirme

- Komutlar: `Server/<BotAdı>/_commands/<Kategori>/`
- Olaylar: `Server/<BotAdı>/_events/<Kategori>/`
- Ortak istemci ve yapılar: `Global/Client/`
- Veritabanı modelleri: `Global/Database/`
- Sunucu yapılandırması: `Global/Settings/`

Yeni sistemler mevcut modüllerden bağımsız ve mümkün olduğunca ayrı servisler hâlinde eklenmelidir.

## Lisans

Depodaki `LICENSE` dosyasını ve kaynak projenin kullanım koşullarını inceleyin. README'deki Apache 2.0 atfı ile dağıtım/satış yasağı ifadesi birbiriyle çelişebildiğinden, yeniden dağıtım veya ticari kullanım öncesinde hak sahibinden yazılı izin alın.
