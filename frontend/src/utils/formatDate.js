export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 30) return `${diffDays} days ago`;
  
  return formatDate(dateString);
};
