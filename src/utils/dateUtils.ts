// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for display
export function formatDisplayDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('vi-VN', options);
}

// Format month for display
export function formatDisplayMonth(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('vi-VN', options);
} 