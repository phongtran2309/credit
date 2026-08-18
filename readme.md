# 💳 MCC Cashback & Credit Card Spending Tracker

Hệ thống tra cứu mã danh mục chi tiêu (MCC - Merchant Category Code) thông minh và quản lý chu kỳ sao kê thẻ tín dụng cá nhân, hỗ trợ tìm kiếm thẻ tối ưu hoàn tiền cao nhất và theo dõi tiến độ chi tiêu theo từng kỳ sao kê.

---

## 🌟 Tính năng chính

1. **Tra cứu MCC & Gợi ý thẻ thông minh (Smart MCC Lookup):**
   - Tìm kiếm nhanh theo mã số MCC (VD: `6300`, `5411`, `5812`) hoặc tên danh mục/từ khóa (VD: `Bảo hiểm`, `Shopee`, `Siêu thị`, `Ăn uống`).
   - Tự động so sánh và sắp xếp các thẻ tín dụng theo **tỷ lệ hoàn tiền cao nhất**.
   - Hiển thị đầy đủ điều kiện hoàn tiền (chi tiêu tối thiểu, trần hoàn tối đa).

2. **Quản lý Chi tiêu & Kỳ sao kê (Cycle Spending Tracker):**
   - Tự động tính toán chu kỳ sao kê hiện tại theo ngày chốt sao kê (`statement_day`) của từng thẻ.
   - Ghi nhận giao dịch chi tiêu theo từng mã MCC và thẻ cụ thể.
   - Thống kê tổng chi tiêu trong kỳ, ước tính số tiền hoàn và cảnh báo khi sắp chạm trần hoàn tiền (Max Cashback Cap).

---

## 🛠️ Công nghệ sử dụng

- **Frontend / Fullstack Framework:** Next.js (App Router), React, Tailwind CSS, Lucide React (Icons).
- **Database & Backend:** Supabase (PostgreSQL Free Tier).
- **Hosting & CI/CD:** Vercel (Miễn phí 100%).
- **Ngôn ngữ:** JavaScript / TypeScript.

---

## 📁 Cấu trúc thư mục dự án

```text
mcc-cashback-tracker/
├── app/
│   ├── layout.tsx                # Layout tổng, Navbar & Theme provider
│   ├── page.tsx                  # Trang chủ: Tra cứu MCC & Gợi ý thẻ
│   ├── tracker/
│   │   └── page.tsx              # Quản lý giao dịch & theo dõi kỳ sao kê
│   ├── api/
│   │   ├── mcc/route.ts          # API query gợi ý thẻ theo MCC
│   │   └── transactions/route.ts # API thêm và tính toán giao dịch
│   └── globals.css
├── components/
│   ├── Navbar.tsx                # Thanh điều hướng chuyển đổi tab
│   ├── MccSearchInput.tsx        # Thanh tìm kiếm MCC thông minh
│   ├── CardRecommendation.tsx    # Card hiển thị kết quả so sánh hoàn tiền
│   ├── TransactionForm.tsx       # Form nhập nhanh giao dịch
│   └── StatementProgress.tsx     # Progress bar chi tiêu & hạn mức hoàn tiền
├── lib/
│   ├── supabase.ts               # Khởi tạo Supabase Client
│   └── statement-helper.ts       # Utility tính chu kỳ ngày sao kê
├── types/
│   └── index.ts                  # TypeScript definitions (Card, MCC, Rule, Transaction)
├── .env.local.example            # File mẫu cấu hình biến môi trường
├── package.json
└── README.md
```

---

## 🚀 Hướng dẫn Triển khai Từng bước

### Bước 1: Khởi tạo Database trên Supabase

