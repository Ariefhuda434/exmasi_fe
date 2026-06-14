# EXMASI Vol. 3 — React + Tailwind

Frontend landing page dan form pemesanan tiket untuk EXMASI (Ekspresi Mahasiswa Melalui Seni) SAPMA PP UMSU.

## Isi Project

- React + Vite
- Tailwind CSS
- Komponen section: Hero, Tentang Acara, Agenda, Tiket, Form Pembelian, Galeri, FAQ, Footer
- Asset poster dan banner EXMASI di `public/images`
- Form pembelian statis dengan tombol konfirmasi via WhatsApp

## Cara Menjalankan

```bash
npm install
npm run dev
```

Lalu buka alamat local yang muncul di terminal, biasanya:

```bash
http://localhost:5173
```

## Cara Build

```bash
npm run build
npm run preview
```

## Catatan Integrasi

Template ini masih frontend. Untuk menjadi sistem ticketing lengkap, perlu ditambahkan:

1. Backend/API untuk menyimpan order.
2. Database pembeli dan kode tiket.
3. Payment gateway atau konfirmasi pembayaran manual.
4. Generator e-ticket otomatis dengan kode seperti `EXM26-00001`.
5. Email sender untuk mengirim e-ticket.
