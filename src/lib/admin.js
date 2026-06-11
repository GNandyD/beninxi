export function parseAdminEmails(value = '') {
  return String(value)
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user, adminEmails = process.env.ADMIN_EMAILS || '') {
  if (!user) return false;

  const role = String(user.app_metadata?.role || user.user_metadata?.role || '').toLowerCase();
  const isAdminFlag = user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true;
  const email = String(user.email || '').trim().toLowerCase();
  const emailAllowlist = parseAdminEmails(adminEmails);

  return isAdminFlag || role === 'admin' || emailAllowlist.includes(email);
}
