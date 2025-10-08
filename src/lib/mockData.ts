import { User } from '@/types/user';
import { Produce, Listing, Bid, Transaction, ListingStatus } from '@/types/produce';

const getExpiryDate = (daysFromNow: number = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const produceList: Produce[] = [
  { id: '1', name: 'Tomatoes', mandiRate: 25 },
  { id: '2', name: 'Potatoes', mandiRate: 18 },
  { id: '3', name: 'Onions', mandiRate: 22 },
  { id: '4', name: 'Carrots', mandiRate: 30 },
  { id: '5', name: 'Cabbage', mandiRate: 15 },
  { id: '6', name: 'Cauliflower', mandiRate: 28 },
  { id: '7', name: 'Brinjal', mandiRate: 20 },
  { id: '8', name: 'Okra', mandiRate: 35 },
  { id: '9', name: 'Spinach', mandiRate: 12 },
  { id: '10', name: 'Wheat', mandiRate: 22 },
];

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@stoxfarm.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    phone: '+91 9876543210',
    address: 'StoxFarm HQ, Mumbai',
    profilePic: '',
    notes: 'Platform administrator',
  },
  // 5 Sellers
  {
    id: 'seller-1',
    email: 'seller1@stoxfarm.com',
    password: 'seller123',
    name: 'Rajesh Kumar',
    role: 'seller',
    phone: '+91 9876543211',
    address: 'Village Rampur, Punjab',
    profilePic: '',
    notes: 'Organic farmer specializing in vegetables',
  },
  {
    id: 'seller-2',
    email: 'seller2@stoxfarm.com',
    password: 'seller123',
    name: 'Suresh Patil',
    role: 'seller',
    phone: '+91 9876543221',
    address: 'Village Kolhapur, Maharashtra',
    profilePic: '',
    notes: 'Premium quality produce',
  },
  {
    id: 'seller-3',
    email: 'seller3@stoxfarm.com',
    password: 'seller123',
    name: 'Ganesh Reddy',
    role: 'seller',
    phone: '+91 9876543231',
    address: 'Village Warangal, Telangana',
    profilePic: '',
    notes: 'Traditional farming methods',
  },
  {
    id: 'seller-4',
    email: 'seller4@stoxfarm.com',
    password: 'seller123',
    name: 'Anil Singh',
    role: 'seller',
    phone: '+91 9876543241',
    address: 'Village Meerut, Uttar Pradesh',
    profilePic: '',
    notes: 'Export quality vegetables',
  },
  {
    id: 'seller-5',
    email: 'seller5@stoxfarm.com',
    password: 'seller123',
    name: 'Ravi Nair',
    role: 'seller',
    phone: '+91 9876543251',
    address: 'Village Kochi, Kerala',
    profilePic: '',
    notes: 'Certified organic farmer',
  },
  // 10 Buyers
  {
    id: 'buyer-1',
    email: 'buyer1@stoxfarm.com',
    password: 'buyer123',
    name: 'Priya Sharma',
    role: 'buyer',
    phone: '+91 9876543212',
    address: 'Azadpur Mandi, Delhi',
    profilePic: '',
    notes: 'Wholesale vegetable dealer',
  },
  {
    id: 'buyer-2',
    email: 'buyer2@stoxfarm.com',
    password: 'buyer123',
    name: 'Amit Gupta',
    role: 'buyer',
    phone: '+91 9876543222',
    address: 'Vashi Market, Mumbai',
    profilePic: '',
    notes: 'Retail chain buyer',
  },
  {
    id: 'buyer-3',
    email: 'buyer3@stoxfarm.com',
    password: 'buyer123',
    name: 'Neha Kapoor',
    role: 'buyer',
    phone: '+91 9876543232',
    address: 'Koyambedu Market, Chennai',
    profilePic: '',
    notes: 'Restaurant supplier',
  },
  {
    id: 'buyer-4',
    email: 'buyer4@stoxfarm.com',
    password: 'buyer123',
    name: 'Vikram Mehta',
    role: 'buyer',
    phone: '+91 9876543242',
    address: 'Yeshwanthpur Market, Bangalore',
    profilePic: '',
    notes: 'Hotel chain procurement',
  },
  {
    id: 'buyer-5',
    email: 'buyer5@stoxfarm.com',
    password: 'buyer123',
    name: 'Sneha Joshi',
    role: 'buyer',
    phone: '+91 9876543252',
    address: 'Market Yard, Pune',
    profilePic: '',
    notes: 'Wholesale distributor',
  },
  {
    id: 'buyer-6',
    email: 'buyer6@stoxfarm.com',
    password: 'buyer123',
    name: 'Rohit Desai',
    role: 'buyer',
    phone: '+91 9876543262',
    address: 'Sabzi Mandi, Ahmedabad',
    profilePic: '',
    notes: 'Export business owner',
  },
  {
    id: 'buyer-7',
    email: 'buyer7@stoxfarm.com',
    password: 'buyer123',
    name: 'Kavita Rao',
    role: 'buyer',
    phone: '+91 9876543272',
    address: 'Rythu Bazaar, Hyderabad',
    profilePic: '',
    notes: 'Supermarket chain buyer',
  },
  {
    id: 'buyer-8',
    email: 'buyer8@stoxfarm.com',
    password: 'buyer123',
    name: 'Sanjay Verma',
    role: 'buyer',
    phone: '+91 9876543282',
    address: 'Subzi Mandi, Kolkata',
    profilePic: '',
    notes: 'Wholesale vegetable trader',
  },
  {
    id: 'buyer-9',
    email: 'buyer9@stoxfarm.com',
    password: 'buyer123',
    name: 'Pooja Iyer',
    role: 'buyer',
    phone: '+91 9876543292',
    address: 'Gandhi Market, Jaipur',
    profilePic: '',
    notes: 'Organic store owner',
  },
  {
    id: 'buyer-10',
    email: 'buyer10@stoxfarm.com',
    password: 'buyer123',
    name: 'Arjun Pillai',
    role: 'buyer',
    phone: '+91 9876543302',
    address: 'Mananchira Market, Calicut',
    profilePic: '',
    notes: 'Food processing company',
  },
  // 2 Logistics
  {
    id: 'logistics-1',
    email: 'logistics1@stoxfarm.com',
    password: 'logistics123',
    name: 'Express Transport Co',
    role: 'logistics',
    phone: '+91 9876543213',
    address: 'Transport Nagar, Mumbai',
    profilePic: '',
    notes: 'Cold chain logistics specialist',
  },
  {
    id: 'logistics-2',
    email: 'logistics2@stoxfarm.com',
    password: 'logistics123',
    name: 'Fast Delivery Services',
    role: 'logistics',
    phone: '+91 9876543313',
    address: 'Logistics Hub, Delhi',
    profilePic: '',
    notes: 'Pan-India delivery network',
  },
];

