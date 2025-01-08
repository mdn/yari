/**
 * @template {new (...args: any[]) => {}} TBase
 * @param {TBase} Base
 */
export const GleanMixin = (Base) =>
  class extends Base {
    /** @param {string} detail  */
    _gleanClick(detail) {
      window.dispatchEvent(new CustomEvent("glean-click", { detail }));
    }
  };
