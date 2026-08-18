import { MccItem } from "@/types";

// Raw definitions from vib-card.json and standard global / VN MCC registries
export const RAW_VIB_MCC_DATA = {
  "Mua sắm": [
    "7296", "7251", "5999", "5998", "5997", "5996", "5995", "5994", "5993", "5992",
    "5977", "5950", "5949", "5948", "5947", "5946", "5945", "5944", "5943", "5942",
    "5941", "5940", "5937", "5935", "5933", "5699", "5698", "5697", "5691", "5681",
    "5661", "5655", "5651", "5641", "5631", "5621", "5611", "5331", "5311", "5310",
    "5309", "5301", "5300", "5298", "5296", "5262", "5200", "5193", "5192", "5139",
    "5137", "5131", "5111", "5099", "5094", "5021", "0046"
  ],
  "Du lịch": [
    "7011", "3998", "3838", "3837", "3836", "3835", "3834", "3833", "3832", "3831",
    "3830", "3829", "3828", "3827", "3826", "3825", "3824", "3823", "3822", "3821",
    "3820", "3819", "3818", "3817", "3816", "3815", "3814", "3813", "3812", "3811",
    "3810", "3809", "3808", "3807", "3806", "3805", "3804", "3803", "3802", "3801",
    "3800", "3799", "3798", "3797", "3796", "3795", "3794", "3793", "3792", "3791",
    "3790", "3789", "3788", "3787", "3786", "3785", "3784", "3783", "3782", "3781",
    "3780", "3779", "3778", "3777", "3776", "3775", "3774", "3773", "3772", "3771",
    "3770", "3769", "3768", "3767", "3766", "3765", "3764", "3763", "3762", "3761",
    "3760", "3759", "3758", "3757", "3756", "3755", "3754", "3753", "3752", "3751",
    "3750", "3749", "3748", "3747", "3746", "3745", "3744", "3743", "3742", "3741",
    "3740", "3739", "3738", "3737", "3736", "3735", "3734", "3733", "3732", "3731",
    "3730", "3729", "3728", "3727", "3726", "3725", "3724", "3723", "3722", "3721",
    "3720", "3719", "3718", "3717", "3716", "3715", "3714", "3713", "3712", "3711",
    "3710", "3709", "3708", "3707", "3706", "3705", "3704", "3703", "3702", "3701",
    "3700", "3699", "3698", "3697", "3696", "3695", "3694", "3693", "3692", "3691",
    "3690", "3689", "3688", "3687", "3686", "3685", "3684", "3683", "3682", "3681",
    "3680", "3679", "3678", "3677", "3676", "3675", "3674", "3673", "3672", "3671",
    "3670", "3669", "3668", "3667", "3666", "3665", "3664", "3663", "3662", "3661",
    "3660", "3659", "3658", "3657", "3656", "3655", "3654", "3653", "3652", "3651",
    "3650", "3649", "3648", "3647", "3646", "3645", "3644", "3643", "3642", "3641",
    "3640", "3639", "3638", "3637", "3636", "3635", "3634", "3633", "3632", "3631",
    "3630", "3629", "3628", "3627", "3626", "3625", "3624", "3623", "3622", "3621",
    "3620", "3619", "3618", "3617", "3616", "3615", "3614", "3613", "3612", "3611",
    "3610", "3609", "3608", "3607", "3606", "3605", "3604", "3603", "3602", "3601",
    "3600", "3599", "3598", "3597", "3596", "3595", "3594", "3593", "3592", "3591",
    "3590", "3589", "3588", "3587", "3586", "3585", "3584", "3583", "3582", "3581",
    "3580", "3579", "3578", "3577", "3576", "3575", "3574", "3573", "3572", "3571",
    "3570", "3569", "3568", "3567", "3566", "3565", "3564", "3563", "3562", "3561",
    "3560", "3559", "3558", "3557", "3556", "3555", "3554", "3553", "3552", "3551",
    "3550", "3549", "3548", "3547", "3546", "3545", "3544", "3543", "3542", "3541",
    "3540", "3539", "3538", "3537", "3536", "3535", "3534", "3533", "3532", "3531",
    "3530", "3529", "3528", "3527", "3526", "3525", "3524", "3523", "3522", "3521",
    "3520", "3519", "3518", "3517", "3516", "3515", "3514", "3513", "3512", "3511",
    "3510", "3509", "3508", "3507", "3506", "3505", "3504", "3503", "3502", "3501",
    "3308", "3303", "3302", "3301", "3300", "3299", "3298", "3297", "3296", "3295",
    "3294", "3293", "3292", "3291", "3290", "3289", "3288", "3287", "3286", "3285",
    "3284", "3283", "3282", "3280", "3279", "3278", "3277", "3276", "3275", "3274",
    "3270", "3268", "3267", "3266", "3265", "3263", "3262", "3261", "3260", "3259",
    "3258", "3257", "3256", "3254", "3253", "3252", "3251", "3250", "3249", "3248",
    "3247", "3246", "3245", "3244", "3243", "3242", "3241", "3240", "3239", "3238",
    "3237", "3236", "3235", "3234", "3233", "3232", "3231", "3230", "3229", "3228",
    "3227", "3226", "3225", "3224", "3223", "3222", "3221", "3220", "3219", "3218",
    "3217", "3216", "3215", "3214", "3213", "3212", "3211", "3210", "3209", "3208",
    "3207", "3206", "3205", "3204", "3203", "3202", "3201", "3200", "3199", "3198",
    "3197", "3196", "3195", "3194", "3193", "3192", "3191", "3190", "3189", "3188",
    "3187", "3186", "3185", "3184", "3183", "3182", "3181", "3180", "3179", "3178",
    "3177", "3176", "3175", "3174", "3173", "3172", "3171", "3170", "3169", "3168",
    "3167", "3166", "3165", "3164", "3163", "3162", "3161", "3160", "3159", "3158",
    "3157", "3156", "3155", "3154", "3153", "3152", "3151", "3150", "3148", "3147",
    "3146", "3145", "3144", "3143", "3142", "3141", "3140", "3139", "3138", "3136",
    "3135", "3134", "3133", "3132", "3131", "3130", "3129", "3128", "3127", "3126",
    "3125", "3124", "3123", "3122", "3121", "3120", "3119", "3118", "3117", "3116",
    "3115", "3114", "3113", "3112", "3111", "3110", "3109", "3108", "3107", "3106",
    "3105", "3104", "3103", "3102", "3101", "3100", "3099", "3098", "3097", "3096",
    "3095", "3094", "3093", "3092", "3091", "3090", "3089", "3088", "3087", "3086",
    "3085", "3084", "3083", "3082", "3081", "3080", "3079", "3078", "3077", "3076",
    "3075", "3074", "3073", "3072", "3071", "3070", "3069", "3068", "3067", "3066",
    "3065", "3064", "3063", "3062", "3061", "3060", "3059", "3058", "3057", "3056",
    "3055", "3054", "3053", "3052", "3051", "3050", "3049", "3048", "3047", "3046",
    "3045", "3044", "3043", "3042", "3041", "3040", "3039", "3038", "3037", "3036",
    "3035", "3034", "3033", "3032", "3031", "3030", "3029", "3028", "3027", "3026",
    "3025", "3024", "3023", "3022", "3021", "3020", "3019", "3018", "3017", "3016",
    "3015", "3014", "3013", "3012", "3011", "3010", "3009", "3008", "3007", "3006",
    "3005", "3004", "3003", "3002", "3001", "3000", "0070", "0010", "4511", "4722"
  ],
  "Ẩm thực": ["5814", "5813", "5812", "5811"],
  "Giải trí": [
    "5815", "5816", "7829", "7832", "7841", "7911", "7922", "7929", "7932", "7933",
    "7941", "7991", "7992", "7993", "7994", "7996", "7997", "7998", "7999"
  ],
  "Giáo dục": ["8211", "8220", "8241", "8244", "8249", "8299"],
  "Y tế": [
    "5047", "5122", "5975", "5976", "8011", "8021", "8031", "8041", "8042", "8049",
    "8050", "8062", "8071", "8099", "8351", "7230"
  ],
  "Bảo hiểm": ["6300"],
  "Dịch vụ Marketing/Quảng cáo": ["5966", "5967", "5968", "5969", "7311"],
  "Siêu thị & Tiêu dùng": ["5411", "5422", "5441", "5451", "5462", "5499"],
  "Giao thông & Di chuyển": ["4121", "4111", "4131", "4789"],
  "Tiện ích & Dịch vụ công": ["4900", "4814", "4899"]
};

