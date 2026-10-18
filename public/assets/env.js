// Runtime configuration. Empty during development, so src/environments/environment.ts uses its
// defaults. The Docker image overwrites this file at container start from environment variables
// (see env.sh), so the same image runs in any environment.
(function (window) {
  window.__env = window.__env || {};
})(window);
