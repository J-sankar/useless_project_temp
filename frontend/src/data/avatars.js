import avatar1 from "../../assets/avatar1.jpeg";
import avatar2 from "../../assets/avatar2.jpeg";
import avatar3 from "../../assets/avatar3.jpeg";
import avatar4 from "../../assets/avatar4.jpeg";
import avatar5 from "../../assets/avatar5.jpeg";

// The catalog is the single source of truth for selectable pet avatars.
export const AVATARS = [
  { id: "avatar-1", name: "Sunny", src: avatar1 },
  { id: "avatar-2", name: "Mochi", src: avatar2 },
  { id: "avatar-3", name: "Pepper", src: avatar3 },
  { id: "avatar-4", name: "Coco", src: avatar4 },
  { id: "avatar-5", name: "Biscuit", src: avatar5 },
];

export const DEFAULT_AVATAR = AVATARS[0];
