import { ClientCompany } from '../types';

export const CLIENT_COMPANIES: ClientCompany[] = [
  {
    id: 'comp_generic',
    name: 'General Transport Co.',
    description: 'A massive conglomerate making fleet vehicles. They prioritize cost over everything.',
    qualityPreference: 'economy'
  },
  {
    id: 'comp_swift',
    name: 'Swift Motors',
    description: 'A mid-range manufacturer looking to spruce up their sport trims.',
    qualityPreference: 'performance'
  },
  {
    id: 'comp_tankan',
    name: 'Tankan Heavy Industries',
    description: 'Industrial vehicle manufacturer. They need engines that never break.',
    qualityPreference: 'reliability'
  },
  {
    id: 'comp_luxe',
    name: 'Vanguard Automotive',
    description: 'Luxury startup needing smooth, high-quality powerplants.',
    qualityPreference: 'performance'
  }
];
