export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // Strictly [longitude, latitude] required for MongoDB 2dsphere indexing
}

export const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];
