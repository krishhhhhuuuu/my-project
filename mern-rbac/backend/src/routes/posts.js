const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { can } = require('../middleware/rbac');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/', requireAuth, can('posts:create'), [
  body('title').isString().notEmpty(),
  body('body').isString().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const post = new Post({ title: req.body.title, body: req.body.body, author: req.user.id });
  await post.save();
  res.status(201).json(post);
});

// Read (list) posts
router.get('/', requireAuth, can('posts:read'), async (req, res) => {
  const q = {};
  // optionally add filters, pagination here
  const posts = await Post.find(q).populate('author', 'name email').sort({ createdAt: -1 }).lean();
  res.json(posts);
});

// Update post (ownership enforced)
router.put('/:postId', requireAuth, can('posts:update', { ownershipField: 'author', ownershipParam: 'postId' }), [
  body('title').optional().isString(),
  body('body').optional().isString()
], async (req, res) => {
  const patch = {};
  if (req.body.title) patch.title = req.body.title;
  if (req.body.body) patch.body = req.body.body;
  patch.updatedAt = new Date();

  const role = req.user.role;
  let q = { _id: req.params.postId };
  if (role !== 'Admin') q.author = req.user.id;

  const updated = await Post.findOneAndUpdate(q, { $set: patch }, { new: true }).lean();
  if (!updated) return res.status(404).json({ error: 'Not found or forbidden' });
  res.json(updated);
});

// Delete (only Admin)
router.delete('/:postId', requireAuth, can('posts:delete'), async (req, res) => {
  const deleted = await Post.findByIdAndDelete(req.params.postId);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
