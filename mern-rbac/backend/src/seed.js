// backend/src/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Post = require('./models/Post');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // WARNING: This will delete existing users & posts in the database.
  await User.deleteMany({});
  await Post.deleteMany({});

  // Hash passwords
  const adminPw = await bcrypt.hash('AdminPass123', 12);      // legacy admin
  const agastyaPw = await bcrypt.hash('Admin@123', 12);      // your requested password
  const editorPw = await bcrypt.hash('EditorPass123', 12);
  const viewerPw = await bcrypt.hash('ViewerPass123', 12);

  // Create users (keeps original Admin and adds Agastya as additional Admin)
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash: adminPw,
    role: 'Admin'
  });

  const agastya = await User.create({
    name: 'Agastya',
    email: '23bai70472@cuchd.in',
    passwordHash: agastyaPw,
    role: 'Admin'
  });

  const editor = await User.create({
    name: 'Editor',
    email: 'editor@example.com',
    passwordHash: editorPw,
    role: 'Editor'
  });

  const viewer = await User.create({
    name: 'Viewer',
    email: 'viewer@example.com',
    passwordHash: viewerPw,
    role: 'Viewer'
  });

  // Example posts
  await Post.create({ title: 'Admin Post', body: 'Post by admin', author: admin._id });
  await Post.create({ title: 'Agastya Post', body: 'Post by Agastya', author: agastya._id });
  await Post.create({ title: 'Editor Post', body: 'Post by editor', author: editor._id });
  await Post.create({ title: 'Viewer Post', body: 'Post by viewer', author: viewer._id });

  console.log('Seeded users:');
  console.log(' admin@example.com / AdminPass123');
  console.log(' 23bai70472@cuchd.in / Admin@123  <-- Agastya (Admin)');
  console.log(' editor@example.com / EditorPass123');
  console.log(' viewer@example.com / ViewerPass123');

  process.exit(0);
}

run().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
