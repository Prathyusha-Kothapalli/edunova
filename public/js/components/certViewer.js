// Certificate Renderer & Viewer Component

const CertViewer = (() => {
  function show(cert) {
    const html = `
      <div id="printable-certificate-area" class="certificate-frame my-2">
        <div class="certificate-border-inner flex flex-col items-center">
          <div class="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white font-extrabold text-2xl mb-4 shadow-glow">
            E
          </div>

          <span class="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Official Certificate of Accomplishment</span>
          <h1 class="font-heading font-extrabold text-3xl text-slate-900 mt-2 mb-4 tracking-tight">EduNova Learning Platform</h1>

          <p class="text-sm text-slate-600 max-w-md mx-auto mb-6">
            This is to certify that the student listed below has successfully completed all required modules, assessments, and practical exercises for:
          </p>

          <h2 class="font-heading font-bold text-2xl text-indigo-700 mb-6 underline decoration-indigo-300">
            ${cert.course_title}
          </h2>

          <div class="my-4 py-3 px-8 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-xs text-slate-500 uppercase block font-semibold">Awarded To</span>
            <span class="font-heading font-extrabold text-2xl text-slate-900">${cert.student_name}</span>
          </div>

          <div class="w-full flex items-center justify-between pt-8 border-t border-slate-200 mt-6 text-xs text-slate-600">
            <div class="text-left">
              <span class="block font-semibold text-slate-400 uppercase">Issue Date</span>
              <span class="font-bold text-slate-800">${new Date(cert.issued_at).toLocaleDateString()}</span>
            </div>

            <div class="text-center">
              <span class="font-serif italic text-lg text-indigo-900 font-bold block">Dr. Sarah Jenkins</span>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Course Instructor Signature</span>
            </div>

            <div class="text-right">
              <span class="block font-semibold text-slate-400 uppercase">Certificate ID</span>
              <span class="font-mono font-bold text-indigo-600">${cert.certificate_code}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-glass">
        <button onclick="CertViewer.print()" class="btn btn-secondary btn-sm">
          <i class="fa-solid fa-print mr-1"></i> Print / Save PDF
        </button>
        <button onclick="Modal.close()" class="btn btn-primary btn-sm">
          Close
        </button>
      </div>
    `;

    Modal.open(html);
  }

  function print() {
    window.print();
  }

  return { show, print };
})();
