class ProgressTracker {
    static calculateProgress(completedModules, totalModules) {
        if (!totalModules || totalModules <= 0) return 0;
        const percent = (completedModules / totalModules) * 100;
        return Math.min(100, Math.round(percent));
    }
}
if (typeof module !== 'undefined') module.exports = ProgressTracker;