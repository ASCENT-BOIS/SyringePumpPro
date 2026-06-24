import "clsx";
import "@tauri-apps/api/core";
import { pyInvoke } from "tauri-plugin-pytauri-api";
import { e as escape_html, a4 as attr, a5 as attr_class, a6 as bind_props, a7 as ensure_array_like, a8 as clsx } from "../../chunks/index.js";
const defaultConfig = {
  volume: 0,
  volumeUnit: "mL",
  rate: 0,
  rateUnit: "mL/min",
  diameter: 20,
  diameterUnit: "mm",
  mode: "inflow",
  status: "P"
};
function Button($$renderer, $$props) {
  let { title = "Button" } = $$props;
  $$renderer.push(`<button class="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95">${escape_html(title)}</button>`);
}
function AsyncButton($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { title = "Button", asynconclick } = $$props;
    let loading = false;
    $$renderer2.push(`<button${attr("disabled", loading, true)}${attr_class("px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 min-w-25", void 0, { "opacity-50": loading, "cursor-not-allowed": loading })}>${escape_html(title)}</button>`);
  });
}
function LoadingSpinner($$renderer) {
  $$renderer.push(`<span class="loader svelte-bw1ywq"></span>`);
}
function LoadingScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { address, message = void 0 } = $$props;
    $$renderer2.push(`<div class="flex justify-center items-center flex-col w-full h-full gap-2 bg-white rounded-b-2xl rounded-bl-2xl">`);
    LoadingSpinner($$renderer2);
    $$renderer2.push(`<!----> <p class="text-2xl">Pumps are connecting...</p> <p class="text-xl text-red-500">${escape_html(message)}</p></div>`);
    bind_props($$props, { message });
  });
}
function UnitSelect($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = void 0, options } = $$props;
    $$renderer2.select(
      {
        value,
        class: "w-28 px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
      },
      ($$renderer3) => {
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(options);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let option = each_array[$$index];
          $$renderer3.option({ value: option }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(option)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    bind_props($$props, { value });
  });
}
function ModeToggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { mode = void 0 } = $$props;
    $$renderer2.push(`<div class="flex flex-col gap-1.5"><span class="text-sm font-semibold text-gray-700">Direction</span> <div class="flex bg-gray-200/80 rounded-xl p-1 shadow-inner"><!--[-->`);
    const each_array = ensure_array_like(["inflow", "withdraw"]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let option = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`flex-1 py-1.5 cursor-pointer text-sm font-medium rounded-lg transition-all duration-200 ${mode === option ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-700"}`)}>${escape_html(option.charAt(0).toUpperCase() + option.slice(1))}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { mode });
  });
}
function PumpSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { config = void 0, setConfig } = $$props;
    let volume = 0;
    let volumeUnit = "mL";
    let rate = 0;
    let rateUnit = "mL/min";
    let diameter = 20;
    let diameterUnit = "mm";
    let mode = "inflow";
    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
    const fields = [
      {
        id: "volume",
        label: "Target Volume",
        bind: () => volume,
        set: (v) => volume = v,
        step: 0.01,
        units: ["mL", "uL"],
        unitBind: () => volumeUnit,
        unitSet: (u) => volumeUnit = u
      },
      {
        id: "rate",
        label: "Pumping Rate",
        bind: () => rate,
        set: (v) => rate = v,
        step: 0.1,
        units: ["mL/min", "mL/hr", "uL/min", "uL/hr"],
        unitBind: () => rateUnit,
        unitSet: (u) => rateUnit = u
      },
      {
        id: "diameter",
        label: "Diameter",
        bind: () => diameter,
        set: (v) => diameter = v,
        step: 0.01,
        units: ["mm"],
        unitBind: () => diameterUnit,
        unitSet: (u) => diameterUnit = u
      }
    ];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex flex-col gap-5 p-6 bg-gray-100 rounded-lg shadow-sm w-full max-w-sm text-gray-800"><h2 class="text-xl font-bold mb-1">Configuration</h2> `);
      ModeToggle($$renderer3, {
        get mode() {
          return mode;
        },
        set mode($$value) {
          mode = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <!--[-->`);
      const each_array = ensure_array_like(fields);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let field = each_array[$$index];
        $$renderer3.push(`<div class="flex flex-col gap-1.5"><label${attr("for", field.id)} class="text-sm font-semibold text-gray-700">${escape_html(field.label)}</label> <div class="flex gap-2"><input${attr("id", field.id)} type="number"${attr("value", field.bind())} min="0"${attr("step", field.step)}${attr_class(clsx(inputClass))}/> `);
        UnitSelect($$renderer3, { value: field.unitBind(), options: field.units });
        $$renderer3.push(`<!----></div></div>`);
      }
      $$renderer3.push(`<!--]--> <button class="mt-2 w-full px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95">Push Settings to Pump</button></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { config });
  });
}
function Popup($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { open = false, title = "", children } = $$props;
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"><div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900" role="dialog" aria-modal="true"><div class="mb-4 flex items-center justify-between"><h2 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100">${escape_html(title)}</h2> <button class="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close">✕</button></div> `);
      children?.($$renderer2);
      $$renderer2.push(`<!----></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function CommandInput($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { address = "" } = $$props;
    let command = "";
    $$renderer2.push(`<div class="flex flex-col gap-3"><p class="text-sm text-gray-500">Enter command for pump <span class="font-semibold text-gray-700">${escape_html(address)}</span></p> <div class="flex flex-row gap-2"><input type="text"${attr("value", command)} placeholder="e.g. run, stop, set rate 5" class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"/> <button${attr("disabled", !command.trim(), true)} class="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">${escape_html("Send")}</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function PumpController($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      address = void 0,
      connected = void 0,
      message = void 0,
      config = void 0,
      setConfig,
      runAll,
      stopAll
    } = $$props;
    let commandsOpen = false;
    const statusLabels = { P: "paused", R: "running", S: "stopped" };
    async function run() {
      try {
        const result = await pyInvoke("run_pump", { address });
        config.status = result === "I" || result === "W" ? "R" : result;
        console.log(result);
      } catch (e) {
        console.error(e);
      }
    }
    async function stop() {
      try {
        const result = await pyInvoke("stop_pump", { address });
        config.status = result;
        console.log(result);
      } catch (e) {
        console.error(e);
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (connected) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="flex flex-col h-full w-full bg-white shadow-lg rounded-b-lg rounded-bl-lg p-6"><div class="flex flex-row items-start w-full shrink-0"><p class="mb-2 font-bold text-3xl">Pump ${escape_html(address)}</p></div> <hr class="w-full shrink-0 mb-4 border-dotted border-slate-400"/> <div class="flex flex-row items-start gap-4 justify-center w-full"><div class="flex flex-col rounded-lg max-w-60 gap-5"><div class="flex flex-col bg-gray-100 rounded-lg w-full p-6"><h2 class="text-xl font-bold">Control</h2> <h3 class="text-sm mb-1 text-gray-400">Pump ${escape_html(address)}</h3> <div class="flex flex-row m-2 gap-2 justify-center">`);
        AsyncButton($$renderer3, {
          title: config.status == "S" ? "Run" : "Continue",
          asynconclick: run
        });
        $$renderer3.push(`<!----> `);
        AsyncButton($$renderer3, {
          title: config.status == "R" ? "Pause" : "Stop",
          asynconclick: stop
        });
        $$renderer3.push(`<!----></div> <h3 class="text-sm mb-1 text-gray-400">All Pumps</h3> <div class="flex flex-row m-2 gap-2 justify-center">`);
        AsyncButton($$renderer3, {
          title: config.status == "S" ? "Run" : "Continue",
          asynconclick: runAll
        });
        $$renderer3.push(`<!----> `);
        AsyncButton($$renderer3, {
          title: config.status == "R" ? "Pause" : "Stop",
          asynconclick: stopAll
        });
        $$renderer3.push(`<!----></div></div> <div class="flex flex-col bg-gray-100 rounded-lg w-full p-6"><h2 class="text-xl font-bold mb-1">Status</h2> <p class="text-gray-500">Connected: <span class="text-green-500">${escape_html(connected)}</span></p> <p class="text-gray-500">State: <span${attr_class(clsx(config.status === "R" ? "text-green-500" : config.status === "P" ? "text-yellow-500" : "text-red-500"))}>${escape_html(statusLabels[config.status] ?? config.status)}</span></p> <p class="text-gray-500">Volume: ${escape_html(config.volume)}
                        ${escape_html(config.volumeUnit)}</p> <p class="text-gray-500">Rate: ${escape_html(config.rate)}
                        ${escape_html(config.rateUnit)}</p> <p class="text-gray-500">Mode: <span${attr_class(clsx(config.mode === "inflow" ? "text-purple-500" : "text-blue-500"))}>${escape_html(config.mode)}</span></p></div> `);
        Button($$renderer3, { title: "Enter Commands" });
        $$renderer3.push(`<!----></div> <div class="flex flex-row items-center justify-center gap-12"><div class="w-full max-h-full">`);
        PumpSettings($$renderer3, {
          setConfig,
          get config() {
            return config;
          },
          set config($$value) {
            config = $$value;
            $$settled = false;
          }
        });
        $$renderer3.push(`<!----></div></div></div> `);
        Popup($$renderer3, {
          open: commandsOpen,
          title: "Enter Command",
          children: ($$renderer4) => {
            CommandInput($$renderer4, { address });
          }
        });
        $$renderer3.push(`<!----></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        LoadingScreen($$renderer3, {
          address,
          get message() {
            return message;
          },
          set message($$value) {
            message = $$value;
            $$settled = false;
          }
        });
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, { address, connected, message, config });
  });
}
function PumpSelectTab($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentAddress = void 0, address, selectAddress } = $$props;
    $$renderer2.push(`<button><div${attr_class("flex flex-row gap-2 rounded-t-lg rounded-tl-lg py-2 px-7 cursor-pointer" + (currentAddress === address ? " bg-white" : " bg-gray border-t border-r border-l border-gray-300"))}><p>${escape_html(address)}</p></div></button>`);
    bind_props($$props, { currentAddress });
  });
}
function PumpSelect($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentAddress = void 0, addresses, selectAddress } = $$props;
    $$renderer2.push(`<div class="flex flex-row gap-2 bg-gray-100 rounded-t-lg rounded-tl-lg"><!--[-->`);
    const each_array = ensure_array_like(addresses);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let address = each_array[$$index];
      PumpSelectTab($$renderer2, { currentAddress, address, selectAddress });
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { currentAddress });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentAddress = "00";
    let addresses = ["00", "01"];
    let message = "";
    let connected = { "00": false, "01": false };
    let configs = Object.fromEntries(addresses.map((a) => [a, { address: a, ...defaultConfig }]));
    function selectAddress(address) {
      currentAddress = address;
    }
    async function setConfig(address, config) {
      console.log("Setting Config: ", config);
      const rate_result = await pyInvoke("set_rate", { address, rate: config.rate, units: config.rateUnit });
      console.log("Rate Result: ", rate_result);
      const volume_result = await pyInvoke("set_volume", { address, volume: config.volume, units: config.volumeUnit });
      console.log("Volume Result: ", volume_result);
      const diameter_result = await pyInvoke("set_diameter", { address, diameter: config.diameter });
      console.log("Diameter Result: ", diameter_result);
      const mode_result = await pyInvoke("set_mode", { address, mode: config.mode });
      console.log("Mode Result: ", mode_result);
    }
    async function runAll() {
      console.log("Running All");
      for (let address of addresses) {
        try {
          const result = await pyInvoke("run_pump", { address });
          configs[address].status = result === "I" || result === "W" ? "R" : result;
          console.log(result);
        } catch (e) {
          console.error(e);
        }
      }
    }
    async function stopAll() {
      console.log("Stopping All");
      for (let address of addresses) {
        try {
          const result = await pyInvoke("stop_pump", { address });
          configs[address].status = result;
          console.log(result);
        } catch (e) {
          console.error(e);
        }
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="tw-root"><div class="flex flex-row w-screen h-screen"><div class="flex flex-col w-full h-full p-2">`);
      PumpSelect($$renderer3, { currentAddress, addresses, selectAddress });
      $$renderer3.push(`<!----> `);
      PumpController($$renderer3, {
        message,
        connected: addresses.every((a) => connected[a]),
        setConfig,
        runAll,
        stopAll,
        get address() {
          return currentAddress;
        },
        set address($$value) {
          currentAddress = $$value;
          $$settled = false;
        },
        get config() {
          return configs[currentAddress];
        },
        set config($$value) {
          configs[currentAddress] = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