1. Truy cập [Supabase](https://supabase.com) và đăng ký/đăng nhập tài khoản miễn phí.
2. Tạo mới một Project (chọn Region gần Việt Nam nhất, ví dụ **Singapore**).
3. Tại thanh menu bên trái, mở **SQL Editor** và chạy đoạn script SQL sau để khởi tạo bảng và dữ liệu mẫu:

```sql
-- 1. Bảng danh mục Thẻ tín dụng
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    bank VARCHAR(50) NOT NULL,
    statement_day INT NOT NULL,           -- Ngày chốt sao kê hàng tháng (VD: 20)
    due_day INT NOT NULL,                 -- Ngày hạn thanh toán (VD: 5)
    max_cashback_per_month NUMERIC(12,2), -- Hạn mức hoàn tiền tối đa/kỳ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng định nghĩa Mã MCC
CREATE TABLE mcc_codes (
    code VARCHAR(10) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 3. Bảng quy tắc hoàn tiền theo Thẻ và MCC
CREATE TABLE cashback_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    mcc_code VARCHAR(10) REFERENCES mcc_codes(code),
    cashback_rate NUMERIC(5,2) NOT NULL,  -- Tỷ lệ hoàn tiền (%): 5.0, 10.0, 15.0
    min_spend_required NUMERIC(12,2) DEFAULT 0,
    note VARCHAR(255)
);

-- 4. Bảng ghi nhận Giao dịch chi tiêu
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    mcc_code VARCHAR(10) REFERENCES mcc_codes(code),
    amount NUMERIC(12,2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cashback_amount NUMERIC(12,2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO mcc_codes (code, category_name, description) VALUES
('6300', 'Bảo hiểm', 'Các công ty bảo hiểm nhân thọ, phi nhân thọ'),
('5411', 'Siêu thị & Tạp hóa', 'WinMart, Co.opmart, Big C, Bách Hóa Xanh'),
('5812', 'Nhà hàng & Ẩm thực', 'Quán ăn, nhà hàng, dịch vụ ẩm thực'),
('5311', 'Trung tâm thương mại', 'TTTM, bách hóa tổng hợp'),
('5814', 'Thức ăn nhanh', 'KFC, Lotteria, McDonald, Highlands, Phúc Long');

INSERT INTO cards (name, bank, statement_day, due_day, max_cashback_per_month) VALUES
('VIB Family Link', 'VIB', 20, 5, 1000000),
('VPBank StepUp', 'VPBank', 25, 10, 600000),
('Techcombank Spark', 'Techcombank', 15, 30, 800000);

-- Thêm quy tắc hoàn tiền mẫu cho thẻ
INSERT INTO cashback_rules (card_id, mcc_code, cashback_rate, min_spend_required, note)
SELECT id, '6300', 10.0, 5000000, 'Hoàn 10% danh mục Bảo hiểm khi chi tiêu đủ 5 triệu/kỳ'
FROM cards WHERE name = 'VIB Family Link';

INSERT INTO cashback_rules (card_id, mcc_code, cashback_rate, min_spend_required, note)
SELECT id, '5411', 5.0, 0, 'Hoàn 5% cho Siêu thị không giới hạn điều kiện'
FROM cards WHERE name = 'VPBank StepUp';
```

4. Lấy thông tin kết nối API:
   - Vào **Project Settings** -> **API**.
   - Sao chép `Project URL` và `anon/public Key`.

---

### Bước 2: Cài đặt và Chạy thử ở máy cá nhân (Local Development)

1. Clone source code dự án hoặc khởi tạo dự án Next.js:
   ```bash
   git clone <url-repo-cua-ban>
   cd mcc-cashback-tracker
   ```

2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install @supabase/supabase-js lucide-react clsx tailwind-merge
   ```

3. Tạo file cấu hình biến môi trường `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Điền thông tin Supabase đã lấy ở Bước 1:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

4. Khởi chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: `http://localhost:3000`.

---

### Bước 3: Triển khai lên Vercel (Miễn phí)

1. Đẩy code lên tài khoản **GitHub** cá nhân.
2. Truy cập [Vercel](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
3. Chọn **Add New...** -> **Project** -> Chọn repository vừa tải lên.
4. Tại phần **Environment Variables**, thêm 2 biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase của bạn.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key của bạn.
5. Nhấn **Deploy**. Vercel sẽ tự động build và cấp cho bạn một tên miền miễn phí dạng `https://your-project.vercel.app`.

---

## 💡 Mẹo sử dụng tiện lợi

- **Thêm trực tiếp trên điện thoại:** Mở website trên trình duyệt Safari/Chrome trên điện thoại -> Chọn *Thêm vào màn hình chính (Add to Home Screen)* để sử dụng như một App độc lập khi đi mua sắm.
- **Cập nhật chính sách thẻ nhanh chóng:** Bạn có thể vào trực tiếp mục **Table Editor** của Supabase trên điện thoại/máy tính để sửa tỷ lệ hoàn tiền hoặc thêm mã MCC mới mà không cần sửa code.