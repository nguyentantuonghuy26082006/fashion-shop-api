// ================================================
// seed-all-products.js - SEED 56+ SAN PHAM DAY DU
// Chay: node seed-all-products.js
// ================================================

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./app/models/product.model");
const Category = require("./app/models/category.model");
const connectDB = require("./app/config/database");

// Ket noi database
connectDB();

// ================================================
// DANH SACH 8 CATEGORIES
// ================================================
const categoriesData = [
  {
    name: "Ao Nam",
    description: "Cac loai ao danh cho nam gioi - ao thun, polo, so mi, khoac",
    order: 1,
    image: {
      public_id: "cat-ao-nam",
      url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600",
    },
  },
  {
    name: "Ao Nu",
    description: "Cac loai ao danh cho nu gioi - ao thun, kieu, blazer",
    order: 2,
    image: {
      public_id: "cat-ao-nu",
      url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600",
    },
  },
  {
    name: "Quan Nam",
    description: "Cac loai quan danh cho nam gioi - jean, kaki, short",
    order: 3,
    image: {
      public_id: "cat-quan-nam",
      url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
    },
  },
  {
    name: "Quan Nu",
    description: "Cac loai quan, vay danh cho nu gioi",
    order: 4,
    image: {
      public_id: "cat-quan-nu",
      url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600",
    },
  },
  {
    name: "Giay The Thao",
    description: "Giay the thao nam nu cac loai - Nike, Adidas, Converse",
    order: 5,
    image: {
      public_id: "cat-giay-the-thao",
      url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    },
  },
  {
    name: "Giay Tay",
    description: "Giay tay cong so lich lam cho nam",
    order: 6,
    image: {
      public_id: "cat-giay-tay",
      url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600",
    },
  },
  {
    name: "Phu Kien",
    description: "Tui xach, balo, mu, that lung, vi, kinh mat",
    order: 7,
    image: {
      public_id: "cat-phu-kien",
      url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    },
  },
  {
    name: "Dong Ho",
    description: "Dong ho thoi trang nam nu",
    order: 8,
    image: {
      public_id: "cat-dong-ho",
      url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
    },
  },
];

