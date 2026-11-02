export function BlueprintDrawing() {
  return (
    <svg
      className="blueprint-drawing"
      viewBox="0 0 340 170"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0v22" stroke="currentColor" strokeOpacity=".09" />
        </pattern>
      </defs>
      <rect width="340" height="170" fill="url(#grid)" />
      <g stroke="currentColor">
        <path
          opacity=".3"
          d="m29 113 133-77 143 78-133 77zM45 122l132-77m-88 102 132-78m-87 103 132-78"
        />
        <path d="m112 97 63-36 64 36-64 37z" fill="#006067" />
        <path
          d="M112 97v-30l63-36 64 36v30m-64 7V74m-63-7 63 37 64-37"
          opacity=".6"
        />
        <path d="m144 77 31-18 33 18-33 19z" fill="#7ad5dd" fillOpacity=".15" />
        <path d="M144 77V49l31-18 33 18v28m-33 19V68m-31-19 31 19 33-19" />
        <path
          d="M77 88v43l34 20m159-63v43l-31 18M175 7v14M89 53l-11-7m183 7 11-7"
          strokeDasharray="3 4"
          opacity=".5"
        />
      </g>
      <circle cx="175" cy="7" r="3" fill="#ffddb3" />
      <circle cx="77" cy="88" r="3" fill="#96f1fa" />
      <circle cx="270" cy="88" r="3" fill="#96f1fa" />
      <text
        x="20"
        y="22"
        fill="currentColor"
        opacity=".5"
        fontSize="8"
        fontFamily="monospace"
      >
        IDEA → ARCHITECTURE
      </text>
      <text
        x="250"
        y="158"
        fill="currentColor"
        opacity=".5"
        fontSize="8"
        fontFamily="monospace"
      >
        FIG. 01
      </text>
    </svg>
  );
}
