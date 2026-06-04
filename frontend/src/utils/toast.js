// Lightweight DOM-based toast — no React context needed, works anywhere
let _handler = null;

export const _registerToast = (fn) => { _handler = fn; };

// Clean raw backend error strings into human-readable messages
const clean = (message) => {
  if (!message) return 'Something went wrong. Please try again.';
  const raw = String(message).trim();
  if (raw.startsWith('[') || raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(e => e.message || e.msg || String(e)).join('. ');
      if (parsed?.message) return parsed.message;
    } catch {}
  }
  return raw;
};

export const showToast = (message, type = 'error') => {
  if (_handler) _handler(clean(message), type);
};

// Auto-detect type from message content
export const toast = (message) => {
  const msg = clean(message);
  const isSuccess = /success|بنجاح|تم |added|locked|created|applied|updated|saved|confirmed/i.test(msg);
  const isInfo    = /please|يرجى|select|اختر|required|مطلوب/i.test(msg);
  showToast(msg, isSuccess ? 'success' : isInfo ? 'info' : 'error');
};
