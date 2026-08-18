const fs = require('fs');
const path = require('path');

const vib = JSON.parse(fs.readFileSync(path.join(__dirname, 'vib-card.json'), 'utf8'));

// Prominent descriptions
const KNOWN_DESC = {
  '5812': { name: 'Nhà hàng & Dịch vụ Ẩm thực', desc: 'Nhà hàng ăn uống, lẩu nướng, buffet, fine dining' },
  '5814': { name: 'Quán ăn nhanh & Thức uống', desc: 'Highlands Coffee, Starbucks, Phúc Long, KFC, Lotteria, Gong Cha' },
  '5813': { name: 'Quán bar, Pub, Lounge & Club', desc: 'Quán bar, đồ uống có cồn, pub' },
  '5811': { name: 'Dịch vụ tiệc & Catering', desc: 'Dịch vụ đặt tiệc, tiệc cưới, tổ chức sự kiện' },
  '5311': { name: 'Trung tâm thương mại & Bách hóa', desc: 'Takashimaya, Vincom, Aeon Mall, Lotte Mall' },
  '5411': { name: 'Siêu thị & Cửa hàng tiện lợi', desc: 'WinMart, Co.opmart, Big C, Bách Hóa Xanh, Circle K' },
  '5651': { name: 'Cửa hàng thời trang gia đình', desc: 'Zara, Uniqlo, H&M, Routine, Yody, Canifa' },
  '5661': { name: 'Cửa hàng giày dép', desc: 'Nike Store, Adidas Store, Bitis Hunter, Juno, Vascara' },
  '5977': { name: 'Cửa hàng mỹ phẩm & Nước hoa', desc: 'Hasaki, Guardian, Watsons, Innisfree, Sephora' },
  '5094': { name: 'Cửa hàng trang sức & Đồng hồ', desc: 'PNJ, DOJI, SJC, Đồng Hồ Hải Triều' },
  '5732': { name: 'Cửa hàng thiết bị điện tử', desc: 'Thế Giới Di Động, FPT Shop, CellphoneS' },
  '5399': { name: 'Sàn thương mại điện tử', desc: 'Shopee, Lazada, Tiki, TikTok Shop, Sendo' },
  '4511': { name: 'Hãng hàng không & Vé máy bay', desc: 'Vietnam Airlines, Vietjet Air, Bamboo Airways' },
  '4722': { name: 'Đại lý du lịch & Đặt phòng OTA', desc: 'Traveloka, Agoda, Booking.com, Trip.com, Klook' },
  '7011': { name: 'Khách sạn, Resort & Khu nghỉ dưỡng', desc: 'Vinpearl, FLC, Marriott, Hilton, InterContinental' },
  '6300': { name: 'Phí Bảo hiểm nhân thọ & Phi nhân thọ', desc: 'Manulife, Prudential, Dai-ichi Life, Bảo Việt, AIA' },
  '8211': { name: 'Trường mầm non, tiểu học, trung học', desc: 'Vinschool, Wellspring, BVIS, VAS' },
  '8220': { name: 'Trường Đại học, Cao đẳng', desc: 'RMIT University, VinUniversity, ĐH FPT, BUV' },
  '8299': { name: 'Trung tâm ngoại ngữ & Kỹ năng', desc: 'ILA, VUS, Apollo, Topica, Coursera' },
  '8062': { name: 'Bệnh viện đa khoa & Chuyên khoa', desc: 'Vinmec, BV FV, BV Hoàn Mỹ, BV Tâm Anh, BV Chợ Rẫy' },
  '5912': { name: 'Hiệu thuốc & Nhà thuốc tân dược', desc: 'Nhà thuốc Long Châu, Pharmacity, An Khang' },
  '7311': { name: 'Dịch vụ Quảng cáo trực tuyến', desc: 'Facebook Ads (Meta), Google Ads, TikTok Ads' },
  '5815': { name: 'Dịch vụ giải trí số', desc: 'Netflix, Spotify, Apple Music, YouTube Premium' },
  '5816': { name: 'Trò chơi điện tử & Ứng dụng số', desc: 'Steam, PlayStation, App Store, Google Play' },
  '7832': { name: 'Rạp chiếu phim', desc: 'CGV Cinemas, Lotte Cinema, Galaxy, BHD Star' }
};