// Detailed descriptions and brand mappings for prominent MCCs
export const MCC_DICTIONARY: Record<string, Partial<MccItem>> = {
  // Ẩm thực (F&B)
  "5812": {
    name: "Nhà hàng & Dịch vụ Ẩm thực",
    category: "Ẩm thực",
    description: "Nhà hàng ăn uống, quán ăn gia đình, buffet, hải sản, fine dining",
    popularBrands: ["Golden Gate", "RedSun", "Haidilao", "Kichi Kichi", "Gogi House", "Manwah", "Pizza 4P's", "Dookki"],
    isOnlineEligible: true
  },
  "5814": {
    name: "Quán ăn nhanh & Thức uống (Fast Food / Cafe)",
    category: "Ẩm thực",
    description: "Thức ăn nhanh, quán cà phê, trà sữa, bánh ngọt",
    popularBrands: ["Starbucks", "Highlands Coffee", "Phúc Long", "KFC", "Lotteria", "McDonald's", "The Coffee House", "Jollibee", "Gong Cha", "Mixue", "Katinat", "Pheva"],
    isOnlineEligible: true
  },
  "5813": {
    name: "Quán bar, Pub, Lounge & Club",
    category: "Ẩm thực",
    description: "Quán bar phục vụ đồ uống có cồn, bia tươi, cocktail lounge",
    popularBrands: ["Rooftop Bar", "Bia Craft", "Heineken Lounge", "Pubs"],
    isOnlineEligible: false
  },
  "5811": {
    name: "Dịch vụ tiệc & Catering",
    category: "Ẩm thực",
    description: "Dịch vụ đặt tiệc, tiệc cưới, tổ chức sự kiện ẩm thực",
    popularBrands: ["Adora", "Gala Center", "White Palace", "Riverside Palace"],
    isOnlineEligible: true
  },

  // Mua sắm (Shopping & Retail)
  "5311": {
    name: "Trung tâm thương mại & Bách hóa tổng hợp (Department Stores)",
    category: "Mua sắm",
    description: "Các trung tâm thương mại lớn, đại siêu thị bách hóa cao cấp",
    popularBrands: ["Takashimaya", "Vincom Plaza / Mega Mall", "Aeon Mall", "Lotte Mall", "Diamond Plaza", "Parkson", "Crescent Mall"],
    isOnlineEligible: true
  },
  "5411": {
    name: "Siêu thị & Cửa hàng tạp hóa tiện lợi (Supermarkets)",
    category: "Mua sắm",
    description: "Chuỗi siêu thị thực phẩm tươi sống, hàng tiêu dùng nhanh, cửa hàng tiện lợi 24/7",
    popularBrands: ["WinMart / WinMart+", "Co.opmart / Co.op Food", "Big C / GO!", "Bách Hóa Xanh", "Annam Gourmet", "Lotte Mart", "Circle K", "7-Eleven", "FamilyMart", "GS25", "Mega Market"],
    isOnlineEligible: true
  },
  "5999": {
    name: "Cửa hàng bán lẻ chuyên doanh & Tổng hợp",
    category: "Mua sắm",
    description: "Cửa hàng bán lẻ đa mặt hàng, quà lưu niệm, đồ gia dụng nhỏ",
    popularBrands: ["Miniso", "Mumuso", "Daiso", "Komonoya", "Kohnan"],
    isOnlineEligible: true
  },
  "5651": {
    name: "Cửa hàng thời trang & May mặc gia đình",
    category: "Mua sắm",
    description: "Chuỗi cửa hàng thời trang quần áo, phụ kiện cho cả nam, nữ và trẻ em",
    popularBrands: ["Zara", "Uniqlo", "H&M", "Routine", "Yody", "Canifa", "Mango", "Pull&Bear", "MLB"],
    isOnlineEligible: true
  },
  "5661": {
    name: "Cửa hàng giày dép (Shoe Stores)",
    category: "Mua sắm",
    description: "Cửa hàng bán lẻ giày dép, sneaker thể thao",
    popularBrands: ["Nike Store", "Adidas Store", "Biti's Hunter", "Vans", "Converse", "Juno", "Vascara", "Pedro", "Charles & Keith"],
    isOnlineEligible: true
  },
  "5691": {
    name: "Cửa hàng thời trang nam & nữ chuyên biệt",
    category: "Mua sắm",
    description: "Trang phục công sở, thiết kế cao cấp, may đo",
    popularBrands: ["Owen", "An Phước - Pierre Cardin", "Elise", "IVY moda", "Nem", "Sixdo"],
    isOnlineEligible: true
  },
  "5977": {
    name: "Cửa hàng mỹ phẩm & Nước hoa",
    category: "Mua sắm",
    description: "Mỹ phẩm chăm sóc da, trang điểm, nước hoa chính hãng",
    popularBrands: ["Hasaki", "Guardian", "Watsons", "Innisfree", "The Face Shop", "Sephora", "Nars", "MAC", "Laneige"],
    isOnlineEligible: true
  },
  "5094": {
    name: "Cửa hàng trang sức & Đồng hồ cao cấp",
    category: "Mua sắm",
    description: "Vàng bạc đá quý, trang sức cao cấp, đồng hồ chính hãng",
    popularBrands: ["PNJ", "DOJI", "SJC", "Đồng Hồ Hải Triều", "G-Shock", "Swarovski"],
    isOnlineEligible: true
  },
  "5732": {
    name: "Cửa hàng thiết bị điện tử & Công nghệ (Electronics)",
    category: "Mua sắm",
    description: "Điện thoại, máy tính bảng, laptop, thiết bị công nghệ",
    popularBrands: ["Thế Giới Di Động", "FPT Shop", "CellphoneS", "Điện Máy Xanh", "Nguyễn Kim", "TopZone", "Di Động Việt", "GearVN"],
    isOnlineEligible: true
  },
  "5399": {
    name: "Sàn thương mại điện tử tổng hợp (E-Commerce)",
    category: "Mua sắm",
    description: "Mua sắm trực tuyến đa ngành hàng qua ứng dụng hoặc website",
    popularBrands: ["Shopee", "Lazada", "Tiki", "TikTok Shop", "Sendo", "Amazon"],
    isOnlineEligible: true
  },

  // Du lịch & Vận chuyển (Travel & Airlines & Hotels)
  "4511": {
    name: "Hãng hàng không & Vé máy bay (Airlines)",
    category: "Du lịch",
    description: "Mua vé máy bay trực tiếp từ các hãng hàng không nội địa và quốc tế",
    popularBrands: ["Vietnam Airlines", "Vietjet Air", "Bamboo Airways", "Vietravel Airlines", "Singapore Airlines", "Emirates", "Qatar Airways", "AirAsia"],
    isOnlineEligible: true
  },
  "4722": {
    name: "Đại lý du lịch, Tour & Đặt phòng trực tuyến (OTA)",
    category: "Du lịch",
    description: "Đại lý lữ hành, nền tảng đặt phòng khách sạn và vé máy bay trực tuyến",
    popularBrands: ["Traveloka", "Agoda", "Booking.com", "Trip.com", "Klook", "Vietravel", "Saigontourist", "iVIVU", "Mytour"],
    isOnlineEligible: true
  },
  "7011": {
    name: "Khách sạn, Resort & Khu nghỉ dưỡng (Hotels & Motels)",
    category: "Du lịch",
    description: "Thanh toán trực tiếp tại khách sạn, resort, căn hộ dịch vụ",
    popularBrands: ["Vinpearl", "FLC Hotels & Resorts", "Sun Group", "Marriott", "Hilton", "InterContinental", "Sheraton", "Novotel", "Mường Thanh"],
    isOnlineEligible: true
  },
  "4121": {
    name: "Dịch vụ taxi & Đặt xe công nghệ (Ride-hailing & Taxis)",
    category: "Giao thông & Di chuyển",
    description: "Đặt xe công nghệ, taxi truyền thống, xe ôm công nghệ",
    popularBrands: ["Grab Car/Bike", "Be Group", "Xanh SM (GSM)", "Mai Linh Taxi", "Vinasun Taxi", "Gojek"],
    isOnlineEligible: true
  },
  "5541": {
    name: "Cây xăng & Trạm nhiên liệu (Gas / Fuel Stations)",
    category: "Giao thông & Di chuyển",
    description: "Đổ xăng dầu tại các trạm nhiên liệu trên toàn quốc",
    popularBrands: ["Petrolimex", "PV OIL", "SGS Petrol", "Mipec"],
    isOnlineEligible: false
  },

  // Giải trí (Entertainment)
  "7832": {
    name: "Rạp chiếu phim (Cinema)",
    category: "Giải trí",
    description: "Vé xem phim tại rạp, bắp rang nước ngọt",
    popularBrands: ["CGV Cinemas", "Lotte Cinema", "BHD Star Cineplex", "Galaxy Cinema", "Cinestar", "Mega GS"],
    isOnlineEligible: true
  },
  "5815": {
    name: "Dịch vụ giải trí số (Digital Entertainment Media)",
    category: "Giải trí",
    description: "Đăng ký xem phim, nghe nhạc trực tuyến, sách điện tử",
    popularBrands: ["Netflix", "Spotify", "Apple Music / TV+", "YouTube Premium", "VieON", "FPT Play", "Galaxy Play", "Zing MP3"],
    isOnlineEligible: true
  },
  "5816": {
    name: "Trò chơi điện tử & Ứng dụng số (Games & Digital Content)",
    category: "Giải trí",
    description: "Nạp game, mua game, thanh toán ứng dụng di động",
    popularBrands: ["Steam", "PlayStation Network", "CH Play (Google Play)", "Apple App Store", "Garena", "VTC Game", "Epic Games"],
    isOnlineEligible: true
  },
  "7997": {
    name: "Câu lạc bộ thể thao & Phòng Gym (Fitness Clubs)",
    category: "Giải trí",
    description: "Gói tập gym, yoga, pilates, hồ bơi, golf",
    popularBrands: ["California Fitness & Yoga", "CityGym", "The New Gym", "Elite Fitness", "25 FIT"],
    isOnlineEligible: true
  },

  // Giáo dục (Education)
  "8211": {
    name: "Trường mầm non, tiểu học, trung học (K-12 Schools)",
    category: "Giáo dục",
    description: "Học phí trường công lập, trường dân lập và quốc tế",
    popularBrands: ["Vinschool", "Wellspring", "BVIS", "SSIS", "VAS (Việt Úc)", "PennSchool"],
    isOnlineEligible: true
  },
  "8220": {
    name: "Trường Đại học, Cao đẳng (Colleges & Universities)",
    category: "Giáo dục",
    description: "Đóng học phí đại học, cao học, viện đào tạo liên kết",
    popularBrands: ["RMIT University", "VinUniversity", "Đại học FPT", "BUV (British University)", "Đại học Bách Khoa", "Đại học Kinh Tế"],
    isOnlineEligible: true
  },
  "8299": {
    name: "Trung tâm đào tạo ngoại ngữ, kỹ năng & Trường nghề",
    category: "Giáo dục",
    description: "Khóa học tiếng Anh, tin học, kỹ năng mềm, chứng chỉ quốc tế",
    popularBrands: ["ILA", "VUS", "Apollo English", "Language Link", "Topica", "Coursera", "Udemy"],
    isOnlineEligible: true
  },

  // Y tế (Healthcare & Medical)
  "8062": {
    name: "Bệnh viện đa khoa & Chuyên khoa (Hospitals)",
    category: "Y tế",
    description: "Viện phí khám chữa bệnh nội trú/ngoại trú, cấp cứu, phẫu thuật",
    popularBrands: ["Bệnh viện Vinmec", "Bệnh viện FV (Pháp Việt)", "Bệnh viện Hoàn Mỹ", "Bệnh viện Tâm Anh", "Bệnh viện Đại học Y Dược", "Bệnh viện Chợ Rẫy"],
    isOnlineEligible: true
  },
  "5912": {
    name: "Hiệu thuốc & Nhà thuốc tân dược (Pharmacies)",
    category: "Y tế",
    description: "Mua thuốc kê đơn, thực phẩm chức năng, thiết bị y tế gia đình",
    popularBrands: ["Nhà thuốc Long Châu", "Pharmacity", "An Khang", "Trung Sơn Pharma"],
    isOnlineEligible: true
  },
  "8011": {
    name: "Phòng khám tư nhân & Bác sĩ gia đình (Clinics)",
    category: "Y tế",
    description: "Phòng khám chuyên khoa, xét nghiệm, chẩn đoán hình ảnh",
    popularBrands: ["Phòng khám Victoria Healthcare", "CarePlus Clinic", "Diag Laboratories", "Medlatec"],
    isOnlineEligible: true
  },
  "8021": {
    name: "Nha khoa & Răng hàm mặt (Dentists)",
    category: "Y tế",
    description: "Khám răng, niềng răng, thẩm mỹ nha khoa",
    popularBrands: ["Nha khoa Kim", "Nha khoa Paris", "Peace Dentistry", "Nha khoa Trồng Răng Sài Gòn"],
    isOnlineEligible: true
  },

  // Bảo hiểm (Insurance)
  "6300": {
    name: "Phí Bảo hiểm nhân thọ & Phi nhân thọ (Insurance Underwriting)",
    category: "Bảo hiểm",
    description: "Đóng phí bảo hiểm định kỳ (nhân thọ, sức khỏe, xe cơ giới, du lịch)",
    popularBrands: ["Manulife", "Prudential", "Dai-ichi Life", "Bảo Việt Nhân Thọ", "FWD", "Chubb Life", "AIA", "Generali", "PVI", "BIC", "VBI (VietinBank Insurance)"],
    isOnlineEligible: true
  },

  // Dịch vụ Marketing / Quảng cáo số
  "7311": {
    name: "Dịch vụ Quảng cáo trực tuyến & Truyền thông (Advertising Services)",
    category: "Dịch vụ Marketing/Quảng cáo",
    description: "Chi phí chạy quảng cáo trực tuyến đa kênh, Agency, truyền thông",
    popularBrands: ["Facebook Ads (Meta)", "Google Ads (AdWords)", "TikTok Ads", "Cốc Cốc Ads", "Zalo Ads", "LinkedIn Ads"],
    isOnlineEligible: true
  },
  "5968": {
    name: "Dịch vụ đăng ký định kỳ & Bán lẻ trực tiếp qua mạng",
    category: "Dịch vụ Marketing/Quảng cáo",
    description: "Phần mềm SaaS doanh nghiệp, đăng ký tên miền, lưu trữ web",
    popularBrands: ["Canva Pro", "ChatGPT Plus / OpenAI", "Midjourney", "Adobe Creative Cloud", "Cloudflare", "Namecheap", "Hostinger"],
    isOnlineEligible: true
  }
};

