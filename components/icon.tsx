import type { CSSProperties } from "react";
const paths: Record<string, string> = {
  arrow: "M4 12h16m-6-6 6 6-6 6",
  back: "M20 12H4m6-6-6 6 6 6",
  check: "m5 12 4 4L19 6",
  chevron: "m8 10 4 4 4-4",
  workflow: "M8 5h8v6H8zM5 16h4v4H5zm10 0h4v4h-4zM12 11v3m-5 2v-2h10v2",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18",
  layers: "m12 3 10 5-10 5L2 8zm-10 9 10 5 10-5M2 16l10 5 10-5",
  growth: "M4 20h16M5 16l5-5 4 2 6-9m-6 0h6v6",
  compass: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 9l-2 4-4 2 2-4z",
  file: "M14 2H5v20h14V7zm0 0v5h5M8 12h8m-8 4h6",
  shield: "m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5zm-4 10 3 3 5-6",
  clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  copy: "M8 8h13v13H8zM16 8V3H3v13h5",
  mail: "M3 5h18v14H3zm0 0 9 8 9-8",
  edit: "m4 16 12-12 4 4L8 20H4zm10-10 4 4",
  refresh: "M4 9a8 8 0 1 1 0 7M4 3v6h6",
  info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-10v1",
  print: "M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v8H6z",
  external: "M14 3h7v7m0-7L10 14M10 3H3v18h18v-7",
  close: "m6 6 12 12M6 18 18 6",
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
