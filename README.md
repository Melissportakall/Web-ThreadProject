KOCAELİ ÜNİVERSİTESİ
BİLGİSAYAR MÜHENDİSLİĞİ BÖLÜMÜ
YAZILIM LAB. I- 3.Proje
PROJE TESLİM TARİHİ: 28.12.2024
Eş Zamanlı Sipariş ve Stok Yönetimi Uygulaması

->Amaç: Bu proje, eş zamanlı sipariş yönetimi ve stok güncellemelerini gerçekleştiren bir
sistem tasarlamayı amaçlar. Amaç, multithreading ve senkronizasyon mekanizmaları
kullanarak aynı kaynağa eş zamanlı erişim problemlerini çözmek ve process, thread, mutex,
semafor ve process önceliği gibi kavramların kullanımını kavramaktır. 

PROJE GEREKSİNİMLERİ
Müşteriler ve Türleri:
● Müşteri bilgileri: CustomerID, CustomerName, Budget, CustomerType (Premium/
Standard), TotalSpent.
● Müşteriler başlangıçta random sayıda atanmalıdır, bütçeler de benzer şekilde random
atanmalıdır.
○ Müşteri sayısı 5-10 arasında değişmelidir.
○ Bütçe miktarı 500-3000 TL arasında değişmelidir.
○ Başlangıçta en az 2 adet premium müşteri bulunmalıdır.
● İki tür müşteri vardır:
○ Premium Müşteriler: Bu müşteriler yüksek öncelikli olup işlemleri normal
müşterilerden önce gerçekleştirilir.
○ Normal (Standard) Müşteriler: İşlemleri, Premium müşterilerin işlemleri
tamamlandıktan sonra işlem sırasına girer.
● Aynı anda birden fazla müşteri aynı ürünü almak istediğinde, Premium ve Normal
müşteriler arasında uygun bir işlem sırası sağlanmalıdır.
● Her müşteri, belirli bir veya birden fazla ürün çeşidini satın almak için başvurabilir.
● Bir müşteri, her üründen en fazla 5 adet satın alabilir.
Admin:
● Admin sistemi yönetir:
○ Ürün ekleme, silme ve stok güncelleme işlemlerini yapar.
● Admin işlemleri, müşteri işlemleri ile paralel olarak gerçekleştirilir.
● Admin, ürün ve stok bilgilerine erişirken diğer işlemleri beklemeye alır.
Stok Yönetimi:
● Her ürün başlangıçta sistem tarafından sabit bir stok miktarı ile tanımlanır.
● Mağazada başlangıçta 5 farklı ürün bulunmaktadır ve ürünlere ait bilgiler aşağıdaki
tabloda verilmiştir:
ProductID ProductName Stock Price (TL)
1 Product1 500 100
2 Product2 10 50
3 Product3 200 45
4 Product4 75 75
5 Product5 0 500
● Admin yeni ürünler ekleyebilir veya mevcut ürünleri silebilir.
● Admin, stok miktarlarını artırabilir veya azaltabilir.
● Ürün stokları satın almadan dolayı eş zamanlı olarak birden fazla müşteri tarafından
güncellenmek istenebilir.
● Eğer bir ürünün stoğu yeterli değilse, işlem reddedilir.
● Ürün satın alındığında stoklar hemen güncellenmelidir.
Bütçe (Budget) Yönetimi:
● Müşteriler, bir bakiye hesabına sahip olur ve ödeme işlemleri bu bakiyeden yapılır.
● Müşteri bakiyesi yetersiz olduğunda işlem reddedilir.
● Bütçeler random ( 500-3000 TL arası) olarak atanır.
Dinamik Öncelik Sistemi:
● Müşteri işlemleri sırasında, işlem süresine göre öncelik dinamik olarak değişmelidir.
● Bekleme süresi ve müşteri türü gibi kriterlere dayalı olarak öncelik sıralaması sürekli
olarak güncellenmelidir.
● Premium müşteriler varsayılan olarak yüksek önceliğe sahiptir. Normal müşteriler için
bekleme süresi arttıkça öncelik sıralaması yükseltilir.
● Eğer bir Standard müşteri Premium müşteri olduysa, müşterinin mevcut işlem sırasına
dokunulmamalıdır. Müşteri türü değişikliği bir sonraki işlemde etkili olmalıdır.
Dinamik Öncelik Hesaplama:
● Her müşteriye bir öncelik skoru atanır:
ÖncelikSkoru = TemelÖncelikSkoru + (BeklemeSüresi × BeklemeSüresiAğırlığı)
○ Temel Öncelik Skoru: Premium müşteriler için 15, Normal müşteriler için 10
olarak tanımlanmalıdır.
○ Bekleme Süresi: Saniye cinsinden müşterinin sipariş ver butonuna bastıktan
sonra admin tarafından siparişin onaylanmasına kadar geçen süreyi ifade eder.
○ Bekleme Süresi Ağırlığı: Bekleme süresinin etkisini belirler. Her bir saniye
bekleme süresinin ağırlığı 0.5 puandır.
○ Her işlem sırasında sıralama, dinamik olarak yeniden hesaplanmalıdır.
Veritabanı:
● Veritabanında olması beklenen minimum tablolar ve attributeleri aşağıda verilmiştir:
○ Customers: CustomerID, CustomerName, Budget, CustomerType, TotalSpent
○ Products: ProductID, ProductName, Stock, Price
○ Orders: OrderID, CustomerID, ProductID, Quantity, TotalPrice, OrderDate,
OrderStatus
○ Logs: LogID, CustomerID, OrderID, LogDate, LogType, LogDetails.
Loglama ve İzleme:
● Her işlem başladığında, işlem hakkında bir log kaydedilir.
● Log kaydı hem müşteri hem de admin işlemleri için tutulmalıdır.
● Loglar, işlem sırasına göre oluşturulmalıdır.
● Her log kaydı aşağıdaki bilgileri içermelidir:
○ Log ID
○ Müşteri ID
○ Log türü: “Hata”, “Uyarı”, “Bilgilendirme”
○ Müşteri türü: Premium veya Standard
○ Satın alınan ürün ve miktar
○ İşlem (satın alma) zaman bilgisi
○ İşlem (satın alma) sonucu: İşlem başarıyla tamamlanmışsa işlem sonucu
olarak "Satın alma başarılı" kaydedilir. Eğer işlem başarısız olursa aşağıdaki
hata mesajlarından uygun olan mesaj kaydedilir.
Bazı Hata Mesajı Türleri:
○ “Ürün stoğu yetersiz”: Bir müşteri satın alma işlemine başvurduğunda, ürün
stoğunun yeterli olmaması durumunda tetiklenir.
○ “Zaman aşımı”: İşlem belirlenen maksimum sürede tamamlanamazsa
tetiklenir.
○ “Müşteri bakiyesi yetersiz”: Müşterinin bütçesi, seçilen ürün(ler)in toplam
fiyatını karşılamıyorsa tetiklenir.
○ “Veritabanı Hatası”: Bağlantı sorunları veya işlem sırasında oluşan
deadlock'lar gibi durumlarda tetiklenir.
● Log Kaydı Örneği:
○ Log ID: 4
○ Müşteri ID: 1
○ Log Türü: Hata
○ Müşteri Türü: Premium
○ Ürün: Product5
○ Satın Alınan Miktar: 5
○ İşlem Zamanı: 2024-11-28 14:32
○ İşlem Sonucu: Ürün stoğu yetersiz
UI Entegrasyonu:
● Müşteri Paneli
○ Müşteri Listesi:
■ Tabloda CustomerID, Ad, Tür (Premium/Normal), Bütçe, Bekleme
Süresi, Öncelik Skoru gibi bilgileri gösterin.
○ Sipariş Oluşturma Formu:
■ Müşterinin Ürün Seçimi, Adet Girişi ve Sipariş Ver butonu ile işlem
yapmasına izin verin.
○ Bekleme Durumu:
■ Her müşterinin sipariş sırasındaki durumu (bekliyor, işleniyor,
tamamlandı) renklendirme ile görselleştirilebilir.
● Ürün Stok Durumu Paneli
○ Ürün Tablosu:
■ Ürün Adı, Stok Miktarı, Fiyat gibi bilgiler tablo halinde gösterilir.
■ Stok miktarları her işlem sonrası güncellenir.
○ Grafik Temsili:
■ Bar veya dairesel grafik ile stok durumu görselleştirilebilir.
■ Stok kritik seviyeye geldiğinde renk değiştiren bir grafik ile görsel
uyarı eklenebilir.
● Log Paneli
○ Gerçek zamanlı loglama ile her işlemin sonucunu listeler:
■ Örneğin: "Müşteri 1, Product3'ten 2 adet aldı. İşlem Başarılı."
■ Hatalar için: "Müşteri 2, Product5'ten 3 adet almak istedi. Yetersiz
Stok."
○ Loglar sırayla kayar bir liste şeklinde UI’da işlemler gerçekleşirken eş zamanlı
gösterilmelidir. Aşağıda bir örnek verilmiştir ancak bu örnek herhangi bir
senaryoya ait değildir.
○ Örneğin;
- Müşteri 1 (premium) product1’den 10 adet sipariş verdi.
- Müşteri 2 (normal) product2’den 50 adet, product5’ten 30 adet sipariş
verdi.
- Müşteri 3 (premium) product3’ten 10 adet, product4’ten 100 adet
sipariş verdi.
- Müşteri 1 (premium) siparişi işleme alındı. (Bu işlem müşteri sipariş
ver butonuna bastığında gerçekleşir.)
- Müşterinin siparişi onaylandı. (Bu işlem admin siparişleri
onayladığında gerçekleşir.)
- …
- Müşteri 4’ün siparişi stok yetersizliğinden iptal edildi.
● Dinamik Öncelik ve Bekleme Paneli
○ Bekleme Süresi ve Öncelik Skoru bir tabloda gösterilir ve her işlemde
güncellenir.
○ Müşteri sırasını animasyonla gösterebilirsiniz:
■ Örneğin, sipariş sırası değiştiğinde listeler yukarı/aşağı hareket eder.
● Sipariş İşleme Animasyonu
○ İşlemde olan siparişler için bir animasyon göstergesi:
■ Örneğin: “Müşteri 1’in siparişi işleniyor” şeklinde bir yükleme çubuğu
veya hareketli bir simge.

