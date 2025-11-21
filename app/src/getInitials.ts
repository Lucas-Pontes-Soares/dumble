export default function getInitials(name: string) {
  if (!name) return "...";
  const words = name.split(' ').filter(Boolean);

  if (words.length > 1) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length > 1) {
    return name.substring(0, 2).toUpperCase();
  } else if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  return ""; 
};