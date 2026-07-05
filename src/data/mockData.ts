import { Product, Category, Brand, Offer, Coupon, Supplier, StoreSettings, Address } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'cat-fruits', name: 'Fruits', slug: 'fruits', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-vegetables', name: 'Vegetables', slug: 'vegetables', image: 'https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-dairy', name: 'Dairy', slug: 'dairy', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-bakery', name: 'Bakery', slug: 'bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-beverages', name: 'Beverages', slug: 'beverages', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-snacks', name: 'Snacks', slug: 'snacks', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-grocery', name: 'Grocery', slug: 'grocery', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-rice', name: 'Rice', slug: 'rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-pulses', name: 'Pulses', slug: 'pulses', image: 'https://images.unsplash.com/photo-1585996388902-6047242e20de?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-spices', name: 'Spices', slug: 'spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-oils', name: 'Oils', slug: 'oils', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-frozen', name: 'Frozen Foods', slug: 'frozen-foods', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-household', name: 'Household', slug: 'household', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=200' },
  { id: 'cat-personal', name: 'Personal Care', slug: 'personal-care', image: 'https://images.unsplash.com/photo-1556228515-31985554642f?auto=format&fit=crop&q=80&w=200' }
];

export const BRANDS: Brand[] = [
  { id: 'b-1', name: 'Amul', logo: 'https://images.unsplash.com/photo-1563630423918-b58f07298ac9?auto=format&fit=crop&q=80&w=80' },
  { id: 'b-2', name: 'Aashirvaad', logo: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=80' },
  { id: 'b-3', name: 'Tata Tea', logo: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=80' },
  { id: 'b-4', name: 'Surf Excel', logo: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=80' },
  { id: 'b-5', name: 'Haldiram\'s', logo: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?auto=format&fit=crop&q=80&w=80' },
  { id: 'b-6', name: 'Nestle', logo: 'https://images.unsplash.com/photo-1614707267537-b85acf00c4b8?auto=format&fit=crop&q=80&w=80' }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Organic Fresh Bananas (Robusta)',
    category: 'fruits',
    brand: 'Local Fresh',
    price: 49,
    originalPrice: 65,
    rating: 4.5,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=500',
    description: 'Fresh organic bananas directly sourced from local farmers. Extremely high in potassium, magnesium, and dietary fibers. Perfect for daily nutrition or pre-workout energy boosting.',
    stock: 120,
    unit: '1 Dozen',
    isDealsOfTheDay: true,
    ingredients: '100% Organic Banana',
    benefits: 'Boosts energy, regulates blood pressure, aids healthy digestion.'
  },
  {
    id: 'p-2',
    name: 'Fresh Red Tomatoes (Hybrid)',
    category: 'vegetables',
    brand: 'Local Fresh',
    price: 32,
    originalPrice: 45,
    rating: 4.2,
    reviewsCount: 85,
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=500',
    description: 'Handpicked fresh hybrid red tomatoes. Firm texture and vibrant red color. Excellent choice for curry base, salads, sauces, and garnishing.',
    stock: 200,
    unit: '1 kg',
    isDealsOfTheDay: true,
    ingredients: 'Fresh Farm Tomatoes',
    benefits: 'High in Vitamin C, potassium, and antioxidants like Lycopene.'
  },
  {
    id: 'p-3',
    name: 'Fresh Cauliflower (Gobhi)',
    category: 'vegetables',
    brand: 'Local Fresh',
    price: 35,
    originalPrice: 50,
    rating: 4.3,
    reviewsCount: 44,
    image: 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?auto=format&fit=crop&q=80&w=500',
    description: 'Fresh farm-selected cauliflower with compact white curds and crisp outer green leaves. Harvested in clean conditions.',
    stock: 80,
    unit: '1 Unit',
    isNewArrival: true,
    ingredients: 'Fresh cauliflower',
    benefits: 'Rich in fiber and B-vitamins.'
  },
  {
    id: 'p-4',
    name: 'Amul Salted Butter',
    category: 'dairy',
    brand: 'Amul',
    price: 275,
    originalPrice: 285,
    rating: 4.8,
    reviewsCount: 512,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=500',
    description: 'Amul Salted Butter is made from premium fresh cream and is loved all over the country. Indispensable for spreading on bread, toast, or parathas and for baking.',
    stock: 150,
    unit: '500 g',
    isBestSeller: true,
    ingredients: 'Butter, Common Salt',
    benefits: 'Rich in milk fat and provides essential fat-soluble vitamins.'
  },
  {
    id: 'p-5',
    name: 'Aashirvaad Shudh Chakki Atta',
    category: 'grocery',
    brand: 'Aashirvaad',
    price: 245,
    originalPrice: 275,
    rating: 4.7,
    reviewsCount: 1024,
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=500',
    description: 'Aashirvaad Whole Wheat Atta is made from premium grains. Ground using modern chakki-grinding process that preserves the high nutritional value of wheat. Keeps your rotis soft for a longer duration.',
    stock: 350,
    unit: '5 kg',
    isBestSeller: true,
    ingredients: '100% Whole Wheat',
    benefits: 'Excellent source of dietary fiber, aids digestion, provides sustained energy.'
  },
  {
    id: 'p-6',
    name: 'Surf Excel Easy Wash Detergent Powder',
    category: 'household',
    brand: 'Surf Excel',
    price: 135,
    originalPrice: 150,
    rating: 4.6,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=500',
    description: 'Surf Excel Easy Wash removes tough stains effortlessly in the bucket itself. Formulated with extra-active power-particles that penetrate deep into fabrics to clear out soil.',
    stock: 90,
    unit: '1 kg',
    isDealsOfTheDay: true,
    ingredients: 'Surfactants, Stain Removing Enzymes, Perfume',
    benefits: 'Removes grease, food stains, and deep-set dirt while preserving fabric color.'
  },
  {
    id: 'p-7',
    name: 'Premium Basmati Rice (Rozana)',
    category: 'rice',
    brand: 'Tata Tea',
    price: 110,
    originalPrice: 140,
    rating: 4.4,
    reviewsCount: 195,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=500',
    description: 'Premium quality basmati rice. Aged perfectly to deliver aromatic, long, fluffy grains that do not stick after cooking. Ideal for daily meals, biryanis, and pulav.',
    stock: 180,
    unit: '1 kg',
    isFlashSale: true,
    flashSalePrice: 89,
    ingredients: 'Aged Basmati Rice',
    benefits: 'Gluten-free, low fat, contains essential carbohydrates.'
  },
  {
    id: 'p-8',
    name: 'Haldiram\'s Bhujia Sev',
    category: 'snacks',
    brand: 'Haldiram\'s',
    price: 105,
    originalPrice: 120,
    rating: 4.6,
    reviewsCount: 420,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=500',
    description: 'The ultimate crispy snack! Infused with unique spices, tepary bean flour, and gram flour. Serve with hot tea or sprinkle over chaat dishes.',
    stock: 140,
    unit: '400 g',
    isBestSeller: true,
    ingredients: 'Tepary Beans Flour, Gram Flour, Edible Vegetable Oil, Mixed Spices, Salt',
    benefits: 'Authentic Indian crispy flavor, perfect teatime accompaniment.'
  },
  {
    id: 'p-9',
    name: 'Fresh Organic Blueberries',
    category: 'fruits',
    brand: 'Local Fresh',
    price: 299,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=500',
    description: 'Sweet, plump, and highly nutritious blueberries packed with antioxidants. Sourced under cold-chain processes to guarantee maximum freshness.',
    stock: 45,
    unit: '125 g',
    isFlashSale: true,
    flashSalePrice: 199,
    ingredients: 'Organic Blueberries',
    benefits: 'Antioxidant powerhouse, great for heart health and cognitive function.'
  },
  {
    id: 'p-10',
    name: 'Fresh Full Cream Milk',
    category: 'dairy',
    brand: 'Amul',
    price: 66,
    originalPrice: 70,
    rating: 4.8,
    reviewsCount: 840,
    image: 'https://images.unsplash.com/photo-1563630423918-b58f07298ac9?auto=format&fit=crop&q=80&w=500',
    description: 'Amul Taaza/Gold Pasteurised Milk. Meets rigorous quality parameters, and contains essential cream value to make tasty curd, tea, or drink directly.',
    stock: 250,
    unit: '1 L',
    isBestSeller: true,
    ingredients: 'Pasteurised Whole Milk',
    benefits: 'High in Calcium, Vitamin D, and active proteins.'
  },
  {
    id: 'p-11',
    name: 'Fresh Brown Eggs (Premium)',
    category: 'dairy',
    brand: 'Local Fresh',
    price: 85,
    originalPrice: 100,
    rating: 4.5,
    reviewsCount: 130,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=500',
    description: 'High-quality brown eggs from cage-free, pasture-fed hens. Rich in yolk thickness and loaded with protein, Omega-3, and healthy minerals.',
    stock: 95,
    unit: '6 Units',
    isNewArrival: true,
    ingredients: 'Chicken Eggs',
    benefits: 'Excellent bioavailable protein source, good for muscle growth.'
  },
  {
    id: 'p-12',
    name: 'Coca-Cola Zero Sugar Can',
    category: 'beverages',
    brand: 'Nestle',
    price: 40,
    originalPrice: 40,
    rating: 4.3,
    reviewsCount: 215,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500',
    description: 'Great Coca-Cola taste with zero sugar and zero calories. Best enjoyed ice cold for refreshing hydration on busy days.',
    stock: 300,
    unit: '300 ml',
    isNewArrival: true,
    ingredients: 'Carbonated water, Caramel Color, Acidulants, Artificial Sweeteners, Caffeine',
    benefits: 'Zero calories, ultimate refreshing fizz without extra sugar.'
  }
];

export const OFFERS: Offer[] = [
  {
    id: 'off-1',
    title: 'Monsoon Grocery Bonanza',
    subtitle: 'Get massive discounts on fresh veggies & organic pulses',
    discountText: 'UP TO 50% OFF',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
    code: 'MONSOON50'
  },
  {
    id: 'off-2',
    title: 'Dairy & Breakfast Freshness',
    subtitle: 'Buy butter, eggs, and organic milk at premium rates',
    discountText: 'FLAT ₹50 OFF',
    image: 'https://images.unsplash.com/photo-1528498033373-38d7a8ffd157?auto=format&fit=crop&q=80&w=800',
    code: 'FRESHDAIRY'
  },
  {
    id: 'off-3',
    title: 'New User Welcoming Offer',
    subtitle: 'Place your first order and save huge',
    discountText: '₹100 INSTANT DISCOUNT',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800',
    code: 'ARAJUMA100'
  }
];

export const COUPONS: Coupon[] = [
  {
    id: 'c-1',
    code: 'ARAJUMA100',
    description: 'Get Flat ₹100 Off on your first purchase of ₹499 or more.',
    discountType: 'fixed',
    discountValue: 100,
    minPurchase: 499,
    isActive: true
  },
  {
    id: 'c-2',
    code: 'SUPER20',
    description: '20% off on snack orders above ₹299. Max discount ₹75.',
    discountType: 'percentage',
    discountValue: 20,
    minPurchase: 299,
    isActive: true
  },
  {
    id: 'c-3',
    code: 'FREE_DEL',
    description: 'Get free home delivery on order value above ₹199.',
    discountType: 'percentage',
    discountValue: 0,
    minPurchase: 199,
    isActive: true
  }
];

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'Rihan Khan',
    phone: '9876543210',
    houseNumber: 'Flat No. 402, Elite Heights',
    area: 'R.G. Road, Near Ganesh Temple',
    landmark: 'Opposite State Bank',
    city: 'Guwahati',
    state: 'Assam',
    pincode: '781001',
    type: 'Home'
  },
  {
    id: 'addr-2',
    name: 'Arajuma Store Workspace',
    phone: '9123456789',
    houseNumber: 'Store Ground Floor, 12B',
    area: 'GS Road, Christian Basti',
    landmark: 'Near Central Mall',
    city: 'Guwahati',
    state: 'Assam',
    pincode: '781005',
    type: 'Work'
  }
];

export const DEFAULT_ADDRESSES = INITIAL_ADDRESSES;

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Welcome to Arajuma Store!',
    message: 'Explore fresh farm vegetables, dairy, and household essentials. Enjoy free home delivery on orders above ₹499.',
    date: 'July 5, 2026',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Flat ₹100 Off coupon code!',
    message: 'Apply coupon code ARAJUMA100 during checkout to get instant ₹100 Off on purchase above ₹499.',
    date: 'July 4, 2026',
    isRead: true
  }
];

export const SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Assam Fresh Farms Ltd.',
    contactPerson: 'Prabhat Bora',
    phone: '9854011223',
    email: 'contact@assamfreshfarms.com',
    productsSupplied: ['p-1', 'p-2', 'p-3', 'p-9']
  },
  {
    id: 'sup-2',
    name: 'East-India Dairy Co-operative',
    contactPerson: 'Anjali Sharma',
    phone: '9435012345',
    email: 'info@eastindiadairy.org',
    productsSupplied: ['p-4', 'p-10', 'p-11']
  },
  {
    id: 'sup-3',
    name: 'National Staples & Distribution',
    contactPerson: 'Rajeev Singhal',
    phone: '9112233445',
    email: 'wholesale@nationalstaples.co.in',
    productsSupplied: ['p-5', 'p-7', 'p-8']
  }
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  minimumOrderAmount: 149,
  deliveryChargeStandard: 39,
  deliveryChargeFreeThreshold: 499,
  storeAddress: 'Arajuma Store, Christian Basti, GS Road, Guwahati, Assam - 781005',
  supportEmail: 'support@arajumastore.com',
  supportPhone: '+91 9876543210'
};
