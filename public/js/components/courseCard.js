// Course Card Component

const CourseCard = (() => {
  function render(course, userEnrollment = null) {
    const isEnrolled = !!userEnrollment;
    const progressPct = userEnrollment ? userEnrollment.progress_pct : 0;

    return `
      <div class="card flex flex-col h-full group">
        <!-- Thumbnail -->
        <div class="relative overflow-hidden aspect-video bg-surface-elevated">
          <img src="${course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}" 
               alt="${course.title}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
               loading="lazy" />
          
          <!-- Category Badge -->
          <div class="absolute top-3 left-3">
            <span class="badge badge-primary shadow-md backdrop-blur-md bg-surface/90">${course.category}</span>
          </div>

          <!-- Level Badge -->
          <div class="absolute top-3 right-3">
            <span class="badge bg-black/70 backdrop-blur-md text-white border border-white/20">${course.level}</span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center space-x-2 mb-2 text-xs text-subtle font-medium">
              <span class="flex items-center text-amber-400 font-bold">
                <i class="fa-solid fa-star mr-1"></i> ${course.rating}
              </span>
              <span>•</span>
              <span><i class="fa-solid fa-users mr-1"></i> ${course.students_count} enrolled</span>
              <span>•</span>
              <span><i class="fa-solid fa-clock mr-1"></i> ${course.duration}</span>
            </div>

            <h3 class="font-heading font-bold text-lg text-heading group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
              <a href="#course/${course.id}">${course.title}</a>
            </h3>

            <p class="text-xs sm:text-sm text-subtle line-clamp-2 mb-4 leading-relaxed">
              ${course.subtitle || course.description}
            </p>
          </div>

          <!-- Footer -->
          <div class="pt-4 border-t border-glass flex items-center justify-between">
            <div class="flex items-center space-x-2 overflow-hidden">
              <div class="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                ${course.instructor_name ? course.instructor_name[0] : 'I'}
              </div>
              <span class="text-xs font-semibold text-heading truncate">${course.instructor_name}</span>
            </div>

            ${isEnrolled ? `
              <div class="flex flex-col items-end flex-shrink-0">
                <span class="text-[11px] font-bold text-primary mb-1">${progressPct}% Done</span>
                <a href="#learn/${course.id}" class="btn btn-primary btn-sm">
                  <i class="fa-solid fa-play text-[10px] mr-1"></i> Continue
                </a>
              </div>
            ` : `
              <div class="flex items-center space-x-3 flex-shrink-0">
                <span class="font-extrabold text-lg text-heading">
                  ${course.price === 0 ? 'Free' : `$${course.price}`}
                </span>
                <a href="#course/${course.id}" class="btn btn-secondary btn-sm">
                  Details
                </a>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  return { render };
})();
