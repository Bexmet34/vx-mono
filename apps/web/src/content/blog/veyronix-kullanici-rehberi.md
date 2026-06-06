---
title: "Veyronix Kullanıcı Rehberi: Başlangıçtan Uzmanlığa"
description: "Veyronix Discord Albion Party Finder botunu sunucunuza nasıl kuracağınızı ve loncanızı en verimli şekilde nasıl yöneteceğinizi adım adım öğrenin."
date: "2026-06-03"
tags: "Veyronix,Rehber,Discord"
---

Albion Online'da başarılı bir lonca yönetmek tam zamanlı bir iş gibidir. Veyronix, Discord üzerinden sunduğu araçlarla yöneticilerin üzerindeki yükü sıfıra indirmek için tasarlandı. Bu rehberde, Veyronix'i nasıl kuracağınızı ve özelliklerinden maksimum verim alacağınızı anlatacağız.

## Adım 1: Kurulum ve Temel Ayarlar

Veyronix botunu sunucunuza ekledikten sonra (yönetici izinleriyle birlikte), ilk yapmanız gereken şey lonca bilgilerinizi sisteme tanıtmaktır.
1. Herhangi bir yetkili kanalında `/settings` komutunu çalıştırın.
2. Karşınıza çıkan menüden **Guild Name** (Lonca Adı) kısmını oyun içindeki tam adı ile doldurun.
3. Botun mesajları hangi kanala atacağını **Log Channel** veya **Party Channel** seçenekleri ile belirleyin.

*Not: Botun çalışması için bu kanallarda mesaj gönderme ve embed oluşturma yetkisine sahip olduğundan emin olun.*

## Adım 2: Parti Sistemi (Party Builder)

Etkinlik düzenliyorsunuz ve insanları toplamak istiyorsunuz. `/createparty` komutu imdadınıza yetişiyor.
- Komutu yazdığınızda bir etkinlik başlığı (Örn: "Tier 8 Avalon Zindanı") girin.
- Bot otomatik olarak belirlediğiniz kanala şık bir bilet/mesaj oluşturur.
- Üyeler mesajın altındaki interaktif butonlara basarak Tank, Healer veya DPS olarak etkinliğe kayıt olurlar.
- Sınır dolduğunda lider `/closeparty` komutu ile katılımı durdurabilir.

Bu sayede kimin hangi rolle geleceğini savaş başlamadan önce eksiksiz görürsünüz.

## Adım 3: Killboard Entegrasyonu (Premium Özellik)

Eğer Premium pakete sahipseniz, Veyronix arkaplanda tamamen otonom çalışır. Albion Online'ın resmi API servislerine bağlanarak loncanızın istatistiklerini çeker.
- Her gün saat 20:00'da en çok PvP kill alan, en yüksek hasar vuran veya loncaya en çok Fame kazandıran oyuncuların listesini Discord'a atar.
- Bu veriler, oyuncularınız arasında tatlı bir rekabet yaratır ve lonca aktivitesini muazzam oranda artırır.

## Adım 4: Whitelist (Yetkilendirme)

Herkesin botu kullanıp etrafı kirletmesini önlemek için bir "Beyaz Liste" sistemi vardır.
- `/whitelistadd @Rol` komutunu kullanarak sadece "Guild Master" veya "Officer" rollerine sahip kişilerin parti oluşturmasına izin verebilirsiniz.
- İzinleri kaldırmak için `/whitelistremove @Rol` komutu mevcuttur.

Veyronix ile Albion Online deneyimini profesyonel e-spor standartlarına taşıyın!
