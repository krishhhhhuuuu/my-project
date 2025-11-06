import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../auth/AuthProvider';
import PostEditor from '../components/PostEditor';
import '../App.css'; // to make sure card styles are available

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await api.get('/posts', { headers: { Authorization: `Bearer ${token}` } });
      setPosts(res.data);
    } catch (err) {
      alert('Failed to load posts');
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function del(id) {
    const shouldDelete = window.confirm('Are you sure you want to delete this post?');
    if (!shouldDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      await api.delete(`/posts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#1e3a8a' }}>Posts</h2>

      {/* Create new post */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, color: '#2563eb' }}>Create a new post</h3>
        <PostEditor
          post={null}
          onSaved={(p) => {
            setPosts([p, ...posts]);
          }}
        />
      </div>

      {/* List of posts */}
      <div>
        {posts.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#64748b',
              fontStyle: 'italic',
              marginTop: 40,
            }}
          >
            No posts available yet.
          </div>
        )}

        {posts.map((p) => (
          <div key={p._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a' }}>{p.title}</h3>
                <small style={{ color: '#64748b' }}>By: {p.author?.name || p.author}</small>
              </div>
              <div>
                <button
                  onClick={() => setEditing(p)}
                  style={{ backgroundColor: '#3b82f6', color: 'white', marginRight: 8 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => del(p._id)}
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <p style={{ marginTop: 12, lineHeight: 1.6 }}>{p.body}</p>

            {/* Inline editor for editing a post */}
            {editing && editing._id === p._id && (
              <div style={{ marginTop: 12 }}>
                <PostEditor
                  post={editing}
                  onSaved={(updated) => {
                    setPosts(posts.map((x) => (x._id === updated._id ? updated : x)));
                    setEditing(null);
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
