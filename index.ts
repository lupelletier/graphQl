import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: Author
    category: Category
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
  }
`;
const books = [
    {
      id: 1,
      title: 'The Awakening',
      authorId: 1 ,
      categoryId: 1,
    },
    {
      id: 2,
      title: 'City of Glass',
      authorId: 2,
      categoryId: 1,
    },
    {
      id: 3,
      title: 'The Awakening',
      authorId: 1,
      categoryId: 2,
    },
    {
      id: 4,
      title: 'City of Glass2',
      authorId: 2,
      categoryId: 2,
    }
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
    name: 'Kate Chopin',
    id: 1,
    books: [books[0], books[2]],
  },
  {
    name: 'Paul Auster',
    id: 2,
    books: [books[1], books[3]],
  },
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
      books: () => books,
      authors: () => authors,
      categories: () => categories,
    },
    Book: {
      author: ({ authorId }) => authors.find(author => author.id === authorId),
      category: ({ categoryId }) => categories.find(category => category.id === categoryId),
    },
    Author: {
      books: ({ id }) => books.filter(book => book.authorId === id),
    },
    Category: {
      books: ({ id }) => books.filter(book => book.categoryId === id),
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