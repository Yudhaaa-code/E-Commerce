import { Category, Product } from '@/types/ecommerce';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-akrilik',
    name: 'Plakat Akrilik',
    slug: 'plakat-akrilik',
    icon: 'Layers',
    description: 'Plakat akrilik bening presisi tinggi dengan print UV full color dan grafir laser',
    productCount: 3,
  },
  {
    id: 'cat-kayu',
    name: 'Plakat Kayu',
    slug: 'plakat-kayu',
    icon: 'Award',
    description: 'Plakat kayu jati & mahoni premium dengan plat kuningan/etched metal elegan',
    productCount: 3,
  },
  {
    id: 'cat-kristal',
    name: 'Plakat Kristal & Kaca',
    slug: 'plakat-kristal',
    icon: 'Sparkles',
    description: 'Kemewahan kristal optik 3D laser engraving untuk penghargaan eksekutif',
    productCount: 2,
  },
  {
    id: 'cat-logam',
    name: 'Plakat Logam & Kuningan',
    slug: 'plakat-logam',
    icon: 'Shield',
    description: 'Plakat cor logam tembaga, kuningan sepuh emas, dan medali kejuaraan eksklusif',
    productCount: 2,
  },
  {
    id: 'cat-trophy',
    name: 'Piala & Trophy',
    slug: 'piala-trophy',
    icon: 'Trophy',
    description: 'Trophy turnamen, kejuaraan olahraga, dan piala penghargaan bergengsi',
    productCount: 2,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Plakat Akrilik Diamond Bevel Custom UV Print (Tebal 15mm)',
    slug: 'plakat-akrilik-diamond-bevel-15mm',
    description: 'Plakat akrilik premium potongan diamond sudut bevel dengan ketebalan 15mm. Menggunakan teknologi cetak UV Flatbed Mimaki resolusi tinggi tahan gores dan tidak pudar. Dilengkapi tatakan kayu solid warna mahoni dan box beludru eksklusif.',
    price: 325000,
    originalPrice: 380000,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    ],
    stock: 50,
    rating: 4.9,
    reviewCount: 142,
    featured: true,
    badge: 'Terlaris',
    specs: {
      'Bahan': 'Akrilik Marga Cipta Grade A (Bening Kristal)',
      'Ketebalan': '15 mm (Tatakan Akrilik Hitam 20 mm)',
      'Ukuran': '20 cm x 15 cm (Customizable)',
      'Metode Cetak': 'Direct UV Print HD & Laser Engrave',
      'Kelengkapan': 'Free Box Beludru Biru/Merah Eksklusif'
    },
    categoryId: 'cat-akrilik',
  },
  {
    id: 'prod-2',
    name: 'Plakat Kayu Jati Ukir Ornamen Plat Kuningan Sepuh Emas',
    slug: 'plakat-kayu-jati-plat-kuningan-emas',
    description: 'Plakat eksklusif berbahan kayu jati TPK perhutani pilihan dengan ukiran ornamen batik tradisional pada bingkai. Plat etsa kuningan dilapisi sepuhan emas berkilau mengkilap tahan karat. Sangat cocok untuk cinderamata pejabat, kenang-kenangan instansi militer/pemerintahan.',
    price: 550000,
    originalPrice: 650000,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 35,
    rating: 5.0,
    reviewCount: 98,
    featured: true,
    badge: 'Kualitas Premium',
    specs: {
      'Bahan Utama': 'Kayu Jati Solid Grade A Finishing Melamic Satin',
      'Plat Tulisan': 'Kuningan Asli Etsa Asam Sepuh Emas Kilau',
      'Dimensi': '23 cm x 18 cm x 4 cm',
      'Penyimpanan': 'Box Songket Beludru Kancing Magnet',
      'Pengerjaan': '3 - 5 Hari Kerja'
    },
    categoryId: 'cat-kayu',
  },
  {
    id: 'prod-3',
    name: 'Plakat Kristal Optik Segi Delapan 3D Laser Internal Engraving',
    slug: 'plakat-kristal-optik-segi-delapan-3d',
    description: 'Plakat kristal optik K9 murni dengan kejernihan maksimal dan kilau prisma sempurna. Logo institusi atau foto diukir di dalam kristal secara 3 dimensi menggunakan laser presisi tinggi. Pilihan utama untuk penghargaan Direksi, CEO Award, dan BUMN.',
    price: 780000,
    originalPrice: 920000,
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 20,
    rating: 4.9,
    reviewCount: 65,
    featured: true,
    badge: 'Executive Choice',
    specs: {
      'Bahan': 'K9 Optical Pure Crystal Glass',
      'Teknologi': 'Sub-surface 3D Laser Engraving Internal',
      'Dimensi': '21 cm x 12 cm x 5 cm',
      'Bobot': '1.8 kg (Sangat Kokoh & Mewah)',
      'Kemasan': 'Hard Box Sutra Satin Emboss Gold'
    },
    categoryId: 'cat-kristal',
  },
  {
    id: 'prod-4',
    name: 'Trophy Piala Kejuaraan Star Excellence Logam Metal Base Marmer',
    slug: 'trophy-piala-star-excellence-marmer',
    description: 'Piala turnamen mewah dengan figur bintang berbahan die-cast alloy lapis emas mengkilap di atas base marmer hitam Itali alami. Teks penghargaan diukir pada plat logam di bagian base. Ideal untuk kompetisi nasional, kejuaraan golf, dan penghargaan tahunan perusahaan.',
    price: 890000,
    originalPrice: 1050000,
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 25,
    rating: 4.8,
    reviewCount: 52,
    featured: true,
    badge: 'Juara 1 Favorit',
    specs: {
      'Tinggi': '38 cm (Tersedia set Juara 1, 2, 3)',
      'Figur': 'Metal Alloy Cor Chrome Gold Coating',
      'Tatakan Bawah': 'Marmer Hitam Alami Beveled Edge',
      'Plat Nama': 'Aluminium Anodized Gold Grafir Presisi',
      'Garansi': 'Anti Karat & Kualitas Terjamin'
    },
    categoryId: 'cat-trophy',
  },
  {
    id: 'prod-5',
    name: 'Plakat Logam Kuningan Grafir Model Gunungan Wayang Nusantara',
    slug: 'plakat-logam-kuningan-gunungan-wayang',
    description: 'Karya seni plakat khas Nusantara berbentuk Gunungan Wayang dari plat kuningan murni setebal 2mm dengan relief etsa timbul berdetail tinggi. Dipadukan dengan base kayu mahoni gelap untuk kesan wibawa yang mendalam.',
    price: 620000,
    originalPrice: 750000,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 28,
    rating: 4.9,
    reviewCount: 41,
    featured: false,
    badge: 'Karya Seni Etnik',
    specs: {
      'Bahan': 'Plat Kuningan Murni 2.0 mm & Finishing Lacquer Glossy',
      'Dudukan': 'Kayu Mahoni Oven Grade A',
      'Tinggi': '25 cm',
      'Teknik': 'Etsa Asam Kimia Presisi & Clear Coated',
      'Packaging': 'Box Beludru Merah Maroon Eksklusif'
    },
    categoryId: 'cat-logam',
  },
  {
    id: 'prod-6',
    name: 'Plakat Akrilik Kombinasi Kayu Modern Minimalis Eco-Series',
    slug: 'plakat-akrilik-kombinasi-kayu-minimalis',
    description: 'Desain plakat kontemporer yang memadukan akrilik transparan tebal 10mm dengan balok kayu pinus/jati natural. Tampilan estetik modern yang sangat diminati oleh startup, universitas, workshop, dan seminar nasional.',
    price: 245000,
    originalPrice: 290000,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 60,
    rating: 4.8,
    reviewCount: 114,
    featured: false,
    badge: 'Best Value',
    specs: {
      'Bahan': 'Akrilik Bening 10mm + Kayu Pinus Solid Natural Wax Finish',
      'Dimensi': '18 cm x 14 cm',
      'Metode': 'UV Flatbed Printing CMYK + White Ink',
      'Pengerjaan': 'Cepat (1 - 2 hari selesai)',
      'Bonus': 'Free Packing Bubble Wrap Tebal'
    },
    categoryId: 'cat-akrilik',
  },
  {
    id: 'prod-7',
    name: 'Plakat Akrilik Plakat Wisuda Kelulusan Karakter Custom Foto',
    slug: 'plakat-akrilik-wisuda-karakter-foto',
    description: 'Plakat kenang-kenangan wisuda sarjana, magister, dan doktor dengan bentuk pola karakter kartun wisudawan atau foto asli beresolusi tajam. Bentuk dipotong rapi mengikuti pola (laser contour cut). Hadiah kelulusan berkesan seumur hidup.',
    price: 185000,
    originalPrice: 225000,
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 75,
    rating: 4.9,
    reviewCount: 230,
    featured: false,
    badge: 'Favorit Wisuda',
    specs: {
      'Bahan': 'Akrilik Tebal 8 mm - 10 mm Glossy',
      'Cutting': 'Laser Contour Cut Sesuai Pola Karakter',
      'Ukuran': 'Tinggi 20 cm',
      'Tatakan': 'Akrilik Hitam Glossy 10 mm',
      'Cetak': 'UV Print Full Color 1440 DPI Mirrored Back'
    },
    categoryId: 'cat-akrilik',
  },
  {
    id: 'prod-8',
    name: 'Medali Kejuaraan Logam Kuningan / Zinc Alloy Custom Lanyard',
    slug: 'medali-kejuaraan-logam-lanyard-custom',
    description: 'Medali lomba olahraga, olimpiade sains, dan kelulusan berbahan logam zinc alloy padat dengan sepuhan Emas (Gold), Perak (Silver), atau Perunggu (Bronze). Sudah termasuk pita tali lanyard printing dua sisi berkualitas tinggi.',
    price: 65000,
    originalPrice: 85000,
    image: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 200,
    rating: 4.9,
    reviewCount: 180,
    featured: false,
    badge: 'Grosir Murah',
    specs: {
      'Diameter': '6.5 cm - 7.0 cm (Tebal 3.5 mm)',
      'Bahan': 'Zinc Alloy Metal Die Casting',
      'Pilihan Warna': 'Gold, Silver, Bronze (Antique Finish)',
      'Tali': 'Lanyard Tissue Halus Lebar 3 cm Print Fullcolor',
      'Minimal Order': 'Tanpa minimal order (Satuan bisa)'
    },
    categoryId: 'cat-trophy',
  }
];
