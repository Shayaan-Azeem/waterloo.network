export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch('/api/user/me');
    return res.ok;
  } catch {
    return false;
  }
}

export async function getCurrentUser() {
  try {
    const res = await fetch('/api/user/me');
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (e) {
    console.error('Logout failed:', e);
  }
}

