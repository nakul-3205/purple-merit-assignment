const ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
});

const STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
});

// Higher number = more privilege
const ROLE_HIERARCHY = Object.freeze({
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.USER]: 1,
});

const PERMISSIONS = Object.freeze({
  CREATE_USER: [ROLES.ADMIN],
  READ_ALL_USERS: [ROLES.ADMIN, ROLES.MANAGER],
  UPDATE_ANY_USER: [ROLES.ADMIN],
  UPDATE_NON_ADMIN: [ROLES.ADMIN, ROLES.MANAGER],
  DELETE_USER: [ROLES.ADMIN],
  ASSIGN_ROLE: [ROLES.ADMIN],
  CHANGE_STATUS: [ROLES.ADMIN],
});

module.exports = { ROLES, STATUS, ROLE_HIERARCHY, PERMISSIONS };
