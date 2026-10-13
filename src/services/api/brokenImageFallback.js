// If an uploaded image can't load (deleted file, storage error), show a
// neutral placeholder instead of the browser's broken-image icon. One
// capture-phase listener covers every <img> pointing at the uploads API.
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#eef1f4"/>'
  + '<path d="M18 44l10-12 7 8 5-6 8 10z" fill="#c3cad3"/><circle cx="40" cy="24" r="4" fill="#c3cad3"/></svg>'
)}`;

export const installBrokenImageFallback = () => {
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallbackApplied) return;
    if (!img.currentSrc.includes('/api/v1/uploads/')) return;
    img.dataset.fallbackApplied = 'true';
    img.src = PLACEHOLDER;
  }, true);
};