->Bu projede, React ve Python-Flask teknolojilerini kullanarak çeşitli işlevsellikler geliştirdik. Proje, yukarıda belirtilen gereksinimleri karşılamak için tasarlanmış olup, kullanıcılar için dinamik ve etkileşimli bir deneyim sunmaktadır.

Kullanılan Teknolojiler:
Frontend: React
Backend: Python-Flask
Veritabanı: MySQL
WebSocket: Anlık veri iletimi için
Threading & Locking: Sipariş yönetimi için
Genel Açıklama:
Projemizde, kullanıcılar ana sayfada ürünlerin kart yapılarıyla sergilendiği bir platforma erişim sağlıyor. Aynı zamanda, bu ürünlerin toplam miktarlarını gösteren bir grafik de sunulmaktadır. Kullanıcı, almak istediği ürünü seçtiğinde, bu istek ilk olarak admin paneline iletilmektedir.

Sipariş Yönetimi:
Gereksinimler doğrultusunda her sipariş için bir thread oluşturduk. Bu threadlerin öncelik hesaplamalarını yaparak, gelen siparişlerin işlenme sırasını belirledik. Bu şekilde, siparişlerin sırasıyla işlenmesini sağladık.

Queue ve Race Condition Yönetimi:

Siparişler bir kuyruk yapısına alınarak sırasıyla işlenmektedir.
Admin tüm siparişlere onay verdiğinde, kuyruktaki her sipariş, race condition durumunu engellemek amacıyla tek tek işleme alınır. Bu işlemde, olası problemlerin önüne geçebilmek için lock mekanizması kullanılmıştır.
Admin siparişi reddettiğinde, kuyruk sıfırlanır ve hiçbir sipariş onaylanmaz.
Kullanıcı Deneyimi:
Kullanıcılar, onaylanan siparişlerini "Siparişlerim" sayfasında, process bar üzerinden anlık olarak takip edebilirler. Bu bilgilere ulaşabilmek için thread'lerde bir bekleme süresi ekledik ve WebSocket teknolojisini kullanarak verileri canlı bir şekilde güncelledik.

