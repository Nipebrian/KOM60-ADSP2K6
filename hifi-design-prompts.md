# Prompt Desain Hi-Fi — IPB Food & UMKM Student Hub
## Untuk Google Stitch | Desktop (1440×900) | Light Mode | Referensi: GoFood

---

## 🎨 Design System (Gunakan di SEMUA screen)

**Salin dan paste blok ini di awal setiap prompt Stitch sebagai konteks:**

> **Design System:**
> - Style: Clean, modern, GoFood-inspired food delivery platform
> - Mode: Light mode, white background (#FFFFFF), light gray (#F5F7FA) for sections
> - Primary color: IPB Green (#006B3F), hover: #005432
> - Secondary color: Warm Yellow (#F5A623) for accents, badges, ratings
> - Danger/Error: #E53935, Success: #43A047, Info: #1E88E5
> - Text: Dark gray (#1A1A1A) for headings, (#4A4A4A) for body, (#9E9E9E) for muted
> - Font: Inter or Poppins, clean sans-serif
> - Border radius: 12px for cards, 8px for buttons, 24px for pills/badges
> - Shadows: subtle drop shadow (0 2px 8px rgba(0,0,0,0.08))
> - Desktop layout: 1440px wide, centered content max-width 1200px
> - App name: "IPB Food Hub" with a fork+leaf icon in green

---

## Screen 1 — Login Page

```
Design a desktop login page (1440x900) for "IPB Food Hub", a university campus food ordering platform.

Design System: Light mode, white background. Primary color: IPB Green (#006B3F). Accent: Warm Yellow (#F5A623). Font: Inter/Poppins. Clean, modern, GoFood-inspired.

Layout:
- Split screen: LEFT side (60%) has a large hero illustration of cheerful college students ordering food at a campus canteen, with warm green tones and food illustrations
- RIGHT side (40%) has the login form card on a light gray (#F5F7FA) background
- Top-left corner: "IPB Food Hub" logo with a fork+leaf icon in green
- Login card (white, rounded 16px, subtle shadow):
  - Heading: "Selamat Datang!" in bold dark text
  - Subtext: "Masuk ke akun IPB Food Hub kamu" in gray
  - Email input field with envelope icon
  - Password input field with lock icon and show/hide toggle
  - Green primary button "Masuk" full width, rounded
  - Divider "atau"
  - "Belum punya akun? Daftar di sini" link in green
- Bottom: "© 2024 IPB Food Hub — Kelompok 6 P2" small text
```

---

## Screen 2 — Register Page

```
Design a desktop registration page (1440x900) for "IPB Food Hub".

Design System: Light mode, white background. Primary: IPB Green (#006B3F). Accent: Yellow (#F5A623). Font: Inter. GoFood-inspired, clean.

Layout:
- Split screen like login page. LEFT (60%): illustration of diverse students with food stalls. RIGHT (40%): registration form.
- Top: "IPB Food Hub" logo
- Registration card (white, rounded, shadow):
  - Heading: "Buat Akun Baru"
  - Role selector: two large clickable cards side by side — "Mahasiswa" (with student icon) and "Pelaku UMKM" (with store icon). Selected card has green border + green background tint.
  - Form fields (stacked):
    - Nama Lengkap
    - Email
    - No. Telepon
    - If Mahasiswa selected: NIM, Fakultas fields appear
    - Password with strength indicator bar
    - Konfirmasi Password
  - Green button "Daftar" full width
  - "Sudah punya akun? Masuk" link
```

---

## Screen 3 — Home / Landing Page (Mahasiswa)

```
Design a desktop home/landing page (1440x900) for "IPB Food Hub" after login as a student user.

Design System: Light mode, white (#FFF) and light gray (#F5F7FA). Primary: IPB Green (#006B3F). Accent: Yellow (#F5A623). Font: Inter. GoFood-style.

Layout:
- TOP NAVBAR (white, sticky, subtle bottom shadow):
  - Left: "IPB Food Hub" logo (green fork+leaf icon)
  - Center: Search bar with placeholder "Cari UMKM atau menu..." (rounded pill shape, gray border)
  - Right: Notification bell icon, User avatar circle with name "Halo, Hanif!" and dropdown arrow

- HERO BANNER (below navbar):
  - Large card (green gradient background #006B3F to #00875A) with white text
  - Left side: "Temukan UMKM Favorit di Kampus IPB 🍔" big heading, "Pesan makanan dari kantin dan UMKM mahasiswa, tanpa antri!" subtext, green button "Jelajahi UMKM"
  - Right side: Food illustration (nasi goreng, es teh, bakso, etc.)

- PROMO CAROUSEL:
  - Section heading: "🏷️ Promo Hari Ini"
  - Horizontal scrollable cards (3 visible): each card has colorful gradient background, promo title like "Diskon 20% Ayam Geprek", UMKM name, validity date, and "Klaim" button

- KATEGORI (horizontal icon row):
  - Section heading: "Kategori"
  - Circle icons in a row: Makanan Berat, Minuman, Snack, Dessert, Healthy Food — each with icon and label below

- UMKM POPULER:
  - Section heading: "⭐ UMKM Populer" with "Lihat Semua →" link
  - Grid of 4 UMKM cards (GoFood-style):
    - Each card: food photo on top (rounded top corners), UMKM name in bold, category badge (green pill), star rating with yellow star + number, location text, "Buka" status badge in green or "Tutup" in red

- FOOTER: simple footer with links and "© 2024 IPB Food Hub"
```

---

## Screen 4 — Daftar UMKM / Direktori

```
Design a desktop UMKM directory/listing page (1440x900) for "IPB Food Hub".

Design System: Light mode. Primary: IPB Green (#006B3F). Accent: Yellow (#F5A623). GoFood-inspired.

Layout:
- Navbar same as Home page
- Page heading: "Direktori UMKM" with breadcrumb (Home > Direktori UMKM)

- LEFT SIDEBAR (250px, white card):
  - "Filter" heading
  - Kategori: checkboxes (Makanan Berat, Minuman, Snack, Dessert)
  - Status: radio buttons (Semua, Buka Sekarang, Tutup)
  - Rating Minimum: star selector (1-5)
  - Lokasi: dropdown (Kantin Sapta Marga, Kantin FEM, dll.)
  - Green "Terapkan Filter" button

- MAIN CONTENT (right side):
  - Top bar: showing "Menampilkan 24 UMKM" count, sort dropdown (Terpopuler, Rating Tertinggi, Terbaru)
  - Grid layout (3 columns) of UMKM cards:
    - Each card: large food photo, UMKM name, category pill badge, star rating (yellow), operating hours "08:00 - 21:00", "Buka" green badge or "Tutup" red badge
    - Hover effect: slight lift shadow
  - Bottom: Pagination (1, 2, 3... Next)
```

---

## Screen 5 — Detail UMKM + Menu

```
Design a desktop UMKM detail page (1440x900) for "IPB Food Hub" showing a specific UMKM store and its menu.

Design System: Light mode. Primary: Green (#006B3F). Accent: Yellow (#F5A623). GoFood-style.

Layout:
- Navbar same as before

- HERO SECTION:
  - Large banner photo of the food stall (full width, 300px height, rounded bottom corners)
  - Overlapping white card at bottom of banner containing:
    - UMKM name large bold: "Warung Nasi Padang Minang"
    - Category badge: "Makanan Berat" green pill
    - Rating: ⭐ 4.8 (120 ulasan) — clickable
    - Status: "Buka" green badge, Hours: "08:00 - 21:00"
    - Location: "Kantin Sapta Marga, Lantai 1"
    - Owner info small text

- TAB NAVIGATION: "Menu" | "Ulasan" | "Promo" — underline active tab in green

- MENU TAB (active):
  - Category filters: horizontal pills (Semua, Nasi, Lauk, Minuman)
  - Menu list (GoFood style — horizontal cards):
    - Each menu item card: food photo (square, rounded), menu name bold, short description, price "Rp 15.000" in green bold, "+" add to cart circular green button on right
    - If unavailable: grayed out with "Habis" badge
  - Show 8-10 menu items

- FLOATING CART BAR (bottom of screen):
  - Green bar: "🛒 3 item | Rp 45.000" on left, "Lihat Keranjang →" button on right
```

---

## Screen 6 — Keranjang & Checkout

```
Design a desktop cart/checkout page (1440x900) for "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Accent: Yellow (#F5A623). Clean checkout flow.

Layout:
- Navbar
- Page heading: "Keranjang Pesanan" with breadcrumb

- LEFT SECTION (65%):
  - UMKM info card: store name "Warung Nasi Padang Minang" with small photo
  - Cart items list (white cards, stacked):
    - Each item: food photo thumbnail, menu name, quantity controls (- number +), unit price, subtotal, delete (trash) icon
    - Show 3 items
  - "Catatan Pesanan" text area (optional notes)
  - "Waktu Pengambilan" date-time picker

- RIGHT SECTION (35%, sticky):
  - Order summary card (white, rounded, shadow):
    - "Ringkasan Pesanan" heading
    - Item breakdown list with prices
    - Divider line
    - "Total" in bold: "Rp 45.000" large green text
    - Payment method info: "Transfer Manual (Bank/E-Wallet/QRIS)"
    - Green button "Buat Pesanan" full width, large
    - Small disclaimer text about payment process
```

---

## Screen 7 — Upload Bukti Pembayaran

```
Design a desktop payment proof upload page (1440x900) for "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Clean, step-by-step.

Layout:
- Navbar
- Progress stepper at top: Step 1 "Pesanan Dibuat" ✓ → Step 2 "Upload Bukti" (active, green) → Step 3 "Validasi" → Step 4 "Selesai"

- TWO COLUMN layout:
  - LEFT (55%): Payment instructions card
    - Heading: "Transfer Pembayaran"
    - Total amount large: "Rp 45.000"
    - Payment destination card (green light background):
      - Bank/E-wallet options as tabs: BCA, Mandiri, GoPay, QRIS
      - Selected: show account number "0812-3456-7890" with copy button
      - Account holder name: "Warung Nasi Padang Minang"
    - "Batas waktu pembayaran: 23:59 WIB" with countdown timer
    
  - RIGHT (45%): Upload section card
    - Heading: "Upload Bukti Transfer"
    - Large dashed-border upload area with cloud upload icon
    - Text: "Klik atau drag foto bukti transfer di sini"
    - Supported formats: "JPG, PNG (max 5MB)"
    - After upload: show image preview with remove button
    - Dropdown: "Metode Pembayaran" (Transfer Bank, E-Wallet, QRIS)
    - Green button "Kirim Bukti Pembayaran"
```

---

## Screen 8 — Status & Riwayat Pesanan

```
Design a desktop order status/history page (1440x900) for "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Accent: Yellow (#F5A623).

Layout:
- Navbar
- Page heading: "Pesanan Saya"
- Tab navigation: "Aktif (2)" | "Riwayat" — active tab underlined green

- ACTIVE ORDERS tab:
  - Order cards (white, rounded, shadow), stacked vertically:
    - Card 1 (current/active):
      - Status badge: "Diproses" yellow badge (animated pulse dot)
      - UMKM name, Order date, Order ID
      - Items summary: "Nasi Padang x1, Es Teh x2"
      - Total: Rp 45.000
      - Progress tracker (horizontal): Ordered ✓ → Paid ✓ → Processing (active, pulsing) → Ready → Done
      - "Lihat Detail" button
    - Card 2: Status "Menunggu Validasi" orange badge

- HISTORY tab (when clicked):
  - Similar cards but with completed status
  - Each card has "Selesai" green badge or "Ditolak" red badge
  - "Beri Rating" yellow button for completed orders without rating
  - Star rating shown for already-rated orders
```

---

## Screen 9 — Rating & Ulasan

```
Design a desktop rating/review page (1440x900) for "IPB Food Hub" showing reviews for a UMKM.

Design System: Light mode. Primary: Green (#006B3F). Accent: Yellow (#F5A623).

Layout:
- Navbar
- Page heading: "Ulasan — Warung Nasi Padang Minang"

- TOP: Rating summary card (white, rounded):
  - Left: Large average rating "4.8" with big yellow stars, "120 ulasan" text
  - Right: Rating distribution bars (5 star: 80%, 4 star: 15%, 3 star: 3%, 2 star: 1%, 1 star: 1%) — horizontal bar chart in green

- WRITE REVIEW card (if user has completed order, green light background):
  - "Tulis Ulasan Anda" heading
  - 5 large clickable stars (interactive, yellow when selected)
  - Text area: "Ceritakan pengalaman Anda..."
  - Green "Kirim Ulasan" button

- REVIEWS LIST:
  - Filter: "Semua", "⭐5", "⭐4", "⭐3", "⭐2", "⭐1" pill buttons
  - Review cards stacked:
    - User avatar, user name, rating stars, date
    - Review text content
    - If owner replied: nested reply card with green left border, "Balasan dari pemilik:" label
```

---

## Screen 10 — Dashboard UMKM (Pelaku UMKM)

```
Design a desktop UMKM owner dashboard page (1440x900) for "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Accent: Yellow (#F5A623). Professional dashboard style.

Layout:
- LEFT SIDEBAR (240px, white, full height):
  - Top: "IPB Food Hub" logo + "Dashboard UMKM" label
  - Store avatar + name "Warung Nasi Padang Minang"
  - Navigation menu items (icons + text, active item has green background tint):
    - 📊 Dashboard (active)
    - 📋 Kelola Menu
    - 📦 Pesanan Masuk
    - 🏷️ Kelola Promo
    - 📜 Riwayat Transaksi
    - ⚙️ Pengaturan Toko
  - Bottom: Logout button

- MAIN CONTENT:
  - Top bar: "Dashboard" heading, "Halo, Hanif!" greeting, date today
  
  - STATS CARDS ROW (4 cards):
    - Pesanan Hari Ini: "12" (green icon)
    - Pendapatan Hari Ini: "Rp 540.000" (yellow icon)
    - Rating: "4.8 ⭐" (yellow)
    - Menu Aktif: "15" (blue icon)
  
  - TWO COLUMN below stats:
    - LEFT: "Pesanan Terbaru" table (5 rows): Order ID, Customer, Items, Total, Status badge, Action button
    - RIGHT: "Grafik Penjualan Mingguan" simple bar chart (green bars)
  
  - BOTTOM: "Ulasan Terbaru" — 2-3 recent review cards with star ratings
```

---

## Screen 11 — Kelola Menu (UMKM)

```
Design a desktop menu management page (1440x900) for UMKM owner in "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Dashboard style with sidebar.

Layout:
- Same sidebar as Dashboard (Kelola Menu is active/highlighted)

- MAIN CONTENT:
  - Top: "Kelola Menu" heading + green "＋ Tambah Menu" button on right
  - Category tabs: "Semua (15)" | "Makanan (8)" | "Minuman (5)" | "Snack (2)"
  
  - Menu items as a TABLE or grid cards:
    - Table columns: Photo thumbnail, Nama Menu, Kategori, Harga, Status toggle (switch), Actions (Edit pencil icon, Delete trash icon)
    - Show 8 rows with alternating white/light gray backgrounds
    - Status toggle: green=Tersedia, gray=Habis
  
  - When "Tambah Menu" is clicked, show MODAL overlay:
    - Modal (white, centered, rounded 16px, shadow):
      - "Tambah Menu Baru" heading
      - Image upload area (square, dashed border)
      - Fields: Nama Menu, Kategori dropdown, Harga (Rp prefix), Deskripsi textarea
      - Toggle: "Tersedia"
      - Buttons: "Batal" gray outline, "Simpan" green
```

---

## Screen 12 — Pesanan Masuk & Validasi (UMKM)

```
Design a desktop incoming orders page (1440x900) for UMKM owner in "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Dashboard style.

Layout:
- Same sidebar (Pesanan Masuk active)

- MAIN CONTENT:
  - Top: "Pesanan Masuk" heading
  - Filter tabs: "Menunggu Validasi (3)" | "Diproses (2)" | "Siap Diambil (1)" | "Selesai" | "Ditolak"

  - ORDER CARDS (stacked, white, rounded, shadow):
    - Card header: Order ID "#ORD-001", date, customer name + avatar
    - Items list: "Nasi Padang x1, Es Teh Manis x2" 
    - Total: "Rp 45.000" bold
    - Payment proof section (for "Menunggu Validasi" tab):
      - Thumbnail of uploaded payment proof image (clickable to enlarge)
      - Payment method badge: "Transfer BCA"
      - Two action buttons: "✓ Terima" (green) and "✗ Tolak" (red outline)
      - If Tolak: show text input for rejection reason
    - For "Diproses" tab: "Tandai Siap Diambil" green button
    - For "Siap Diambil" tab: "Tandai Selesai" green button
```

---

## Screen 13 — Kelola Promo (UMKM)

```
Design a desktop promo management page (1440x900) for UMKM owner in "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Dashboard style.

Layout:
- Same sidebar (Kelola Promo active)

- MAIN CONTENT:
  - Top: "Kelola Promo" heading + green "＋ Buat Promo Baru" button
  - Tabs: "Aktif (2)" | "Akan Datang (1)" | "Berakhir (5)"

  - Promo cards (grid, 2 columns):
    - Each card (white, rounded, colorful top accent border):
      - Promo title: "Diskon 20% Ayam Geprek"
      - Description text
      - Discount badge: "20% OFF" in yellow pill
      - Period: "1 Jan - 31 Jan 2024"
      - Status: "Aktif" green badge or "Berakhir" gray badge
      - Buttons: "Edit" and "Nonaktifkan"/"Aktifkan" toggle

  - Create Promo MODAL:
    - Fields: Judul Promo, Deskripsi, Diskon (%), Tanggal Mulai, Tanggal Berakhir, Syarat & Ketentuan textarea
    - "Simpan Promo" green button
```

---

## Screen 14 — Dashboard Admin

```
Design a desktop admin dashboard page (1440x900) for "IPB Food Hub" platform administrator.

Design System: Light mode. Primary: Green (#006B3F). Professional admin panel.

Layout:
- LEFT SIDEBAR (240px, dark green #006B3F background, white text):
  - Top: "IPB Food Hub" logo, "Admin Panel" label
  - Admin avatar + name
  - Navigation (white text, active item has light green highlight):
    - 📊 Dashboard (active)
    - 👥 Kelola Akun
    - 🏪 Kelola UMKM
    - 📝 Moderasi Konten
    - 💰 Monitor Transaksi
    - 📈 Statistik
  - Bottom: Logout

- MAIN CONTENT:
  - Top bar: "Dashboard Admin" heading, date
  
  - STATS ROW (5 cards):
    - Total Mahasiswa: "1,234"
    - Total UMKM: "56"
    - Transaksi Hari Ini: "89"
    - Pendapatan Platform: "Rp 12.5 Jt"
    - UMKM Pending Approval: "3" (red badge)
  
  - TWO COLUMN:
    - LEFT (60%): "UMKM Menunggu Persetujuan" table — UMKM name, owner, date applied, "Approve" green btn, "Reject" red btn
    - RIGHT (40%): "Aktivitas Terbaru" activity feed — timeline style with icons and descriptions
  
  - BOTTOM: "Statistik Transaksi Bulanan" line chart (green line)
```

---

## Screen 15 — Kelola Akun (Admin)

```
Design a desktop user account management page (1440x900) for admin in "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Admin panel style.

Layout:
- Same dark green sidebar (Kelola Akun active)

- MAIN CONTENT:
  - Top: "Kelola Akun Pengguna" heading
  - Search bar + filter dropdown (Role: Semua/Mahasiswa/UMKM/Admin) + "Export CSV" button
  
  - DATA TABLE (clean, professional):
    - Columns: Avatar, Nama, Email, Role (colored badge), Status, Tanggal Daftar, Aksi
    - Role badges: "Mahasiswa" blue pill, "UMKM" orange pill, "Admin" green pill
    - Status: "Aktif" green dot, "Suspended" red dot
    - Actions dropdown: View, Suspend, Activate, Delete
    - 10 rows of sample data
    - Bottom: "Showing 1-10 of 1,234" + pagination
```

---

## Screen 16 — Moderasi & Monitor Transaksi (Admin)

```
Design a desktop transaction monitoring page (1440x900) for admin in "IPB Food Hub".

Design System: Light mode. Primary: Green (#006B3F). Admin panel.

Layout:
- Same dark green sidebar (Monitor Transaksi active)

- MAIN CONTENT:
  - Top: "Monitor Transaksi" heading
  - Date range picker + Status filter dropdown + "Export" button

  - SUMMARY CARDS ROW:
    - Total Transaksi: "1,890"
    - Total Nilai: "Rp 45.2 Jt"
    - Sukses: "1,756" (green)
    - Ditolak: "134" (red)

  - TRANSACTION TABLE:
    - Columns: ID Transaksi, Tanggal, Mahasiswa, UMKM, Items, Total, Status badge, Aksi
    - Status badges: "Selesai" green, "Diproses" yellow, "Ditolak" red, "Menunggu" gray
    - Expandable row detail showing payment proof image and order details
    - 10 rows sample data
    - Pagination at bottom
```

---

## 💡 Tips Penggunaan di Google Stitch

1. **Copy Design System** blok di atas, lalu paste sebagai konteks awal di setiap prompt.
2. **Paste satu screen prompt** per satu kali generate (jangan campur beberapa screen sekaligus).
3. Jika hasil kurang sesuai, tambahkan instruksi tambahan seperti: *"Make the cards bigger"*, *"Use more whitespace"*, *"Make text more readable"*.
4. Untuk konsistensi antar screen, sebutkan: *"Use the same navbar, sidebar, and color scheme as the previous design."*
