import express from 'express';
import { Client as FaunaClient, query as q } from 'faunadb';
import * as z from 'zod';

const NewPostSchema = z.object({
  title: z.string(),
  tags: z.string().array()
});

const create = (fauna: FaunaClient) => {
  const router = express.Router();

  router.get('/:id', async (req, res) => {
    try {
      const post = await fauna.query(
        q.Get(q.Ref(q.Collection('posts'), req.params.id))
      );

      return res.json(post);
    } catch (e) {
      // if Fauna could not find doc return 404
      if (e.requestResult.statusCode === 404) {
        return res.status(404).json({
          message: 'Not Found'
        });
      }

      // otherwise its a server error
      console.error(e);
      return res.sendStatus(500);
    }
  });

  router.post('/', async (req, res) => {
    const validation = NewPostSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        message: 'Error parsing'
      });
    }

    const data = validation.data;

    try {
      const resp = await fauna.query(
        q.Create(q.Collection('posts'), {
          data
        })
      );
      return res.json(resp);
    } catch (e) {
      return res.status(500).json({
        message: 'error inserting'
      });
    }
  });

  return router;
};

export default create;
