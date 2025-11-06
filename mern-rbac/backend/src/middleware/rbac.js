const { roles } = require('../config/roles');
const Post = require('../models/Post');

// can(permission, options)
// options: { ownershipField: 'author', ownershipParam: 'postId' }
function can(permission, options = {}) {
  return async function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const roleName = req.user.role || 'Viewer';
    const rolePerms = roles[roleName] || {};

    // If role allows permission globally
    if (rolePerms[permission]) return next();

    // Ownership-based allowance
    if (options.ownershipField && options.ownershipParam) {
      const resourceId = req.params[options.ownershipParam] || req.body[options.ownershipParam];
      if (!resourceId) return res.status(403).json({ error: 'Forbidden' });

      try {
        const resource = await Post.findById(resourceId).select(options.ownershipField).lean();
        if (!resource) return res.status(404).json({ error: 'Resource not found' });
        if (String(resource[options.ownershipField]) === String(req.user.id)) {
          // allow ownership override (documented)
          return next();
        }
      } catch (err) {
        return res.status(500).json({ error: 'Server error' });
      }
    }

    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { can };
