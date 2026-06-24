

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const universal = {
  "ssr": false
};
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.Cwz6E1BY.js","_app/immutable/chunks/LG5FupQN.js","_app/immutable/chunks/CU85j1qM.js","_app/immutable/chunks/D-zvFbeX.js","_app/immutable/chunks/BdXdzrua.js"];
export const stylesheets = ["_app/immutable/assets/0.BNCBGHwd.css"];
export const fonts = [];
