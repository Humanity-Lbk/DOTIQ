export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'dotiq-full-report',
    name: 'DOTIQ Full Report',
    description: 'Unlock your complete DOTIQ analysis with detailed pillar breakdowns, personalized action plans, and development resources',
    priceInCents: 1999, // $19.99
  },
]
