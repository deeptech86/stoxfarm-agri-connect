import { User } from '@/types/user';
import { Produce, Listing, Bid, Transaction, ListingStatus } from '@/types/produce';

export const produceList: Produce[] = [
  { id: '1', name: 'Carrots', mandiRate: 25 },
  { id: '2', name: 'Tomatoes', mandiRate: 30 },
  { id: '3', name: 'Potatoes', mandiRate: 20 },
  { id: '4', name: 'Onions', mandiRate: 28 },
  { id: '5', name: 'Cabbage', mandiRate: 15 },
  { id: '6', name: 'Cauliflower', mandiRate: 35 },
  { id: '7', name: 'Green Beans', mandiRate: 40 },
  { id: '8', name: 'Brinjal', mandiRate: 22 },
  { id: '9', name: 'Lady Finger', mandiRate: 38 },
  { id: '10', name: 'Cucumber', mandiRate: 18 },
];

export const mockUsers: User[] = [
  // Admin
  { id: 'admin1', name: 'Admin Kumar', email: 'admin@stoxfarm.in', phone: '9876543210', role: 'admin', address: 'Mumbai, Maharashtra' },
  
  // Sellers
  { id: 'seller1', name: 'Rajesh Patel', email: 'rajesh@farm.in', phone: '9876543211', role: 'seller', address: 'Anand, Gujarat' },
  { id: 'seller2', name: 'Suresh Singh', email: 'suresh@farm.in', phone: '9876543212', role: 'seller', address: 'Ludhiana, Punjab' },
  { id: 'seller3', name: 'Ramesh Kumar', email: 'ramesh@farm.in', phone: '9876543213', role: 'seller', address: 'Nashik, Maharashtra' },
  { id: 'seller4', name: 'Mahesh Yadav', email: 'mahesh@farm.in', phone: '9876543214', role: 'seller', address: 'Jaipur, Rajasthan' },
  { id: 'seller5', name: 'Ganesh Patil', email: 'ganesh@farm.in', phone: '9876543215', role: 'seller', address: 'Pune, Maharashtra' },
  
  // Buyers
  { id: 'buyer1', name: 'Anil Traders', email: 'anil@buyer.in', phone: '9876543221', role: 'buyer', address: 'Delhi' },
  { id: 'buyer2', name: 'Vinod Wholesale', email: 'vinod@buyer.in', phone: '9876543222', role: 'buyer', address: 'Bangalore' },
  { id: 'buyer3', name: 'Prakash Markets', email: 'prakash@buyer.in', phone: '9876543223', role: 'buyer', address: 'Chennai' },
  { id: 'buyer4', name: 'Deepak Stores', email: 'deepak@buyer.in', phone: '9876543224', role: 'buyer', address: 'Hyderabad' },
  { id: 'buyer5', name: 'Sanjay Foods', email: 'sanjay@buyer.in', phone: '9876543225', role: 'buyer', address: 'Kolkata' },
  { id: 'buyer6', name: 'Ravi Enterprises', email: 'ravi@buyer.in', phone: '9876543226', role: 'buyer', address: 'Ahmedabad' },
  { id: 'buyer7', name: 'Manoj Suppliers', email: 'manoj@buyer.in', phone: '9876543227', role: 'buyer', address: 'Surat' },
  { id: 'buyer8', name: 'Ashok Distributors', email: 'ashok@buyer.in', phone: '9876543228', role: 'buyer', address: 'Pune' },
  { id: 'buyer9', name: 'Vijay Trading', email: 'vijay@buyer.in', phone: '9876543229', role: 'buyer', address: 'Jaipur' },
  { id: 'buyer10', name: 'Kiran Merchants', email: 'kiran@buyer.in', phone: '9876543230', role: 'buyer', address: 'Lucknow' },
  
  // Logistics
  { id: 'logistics1', name: 'Fast Transport Co', email: 'fast@logistics.in', phone: '9876543241', role: 'logistics', address: 'Mumbai, Maharashtra' },
  { id: 'logistics2', name: 'Quick Delivery Ltd', email: 'quick@logistics.in', phone: '9876543242', role: 'logistics', address: 'Delhi' },
];

const now = new Date();
const dayInMs = 24 * 60 * 60 * 1000;

export let mockListings: Listing[] = [
  {
    id: 'list1',
    sellerId: 'seller1',
    produceName: 'Carrots',
    mandiRate: 25,
    quantity: 500,
    minOrderQty: 50,
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'],
    status: 'active',
    createdAt: new Date(now.getTime() - 2 * dayInMs),
    expiresAt: new Date(now.getTime() + 5 * dayInMs),
  },
  {
    id: 'list2',
    sellerId: 'seller2',
    produceName: 'Tomatoes',
    mandiRate: 30,
    quantity: 800,
    minOrderQty: 100,
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
    status: 'pending',
    createdAt: new Date(now.getTime() - 1 * dayInMs),
    expiresAt: new Date(now.getTime() + 6 * dayInMs),
  },
  {
    id: 'list3',
    sellerId: 'seller3',
    produceName: 'Potatoes',
    mandiRate: 20,
    quantity: 1000,
    minOrderQty: 100,
    images: ['https://images.unsplash.com/photo-1518977676601-b53f82aba655'],
    status: 'active',
    createdAt: new Date(now.getTime() - 3 * dayInMs),
    expiresAt: new Date(now.getTime() + 4 * dayInMs),
  },
  {
    id: 'list4',
    sellerId: 'seller4',
    produceName: 'Carrots',
    mandiRate: 25,
    quantity: 300,
    minOrderQty: 30,
    images: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'],
    status: 'rejected',
    createdAt: new Date(now.getTime() - 4 * dayInMs),
    expiresAt: new Date(now.getTime() + 3 * dayInMs),
  },
];

export let mockBids: Bid[] = [];

export let mockTransactions: Transaction[] = [];

export const addListing = (listing: Listing) => {
  mockListings.push(listing);
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
