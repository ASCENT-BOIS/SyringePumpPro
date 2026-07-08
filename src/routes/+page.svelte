<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { pyInvoke } from "tauri-plugin-pytauri-api";
    import { onMount, onDestroy } from "svelte";

    import type { PumpConfig } from "$lib/types";
    import { defaultConfig } from "$lib/types";
    import PumpController from "$lib/PumpController.svelte";
    import SelectPump from "$lib/PumpSelect.svelte";

    let isPolling = false;
    let pollTimer: ReturnType<typeof setTimeout>;

    let currentAddress = $state("00");
    let addresses = $state<string[]>(["00", "01"]);

    let message = $state("");
    let connected: Record<string, boolean> = $state({
        "00": false,
        "01": false,
    });

    type SerialPort = { device: string; description: string };
    let ports = $state<SerialPort[]>([]);
    let selectedPort = $state("");

    let configs = $state<Record<string, PumpConfig>>(
        Object.fromEntries(
            addresses.map((a) => [a, { address: a, ...defaultConfig }]),
        ),
    );

    function selectAddress(address: string) {
        currentAddress = address;
    }

    async function loadPorts() {
        try {
            const res = await pyInvoke("list_serial_ports", {});
            ports = JSON.parse(String(res)) as SerialPort[];
            // Default to the first available port if none is selected yet, or
            // if the previously selected port has disappeared.
            if (
                ports.length > 0 &&
                !ports.some((p) => p.device === selectedPort)
            ) {
                selectedPort = ports[0].device;
            }
        } catch (e) {
            console.error("Failed to list serial ports:", e);
        }
    }

    async function reconnectAll() {
        if (!selectedPort) {
            message = "No serial port selected. Plug in a pump and refresh.";
            return;
        }

        message = "";
        connected = Object.fromEntries(addresses.map((a) => [a, false]));

        for (const address of addresses) {
            for (let i = 0; i < 20; i++) {
                try {
                    await connect(address);
                    break;
                } catch (err) {
                    console.error(
                        `Connection failed for ${address} on attempt ${i}`,
                        err,
                    );
                    if (i < 19) await new Promise((r) => setTimeout(r, 500));
                }
            }
        }

        const failedConnect = addresses.filter((a) => !connected[a]);
        message =
            failedConnect.length > 0
                ? `Failed to connect to pump(s): ${failedConnect.join(", ")} after 20 attempts.`
                : "";

        if (!isPolling) {
            isPolling = true;
            pollPumps();
        }
    }

    async function pollPumps() {
        if (!isPolling) return; // Allows us to stop the loop cleanly

        for (let address of addresses) {
            if (!connected[address]) continue;

            try {
                const response = await pyInvoke("get_dispensed", {
                    address: address,
                });
                console.log(response);

                const parts = String(response).split(" ");
                const statusChar = parts[0];
                configs[address].status =
                    statusChar === "I" || statusChar === "W" ? "R"
                    : statusChar === "P" ? "P"
                    : "S";

                configs[address].inflow = parseFloat(parts[1]) || 0;
                configs[address].withdraw = parseFloat(parts[2]) || 0;
                configs[address].dispenseUnit = parts[3] || "mL";
            } catch (e) {
                console.error(`Error polling pump ${address}:`, e);
            }
        }

        if (isPolling) {
            pollTimer = setTimeout(pollPumps, 1000);
        }
    }

    async function connect(address: string) {
        const result = await pyInvoke("connect_pump", {
            address: address,
            port: selectedPort,
        });
        console.log(result);

        connected = { ...connected, [address]: true };
        configs[address].status = result == "I" || result == "W" ? "R" : "S";
        await readConfig(address);
    }

    async function readConfig(address: string) {
        // Read current pump settings and update the UI config
        const [rateStr, volumeStr, diameterStr, modeStr] = await Promise.all([
            pyInvoke("get_rate", { address }),
            pyInvoke("get_volume", { address }),
            pyInvoke("get_diameter", { address }),
            pyInvoke("get_direction", { address }),
        ]);

        const rateParts = String(rateStr).split(" ");
        const volumeParts = String(volumeStr).split(" ");

        configs = {
            ...configs,
            [address]: {
                ...configs[address],
                rate: parseFloat(rateParts[0]) || configs[address].rate,
                rateUnit:
                    rateParts.slice(1).join(" ") || configs[address].rateUnit,
                volume: parseFloat(volumeParts[0]) || configs[address].volume,
                volumeUnit:
                    volumeParts.slice(1).join(" ") ||
                    configs[address].volumeUnit,
                diameter:
                    parseFloat(String(diameterStr)) ||
                    configs[address].diameter,
                mode: String(modeStr) === "withdraw" ? "withdraw" : "inflow",
            },
        };
    }

    async function setConfig(address: string, config: PumpConfig) {
        console.log("Setting Config: ", config);
        // Set rate
        const rate_result = await pyInvoke("set_rate", {
            address: address,
            rate: config.rate,
            units: config.rateUnit,
        });
        console.log("Rate Result: ", rate_result);

        // Set Volume
        const volume_result = await pyInvoke("set_volume", {
            address: address,
            volume: config.volume,
            units: config.volumeUnit,
        });
        console.log("Volume Result: ", volume_result);

        // Set Diameter
        const diameter_result = await pyInvoke("set_diameter", {
            address: address,
            diameter: config.diameter,
        });
        console.log("Diameter Result: ", diameter_result);

        // Set Mode
        const mode_result = await pyInvoke("set_mode", {
            address: address,
            mode: config.mode,
        });
        console.log("Mode Result: ", mode_result);
    }

    async function runAll() {
        console.log("Running All");
        for (let address of addresses) {
            try {
                const result = await pyInvoke("run_pump", { address: address });
                configs[address].status =
                    result === "I" || result === "W" ? "R" : result;
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
                const result = await pyInvoke("stop_pump", {
                    address: address,
                });
                configs[address].status = result == "S" ? "S" : "P";
                console.log(result);
            } catch (e) {
                console.error(e);
            }
        }
    }

    onMount(async () => {
        await loadPorts();

        if (!selectedPort) {
            message =
                "No serial ports found. Plug in a pump, then click Refresh.";
            return;
        }

        await reconnectAll();
    });

    onDestroy(() => {
        isPolling = false;
        if (pollTimer) clearTimeout(pollTimer);
    });
</script>

<div class="tw-root">
    <div class="flex flex-row w-screen h-screen">
        <div class="flex flex-col w-full h-full p-2">
            <div
                class="flex flex-row items-center gap-2 mb-2 p-2 bg-gray-100 rounded-lg"
            >
                <span class="text-sm font-medium text-gray-600">Serial port</span>
                <select
                    bind:value={selectedPort}
                    class="flex-1 px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                >
                    {#if ports.length === 0}
                        <option value="" disabled>No ports found</option>
                    {/if}
                    {#each ports as port}
                        <option value={port.device}
                            >{port.device} — {port.description}</option
                        >
                    {/each}
                </select>
                <button
                    onclick={loadPorts}
                    class="px-3 py-2 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded-lg shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                >
                    Refresh
                </button>
                <button
                    onclick={reconnectAll}
                    disabled={!selectedPort}
                    class="px-3 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Connect
                </button>
            </div>
            <SelectPump {currentAddress} {addresses} {selectAddress}
            ></SelectPump>
            <PumpController
                bind:address={currentAddress}
                {message}
                connected={connected[currentAddress]}
                bind:config={configs[currentAddress]}
                {setConfig}
                {runAll}
                {stopAll}
            ></PumpController>
        </div>
    </div>
</div>
