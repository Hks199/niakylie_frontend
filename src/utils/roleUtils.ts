/**
 * Helper utility to determine if a user document has Administrative privileges.
 * Supports case-insensitive checks for 'ADMIN', 'admin', 'SUPER_ADMIN', and 'super_admin',
 * handling both array `user.roles` and single string `user.role` properties.
 */
export function checkIsAdmin(user: any): boolean {
  if (!user) return false;
  const roles: string[] = [];

  if (Array.isArray(user.roles)) {
    roles.push(...user.roles.map((r: any) => String(r).toLowerCase()));
  }

  if (user.role) {
    roles.push(String(user.role).toLowerCase());
  }

  return roles.some((r) => r === 'admin' || r === 'super_admin');
}
