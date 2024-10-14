import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const books = [
  {
    id: 1,
    title: 'The Awakening',
    authorId: 1,
    categoryId: 1,
    publicationDate: '1899-04-22',
  },
  {
    id: 2,
    title: 'City of Glass',
    authorId: 2,
    categoryId: 1,
    publicationDate: '1985-03-12',
  },
  {
    id: 3,
    title: 'The Awakening2',
    authorId: 1,
    categoryId: 2,
    publicationDate: '1899-04-22',
  },
  {
    id: 4,
    title: 'City of Glass2',
    authorId: 2,
    categoryId: 2,
    publicationDate: '1985-03-12',
  },
];

const categories = [
  {
    id: 1,
    name: 'Fiction',
  },
  {
    id: 2,
    name: 'Novel',
  },
];

const authors = [
  {
    id: 1,
    name: 'Kate Chopin',
  },
  {
    id: 2,
    name: 'Paul Auster',
  },
];

async function main() {
  // Seed Categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: {
        id: category.id,
        name: category.name,
      },
    });
  }

  // Seed Authors
  for (const author of authors) {
    await prisma.author.upsert({
      where: { id: author.id },
      update: {},
      create: {
        id: author.id,
        name: author.name,
      },
    });
  }

  // Seed Books
  for (const book of books) {
    await prisma.book.upsert({
      where: { id: book.id },
      update: {},
      create: {
        id: book.id,
        title: book.title,
        publicationDate: book.publicationDate,
        authorId: book.authorId,
        categoryId: book.categoryId,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
