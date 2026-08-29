// Course Catalog Page View

const CatalogPage = (() => {
  let activeFilters = {
    search: '',
    category: 'All',
    level: 'All',
    sort: 'newest'
  };

  let allCourses = [];
  let userEnrollmentsMap = {};

  async function render() {
    const container = document.getElementById('view-container');
    if (!container) return;

    container.innerHTML = `
      <div class="container mx-auto px-4 sm:px-6 py-10 animate-fade-in">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="font-heading font-extrabold text-3xl md:text-4xl text-heading mb-2">Explore Course Catalog</h1>
          <p class="text-subtle text-sm sm:text-base">Browse 26 production-tier courses across full-stack dev, AI engineering, cloud, and cybersecurity.</p>
        </div>

        <!-- Search & Filter Controls Card -->
        <div class="bg-surface border border-glass rounded-2xl p-6 shadow-xl mb-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Search Input -->
            <div class="md:col-span-2 relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle text-sm"></i>
              <input type="text" 
                     id="catalog-search-input" 
                     placeholder="Search by course title, topic, or instructor name..." 
                     value="${activeFilters.search}"
                     oninput="CatalogPage.onSearchInput(this.value)" 
                     class="form-input pl-10" />
            </div>

            <!-- Level Select -->
            <div>
              <select onchange="CatalogPage.onLevelChange(this.value)" class="form-select">
                <option value="All">All Skill Levels</option>
                <option value="Beginner" ${activeFilters.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
                <option value="Intermediate" ${activeFilters.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                <option value="Advanced" ${activeFilters.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
              </select>
            </div>

            <!-- Sort Select -->
            <div>
              <select onchange="CatalogPage.onSortChange(this.value)" class="form-select">
                <option value="newest" ${activeFilters.sort === 'newest' ? 'selected' : ''}>Newest Additions</option>
                <option value="popular" ${activeFilters.sort === 'popular' ? 'selected' : ''}>Most Enrolled</option>
                <option value="rating" ${activeFilters.sort === 'rating' ? 'selected' : ''}>Highest Rated</option>
                <option value="price-low" ${activeFilters.sort === 'price-low' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-high" ${activeFilters.sort === 'price-high' ? 'selected' : ''}>Price: High to Low</option>
              </select>
            </div>
          </div>

          <!-- Category Pills Row -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 pt-2 border-t border-glass">
            <span class="text-xs font-bold text-subtle uppercase tracking-wider mr-2 flex-shrink-0">Categories:</span>
            ${['All', 'Web Development', 'Data Science & AI', 'UI/UX Design', 'Cloud Computing', 'Cybersecurity', 'Business & Marketing'].map(cat => `
              <button onclick="CatalogPage.onCategoryChange('${cat}')" 
                      class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeFilters.category === cat ? 'bg-primary text-white shadow-md' : 'bg-surface-elevated text-subtle hover:text-heading border border-glass'}">
                ${cat}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Course Grid Mount -->
        <div id="catalog-courses-grid" class="course-grid">
          <div class="col-span-full py-16 text-center text-subtle">
            <i class="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3 block"></i>
            Loading course catalog...
          </div>
        </div>
      </div>
    `;

    await fetchCourses();
  }

  async function fetchCourses() {
    try {
      const user = AppState.getState().user;
      userEnrollmentsMap = {};

      if (user) {
        try {
          const enrRes = await API.get('/enrollments');
          (enrRes.enrollments || []).forEach(e => {
            userEnrollmentsMap[e.course_id] = e;
          });
        } catch (e) {}
      }

      const query = new URLSearchParams();
      if (activeFilters.search) query.append('search', activeFilters.search);
      if (activeFilters.category !== 'All') query.append('category', activeFilters.category);
      if (activeFilters.level !== 'All') query.append('level', activeFilters.level);
      if (activeFilters.sort) query.append('sort', activeFilters.sort);

      const res = await API.get(`/courses?${query.toString()}`);
      allCourses = res.courses || [];
      renderGrid();
    } catch (err) {
      Toast.error('Failed to load catalog courses: ' + err.message);
    }
  }

  function renderGrid() {
    const grid = document.getElementById('catalog-courses-grid');
    if (!grid) return;

    if (!allCourses.length) {
      grid.innerHTML = `
        <div class="col-span-full bg-surface border border-glass rounded-2xl p-12 text-center shadow-lg">
          <i class="fa-solid fa-folder-open text-4xl text-subtle mb-3 block"></i>
          <h3 class="font-bold text-xl text-heading mb-1">No Courses Found</h3>
          <p class="text-sm text-subtle">Try clearing your search query or selecting a different category pill.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = allCourses.map(c => CourseCard.render(c, userEnrollmentsMap[c.id])).join('');
  }

  let searchTimeout = null;
  function onSearchInput(val) {
    activeFilters.search = val;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => fetchCourses(), 300);
  }

  function onCategoryChange(cat) {
    activeFilters.category = cat;
    render();
  }

  function onLevelChange(lvl) {
    activeFilters.level = lvl;
    fetchCourses();
  }

  function onSortChange(srt) {
    activeFilters.sort = srt;
    fetchCourses();
  }

  return { render, onSearchInput, onCategoryChange, onLevelChange, onSortChange };
})();
