import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Author, PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const prisma = new PrismaClient();
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: ID!
    title: String
    author: Author
    category: Category
    publicationDate: String
  }

  type Author {
    id: ID!
    name: String
    books: [Book!]!
  }

  type Category {
    id: ID!
    name: String
    books: [Book!]!
  }


  type Mutation {
    createBook(BookInput: BookInput): Book
  }

  input BookInput {
    title: String!
    authorId: Int!
    categoryId: Int!
    publicationDate: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book!]!
    authors: [Author!]!
    categories: [Category!]!
    book(id: Int!): Book
    category(id: Int!): Category
    author(id: Int!): Author
  }

`;

// Data Loaders
// author by id
const authorById = new DataLoader(async (IdsList: number[]) => {
  const authors = await prisma.author.findMany({
    where: { id: { in: IdsList } },
  });
  return IdsList.map((id) => authors.find((author) => author.id === id));
});
// category by id
const categoryById = new DataLoader(async (IdsList: number[]) => {
  const categories = await prisma.category.findMany({
    where: { id: { in: IdsList } },
  });
  return IdsList.map((id) => categories.find((category) => category.id === id));
});
// book by id
const bookById = new DataLoader(async (IdsList: number[]) => {
  const books = await prisma.book.findMany({
    where: { id: { in: IdsList } },
  });
  return IdsList.map((id) => books.find((book) => book.id === id));
});

// books by author id
const booksByAuthorId = new DataLoader(async (IdsList: number[]) => {
  const books = await prisma.book.findMany({
    where: { authorId: { in: IdsList } },
  });
  return IdsList.map((id) => books.filter((book) => book.authorId === id));
});

// books by category id
const booksByCategoryId = new DataLoader(async (IdsList: number[]) => {
  const books = await prisma.book.findMany({
    where: { categoryId: { in: IdsList } },
  });
  return IdsList.map((id) => books.filter((book) => book.categoryId === id));
});
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: async () => await prisma.book.findMany(),
    authors: async () => await prisma.author.findMany(),
    categories: async () => await prisma.category.findMany(),
    book: async (_: any, { id }: any) => bookById.load(id),
    category: async (_: any, { id }: any) => (await prisma.category.findMany()).find(category => category.id === id),
    author: async (_: any, { id }: any) => (await prisma.author.findMany()).find(author => author.id === id),
  },
  Mutation: {
    createBook: async (_: any, { BookInput }: any) => {
      const newBook = await prisma.book.create({
        data: {
          title: BookInput.title,
          author: {
            connect: { id: BookInput.authorId }
          },
          category: {
            connect: { id: BookInput.categoryId }
          },
          publicationDate: BookInput.publicationDate
        }
      });
      return newBook;
    }
  },
  Book: {
    author: async ({ authorId }) =>  authorById.load(authorId),
    category: async ({ categoryId }) => categoryById.load(categoryId),
  },
  Author: {
    books: async ({ id }) => booksByAuthorId.load(id),
  },
  Category: {
    books: async ({ id }) =>booksByCategoryId.load(id),
  },
  
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
  
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});
  
console.log(`🚀  Server ready at: ${url}`);