const mccMap = new Map();

for (const card of vib) {
  for (const [category, value] of Object.entries(card)) {
    if (category === 'tên_thẻ') continue;
    if (Array.isArray(value)) {
      for (const code of value) {
        if (!mccMap.has(code)) {
          mccMap.set(code, category);
        }
      }
    }
  }
}

// Build SQL
let sql = `-- ====================================================================
-- MCC Cashback & Credit Card Spending Tracker - Database Schema
-- Tích hợp đầy đủ ${mccMap.size} mã MCC từ vib-card.json
-- Cập nhật chính sách: Family Link & Cash Back (theo kỳ trước), Super Card (max 500k/danh mục), 2in1 (5% online ngoại tệ, 50k lưu thẻ)
-- ====================================================================

-- 1. Bảng danh mục Thẻ tín dụng
CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    bank VARCHAR(50) NOT NULL,
    statement_day INT NOT NULL,           -- Ngày chốt sao kê hàng tháng (VD: 20)
    due_day INT NOT NULL,                 -- Ngày hạn thanh toán (VD: 5)
    max_cashback_per_month NUMERIC(12,2), -- Hạn mức hoàn tiền tối đa/kỳ
    max_cashback_per_category NUMERIC(12,2), -- Hạn mức tối đa / 1 danh mục / kỳ (500k)
    default_cashback_rate NUMERIC(5,2) DEFAULT 0.1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng định nghĩa Mã MCC
CREATE TABLE IF NOT EXISTS mcc_codes (
    code VARCHAR(10) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- 3. Bảng quy tắc hoàn tiền theo Thẻ và MCC
CREATE TABLE IF NOT EXISTS cashback_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id VARCHAR(50) REFERENCES cards(id) ON DELETE CASCADE,
    category_name VARCHAR(100),
    mcc_code VARCHAR(10) REFERENCES mcc_codes(code),
    cashback_rate NUMERIC(5,2) NOT NULL,  -- Tỷ lệ hoàn tiền (%): 5.0, 8.0, 10.0, 15.0
    min_spend_required NUMERIC(12,2) DEFAULT 0,
    max_cashback_per_category NUMERIC(12,2) DEFAULT 0,
    is_online_only BOOLEAN DEFAULT FALSE,
    is_foreign_only BOOLEAN DEFAULT FALSE,
    is_saved_card_only BOOLEAN DEFAULT FALSE,
    note VARCHAR(255)
);

-- 4. Bảng ghi nhận Giao dịch chi tiêu
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(100) PRIMARY KEY,
    card_id VARCHAR(50) REFERENCES cards(id) ON DELETE CASCADE,
    mcc_code VARCHAR(10),
    amount NUMERIC(12,2) NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cashback_amount NUMERIC(12,2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- SEED DATA: DỮ LIỆU CÁC DÒNG THẺ VIB (NGÀY CHỐT 27 - HẠN TT 21)
-- ====================================================================

INSERT INTO cards (id, name, bank, statement_day, due_day, max_cashback_per_month, max_cashback_per_category, default_cashback_rate) VALUES
('vib-super-card', 'VIB Super Card', 'VIB', 27, 21, 1000000, 500000, 0.1),
('vib-family-link', 'VIB Family Link', 'VIB', 27, 21, 1000000, 500000, 0.1),
('vib-online-plus-2in1', 'VIB Online Plus 2in1', 'VIB', 27, 21, 600000, NULL, 0.1),
('vib-cash-back', 'VIB Cash Back', 'VIB', 27, 21, 2000000, NULL, 0.1),
('vib-max-card', 'VIB Max Card', 'VIB', 27, 21, 1500000, 1500000, 0.1),
('shinhan-supreme', 'Shinhan Supreme', 'Shinhan Bank', 20, 6, 1000000, 1000000, 0.1)
ON CONFLICT (id) DO UPDATE SET
    statement_day = EXCLUDED.statement_day,
    due_day = EXCLUDED.due_day,
    max_cashback_per_month = EXCLUDED.max_cashback_per_month,
    max_cashback_per_category = EXCLUDED.max_cashback_per_category;

-- ====================================================================
-- SEED DATA: CHÈN TOÀN BỘ ${mccMap.size} MÃ MCC TỪ VIB-CARD.JSON
-- ====================================================================

INSERT INTO mcc_codes (code, category_name, name, description) VALUES
`;

