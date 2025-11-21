const avatarColors = [
  "bg-[#58CC02]",  
  "bg-[#1cb0f6]",
  "bg-[#ff4b4b]", 
  "bg-[#ffc800]", 
  "bg-[#ff9600]", 
  "bg-[#ce82ff]",
  "bg-[#2b70c9]", 
  "bg-[#8549ba]", 
  "bg-[#14d4f4]",
  "bg-[#8ee000]", 
];

export default function getAvatarColor (id: string) {
    if (!id || typeof id !== 'string' || id.length === 0) {
        return;
    }

    const index = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
    return avatarColors[index];
};