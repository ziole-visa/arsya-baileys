# Panduan Kontribusi

Terima kasih atas minat Anda untuk berkontribusi pada **arsya-baileys**! Berikut adalah panduan untuk berkontribusi pada proyek ini.

## 🚀 Memulai

### Prasyarat

- Node.js >= 20.0.0
- npm atau yarn
- Git

### Membuat Fork dan Clone

```bash
# Fork repo di GitHub, lalu clone
git clone https://github.com/ziole-visa/arsya-baileys.git
cd arsya-baileys

# Install dependensi
npm install
```

## 📋 Cara Berkontribusi

### 1. Membuat Issue

Sebelum membuat pull request, silakan buat issue untuk mendiskusikan perubahan yang ingin Anda buat. Ini membantu memastikan perubahan sesuai dengan arah proyek.

### 2. Membuat Branch

```bash
git checkout -b fitur/nama-fitur-anda
# atau
git checkout -b perbaikan/nama-perbaikan-anda
```

### 3. Membuat Perubahan

- Ubah kode sesuai kebutuhan
- Pastikan tidak mengubah file di `lib/` secara langsung (ini adalah hasil build dari TypeScript)
- Ubah kode sumber di repositori asli TypeScript jika tersedia, atau dokumentasikan alasan perubahan langsung di `lib/`

### 4. Menguji Perubahan

```bash
# Uji smoke test existing
node tools/smoke-games.mjs
node tools/smoke-menu-variants.mjs
```

Jika Anda menambahkan fitur baru, silakan tambahkan smoke test di `tools/`.

### 5. Commit Pesan

Gunakan format commit yang jelas:

```
feat: menambahkan fitur X
fix: memperbaiki bug pada Y
docs: memperbarui dokumentasi Z
refactor: merestrukturisasi Z
```

Contoh:

```
feat: menambahkan fitur translate melalui MyMemory API
```

### 6. Mengirim Pull Request

1. Push branch Anda ke fork
2. Buat Pull Request dari branch Anda ke `main` repo utama
3. Isi template PR dengan deskripsi lengkap perubahan
4. Tunggu review dari maintainer

## 📜 Aturan Kontribusi

- Jangan mengubah file di `lib/` secara langsung tanpa dokumentasi yang jelas (ini adalah hasil build)
- Jangan menyertakan secret, API key, atau kredensial pribadi dalam commit
- Pastikan semua smoke test lulus sebelum membuat PR
- Dokumentasikan fitur baru di README.md
- Ikuti gaya penulisan kode yang ada

## 📄 Lisensi

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah lisensi MIT yang sama dengan proyek ini.

## 🤝 Kontak

Pertanyaan atau saran dapat dikirimkan melalui issue GitHub atau email ke bhimantara.arsya@gmail.com.