// Compile full list of MCC items
function buildFullMccDatabase(): MccItem[] {
  const items: MccItem[] = [];
  const processedCodes = new Set<string>();

  // 1. Add known dictionary items first
  for (const [code, details] of Object.entries(MCC_DICTIONARY)) {
    items.push({
      code,
      category: details.category || "Khác",
      name: details.name || `Mã MCC ${code}`,
      description: details.description || `Chi tiêu thuộc danh mục mã ${code}`,
      popularBrands: details.popularBrands || [],
      isOnlineEligible: details.isOnlineEligible ?? true,
    });
    processedCodes.add(code);
  }

  // 2. Add all codes defined in RAW_VIB_MCC_DATA
  for (const [category, codes] of Object.entries(RAW_VIB_MCC_DATA)) {
    for (const code of codes) {
      if (!processedCodes.has(code)) {
        let defaultName = `Dịch vụ ${category} (Mã ${code})`;
        let defaultDesc = `Giao dịch ${category} được VIB xếp loại theo MCC ${code}`;

        // Specific airlines or hotels prefix range
        const num = parseInt(code, 10);
        if (num >= 3000 && num <= 3308) {
          defaultName = `Hãng hàng không / Hàng không quốc tế (${code})`;
          defaultDesc = `Mã định danh hàng không quốc tế thuộc danh mục Du lịch VIB`;
        } else if (num >= 3501 && num <= 3838) {
          defaultName = `Chuỗi khách sạn / Resort quốc tế (${code})`;
          defaultDesc = `Mã định danh chuỗi khách sạn/nghỉ dưỡng quốc tế thuộc danh mục Du lịch VIB`;
        }

        items.push({
          code,
          category,
          name: defaultName,
          description: defaultDesc,
          popularBrands: [],
          isOnlineEligible: true,
        });
        processedCodes.add(code);
      }
    }
  }

  return items;
}

export const ALL_MCC_ITEMS: MccItem[] = buildFullMccDatabase();

// Fast search function supporting MCC code, Vietnamese query, Category, Brand name
export function searchMccCodes(query: string): MccItem[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return ALL_MCC_ITEMS.slice(0, 30);

  // Exact code match prioritized
  const exactCode = ALL_MCC_ITEMS.find((item) => item.code === cleanQuery);
  if (exactCode) {
    return [exactCode, ...ALL_MCC_ITEMS.filter((i) => i.code !== cleanQuery && i.code.startsWith(cleanQuery))];
  }

  // Search by code prefix, name, category, brand, description
  return ALL_MCC_ITEMS.filter((item) => {
    if (item.code.includes(cleanQuery)) return true;
    if (item.name.toLowerCase().includes(cleanQuery)) return true;
    if (item.category.toLowerCase().includes(cleanQuery)) return true;
    if (item.description.toLowerCase().includes(cleanQuery)) return true;
    if (item.popularBrands?.some((b) => b.toLowerCase().includes(cleanQuery))) return true;
    return false;
  }).slice(0, 40);
}

export function getMccByCode(code: string): MccItem | undefined {
  return ALL_MCC_ITEMS.find((item) => item.code === code);
}