// ================================================
// DANH SACH 56+ SAN PHAM
// ================================================
const productsData = [
  // ========== AO NAM (10 san pham) ==========
  {
    name: "Ao Thun Nam Basic Cotton Premium",
    description:
      "Ao thun nam chat lieu 100% cotton cao cap. Form regular fit thoai mai, tham hut mo hoi tot. Phu hop mac hang ngay va di choi.",
    price: 199000,
    comparePrice: 299000,
    images: [
      {
        public_id: "ao-thun-basic-1",
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      },
      {
        public_id: "ao-thun-basic-2",
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
      },
    ],
    stock: 150,
    sizes: [
      { name: "S", stock: 30 },
      { name: "M", stock: 40 },
      { name: "L", stock: 40 },
      { name: "XL", stock: 30 },
      { name: "XXL", stock: 10 },
    ],
    colors: [
      { name: "Den", hexCode: "#000000", stock: 50 },
      { name: "Trang", hexCode: "#FFFFFF", stock: 50 },
      { name: "Xam", hexCode: "#808080", stock: 30 },
      { name: "Navy", hexCode: "#000080", stock: 20 },
    ],
    brand: "Local Brand",
    tags: ["ao thun", "nam", "basic", "cotton", "casual"],
    isFeatured: true,
    category: "Ao Nam",
  },
  {
    name: "Ao Polo Nam Cao Cap Lacoste Style",
    description:
      "Ao polo nam chat lieu pique cao cap, thoang mat. Thiet ke lich su voi co be, phu hop di lam va dao pho.",
    price: 349000,
    comparePrice: 499000,
    images: [
      {
        public_id: "polo-nam-1",
        url: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800",
      },
    ],
    stock: 100,
    sizes: [
      { name: "M", stock: 30 },
      { name: "L", stock: 40 },
      { name: "XL", stock: 30 },
    ],
    colors: [
      { name: "Trang", hexCode: "#FFFFFF", stock: 40 },
      { name: "Xanh Navy", hexCode: "#000080", stock: 30 },
      { name: "Den", hexCode: "#000000", stock: 30 },
    ],
    brand: "Lacoste",
    tags: ["polo", "nam", "cao cap", "cong so"],
    isFeatured: true,
    category: "Ao Nam",
  },
  {
    name: "Ao So Mi Nam Oxford Trang Classic",
    description:
      "Ao so mi nam chat lieu oxford cao cap. Form slim fit thanh lich, phu hop cong so va su kien.",
    price: 399000,
    comparePrice: 599000,
    images: [
      {
        public_id: "so-mi-oxford-1",
        url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
      },
    ],
    stock: 80,
    sizes: [
      { name: "M", stock: 25 },
      { name: "L", stock: 30 },
      { name: "XL", stock: 25 },
    ],
    brand: "Arrow",
    tags: ["so mi", "nam", "oxford", "cong so"],
    isFeatured: false,
    category: "Ao Nam",
  },
  {
    name: "Ao So Mi Flannel Ke Caro Han Quoc",
    description:
      "Ao so mi flannel ke caro phong cach Han Quoc. Vai mem mai, am ap, thich hop mua thu dong.",
    price: 449000,
    comparePrice: 649000,
    images: [
      {
        public_id: "flannel-caro-1",
        url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
      },
    ],
    stock: 60,
    sizes: [
      { name: "M", stock: 20 },
      { name: "L", stock: 25 },
      { name: "XL", stock: 15 },
    ],
    brand: "Uniqlo",
    tags: ["flannel", "caro", "nam", "mua dong"],
    isFeatured: false,
    category: "Ao Nam",
  },
  {
    name: "Ao Khoac Bomber Nam Streetwear",
    description:
      "Ao khoac bomber phong cach streetwear. Vai du cao cap chong gio, chong nuoc nhe.",
    price: 599000,
    comparePrice: 899000,
    images: [
      {
        public_id: "bomber-1",
        url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
      },
    ],
    stock: 50,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 20 },
      { name: "XL", stock: 15 },
    ],
    brand: "Alpha Industries",
    tags: ["bomber", "khoac", "nam", "streetwear"],
    isFeatured: true,
    category: "Ao Nam",
  },
  {
    name: "Ao Hoodie Ni Basic Form Rong Unisex",
    description:
      "Ao hoodie ni bong basic form oversize. Chat lieu ni bong mem min, giu am tot.",
    price: 399000,
    comparePrice: 599000,
    images: [
      {
        public_id: "hoodie-basic-1",
        url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
      },
    ],
    stock: 80,
    sizes: [
      { name: "M", stock: 25 },
      { name: "L", stock: 30 },
      { name: "XL", stock: 25 },
    ],
    brand: "Local Brand",
    tags: ["hoodie", "ni", "nam", "oversize"],
    isFeatured: false,
    category: "Ao Nam",
  },
  {
    name: "Ao Khoac Jean Nam Vintage Classic",
    description:
      "Ao khoac jean vintage co dien. Chat denim day dan, form regular fit.",
    price: 549000,
    comparePrice: 799000,
    images: [
      {
        public_id: "ao-jean-1",
        url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800",
      },
    ],
    stock: 45,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 15 },
      { name: "XL", stock: 15 },
    ],
    brand: "Levis",
    tags: ["jean", "khoac", "vintage", "nam"],
    isFeatured: false,
    category: "Ao Nam",
  },
  {
    name: "Ao Vest Nam Cong So Slim Fit Premium",
    description:
      "Ao vest nam cong so thiet ke slim fit. Chat lieu cao cap, form dang chuan.",
    price: 899000,
    comparePrice: 1290000,
    images: [
      {
        public_id: "vest-nam-1",
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      },
    ],
    stock: 30,
    sizes: [
      { name: "M", stock: 10 },
      { name: "L", stock: 10 },
      { name: "XL", stock: 10 },
    ],
    brand: "Giovanni",
    tags: ["vest", "nam", "cong so", "slim fit"],
    isFeatured: true,
    category: "Ao Nam",
  },
  {
    name: "Ao Thun Polo The Thao Nam Nike",
    description:
      "Ao polo the thao chat lieu polyester thoang khi. Cong nghe tham hut mo hoi.",
    price: 299000,
    comparePrice: 450000,
    images: [
      {
        public_id: "polo-sport-1",
        url: "https://images.unsplash.com/photo-1565693413579-8a73cb5b9e90?w=800",
      },
    ],
    stock: 70,
    sizes: [
      { name: "M", stock: 20 },
      { name: "L", stock: 30 },
      { name: "XL", stock: 20 },
    ],
    brand: "Nike",
    tags: ["polo", "the thao", "nam", "golf"],
    isFeatured: false,
    category: "Ao Nam",
  },
  {
    name: "Ao Sweater Nam Len Cao Cap Zara",
    description:
      "Ao sweater len cao cap, mem mai khong xu long. Am ap cho mua dong.",
    price: 499000,
    comparePrice: 750000,
    images: [
      {
        public_id: "sweater-len-1",
        url: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=800",
      },
    ],
    stock: 55,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 25 },
      { name: "XL", stock: 15 },
    ],
    brand: "Zara Man",
    tags: ["sweater", "len", "nam", "mua dong"],
    isFeatured: false,
    category: "Ao Nam",
  },

  // ========== AO NU (8 san pham) ==========
  {
    name: "Ao So Mi Nu Trang Cong So Thanh Lich",
    description:
      "Ao so mi nu trang thanh lich cho cong so. Chat lieu voan mem mai, thoang mat.",
    price: 349000,
    comparePrice: 499000,
    images: [
      {
        public_id: "ao-nu-1",
        url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800",
      },
    ],
    stock: 60,
    sizes: [
      { name: "S", stock: 15 },
      { name: "M", stock: 25 },
      { name: "L", stock: 20 },
    ],
    brand: "Local Brand",
    tags: ["so mi", "nu", "cong so", "trang"],
    isFeatured: true,
    category: "Ao Nu",
  },
  {
    name: "Ao Kieu Nu Hoa Nhi Vintage Style",
    description:
      "Ao kieu nu hoa tiet hoa nhi phong cach vintage. Thiet ke nu tinh.",
    price: 299000,
    comparePrice: 449000,
    images: [
      {
        public_id: "ao-kieu-hoa-1",
        url: "https://images.unsplash.com/photo-1564257577193-ae1d4b1e4a46?w=800",
      },
    ],
    stock: 70,
    sizes: [
      { name: "S", stock: 20 },
      { name: "M", stock: 30 },
      { name: "L", stock: 20 },
    ],
    brand: "Zara",
    tags: ["ao kieu", "nu", "hoa nhi", "vintage"],
    isFeatured: true,
    category: "Ao Nu",
  },
  {
    name: "Ao Croptop Nu Basic Cotton Trendy",
    description: "Ao croptop nu basic cotton. Thiet ke tre trung, nang dong.",
    price: 179000,
    comparePrice: 279000,
    images: [
      {
        public_id: "croptop-1",
        url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
      },
    ],
    stock: 90,
    sizes: [
      { name: "S", stock: 30 },
      { name: "M", stock: 40 },
      { name: "L", stock: 20 },
    ],
    brand: "H and M",
    tags: ["croptop", "nu", "basic", "cotton"],
    isFeatured: false,
    category: "Ao Nu",
  },
  {
    name: "Ao Blazer Nu Cong So Modern Style",
    description:
      "Ao blazer nu phong cach cong so hien dai. Thiet ke thanh lich, form fit ton dang.",
    price: 699000,
    comparePrice: 999000,
    images: [
      {
        public_id: "blazer-nu-1",
        url: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800",
      },
    ],
    stock: 40,
    sizes: [
      { name: "S", stock: 12 },
      { name: "M", stock: 16 },
      { name: "L", stock: 12 },
    ],
    brand: "Mango",
    tags: ["blazer", "nu", "cong so", "thanh lich"],
    isFeatured: true,
    category: "Ao Nu",
  },
  {
    name: "Ao Cardigan Len Nu Oversize Trendy",
    description: "Ao cardigan len mem mai, am ap. Thiet ke oversize trendy.",
    price: 399000,
    comparePrice: 599000,
    images: [
      {
        public_id: "cardigan-nu-1",
        url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800",
      },
    ],
    stock: 55,
    sizes: [
      { name: "S", stock: 15 },
      { name: "M", stock: 25 },
      { name: "L", stock: 15 },
    ],
    brand: "Uniqlo",
    tags: ["cardigan", "len", "nu", "oversize"],
    isFeatured: false,
    category: "Ao Nu",
  },
  {
    name: "Ao Thun Nu Oversize Streetwear",
    description:
      "Ao thun nu oversize cotton. Phong cach streetwear, thoai mai.",
    price: 229000,
    comparePrice: 349000,
    images: [
      {
        public_id: "thun-nu-oversize-1",
        url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800",
      },
    ],
    stock: 100,
    sizes: [
      { name: "M", stock: 40 },
      { name: "L", stock: 40 },
      { name: "XL", stock: 20 },
    ],
    brand: "Local Brand",
    tags: ["ao thun", "nu", "oversize", "streetwear"],
    isFeatured: false,
    category: "Ao Nu",
  },
  {
    name: "Ao Ren Nu Sang Trong Du Tiec",
    description: "Ao ren nu thiet ke sang trong, tinh te. Phu hop du tiec.",
    price: 459000,
    comparePrice: 699000,
    images: [
      {
        public_id: "ao-ren-nu-1",
        url: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800",
      },
    ],
    stock: 35,
    sizes: [
      { name: "S", stock: 10 },
      { name: "M", stock: 15 },
      { name: "L", stock: 10 },
    ],
    brand: "Elise",
    tags: ["ren", "nu", "sang trong", "du tiec"],
    isFeatured: false,
    category: "Ao Nu",
  },
  {
    name: "Ao Khoac Denim Nu Vintage Classic",
    description:
      "Ao khoac denim nu co dien. Chat jean cao cap, phong cach vintage.",
    price: 499000,
    comparePrice: 749000,
    images: [
      {
        public_id: "denim-nu-1",
        url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800",
      },
    ],
    stock: 45,
    sizes: [
      { name: "S", stock: 15 },
      { name: "M", stock: 20 },
      { name: "L", stock: 10 },
    ],
    brand: "Levis",
    tags: ["denim", "khoac", "nu", "vintage"],
    isFeatured: false,
    category: "Ao Nu",
  },

  // ========== QUAN NAM (8 san pham) ==========
  {
    name: "Quan Jean Nam Slim Fit Co Gian Premium",
    description:
      "Quan jean nam form slim fit co gian nhe. Chat vai denim cao cap, ben dep.",
    price: 499000,
    comparePrice: 699000,
    images: [
      {
        public_id: "jean-slim-1",
        url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
      },
    ],
    stock: 80,
    sizes: [
      { name: "M", stock: 25 },
      { name: "L", stock: 35 },
      { name: "XL", stock: 20 },
    ],
    brand: "Levis",
    tags: ["jean", "nam", "slim fit", "denim"],
    isFeatured: true,
    category: "Quan Nam",
  },
  {
    name: "Quan Kaki Nam Han Quoc Straight Fit",
    description:
      "Quan kaki nam form straight phong cach Han Quoc. Vai kaki cao cap.",
    price: 399000,
    comparePrice: 599000,
    images: [
      {
        public_id: "kaki-nam-1",
        url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      },
    ],
    stock: 70,
    sizes: [
      { name: "M", stock: 20 },
      { name: "L", stock: 30 },
      { name: "XL", stock: 20 },
    ],
    brand: "Local Brand",
    tags: ["kaki", "nam", "han quoc", "straight"],
    isFeatured: false,
    category: "Quan Nam",
  },
  {
    name: "Quan Short The Thao Nam Nike Dri-FIT",
    description:
      "Quan short the thao chat lieu polyester tham hut mo hoi. Phu hop tap gym.",
    price: 249000,
    comparePrice: 349000,
    images: [
      {
        public_id: "short-sport-1",
        url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800",
      },
    ],
    stock: 100,
    sizes: [
      { name: "M", stock: 30 },
      { name: "L", stock: 40 },
      { name: "XL", stock: 30 },
    ],
    brand: "Nike",
    tags: ["short", "the thao", "nam", "gym"],
    isFeatured: false,
    category: "Quan Nam",
  },
  {
    name: "Quan Tay Nam Cong So Slim Fit Premium",
    description: "Quan tay nam cong so form slim. Chat lieu cao cap, it nhan.",
    price: 459000,
    comparePrice: 699000,
    images: [
      {
        public_id: "quan-tay-1",
        url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      },
    ],
    stock: 60,
    sizes: [
      { name: "M", stock: 20 },
      { name: "L", stock: 25 },
      { name: "XL", stock: 15 },
    ],
    brand: "Giovanni",
    tags: ["quan tay", "nam", "cong so", "slim"],
    isFeatured: true,
    category: "Quan Nam",
  },
  {
    name: "Quan Jogger Nam The Thao Adidas",
    description:
      "Quan jogger nam the thao nang dong. Chat lieu co gian thoai mai.",
    price: 349000,
    comparePrice: 499000,
    images: [
      {
        public_id: "jogger-nam-1",
        url: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800",
      },
    ],
    stock: 75,
    sizes: [
      { name: "M", stock: 25 },
      { name: "L", stock: 30 },
      { name: "XL", stock: 20 },
    ],
    brand: "Adidas",
    tags: ["jogger", "nam", "the thao", "nang dong"],
    isFeatured: false,
    category: "Quan Nam",
  },
  {
    name: "Quan Jean Nam Rach Goi Streetwear",
    description: "Quan jean nam rach goi phong cach streetwear. Form slim fit.",
    price: 549000,
    comparePrice: 799000,
    images: [
      {
        public_id: "jean-rach-1",
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
      },
    ],
    stock: 50,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 20 },
      { name: "XL", stock: 15 },
    ],
    brand: "Diesel",
    tags: ["jean", "rach", "nam", "streetwear"],
    isFeatured: false,
    category: "Quan Nam",
  },
  {
    name: "Quan Short Kaki Nam Lich Lam",
    description:
      "Quan short kaki nam lich lam. Chat lieu thoang mat, phu hop mua he.",
    price: 299000,
    comparePrice: 449000,
    images: [
      {
        public_id: "short-kaki-1",
        url: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=800",
      },
    ],
    stock: 65,
    sizes: [
      { name: "M", stock: 20 },
      { name: "L", stock: 25 },
      { name: "XL", stock: 20 },
    ],
    brand: "Dockers",
    tags: ["short", "kaki", "nam", "mua he"],
    isFeatured: false,
    category: "Quan Nam",
  },
  {
    name: "Quan Ni Nam Basic Giu Am",
    description:
      "Quan ni nam basic form regular. Chat ni bong mem mai, giu am tot.",
    price: 329000,
    comparePrice: 499000,
    images: [
      {
        public_id: "quan-ni-nam-1",
        url: "https://images.unsplash.com/photo-1580906853203-f493e5457b5d?w=800",
      },
    ],
    stock: 85,
    sizes: [
      { name: "M", stock: 25 },
      { name: "L", stock: 35 },
      { name: "XL", stock: 25 },
    ],
    brand: "Local Brand",
    tags: ["ni", "nam", "basic", "am"],
    isFeatured: false,
    category: "Quan Nam",
  },

  // ========== QUAN NU (6 san pham) ==========
  {
    name: "Quan Jean Nu Ong Rong Y2K Style",
    description: "Quan jean nu ong rong phong cach Y2K. Chat denim cao cap.",
    price: 459000,
    comparePrice: 659000,
    images: [
      {
        public_id: "jean-nu-rong-1",
        url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800",
      },
    ],
    stock: 55,
    sizes: [
      { name: "S", stock: 15 },
      { name: "M", stock: 25 },
      { name: "L", stock: 15 },
    ],
    brand: "H and M",
    tags: ["jean", "nu", "ong rong", "Y2K"],
    isFeatured: true,
    category: "Quan Nu",
  },
  {
    name: "Vay Jean Ngan Nu Tre Trung",
    description:
      "Vay jean ngan phong cach tre trung. Thiet ke A-line ton dang.",
    price: 349000,
    comparePrice: 499000,
    images: [
      {
        public_id: "vay-jean-1",
        url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800",
      },
    ],
    stock: 45,
    sizes: [
      { name: "S", stock: 15 },
      { name: "M", stock: 20 },
      { name: "L", stock: 10 },
    ],
    brand: "Forever 21",
    tags: ["vay", "jean", "nu", "ngan"],
    isFeatured: false,
    category: "Quan Nu",
  },
  {
    name: "Quan Culottes Nu Ong Rong Thanh Lich",
    description: "Quan culottes nu ong rong thanh lich. Chat lieu thoang mat.",
    price: 399000,
    comparePrice: 599000,
    images: [
      {
        public_id: "culottes-1",
        url: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800",
      },
    ],
    stock: 50,
    sizes: [
      { name: "S", stock: 15 },
      { name: "M", stock: 20 },
      { name: "L", stock: 15 },
    ],
    brand: "Mango",
    tags: ["culottes", "nu", "ong rong", "cong so"],
    isFeatured: false,
    category: "Quan Nu",
  },
  {
    name: "Quan Legging Nu The Thao Nike Pro",
    description: "Quan legging nu the thao cao cap. Chat lieu co gian 4 chieu.",
    price: 299000,
    comparePrice: 450000,
    images: [
      {
        public_id: "legging-nu-1",
        url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800",
      },
    ],
    stock: 80,
    sizes: [
      { name: "S", stock: 25 },
      { name: "M", stock: 35 },
      { name: "L", stock: 20 },
    ],
    brand: "Nike",
    tags: ["legging", "nu", "the thao", "gym"],
    isFeatured: false,
    category: "Quan Nu",
  },
  {
    name: "Vay Midi Nu Thanh Lich Cong So",
    description: "Vay midi nu thanh lich cong so. Thiet ke don gian, ton dang.",
    price: 449000,
    comparePrice: 699000,
    images: [
      {
        public_id: "vay-midi-1",
        url: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800",
      },
    ],
    stock: 40,
    sizes: [
      { name: "S", stock: 12 },
      { name: "M", stock: 18 },
      { name: "L", stock: 10 },
    ],
    brand: "Zara",
    tags: ["vay", "midi", "nu", "thanh lich"],
    isFeatured: true,
    category: "Quan Nu",
  },
  {
    name: "Quan Short Jean Nu Tre Trung",
    description:
      "Quan short jean nu tre trung. Chat denim mem, thiet ke nang dong.",
    price: 279000,
    comparePrice: 399000,
    images: [
      {
        public_id: "short-jean-nu-1",
        url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800",
      },
    ],
    stock: 65,
    sizes: [
      { name: "S", stock: 20 },
      { name: "M", stock: 30 },
      { name: "L", stock: 15 },
    ],
    brand: "H and M",
    tags: ["short", "jean", "nu", "mua he"],
    isFeatured: false,
    category: "Quan Nu",
  },

  // ========== GIAY THE THAO (8 san pham) ==========
  {
    name: "Giay Nike Air Max 2024 Limited Edition",
    description:
      "Giay the thao Nike Air Max phien ban moi nhat 2024. Thiet ke hien dai, em ai.",
    price: 2990000,
    comparePrice: 3990000,
    images: [
      {
        public_id: "nike-airmax-1",
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      },
      {
        public_id: "nike-airmax-2",
        url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
      },
    ],
    stock: 60,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 25 },
      { name: "XL", stock: 20 },
    ],
    brand: "Nike",
    tags: ["giay", "the thao", "nike", "air max"],
    isFeatured: true,
    category: "Giay The Thao",
  },
  {
    name: "Giay Adidas Ultraboost 22 Running",
    description:
      "Giay chay bo Adidas Ultraboost voi cong nghe dem Boost. Sieu nhe, thoang khi.",
    price: 2490000,
    comparePrice: 3290000,
    images: [
      {
        public_id: "adidas-ultra-1",
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
      },
    ],
    stock: 50,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 20 },
      { name: "XL", stock: 15 },
    ],
    brand: "Adidas",
    tags: ["giay", "the thao", "adidas", "ultraboost"],
    isFeatured: true,
    category: "Giay The Thao",
  },
  {
    name: "Giay Converse Chuck Taylor All Star Classic",
    description:
      "Giay Converse classic, phong cach vintage. De cao su ben chac.",
    price: 890000,
    comparePrice: 1190000,
    images: [
      {
        public_id: "converse-1",
        url: "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800",
      },
    ],
    stock: 80,
    sizes: [
      { name: "M", stock: 25 },
      { name: "L", stock: 35 },
      { name: "XL", stock: 20 },
    ],
    brand: "Converse",
    tags: ["giay", "converse", "classic", "vintage"],
    isFeatured: false,
    category: "Giay The Thao",
  },
  {
    name: "Giay Vans Old Skool Iconic Skateboard",
    description:
      "Giay Vans Old Skool iconic voi soc trang dac trung. Phong cach skateboard.",
    price: 1290000,
    comparePrice: 1590000,
    images: [
      {
        public_id: "vans-oldskool-1",
        url: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800",
      },
    ],
    stock: 70,
    sizes: [
      { name: "M", stock: 20 },
      { name: "L", stock: 30 },
      { name: "XL", stock: 20 },
    ],
    brand: "Vans",
    tags: ["giay", "vans", "old skool", "skateboard"],
    isFeatured: false,
    category: "Giay The Thao",
  },
  {
    name: "Giay New Balance 574 Retro Classic",
    description:
      "Giay New Balance 574 retro classic. Thiet ke thoai mai, phu hop hang ngay.",
    price: 1890000,
    comparePrice: 2390000,
    images: [
      {
        public_id: "nb-574-1",
        url: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800",
      },
    ],
    stock: 55,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 25 },
      { name: "XL", stock: 15 },
    ],
    brand: "New Balance",
    tags: ["giay", "new balance", "574", "retro"],
    isFeatured: false,
    category: "Giay The Thao",
  },
  {
    name: "Giay Puma RS-X Retro Futuristic",
    description:
      "Giay Puma RS-X phong cach retro-futuristic. Dem cong nghe Running System.",
    price: 1790000,
    comparePrice: 2290000,
    images: [
      {
        public_id: "puma-rsx-1",
        url: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800",
      },
    ],
    stock: 45,
    sizes: [
      { name: "M", stock: 12 },
      { name: "L", stock: 20 },
      { name: "XL", stock: 13 },
    ],
    brand: "Puma",
    tags: ["giay", "puma", "rs-x", "retro"],
    isFeatured: false,
    category: "Giay The Thao",
  },
  {
    name: "Giay Air Jordan 1 Retro High OG",
    description:
      "Giay Jordan 1 Retro huyen thoai. Thiet ke iconic, chat luong cao cap.",
    price: 3490000,
    comparePrice: 4290000,
    images: [
      {
        public_id: "jordan-1-1",
        url: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800",
      },
    ],
    stock: 35,
    sizes: [
      { name: "M", stock: 10 },
      { name: "L", stock: 15 },
      { name: "XL", stock: 10 },
    ],
    brand: "Jordan",
    tags: ["giay", "jordan", "retro", "basketball"],
    isFeatured: true,
    category: "Giay The Thao",
  },
  {
    name: "Giay Reebok Classic Leather Premium",
    description:
      "Giay Reebok Classic Leather thanh lich. Chat lieu da cao cap, em ai.",
    price: 1490000,
    comparePrice: 1890000,
    images: [
      {
        public_id: "reebok-classic-1",
        url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      },
    ],
    stock: 50,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 20 },
      { name: "XL", stock: 15 },
    ],
    brand: "Reebok",
    tags: ["giay", "reebok", "classic", "leather"],
    isFeatured: false,
    category: "Giay The Thao",
  },

  // ========== GIAY TAY (4 san pham) ==========
  {
    name: "Giay Tay Nam Da Bo Cao Cap Giovanni",
    description:
      "Giay tay nam da bo that 100%. Thiet ke lich lam, de cao su chong truot.",
    price: 1290000,
    comparePrice: 1790000,
    images: [
      {
        public_id: "giay-tay-1",
        url: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800",
      },
    ],
    stock: 40,
    sizes: [
      { name: "M", stock: 12 },
      { name: "L", stock: 18 },
      { name: "XL", stock: 10 },
    ],
    brand: "Giovanni",
    tags: ["giay tay", "da bo", "nam", "cong so"],
    isFeatured: true,
    category: "Giay Tay",
  },
  {
    name: "Giay Oxford Nam Classic Clarks",
    description:
      "Giay Oxford nam phong cach co dien. Chat lieu da PU cao cap, ben dep.",
    price: 890000,
    comparePrice: 1290000,
    images: [
      {
        public_id: "oxford-1",
        url: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800",
      },
    ],
    stock: 50,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 20 },
      { name: "XL", stock: 15 },
    ],
    brand: "Clarks",
    tags: ["giay", "oxford", "nam", "classic"],
    isFeatured: false,
    category: "Giay Tay",
  },
  {
    name: "Giay Loafer Nam Lich Lam Gucci Style",
    description:
      "Giay loafer nam khong day tien loi. Thiet ke thanh lich, phu hop cong so.",
    price: 990000,
    comparePrice: 1390000,
    images: [
      {
        public_id: "loafer-1",
        url: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=800",
      },
    ],
    stock: 45,
    sizes: [
      { name: "M", stock: 15 },
      { name: "L", stock: 18 },
      { name: "XL", stock: 12 },
    ],
    brand: "Gucci",
    tags: ["giay", "loafer", "nam", "khong day"],
    isFeatured: false,
    category: "Giay Tay",
  },
  {
    name: "Giay Derby Nam Cao Cap Allen Edmonds",
    description:
      "Giay Derby nam chat lieu da that. Form dang chuan, phu hop vest cong so.",
    price: 1190000,
    comparePrice: 1590000,
    images: [
      {
        public_id: "derby-1",
        url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
      },
    ],
    stock: 35,
    sizes: [
      { name: "M", stock: 10 },
      { name: "L", stock: 15 },
      { name: "XL", stock: 10 },
    ],
    brand: "Allen Edmonds",
    tags: ["giay", "derby", "nam", "da that"],
    isFeatured: false,
    category: "Giay Tay",
  },

  // ========== PHU KIEN (8 san pham) ==========
  {
    name: "Balo Da Nam Cao Cap Samsonite",
    description:
      "Balo da PU cao cap cho nam. Nhieu ngan tien loi, phu hop di lam va di hoc.",
    price: 599000,
    comparePrice: 899000,
    images: [
      {
        public_id: "balo-da-1",
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      },
    ],
    stock: 40,
    sizes: [],
    brand: "Samsonite",
    tags: ["balo", "da", "nam", "cao cap"],
    isFeatured: true,
    category: "Phu Kien",
  },
  {
    name: "Tui Xach Nu Thoi Trang Michael Kors",
    description:
      "Tui xach nu da PU cao cap. Thiet ke sang trong, nhieu mau sac lua chon.",
    price: 449000,
    comparePrice: 699000,
    images: [
      {
        public_id: "tui-xach-nu-1",
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
      },
    ],
    stock: 55,
    sizes: [],
    brand: "Michael Kors",
    tags: ["tui xach", "nu", "thoi trang", "sang trong"],
    isFeatured: true,
    category: "Phu Kien",
  },
  {
    name: "Mu Snapback Streetwear New Era",
    description:
      "Mu snapback phong cach streetwear. Chat vai cao cap, dieu chinh size duoc.",
    price: 199000,
    comparePrice: 299000,
    images: [
      {
        public_id: "mu-snapback-1",
        url: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
      },
    ],
    stock: 70,
    sizes: [],
    brand: "New Era",
    tags: ["mu", "snapback", "streetwear"],
    isFeatured: false,
    category: "Phu Kien",
  },
  {
    name: "That Lung Da Nam Montblanc Style",
    description:
      "That lung da that nam. Khoa kim loai chac chan, thiet ke lich lam.",
    price: 349000,
    comparePrice: 499000,
    images: [
      {
        public_id: "that-lung-1",
        url: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800",
      },
    ],
    stock: 60,
    sizes: [],
    brand: "Montblanc",
    tags: ["that lung", "da", "nam"],
    isFeatured: false,
    category: "Phu Kien",
  },
  {
    name: "Vi Da Nam Compact Coach Premium",
    description: "Vi da nam compact nho gon. Nhieu ngan dung the va tien mat.",
    price: 299000,
    comparePrice: 449000,
    images: [
      {
        public_id: "vi-da-1",
        url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800",
      },
    ],
    stock: 80,
    sizes: [],
    brand: "Coach",
    tags: ["vi", "da", "nam", "compact"],
    isFeatured: false,
    category: "Phu Kien",
  },
  {
    name: "Kinh Mat Thoi Trang Ray-Ban Aviator",
    description:
      "Kinh mat thoi trang unisex. Trong kinh chong UV400, khung kim loai cao cap.",
    price: 399000,
    comparePrice: 599000,
    images: [
      {
        public_id: "kinh-mat-1",
        url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
      },
    ],
    stock: 50,
    sizes: [],
    brand: "Ray-Ban",
    tags: ["kinh mat", "thoi trang", "UV400"],
    isFeatured: false,
    category: "Phu Kien",
  },
  {
    name: "Tui Deo Cheo Nam Canvas Streetwear",
    description:
      "Tui deo cheo nam nho gon. Chat lieu canvas ben bi, phu hop di choi.",
    price: 279000,
    comparePrice: 399000,
    images: [
      {
        public_id: "tui-deo-cheo-1",
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
      },
    ],
    stock: 65,
    sizes: [],
    brand: "Local Brand",
    tags: ["tui deo cheo", "nam", "canvas"],
    isFeatured: false,
    category: "Phu Kien",
  },
  {
    name: "Khan Quang Co Len Am Ap Zara",
    description:
      "Khan quang co len mem mai. Giu am co vao mua dong, phong cach thoi thuong.",
    price: 199000,
    comparePrice: 299000,
    images: [
      {
        public_id: "khan-len-1",
        url: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800",
      },
    ],
    stock: 75,
    sizes: [],
    brand: "Zara",
    tags: ["khan", "len", "mua dong"],
    isFeatured: false,
    category: "Phu Kien",
  },

  // ========== DONG HO (4 san pham) ==========
  {
    name: "Dong Ho Nam Casio Classic Chong Nuoc",
    description:
      "Dong ho nam Casio classic chong nuoc. Thiet ke sang trong, ben bi.",
    price: 1290000,
    comparePrice: 1790000,
    images: [
      {
        public_id: "dong-ho-casio-1",
        url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
      },
    ],
    stock: 35,
    sizes: [],
    brand: "Casio",
    tags: ["dong ho", "nam", "casio", "classic"],
    isFeatured: true,
    category: "Dong Ho",
  },
  {
    name: "Dong Ho Nu Michael Kors Diamond",
    description:
      "Dong ho nu Michael Kors thanh lich. Mat dinh da, day kim loai sang trong.",
    price: 2490000,
    comparePrice: 3290000,
    images: [
      {
        public_id: "dong-ho-mk-1",
        url: "https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=800",
      },
    ],
    stock: 25,
    sizes: [],
    brand: "Michael Kors",
    tags: ["dong ho", "nu", "michael kors", "sang trong"],
    isFeatured: true,
    category: "Dong Ho",
  },
  {
    name: "Dong Ho Thong Minh Samsung Galaxy Watch",
    description:
      "Dong ho thong minh Samsung Galaxy Watch. Theo doi suc khoe, GPS, chong nuoc.",
    price: 3990000,
    comparePrice: 4990000,
    images: [
      {
        public_id: "smartwatch-1",
        url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
      },
    ],
    stock: 20,
    sizes: [],
    brand: "Samsung",
    tags: ["dong ho", "thong minh", "samsung", "smartwatch"],
    isFeatured: false,
    category: "Dong Ho",
  },
  {
    name: "Dong Ho Nam Fossil Automatic Mechanical",
    description:
      "Dong ho nam Fossil automatic co. Mat kinh sapphire chong xuoc, day da cao cap.",
    price: 2990000,
    comparePrice: 3790000,
    images: [
      {
        public_id: "dong-ho-fossil-1",
        url: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800",
      },
    ],
    stock: 30,
    sizes: [],
    brand: "Fossil",
    tags: ["dong ho", "nam", "fossil", "automatic"],
    isFeatured: false,
    category: "Dong Ho",
  },
];

