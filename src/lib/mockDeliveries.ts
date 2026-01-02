import { DeliveryDriver, DeliveryTracking } from '@/types/logistics';

export const mockDrivers: DeliveryDriver[] = [
  {
    id: 'driver-1',
    name: 'Ramesh Yadav',
    phone: '+91 9876543401',
    vehicleNumber: 'KA-01-AB-1234',
    vehicleType: 'truck',
    rating: 4.8,
  },
  {
    id: 'driver-2',
    name: 'Sunil Kumar',
    phone: '+91 9876543402',
    vehicleNumber: 'MH-12-CD-5678',
    vehicleType: 'mini-truck',
    rating: 4.5,
  },
  {
    id: 'driver-3',
    name: 'Prakash Singh',
    phone: '+91 9876543403',
    vehicleNumber: 'DL-08-EF-9012',
    vehicleType: 'pickup',
    rating: 4.9,
  },
  {
    id: 'driver-4',
    name: 'Vijay Sharma',
    phone: '+91 9876543404',
    vehicleNumber: 'TN-07-GH-3456',
    vehicleType: 'truck',
    rating: 4.6,
  },
];

// Bengaluru area coordinates
const bengaluruLocations = {
  koramangala: { lat: 12.9352, lng: 77.6245 },
  whitefield: { lat: 12.9698, lng: 77.7500 },
  electronicCity: { lat: 12.8399, lng: 77.6770 },
  yeshwanthpur: { lat: 13.0280, lng: 77.5430 },
  jayanagar: { lat: 12.9308, lng: 77.5838 },
  malleshwaram: { lat: 13.0035, lng: 77.5647 },
  hebbal: { lat: 13.0358, lng: 77.5970 },
  btmLayout: { lat: 12.9166, lng: 77.6101 },
};

const getETA = (hoursFromNow: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

// Calculate a point between origin and destination based on progress
const interpolateLocation = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  progress: number
) => {
  return {
    lat: origin.lat + (destination.lat - origin.lat) * progress,
    lng: origin.lng + (destination.lng - origin.lng) * progress,
  };
};

export const mockDeliveries: DeliveryTracking[] = [
  {
    id: 'delivery-1',
    driver: mockDrivers[0],
    status: 'in_transit',
    origin: {
      address: 'Village Rampur, Punjab',
      ...bengaluruLocations.yeshwanthpur,
    },
    destination: {
      address: 'Yeshwanthpur Market, Bangalore',
      ...bengaluruLocations.koramangala,
    },
    currentLocation: interpolateLocation(
      bengaluruLocations.yeshwanthpur,
      bengaluruLocations.koramangala,
      0.6
    ),
    estimatedArrival: getETA(2),
    produceName: 'Tomatoes',
    quantity: 500,
    sellerName: 'Rajesh Kumar',
    buyerName: 'Vikram Mehta',
    createdAt: new Date(),
  },
  {
    id: 'delivery-2',
    driver: mockDrivers[1],
    status: 'picked_up',
    origin: {
      address: 'Village Kolhapur, Maharashtra',
      ...bengaluruLocations.hebbal,
    },
    destination: {
      address: 'Market Yard, Pune',
      ...bengaluruLocations.electronicCity,
    },
    currentLocation: interpolateLocation(
      bengaluruLocations.hebbal,
      bengaluruLocations.electronicCity,
      0.2
    ),
    estimatedArrival: getETA(4),
    produceName: 'Onions',
    quantity: 1000,
    sellerName: 'Suresh Patil',
    buyerName: 'Sneha Joshi',
    createdAt: new Date(),
  },
  {
    id: 'delivery-3',
    driver: mockDrivers[2],
    status: 'in_transit',
    origin: {
      address: 'Village Warangal, Telangana',
      ...bengaluruLocations.whitefield,
    },
    destination: {
      address: 'Rythu Bazaar, Hyderabad',
      ...bengaluruLocations.jayanagar,
    },
    currentLocation: interpolateLocation(
      bengaluruLocations.whitefield,
      bengaluruLocations.jayanagar,
      0.75
    ),
    estimatedArrival: getETA(1),
    produceName: 'Potatoes',
    quantity: 2000,
    sellerName: 'Ganesh Reddy',
    buyerName: 'Kavita Rao',
    createdAt: new Date(),
  },
  {
    id: 'delivery-4',
    driver: mockDrivers[3],
    status: 'pending',
    origin: {
      address: 'Village Meerut, Uttar Pradesh',
      ...bengaluruLocations.malleshwaram,
    },
    destination: {
      address: 'Subzi Mandi, Kolkata',
      ...bengaluruLocations.btmLayout,
    },
    currentLocation: bengaluruLocations.malleshwaram,
    estimatedArrival: getETA(6),
    produceName: 'Carrots',
    quantity: 800,
    sellerName: 'Anil Singh',
    buyerName: 'Sanjay Verma',
    createdAt: new Date(),
  },
];
