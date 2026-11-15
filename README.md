# Fresh Cut — Website Pemesanan Salad

Website multi-halaman untuk pemesanan salad segar **Fresh Cut** yang terhubung langsung ke WhatsApp penjual.

## Struktur Folder
- `index.html` — Halaman utama (Beranda)
- `katalog.html` — Daftar menu utama:
  1. **Fresh Salad Original (Rp15.000)**: Sawi, kol, jagung, wortel, telur, saus mayones.
  2. **Fresh Salad Ayam Suwir (Rp20.000)** *(Saran Menu)*: Komposisi Menu 1 + ayam suwir.
  3. **Custom Salad**: Racik ukuran, sayuran, saus, dan topping sendiri.
- `detail.html` — Detail produk, pilihan saus, catatan tanpa bahan tertentu, dan ekstra topping
- `custom.html` — Halaman racik salad custom
- `keranjang.html` — Keranjang belanja
- `checkout.html` — Form pemesanan & pengaturan nomor WhatsApp penjual
- `konfirmasi.html` — Struk pesanan & tombol buka/salin pesan WhatsApp
- `login.html` — Profil pelanggan & riwayat pesanan
- `app.js` — Logika keranjang, kalkulasi harga, dan generator pesan WhatsApp
- `style.css` — Tampilan responsif Fresh Cut

## Cara Mengganti Nomor WhatsApp Penjual
1. Buka file `app.js`, lalu ubah nilai pada baris paling atas:
   ```js
   const DEFAULT_SELLER_WA = "6281234567890";
   ```
   (Gunakan format kode negara `62` tanpa tanda `+` atau `0` di depan).
2. Selain itu, nomor WhatsApp tujuan juga dapat langsung diubah pada kotak **Nomor WhatsApp Penjual** di halaman `checkout.html`.
