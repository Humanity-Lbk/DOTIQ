export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  {
    id: 'dotiq-assessment',
    name: 'DOTIQ Assessment',
    description: 'Complete 50-question assessment measuring Discipline, Ownership, Toughness, and Sports IQ',
    priceInCents: 1999, // $19.99
  },
]
