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

    let configs = $state<Record<string, PumpConfig>>(
        Object.fromEntries(
            addresses.map((a) => [a, { address: a, ...defaultConfig }]),
        ),
    );

    function selectAddress(address: string) {
        currentAddress = address;
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
        const result = await pyInvoke("connect_pump", { address: address });
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
        await Promise.all(
            addresses.map(async (address) => {
                for (let i = 0; i < 20; i++) {
                    try {
                        await connect(address);
                        break;
                    } catch (err) {
                        console.error(
                            `Connection failed for ${address} on attempt ${i}`,
                            err,
                        );
                        if (i < 19)
                            await new Promise((r) => setTimeout(r, 500));
                    }
                }
            }),
        );

        const failedConnect = addresses.filter((a) => !connected[a]);
        if (failedConnect.length > 0) {
            message = `Failed to connect to pump(s): ${failedConnect.join(", ")} after 20 attempts.`;
        }

        isPolling = true;
        pollPumps();
    });

    onDestroy(() => {
        isPolling = false;
        if (pollTimer) clearTimeout(pollTimer);
    });
</script>

<div class="tw-root">
    <div class="flex flex-row w-screen h-screen">
        <div class="flex flex-col w-full h-full p-2">
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
