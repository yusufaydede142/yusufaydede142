/* Doğum yeri listesi: enlem, boylam (doğu +), saat dilimi (TR = Türkiye geçmiş kuralı) ve yaz saati kuralı */
(function (global) {
  'use strict';
  const TR = [
    ['Adana', 37.00, 35.32], ['Adıyaman', 37.76, 38.28], ['Afyonkarahisar', 38.76, 30.54], ['Ağrı', 39.72, 43.05],
    ['Aksaray', 38.37, 34.03], ['Amasya', 40.65, 35.83], ['Ankara', 39.93, 32.86], ['Antalya', 36.89, 30.71],
    ['Ardahan', 41.11, 42.70], ['Artvin', 41.18, 41.82], ['Aydın', 37.85, 27.85], ['Balıkesir', 39.65, 27.88],
    ['Bartın', 41.64, 32.34], ['Batman', 37.88, 41.13], ['Bayburt', 40.26, 40.23], ['Bilecik', 40.14, 29.98],
    ['Bingöl', 38.88, 40.50], ['Bitlis', 38.40, 42.11], ['Bolu', 40.74, 31.61], ['Burdur', 37.72, 30.29],
    ['Bursa', 40.19, 29.06], ['Çanakkale', 40.15, 26.41], ['Çankırı', 40.60, 33.62], ['Çorum', 40.55, 34.95],
    ['Denizli', 37.78, 29.09], ['Diyarbakır', 37.91, 40.24], ['Düzce', 40.84, 31.16], ['Edirne', 41.68, 26.56],
    ['Elazığ', 38.67, 39.22], ['Erzincan', 39.75, 39.49], ['Erzurum', 39.90, 41.27], ['Eskişehir', 39.78, 30.52],
    ['Gaziantep', 37.07, 37.38], ['Giresun', 40.91, 38.39], ['Gümüşhane', 40.46, 39.48], ['Hakkari', 37.58, 43.74],
    ['Hatay', 36.20, 36.16], ['Iğdır', 39.92, 44.04], ['Isparta', 37.76, 30.55], ['İstanbul', 41.01, 28.98],
    ['İzmir', 38.42, 27.14], ['Kahramanmaraş', 37.58, 36.94], ['Karabük', 41.20, 32.62], ['Karaman', 37.18, 33.22],
    ['Kars', 40.60, 43.10], ['Kastamonu', 41.38, 33.78], ['Kayseri', 38.73, 35.48], ['Kilis', 36.72, 37.12],
    ['Kırıkkale', 39.85, 33.51], ['Kırklareli', 41.73, 27.22], ['Kırşehir', 39.15, 34.16], ['Kocaeli', 40.77, 29.92],
    ['Konya', 37.87, 32.48], ['Kütahya', 39.42, 29.98], ['Malatya', 38.35, 38.31], ['Manisa', 38.61, 27.43],
    ['Mardin', 37.31, 40.74], ['Mersin', 36.80, 34.64], ['Muğla', 37.22, 28.36], ['Muş', 38.74, 41.49],
    ['Nevşehir', 38.62, 34.71], ['Niğde', 37.97, 34.68], ['Ordu', 40.98, 37.88], ['Osmaniye', 37.07, 36.25],
    ['Rize', 41.03, 40.52], ['Sakarya', 40.69, 30.44], ['Samsun', 41.29, 36.33], ['Siirt', 37.93, 41.94],
    ['Sinop', 42.03, 35.15], ['Sivas', 39.75, 37.02], ['Şanlıurfa', 37.16, 38.79], ['Şırnak', 37.52, 42.46],
    ['Tekirdağ', 40.98, 27.51], ['Tokat', 40.31, 36.55], ['Trabzon', 41.00, 39.72], ['Tunceli', 39.11, 39.55],
    ['Uşak', 38.68, 29.41], ['Van', 38.49, 43.38], ['Yalova', 40.66, 29.27], ['Yozgat', 39.82, 34.81],
    ['Zonguldak', 41.45, 31.79]
  ].map(([name, lat, lon]) => ({ name, country: 'Türkiye', lat, lon, tz: 'TR' }));

  const WORLD = [
    ['Lefkoşa', 'KKTC', 35.19, 33.36, 2, 'EU'], ['Bakü', 'Azerbaycan', 40.41, 49.87, 4, 'NONE'],
    ['Tiflis', 'Gürcistan', 41.72, 44.79, 4, 'NONE'], ['Berlin', 'Almanya', 52.52, 13.40, 1, 'EU'],
    ['Hamburg', 'Almanya', 53.55, 9.99, 1, 'EU'], ['Köln', 'Almanya', 50.94, 6.96, 1, 'EU'],
    ['Frankfurt', 'Almanya', 50.11, 8.68, 1, 'EU'], ['Münih', 'Almanya', 48.14, 11.58, 1, 'EU'],
    ['Stuttgart', 'Almanya', 48.78, 9.18, 1, 'EU'], ['Düsseldorf', 'Almanya', 51.23, 6.78, 1, 'EU'],
    ['Amsterdam', 'Hollanda', 52.37, 4.90, 1, 'EU'], ['Rotterdam', 'Hollanda', 51.92, 4.48, 1, 'EU'],
    ['Brüksel', 'Belçika', 50.85, 4.35, 1, 'EU'], ['Paris', 'Fransa', 48.86, 2.35, 1, 'EU'],
    ['Lyon', 'Fransa', 45.76, 4.84, 1, 'EU'], ['Viyana', 'Avusturya', 48.21, 16.37, 1, 'EU'],
    ['Zürih', 'İsviçre', 47.38, 8.54, 1, 'EU'], ['Stockholm', 'İsveç', 59.33, 18.07, 1, 'EU'],
    ['Kopenhag', 'Danimarka', 55.68, 12.57, 1, 'EU'], ['Oslo', 'Norveç', 59.91, 10.75, 1, 'EU'],
    ['Londra', 'Birleşik Krallık', 51.51, -0.13, 0, 'EU'], ['Roma', 'İtalya', 41.90, 12.50, 1, 'EU'],
    ['Milano', 'İtalya', 45.46, 9.19, 1, 'EU'], ['Madrid', 'İspanya', 40.42, -3.70, 1, 'EU'],
    ['Atina', 'Yunanistan', 37.98, 23.73, 2, 'EU'], ['Selanik', 'Yunanistan', 40.64, 22.94, 2, 'EU'],
    ['Sofya', 'Bulgaristan', 42.70, 23.32, 2, 'EU'], ['Bükreş', 'Romanya', 44.43, 26.10, 2, 'EU'],
    ['Üsküp', 'Kuzey Makedonya', 42.00, 21.43, 1, 'EU'], ['Saraybosna', 'Bosna-Hersek', 43.86, 18.41, 1, 'EU'],
    ['Priştine', 'Kosova', 42.66, 21.17, 1, 'EU'], ['Tiran', 'Arnavutluk', 41.33, 19.82, 1, 'EU'],
    ['Kiev', 'Ukrayna', 50.45, 30.52, 2, 'EU'], ['Moskova', 'Rusya', 55.76, 37.62, 3, 'NONE'],
    ['Taşkent', 'Özbekistan', 41.30, 69.24, 5, 'NONE'], ['Aşkabat', 'Türkmenistan', 37.96, 58.33, 5, 'NONE'],
    ['Bişkek', 'Kırgızistan', 42.87, 74.59, 6, 'NONE'], ['Dubai', 'BAE', 25.20, 55.27, 4, 'NONE'],
    ['Riyad', 'Suudi Arabistan', 24.71, 46.68, 3, 'NONE'], ['Doha', 'Katar', 25.29, 51.53, 3, 'NONE'],
    ['Bağdat', 'Irak', 33.31, 44.36, 3, 'NONE'], ['Erbil', 'Irak', 36.19, 44.01, 3, 'NONE'],
    ['Tahran', 'İran', 35.69, 51.39, 3.5, 'NONE'], ['Kahire', 'Mısır', 30.04, 31.24, 2, 'NONE'],
    ['Beyrut', 'Lübnan', 33.89, 35.50, 2, 'EU'], ['Amman', 'Ürdün', 31.95, 35.93, 2, 'EU'],
    ['New York', 'ABD', 40.71, -74.01, -5, 'US'], ['Chicago', 'ABD', 41.88, -87.63, -6, 'US'],
    ['Los Angeles', 'ABD', 34.05, -118.24, -8, 'US'], ['Houston', 'ABD', 29.76, -95.37, -6, 'US'],
    ['Toronto', 'Kanada', 43.65, -79.38, -5, 'US'], ['Montreal', 'Kanada', 45.50, -73.57, -5, 'US'],
    ['Sidney', 'Avustralya', -33.87, 151.21, 10, 'AU'], ['Melbourne', 'Avustralya', -37.81, 144.96, 10, 'AU'],
    ['Tokyo', 'Japonya', 35.68, 139.69, 9, 'NONE'], ['Seul', 'Güney Kore', 37.57, 126.98, 9, 'NONE']
  ].map(([name, country, lat, lon, tz, dst]) => ({ name, country, lat, lon, tz, dst }));

  const collator = (a, b) => a.name.localeCompare(b.name, 'tr');
  global.Cities = { turkey: TR.sort(collator), world: WORLD.sort(collator) };
  if (typeof module !== 'undefined') module.exports = global.Cities;
})(typeof window !== 'undefined' ? window : globalThis);
