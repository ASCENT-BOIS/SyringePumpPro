export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["pytauri.svg","python.svg","svelte.svg","tauri.svg","vite.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.CLMw7MZ8.js",app:"_app/immutable/entry/app.B6rR7ok3.js",imports:["_app/immutable/entry/start.CLMw7MZ8.js","_app/immutable/chunks/03WuP2GZ.js","_app/immutable/chunks/CU85j1qM.js","_app/immutable/chunks/CLmTHvvC.js","_app/immutable/entry/app.B6rR7ok3.js","_app/immutable/chunks/CU85j1qM.js","_app/immutable/chunks/C-qCGyO4.js","_app/immutable/chunks/LG5FupQN.js","_app/immutable/chunks/CLmTHvvC.js","_app/immutable/chunks/BdxniJaJ.js","_app/immutable/chunks/BdXdzrua.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
