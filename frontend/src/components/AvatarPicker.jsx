import { AVATARS } from "../data/avatars.js";

export default function AvatarPicker({ value, onChange }) {
  return (
    <fieldset className="avatar-picker">
      <legend>Choose an avatar</legend>
      <div className="avatar-options">
        {AVATARS.map((avatar) => (
          <label className={`avatar-option${value === avatar.src ? " selected" : ""}`} key={avatar.id}>
            <input
              type="radio"
              name="avatar"
              value={avatar.src}
              checked={value === avatar.src}
              onChange={() => onChange(avatar.src)}
            />
            <img src={avatar.src} alt={`${avatar.name} avatar`} />
            <span>{avatar.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