const entries = [];
for (const [code, category] of mccMap.entries()) {
  let name = `${category} (MCC ${code})`;
  let desc = `Giao dịch danh mục ${category} theo phân loại VIB`;
  
  if (KNOWN_DESC[code]) {
    name = KNOWN_DESC[code].name;
    desc = KNOWN_DESC[code].desc;
  } else {
    const num = parseInt(code, 10);
    if (num >= 3000 && num <= 3308) {
      name = `Hãng hàng không / Vé máy bay (${code})`;
      desc = `Mã định danh hàng không quốc tế thuộc danh mục Du lịch VIB`;
    } else if (num >= 3501 && num <= 3838) {
      name = `Khách sạn & Resort quốc tế (${code})`;
      desc = `Mã định danh chuỗi khách sạn/nghỉ dưỡng quốc tế thuộc danh mục Du lịch VIB`;
    }
  }

  const safeName = name.replace(/'/g, "''");
  const safeDesc = desc.replace(/'/g, "''");
  const safeCategory = category.replace(/'/g, "''");

  entries.push(`('${code}', '${safeCategory}', '${safeName}', '${safeDesc}')`);
}

sql += entries.join(',\n') + '\nON CONFLICT (code) DO NOTHING;\n\n';

sql += `-- ====================================================================
-- SEED DATA: QUY TẮC HOÀN TIỀN CÁC DÒNG THẺ
-- ====================================================================

INSERT INTO cashback_rules (card_id, category_name, cashback_rate, max_cashback_per_category, note) VALUES
-- VIB Super Card (15%, max 500k/danh mục/kỳ, tổng 1tr/kỳ)
('vib-super-card', 'Ẩm thực', 15.0, 500000, 'Hoàn 15% cho danh mục Ẩm thực (tối đa 500.000đ/kỳ)'),
('vib-super-card', 'Du lịch', 15.0, 500000, 'Hoàn 15% cho Du lịch, Vé máy bay, Khách sạn (tối đa 500.000đ/kỳ)'),
('vib-super-card', 'Mua sắm', 15.0, 500000, 'Hoàn 15% cho Mua sắm, TTTM, Thời trang (tối đa 500.000đ/kỳ)'),
('vib-super-card', 'Giao dịch trực tuyến', 15.0, 500000, 'Hoàn 15% cho chi tiêu Online (trừ 6300, 7399, tối đa 500.000đ/kỳ)'),
('vib-super-card', 'Giao dịch nước ngoài', 15.0, 500000, 'Hoàn 15% cho chi tiêu trực tiếp tại POS nước ngoài (tối đa 500.000đ/kỳ)'),

-- VIB Family Link (Hoàn 5% ≤50tr, 8% 50-100tr, 10% >100tr theo kỳ trước - max 500k/danh mục)
('vib-family-link', 'Bảo hiểm', 10.0, 500000, 'Hoàn 5% - 8% - 10% Bảo hiểm nhân thọ (MCC 6300) theo chi tiêu kỳ trước (tối đa 500.000đ/kỳ)'),
('vib-family-link', 'Giáo dục', 10.0, 500000, 'Hoàn 5% - 8% - 10% Học phí trường học các cấp (MCC 8211-8299) theo chi tiêu kỳ trước (tối đa 500.000đ/kỳ)'),
('vib-family-link', 'Y tế', 10.0, 500000, 'Hoàn 5% - 8% - 10% Bệnh viện, Viện phí, Nhà thuốc (MCC 8062, 5912...) theo chi tiêu kỳ trước (tối đa 500.000đ/kỳ)'),

-- VIB Cash Back (Hoàn 5% max 800k, 8% max 1tr, 10% max 2tr theo kỳ trước)
('vib-cash-back', 'Dịch vụ Marketing/Quảng cáo', 10.0, NULL, 'Hoàn 5% (max 800k), 8% (max 1tr), 10% (max 2tr) cho Ads Facebook/Google/TikTok'),
('vib-cash-back', 'Ẩm thực', 10.0, NULL, 'Hoàn 5%, 8%, 10% Nhà hàng, Ăn uống, Cafe theo chi tiêu kỳ trước'),
('vib-cash-back', 'Giải trí', 10.0, NULL, 'Hoàn 5%, 8%, 10% Rạp chiếu phim CGV, Thể thao, Gym theo chi tiêu kỳ trước'),

-- VIB Online Plus 2in1 (Ưu đãi 1: 5% online ngoại tệ, 3% online nội địa; Ưu đãi 2: 50k lưu thẻ)
('vib-online-plus-2in1', 'Giao dịch chi tiêu trực tuyến nước ngoài', 5.0, 600000, 'Ưu đãi 1: Hoàn 5% chi tiêu trực tuyến tại ĐVCNT nước ngoài bằng ngoại tệ (Max 600k/kỳ)'),
('vib-online-plus-2in1', 'Giao dịch chi tiêu trực tuyến còn lại', 3.0, 600000, 'Ưu đãi 1: Hoàn 3% chi tiêu trực tuyến nội địa (Max 600k/kỳ)'),
('vib-online-plus-2in1', 'Giao dịch có lưu thông tin Thẻ', 5.0, 100000, 'Ưu đãi 2: Hoàn 50.000đ / giao dịch lưu thẻ Grab, Netflix, Tiki, Agoda, Spotify... (Max 100k/kỳ, 300k/KH)'),

-- VIB Max Card (10% các ngành hàng, max 1.5tr/kỳ)
('vib-max-card', 'Mua sắm', 10.0, 1500000, 'Hoàn 10% hệ thống bán lẻ và TTTM (tối đa 1.500.000đ/kỳ)'),
('vib-max-card', 'Du lịch', 10.0, 1500000, 'Hoàn 10% Hàng không và khách sạn toàn cầu (tối đa 1.500.000đ/kỳ)'),
('vib-max-card', 'Ẩm thực', 10.0, 1500000, 'Hoàn 10% Ẩm thực, Nhà hàng, Quán ăn (tối đa 1.500.000đ/kỳ)'),
('vib-max-card', 'Giải trí', 10.0, 1500000, 'Hoàn 10% Giải trí số, Rạp phim, Gym (tối đa 1.500.000đ/kỳ)'),
('vib-max-card', 'Giao dịch trực tuyến', 10.0, 1500000, 'Hoàn 10% chi tiêu trực tuyến (tối đa 1.500.000đ/kỳ)'),

-- Shinhan Supreme (Tích 12% TMĐT/Điện máy/Học phí/Nhà sách; Tích 6% Bệnh viện/Bảo hiểm; Max 1tr/kỳ khi chi tiêu ≥ 15tr)
('shinhan-supreme', 'Thương mại điện tử', 12.0, 1000000, 'Tích 12% cho sàn Thương mại điện tử (MCC 5262, 5399: Shopee, Lazada, Tiki, TikTok Shop...)'),
('shinhan-supreme', 'Điện máy', 12.0, 1000000, 'Tích 12% Cửa hàng Điện máy & Thiết bị gia dụng (MCC 5732, 5722: ĐMX, FPT Shop, TGDD, Nguyễn Kim...)'),
('shinhan-supreme', 'Giáo dục', 12.0, 1000000, 'Tích 12% Học phí, Trường học các cấp, Đại học & Trung tâm đào tạo (MCC 8211, 8220, 8241, 8244, 8249, 8299)'),
('shinhan-supreme', 'Nhà sách', 12.0, 1000000, 'Tích 12% Nhà sách, Sách báo & Tạp chí (MCC 5942, 5192: Fahasa, Nhã Nam, Phương Nam...)'),
('shinhan-supreme', 'Bệnh viện', 6.0, 1000000, 'Tích 6% Bệnh viện, Phòng khám, Dịch vụ y tế & Dịch vụ công (MCC 8011, 8062, 8099, 9399)'),
('shinhan-supreme', 'Bảo hiểm', 6.0, 1000000, 'Tích 6% Phí bảo hiểm nhân thọ, phi nhân thọ & Trực tuyến (MCC 5960, 6300, 6381, 6399)');

`;

fs.writeFileSync(path.join(__dirname, 'supabase-schema.sql'), sql, 'utf8');
console.log('Successfully generated updated supabase-schema.sql with ' + entries.length + ' MCC codes.');
