# Kebijakan Keamanan

## Versi yang Didukung

| Versi | Status         |
| ----- | -------------- |
| 1.0.6 | 🟢 Supported   |
| < 1.0.6 | ❌ Tidak didukung |

## Melaporkan Kerentanan

Jika Anda menemukan kerentanan keamanan, mohon **jangan** buat issue publik. Kirim laporan Anda ke:

**Arsya fils** — `bhimantara.arsya@gmail.com`

Sertakan detail berikut:
- Deskripsi lengkap kerentanan
- Langkah-langkah untuk mereproduksi (PoC)
- Dampak yang mungkin terjadi
- Versi yang terkena
- Saran perbaikan (jika ada)

Kami akan merespon dalam waktu **7 hari kerja** dan memberi tahu Anda riguardi tindakan selanjutnya.

## Kebijakan Divulgasi

- Jangan membagikan detail kerentanan publik sebelum kami memiliki waktu untuk memeriksa dan memperbaiki.
- Kami akan memberikan kredit kepada pelapor dalam rilis dan CHANGELOG (kecuali Anda meminta untuk tetap anonim).
- Kami berkomitmen untuk bekerja sama dengan peneliti keamanan secara jujur dan transparan.

## Kelas Kerentanan yang Difokuskan

Berikut adalah area yang kami priorisasi dalam audit keamanan:

| Kategori | Prioritas | Catatan |
| -------- | --------- | ------- |
| Command Injection | 🔴 Kritis | Perintah shell dari input pengguna (mis. `exec()` dengan template string) |
| Path Traversal | 🟠 Tinggi | Akses file dari input pengguna (mis. `createReadStream(userInput)`) |
| Obfuscated Code | 🟠 Tinggi | Kode yang disamarkan sulit diobservasi; semua output harus di-audit |
| Secret Leakage | 🔴 Kritis | API key, token, atau kredensial pribadi yang sengsara masuk ke kode |
| Denial of Service | 🟡 Sedang | Regex katastrofik, loop tak terbatas, alokasi memori tak terbatas |
| Cryptography | 🟡 Sedang | Penggunaan kunci, IV, dan enkripsi yang tidak aman |

## Praktik Keamanan yang Diterapkan

- Semua file di `lib/` di-obfuskasi dengan `javascript-obfuscator` untuk distribusi terenkripsi.
- Semua file yang di-distribusikan melalui `.tgz` di-scan untuk secret dan kode bocor sebelum rilis.
- Tidak ada secret hardcoded (API key, nomor WhatsApp owner, token) yang tersimpan dalam repositori publik.
- Setiap rilis dilakukan melalui GitHub Release dengan checksum SHA-256.

## Cara Verifikasi Integritas Paket

Setiap rilis distribusi disertakan file `.tgz` dengan checksum SHA-256. Anda dapat memverifikasi integritasnya dengan:

```bash
# Download manifest
curl -s https://raw.githubusercontent.com/ziole-visa/arsya-baileys/main/dist/arsya-baileys-1.0.6.tgz -o arsya-baileys-1.0.6.tgz

# Hitung SHA-256
shasum -a 256 arsya-baileys-1.0.6.tgz

# Bandingkan dengan nilai yang tercantum di halaman GitHub Release
```

## Kontak

- **Email**: bhimantara.arsya@gmail.com
- **GitHub**: https://github.com/ziole-visa/arsya-baileys