// ================================================
// HAM SEED DU LIEU
// ================================================
async function seedData() {
  try {
    console.log("\n========================================");
    console.log("   SEED 56+ SAN PHAM DAY DU");
    console.log("========================================\n");

    // 1. XOA DU LIEU CU
    console.log("[1/3] Xoa du lieu cu...");
    await Product.deleteMany({});
    console.log("   - Da xoa tat ca san pham cu");

    await Category.deleteMany({});
    console.log("   - Da xoa tat ca danh muc cu");

    // 2. TAO CATEGORIES
    console.log("\n[2/3] Tao categories moi...");
    const createdCategories = {};

    for (const catData of categoriesData) {
      const category = await Category.create(catData);
      createdCategories[catData.name] = category._id;
      console.log(`   + ${category.name} (${category._id})`);
    }

    // 3. TAO SAN PHAM
    console.log("\n[3/3] Tao san pham moi...");
    let productCount = 0;
    let featuredCount = 0;

    for (const productData of productsData) {
      const categoryId = createdCategories[productData.category];

      if (!categoryId) {
        console.log(`   ! Khong tim thay category: ${productData.category}`);
        continue;
      }

      const product = await Product.create({
        ...productData,
        category: categoryId,
      });

      productCount++;
      if (product.isFeatured) featuredCount++;
      console.log(`   + [${productCount}] ${product.name}`);
    }

    // 4. THONG KE
    console.log("\n========================================");
    console.log("   SEED THANH CONG!");
    console.log("========================================");

    console.log("\nTHONG KE:");
    console.log(
      `   - Tong categories: ${Object.keys(createdCategories).length}`
    );
    console.log(`   - Tong san pham: ${productCount}`);
    console.log(`   - San pham noi bat: ${featuredCount}`);

    console.log("\nDANH SACH CATEGORIES:");
    for (const [name, id] of Object.entries(createdCategories)) {
      const count = await Product.countDocuments({ category: id });
      console.log(`   - ${name}: ${count} san pham`);
    }

    console.log("\n========================================");
    console.log("HUONG DAN SU DUNG:");
    console.log("========================================");
    console.log("1. Chay backend: npm start");
    console.log("2. Mo frontend: http://localhost:3000");
    console.log("3. Test Postman: GET http://localhost:5000/api/products");
    console.log("4. Admin: admin@fashionshop.com / Admin@123");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\nLOI SEED DU LIEU:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Chay seed
seedData();
