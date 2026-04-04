(function () {
  function svgDataUri(svg) {
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  window.FLAG_SVGS = {
    scotland: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#005eb8"/>
        <line x1="0" y1="0" x2="64" y2="48" stroke="#ffffff" stroke-width="8"/>
        <line x1="64" y1="0" x2="0" y2="48" stroke="#ffffff" stroke-width="8"/>
      </svg>
    `),

    england: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#ffffff"/>
        <rect x="26" width="12" height="48" fill="#cf142b"/>
        <rect y="18" width="64" height="12" fill="#cf142b"/>
      </svg>
    `),

    usa: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#ffffff"/>
        <g fill="#b22234">
          <rect y="0" width="64" height="3.692"/>
          <rect y="7.384" width="64" height="3.692"/>
          <rect y="14.768" width="64" height="3.692"/>
          <rect y="22.152" width="64" height="3.692"/>
          <rect y="29.536" width="64" height="3.692"/>
          <rect y="36.920" width="64" height="3.692"/>
          <rect y="44.304" width="64" height="3.696"/>
        </g>
        <rect width="25.6" height="25.846" fill="#3c3b6e"/>
        <g fill="#ffffff">
          <circle cx="3.2" cy="3.2" r="0.9"/><circle cx="8.0" cy="3.2" r="0.9"/><circle cx="12.8" cy="3.2" r="0.9"/><circle cx="17.6" cy="3.2" r="0.9"/><circle cx="22.4" cy="3.2" r="0.9"/>
          <circle cx="5.6" cy="6.4" r="0.9"/><circle cx="10.4" cy="6.4" r="0.9"/><circle cx="15.2" cy="6.4" r="0.9"/><circle cx="20.0" cy="6.4" r="0.9"/>
          <circle cx="3.2" cy="9.6" r="0.9"/><circle cx="8.0" cy="9.6" r="0.9"/><circle cx="12.8" cy="9.6" r="0.9"/><circle cx="17.6" cy="9.6" r="0.9"/><circle cx="22.4" cy="9.6" r="0.9"/>
          <circle cx="5.6" cy="12.8" r="0.9"/><circle cx="10.4" cy="12.8" r="0.9"/><circle cx="15.2" cy="12.8" r="0.9"/><circle cx="20.0" cy="12.8" r="0.9"/>
          <circle cx="3.2" cy="16.0" r="0.9"/><circle cx="8.0" cy="16.0" r="0.9"/><circle cx="12.8" cy="16.0" r="0.9"/><circle cx="17.6" cy="16.0" r="0.9"/><circle cx="22.4" cy="16.0" r="0.9"/>
          <circle cx="5.6" cy="19.2" r="0.9"/><circle cx="10.4" cy="19.2" r="0.9"/><circle cx="15.2" cy="19.2" r="0.9"/><circle cx="20.0" cy="19.2" r="0.9"/>
          <circle cx="3.2" cy="22.4" r="0.9"/><circle cx="8.0" cy="22.4" r="0.9"/><circle cx="12.8" cy="22.4" r="0.9"/><circle cx="17.6" cy="22.4" r="0.9"/><circle cx="22.4" cy="22.4" r="0.9"/>
        </g>
      </svg>
    `),

    canada: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#ffffff"/>
        <rect width="16" height="48" x="0" fill="#d80621"/>
        <rect width="16" height="48" x="48" fill="#d80621"/>
        <path fill="#d80621" d="M32 8l2 5 5-2-2 5 5 1-5 2 3 4-5-1 1 6h-4l1-6-5 1 3-4-5-2 5-1-2-5 5 2z"/>
        <rect x="30.5" y="24" width="3" height="10" fill="#d80621"/>
      </svg>
    `),

    germany: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="16" y="0" fill="#000000"/>
        <rect width="64" height="16" y="16" fill="#dd0000"/>
        <rect width="64" height="16" y="32" fill="#ffce00"/>
      </svg>
    `),

    finland: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#ffffff"/>
        <rect x="18" width="10" height="48" fill="#003580"/>
        <rect y="19" width="64" height="10" fill="#003580"/>
      </svg>
    `),

    sweden: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#006aa7"/>
        <rect x="20" width="8" height="48" fill="#fecc00"/>
        <rect y="20" width="64" height="8" fill="#fecc00"/>
      </svg>
    `),

    spain: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#c60b1e"/>
        <rect y="12" width="64" height="24" fill="#ffc400"/>
      </svg>
    `),

    belgium: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="21.333" height="48" x="0" fill="#000000"/>
        <rect width="21.333" height="48" x="21.333" fill="#ffd90c"/>
        <rect width="21.334" height="48" x="42.666" fill="#ef3340"/>
      </svg>
    `),

    croatia: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="16" y="0" fill="#ff0000"/>
        <rect width="64" height="16" y="16" fill="#ffffff"/>
        <rect width="64" height="16" y="32" fill="#171796"/>
        <g transform="translate(24,12)">
          <rect width="16" height="20" fill="#ffffff" stroke="#171796" stroke-width="1"/>
          <rect x="0" y="0" width="4" height="4" fill="#ff0000"/><rect x="8" y="0" width="4" height="4" fill="#ff0000"/>
          <rect x="4" y="4" width="4" height="4" fill="#ff0000"/><rect x="12" y="4" width="4" height="4" fill="#ff0000"/>
          <rect x="0" y="8" width="4" height="4" fill="#ff0000"/><rect x="8" y="8" width="4" height="4" fill="#ff0000"/>
          <rect x="4" y="12" width="4" height="4" fill="#ff0000"/><rect x="12" y="12" width="4" height="4" fill="#ff0000"/>
          <rect x="0" y="16" width="4" height="4" fill="#ff0000"/><rect x="8" y="16" width="4" height="4" fill="#ff0000"/>
        </g>
      </svg>
    `),

    slovenia: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="16" y="0" fill="#ffffff"/>
        <rect width="64" height="16" y="16" fill="#005ce6"/>
        <rect width="64" height="16" y="32" fill="#d50000"/>
        <g transform="translate(10,7)">
          <path d="M0 0h14v10c0 6-7 10-7 10S0 16 0 10z" fill="#005ce6" stroke="#ffffff" stroke-width="1"/>
          <path d="M2 5l3-3 2 2 2-2 3 3" fill="none" stroke="#ffffff" stroke-width="1.2"/>
          <path d="M3 12h8" stroke="#ffffff" stroke-width="1.2"/>
          <path d="M2 14h10" stroke="#d50000" stroke-width="1.2"/>
        </g>
      </svg>
    `),

    russia: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="16" y="0" fill="#ffffff"/>
        <rect width="64" height="16" y="16" fill="#0039a6"/>
        <rect width="64" height="16" y="32" fill="#d52b1e"/>
      </svg>
    `),

    ukraine: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="24" y="0" fill="#0057b7"/>
        <rect width="64" height="24" y="24" fill="#ffd700"/>
      </svg>
    `),

    wales: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="24" y="0" fill="#ffffff"/>
        <rect width="64" height="24" y="24" fill="#00a651"/>
        <path fill="#d21034" d="M17 30l3-5 5-2 3-5 4 1 3-2 2 2 4 0 2 3 4 1 1 3-3 2 1 4-4-1-3 3-4-1-3 3-4-1-4 2-3-2-4 1 2-4-2-3 3-1z"/>
      </svg>
    `),

    ireland: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="21.333" height="48" x="0" fill="#169b62"/>
        <rect width="21.333" height="48" x="21.333" fill="#ffffff"/>
        <rect width="21.334" height="48" x="42.666" fill="#ff883e"/>
      </svg>
    `)
  };
})();