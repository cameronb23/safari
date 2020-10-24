import express from 'express';
import bodyparser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import faunadb from 'faunadb';

import dbSetupQueries from './db/setup';

import PostsRoutes from './routes/posts';

// Initialize environment variables from file
dotenv.config();

const { FAUNADB_SECRET, NODE_ENV } = process.env;
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = NODE_ENV === 'production' || NODE_ENV === 'staging';

if (FAUNADB_SECRET == null) {
  console.error('No FaunaDB secret provided.');
  process.exit(1);
}

// Initialize FaunaDB
const fauna = new faunadb.Client({ secret: FAUNADB_SECRET });

// Create Express application
const app = express();

// initialize middlewares
app.use(cors());
app.use(bodyparser.json());
app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));

// create routes
app.get('/', async (req, res) => {
  return res.json({ message: 'Hello!' });
});

app.use('/posts', PostsRoutes(fauna));

const start = async () => {
  try {
    // attempt to create all collections if they do not exist
    const queries = dbSetupQueries.map((expr) => fauna.query(expr));
    const response = await Promise.all(queries);

    // Log each creation response
    response.forEach(console.log);
  } catch (e) {
    if (!e.message.includes('instance already exists')) {
      console.error('Error setting up database: ', e);
      process.exit(1);
    }
  }

  console.log('Database setup complete.');

  // Listen on the server
  app.listen(PORT, () => {
    console.log(`⚡️ Server listening on port ${PORT}`);
  });
};

start();
