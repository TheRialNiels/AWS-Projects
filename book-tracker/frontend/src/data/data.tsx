import { BookCheck, BookHeart, BookOpenText, BookX, Star } from 'lucide-react'

export const statuses = [
  {
    value: 'READING',
    label: 'Reading',
    icon: BookOpenText,
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    icon: BookCheck,
  },
  {
    value: 'WISHLIST',
    label: 'Wishlist',
    icon: BookHeart,
  },
  {
    value: 'ABANDONED',
    label: 'Abandoned',
    icon: BookX,
  },
]

export const ratings = [
  {
    label: '1 star',
    value: 1,
    icon: Star,
  },
  {
    label: '2 stars',
    value: 2,
    icon: Star,
  },
  {
    label: '3 stars',
    value: 3,
    icon: Star,
  },
  {
    label: '4 stars',
    value: 4,
    icon: Star,
  },
  {
    label: '5 stars',
    value: 5,
    icon: Star,
  },
]
