export const ROLES = { ADMIN: "admin", MANAGER: "manager", USER: "user" };

export const isAdmin = (user) => user?.role === ROLES.ADMIN;
export const isManager = (user) => user?.role === ROLES.MANAGER;
export const isAdminOrManager = (user) => [ROLES.ADMIN, ROLES.MANAGER].includes(user?.role);

export const canCreateUser = (user) => isAdmin(user);
export const canDeleteUser = (user) => isAdmin(user);
export const canViewAllUsers = (user) => isAdminOrManager(user);
export const canChangeStatus = (user) => isAdmin(user);
export const canAssignRole = (user) => isAdmin(user);

export const canEditUser = (requester, targetId) => {
  if (!requester) return false;
  if (isAdmin(requester)) return true;
  if (isManager(requester)) return true;
  return String(requester._id) === String(targetId);
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.USER]: "User",
};

export const ROLE_COLORS = {
  [ROLES.ADMIN]: "bg-purple-100 text-purple-800",
  [ROLES.MANAGER]: "bg-blue-100 text-blue-800",
  [ROLES.USER]: "bg-gray-100 text-gray-700",
};

export const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-700",
};
