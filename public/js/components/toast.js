// Toast Notification Component

const Toast = (() => {
  function show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast border-l-4 ${getBorderColor(type)} animate-fade-in`;

    const iconMap = {
      success: '<i class="fa-solid fa-circle-check text-green-500 text-lg"></i>',
      error: '<i class="fa-solid fa-circle-xmark text-red-500 text-lg"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation text-amber-500 text-lg"></i>',
      info: '<i class="fa-solid fa-circle-info text-indigo-500 text-lg"></i>'
    };

    toast.innerHTML = `
      ${iconMap[type] || iconMap.info}
      <span class="text-sm font-medium text-heading">${message}</span>
      <button class="ml-auto text-subtle hover:text-heading" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  function getBorderColor(type) {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-amber-500';
      default: return 'border-indigo-500';
    }
  }

  return {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info: (msg, dur) => show(msg, 'info', dur)
  };
})();