Admin Paneli:
Admin paneli üzerinden, logs kısmında yapılan işlemler canlı olarak izlenebilmektedir. Burada da anlık iletişim sağlamak için WebSocket kullanılmıştır.

Görseller:
Aşağıda, projemizin kullanıcı arayüzüne ait birkaç ekran görüntüsü yer almaktadır:
![Admin main menuye ait bir görsel.Bu görselin sağ tarafında web socket ile dinamik logu sağladık ve aynı anda tüm siparişleri onaylayıp silebilmek için butonlar ekledik.](https://github.com/Melissportakall/Web-ThreadProject/blob/main/Ekran%20Resmi%202025-01-22%2013.23.39.png)

![Kullanıcı main menüye ait bir görsel.Burada kullanıcı istediği ürünlerden istediği sayıda sepetine ekleyebilir.Sepet admin onaylamadan işleme alınmaz.Ürünlerin toplam stoğunu görebilir eğer stoğu olmayan bir üründen sipariş vermek isterse ürün sepete eklenemez.5 ten fazla ürünü bir kerede sepetine ekleyemez.]( https://github.com/Melissportakall/Web-ThreadProject/blob/main/Ekran%20Resmi%202025-01-22%2013.26.10.png)

![Diğer log ekranı](https://github.com/Melissportakall/Web-ThreadProject/blob/main/Ekran%20Resmi%202025-01-22%2012.58.07.png)

![Projeye ait akış diyagramı](https://github.com/Melissportakall/Web-ThreadProject/blob/main/Ekran%20Resmi%202024-12-29%2014.38.42.png)
