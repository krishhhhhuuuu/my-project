// central role -> permission matrix
module.exports = {
  roles: {
    Admin: {
      'posts:create': true,
      'posts:read': true,
      'posts:update': true,
      'posts:delete': true,
      'users:manage': true,
      'audit:read': true
    },
    Editor: {
      'posts:create': true,
      'posts:read': true,
      'posts:update': true, // ownership semantics handled server-side
      'posts:delete': false,
      'users:manage': false
    },
    Viewer: {
      'posts:create': false,
      'posts:read': true,
      'posts:update': false,
      'posts:delete': false
    }
  },
  defaultRole: 'Viewer'
};
