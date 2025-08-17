import { faker } from '@faker-js/faker'

export type Book = {
  id: string
  title: string
  author: string
  status: 'READING' | 'COMPLETED' | 'WISHLIST' | 'ABANDONED'
  rating: number
  notes: string
}

const range = (len: number) => {
  const arr: number[] = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const newBook = (): Book => {
  return {
    id: faker.string.uuid(),
    title: faker.book.title(),
    author: faker.book.author(),
    rating: faker.number.int({min: 1, max: 5}),
    notes: faker.word.words(),
    status: faker.helpers.shuffle<Book['status']>([
      'READING',
      'COMPLETED',
      'WISHLIST',
      'ABANDONED',
    ])[0]!,
  }
}

export function makeData(...lens: number[]) {
  const makeDataLevel = (depth = 0): Book[] => {
    const len = lens[depth]!
    return range(len).map((): Book => {
      return newBook()
    })
  }

  return makeDataLevel()
}
