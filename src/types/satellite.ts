export interface SatelliteCenter {
  id: string;
  name: string;
  address: string;
  officePhone: string;
  platformFee: number; // Percentage fee charged by the platform
  createdAt: Date;
  updatedAt: Date;
}
