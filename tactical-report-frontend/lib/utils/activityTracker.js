const ACTIVITY_KEY = 'tactical_report_activities';

export const ActivityType = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

export function trackActivity(type, itemId, itemName, details = {}) {
  if (typeof window === 'undefined') return null;

  const activities = getActivities();
  const activity = {
    id: Date.now().toString(),
    type,
    itemId,
    itemName,
    details,
    timestamp: new Date().toISOString(),
    user: 'admin',
  };

  activities.unshift(activity);
  const limitedActivities = activities.slice(0, 100);

  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(limitedActivities));
  window.dispatchEvent(new CustomEvent('activity-added', { detail: activity }));

  return activity;
}

export function getActivities() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading activities:', error);
    return [];
  }
}

export function getRecentActivities(limit = 5) {
  return getActivities().slice(0, limit);
}

export function filterActivities(filters = {}) {
  let activities = getActivities();

  if (filters.type && filters.type !== 'ALL') {
    activities = activities.filter(a => a.type === filters.type);
  }

  if (filters.startDate) {
    activities = activities.filter(a => new Date(a.timestamp) >= new Date(filters.startDate));
  }

  if (filters.endDate) {
    activities = activities.filter(a => new Date(a.timestamp) <= new Date(filters.endDate));
  }

  if (filters.search) {
    const search = filters.search.toLowerCase();
    activities = activities.filter(a => a.itemName.toLowerCase().includes(search));
  }

  return activities;
}

export function clearActivities() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(ACTIVITY_KEY);
  window.dispatchEvent(new CustomEvent('activities-cleared'));
}