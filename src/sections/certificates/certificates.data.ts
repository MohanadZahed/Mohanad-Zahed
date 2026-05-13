export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string; // MM/YYYY
}

export const CERTIFICATES: readonly Certificate[] = [
  {
    id: 'isaqb-cpsa-f',
    name: 'Certified Professional for Software Architecture — Foundation',
    issuer: 'iSAQB',
    date: '02/2026',
  },
  {
    id: 'itil-4',
    name: 'ITIL 4 Foundation',
    issuer: 'PeopleCert · AXELOS',
    date: '09/2025',
  },
  {
    id: 'istqb-ctfl',
    name: 'Certified Tester — Foundation Level',
    issuer: 'ISTQB',
    date: '08/2025',
  },
  {
    id: 'prince2-foundation-agile',
    name: 'PRINCE2 Foundation Agile',
    issuer: 'PeopleCert · AXELOS',
    date: '08/2025',
  },
  {
    id: 'telc-deutsch-b1',
    name: 'Deutsch B1',
    issuer: 'telc gGmbH',
    date: '02/2017',
  },
  {
    id: 'Informatik',
    name: 'B.Sc. Informatik',
    issuer: 'Al-Ahliyya Amman University',
    date: '03/2014',
  },
] as const;