export let mockListings: Listing[] = [
  {
    id: 'listing-1',
    sellerId: 'seller-1',
    produceName: 'Tomatoes',
    mandiRate: 25,
    quantity: 500,
    minOrderQty: 50,
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
    status: 'active',
    createdAt: new Date(),
    expiresAt: getExpiryDate(5),
  },
  {
    id: 'listing-2',
    sellerId: 'seller-1',
    produceName: 'Onions',
    mandiRate: 22,
    quantity: 1000,
    minOrderQty: 100,
    images: ['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400'],
    status: 'active',
    createdAt: new Date(),
    expiresAt: getExpiryDate(6),
  },
  {
    id: 'listing-3',
    sellerId: 'seller-2',
    produceName: 'Carrots',
    mandiRate: 30,
    quantity: 800,
    minOrderQty: 80,
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'],
    status: 'active',
    createdAt: new Date(),
    expiresAt: getExpiryDate(4),
  },
  {
    id: 'listing-4',
    sellerId: 'seller-3',
    produceName: 'Potatoes',
    mandiRate: 18,
    quantity: 2000,
    minOrderQty: 200,
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'],
    status: 'active',
    createdAt: new Date(),
    expiresAt: getExpiryDate(7),
  },
  {
    id: 'listing-5',
    sellerId: 'seller-4',
    produceName: 'Cabbage',
    mandiRate: 15,
    quantity: 600,
    minOrderQty: 60,
    images: ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400'],
    status: 'active',
    createdAt: new Date(),
    expiresAt: getExpiryDate(3),
  },
  {
    id: 'listing-6',
    sellerId: 'seller-5',
    produceName: 'Cauliflower',
    mandiRate: 28,
    quantity: 400,
    minOrderQty: 40,
    images: ['https://images.unsplash.com/photo-1568584711271-7c8a32d6a4c9?w=400'],
    status: 'expired',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export let mockBids: Bid[] = [];

export let mockTransactions: Transaction[] = [];

export const addListing = (listing: Listing) => {
  // Auto-set expiry date to 7 days from creation
  const listingWithExpiry = {
    ...listing,
    expiresAt: getExpiryDate(7),
    status: 'active' as ListingStatus, // Listings go live immediately
  };
  mockListings.push(listingWithExpiry);
};

export const updateListingStatus = (id: string, status: ListingStatus) => {
  mockListings = mockListings.map(l => l.id === id ? { ...l, status } : l);
};

export const addBid = (bid: Bid) => {
  mockBids.push(bid);
};

export const updateBid = (id: string, updates: Partial<Bid>) => {
  mockBids = mockBids.map(b => b.id === id ? { ...b, ...updates } : b);
};

export const addTransaction = (transaction: Transaction) => {
  mockTransactions.push(transaction);
};
