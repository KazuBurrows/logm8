// Runs before the app bundle so the log page paints on its dark background from
// the first frame, instead of the browser's white default while JavaScript loads.
// "bg-canvas" is the Tailwind theme token class (the stylesheet loads in <head>);
// the Log page keeps it on <html> while mounted. External, not inline, because
// the Content-Security-Policy only allows scripts from 'self'.
if (/^\/log\/?$/.test(window.location.pathname)) {
  document.documentElement.classList.add("bg-canvas");
}
