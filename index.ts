import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const prisma = new PrismaClient();
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
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

  input BookInput {
    title: String!
    authorId: Int!
    categoryId: Int!
    publicationDate: String!
  }

  type Mutation {
    createBook(BookInput: BookInput): Book
  }

`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: async () => await prisma.book.findMany(),
    authors: async () => await prisma.author.findMany(),
    categories: async () => await prisma.category.findMany(),
    book: async (_: any, { id }: any) => (await prisma.book.findMany()).find(book => book.id === id),
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
    author: async ({ authorId }) => {
      return await prisma.author.findUnique({
        where: { id: authorId },
      });
    },
    category: async ({ categoryId }) => {
      return await prisma.category.findUnique({
        where: { id: categoryId },
      });
    },
  },
  Author: {
    books: async ({ id }) => (await prisma.book.findMany()).filter(book => book.authorId === id),
  },
  Category: {
    books: async ({ id }) => (await prisma.book.findMany()).filter(book => book.categoryId === id),
  }    
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