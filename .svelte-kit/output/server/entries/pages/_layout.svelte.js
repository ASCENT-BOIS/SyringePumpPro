import "clsx";
function _layout($$renderer, $$props) {
  let { children } = $$props;
  $$renderer.push(`<div class="svelte-12qhfyh">`);
  children($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  _layout as default
};
