// Modal Component Manager

const Modal = (() => {
  function open(htmlContent, options = {}) {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="relative bg-surface border border-glass rounded-2xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
        <button class="absolute top-4 right-4 text-subtle hover:text-heading text-lg w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center transition-colors" onclick="Modal.close()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        ${htmlContent}
      </div>
    `;

    container.classList.remove('hidden');
    requestAnimationFrame(() => {
      container.classList.remove('opacity-0');
    });

    if (options.onOpen) options.onOpen();
  }

  function close() {
    const container = document.getElementById('modal-container');
    if (!container) return;

    container.classList.add('opacity-0');
    setTimeout(() => {
      container.classList.add('hidden');
      container.innerHTML = '';
    }, 300);
  }

  return { open, close };
})();
