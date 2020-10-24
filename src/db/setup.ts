import { query as q, Expr } from 'faunadb';

const collections: Expr[] = [q.CreateCollection({ name: 'posts' })];

const indices: Expr[] = [
  q.CreateIndex({
    name: 'posts_by_title',
    source: q.Collection('posts'),
    terms: [{ field: ['data', 'title'] }]
  }),
  q.CreateIndex({
    name: 'posts_by_tags_with_title',
    source: q.Collection('posts'),
    terms: [{ field: ['data', 'tags'] }],
    values: [{ field: ['data', 'title'] }]
  })
];

export default [...collections, ...indices];
