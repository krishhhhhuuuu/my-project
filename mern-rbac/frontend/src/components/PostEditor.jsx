import React, { useContext, useState } from 'react';
import { AuthContext } from '../auth/AuthProvider';
import api from '../api/axios';

export default function PostEditor({ post, onSaved }) {
  const { user } = useContext(AuthContext);
  const isOwner = user && post && post.author && (post.author._id === user.id || post.author === user.id);
  const canEdit = (user?.role === 'Admin') || (user?.role === 'Editor' && isOwner);

  const [title, setTitle] = useState(post?.title || '');
  const [body, setBody] = useState(post?.body || '');
  const [saving, setSaving] = useState(false);

  async function save(){
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (post?._id) {
        const res = await api.put(`/posts/${post._id}`, { title, body }, { headers: { Authorization: `Bearer ${token}` } });
        onSaved && onSaved(res.data);
      } else {
        const res = await api.post('/posts', { title, body }, { headers: { Authorization: `Bearer ${token}` } });
        onSaved && onSaved(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  }

  return (
    <div style={{ border:'1px solid #eee', padding:12, borderRadius:6 }}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{ width:'100%', marginBottom:8 }} disabled={!canEdit}/>
      <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Body" rows={6} style={{ width:'100%' }} disabled={!canEdit}/>
      <div style={{ marginTop:8 }}>
        <button onClick={save} disabled={!canEdit || saving} title={!canEdit ? 'No permission' : ''}>{post?._id ? 'Update' : 'Create'}</button>
      </div>
    </div>
  );
}
