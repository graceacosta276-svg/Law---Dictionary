// Small, dependency-free icon set. Using real unicode characters directly
// (not \u escape codes) since JSX attribute strings don't process escapes.

export function Icon({ glyph, size = 16, color }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1, color: color || "inherit", display: "inline-block" }}>
      {glyph}
    </span>
  );
}

export const IconSearch = (p) => <Icon glyph="🔍" {...p} />;
export const IconMoon = (p) => <Icon glyph="🌙" {...p} />;
export const IconSun = (p) => <Icon glyph="☀️" {...p} />;
export const IconBook = (p) => <Icon glyph="📖" {...p} />;
export const IconLayers = (p) => <Icon glyph="📚" {...p} />;
export const IconBrain = (p) => <Icon glyph="🧠" {...p} />;
export const IconClock = (p) => <Icon glyph="🕒" {...p} />;
export const IconChevronLeft = (p) => <Icon glyph="‹" {...p} />;
export const IconChevronRight = (p) => <Icon glyph="›" {...p} />;
export const IconX = (p) => <Icon glyph="✕" {...p} />;
export const IconRotate = (p) => <Icon glyph="↺" {...p} />;
export const IconCheck = (p) => <Icon glyph="✓" {...p} />;
export const IconPlus = (p) => <Icon glyph="＋" {...p} />;
export const IconSignOut = (p) => <Icon glyph="⎋" {...p} />;
export const IconWifiOff = (p) => <Icon glyph="⚠" {...p} />;
export const IconUpload = (p) => <Icon glyph="⇪" {...p} />;
export const IconEdit = (p) => <Icon glyph="✎" {...p} />;

export function IconStar({ size = 16, color, fill }) {
  const filled = fill && fill !== "none";
  return <Icon glyph={filled ? "★" : "☆"} size={size} color={color} />;
}
