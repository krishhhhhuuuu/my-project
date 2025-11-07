cat <<'EOF' > src/components/Loader.jsx
import React from 'react';

export default function Loader({ size='md', text }) {
  const style = size === 'sm' ? { width:16, height:16 } : { width:24, height:24 };
  return (
    <div className="d-flex align-items-center">
      <div className="spinner-border" role="status" style={{...style, marginRight:8}}>
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <small className="text-muted">{text}</small>}
    </div>
  );
}
EOF
