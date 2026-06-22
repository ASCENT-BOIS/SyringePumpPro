<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import { pyInvoke } from "tauri-plugin-pytauri-api";
    import { onMount } from "svelte";

    import type { PumpConfig } from "$lib/types";
    import { defaultConfig } from "$lib/types";
    import PumpController from "$lib/PumpController.svelte";
    import SelectPump from "$lib/PumpSelect.svelte";

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

    async function connect(address: string) {
        const result = await pyInvoke("connect_pump", { address: address });
        console.log(result);

        const config_result = await setConfig(address, configs[address]);
        console.log(config_result);
    }

    async function setConfig(address: string, config: PumpConfig) {
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
                console.log(result);
            } catch (e) {
                console.error(e);
            }
        }
    }

    onMount(async () => {
        // Phase 1: Connect all pumps
        await Promise.all(
            addresses.map(async (address) => {
                for (let i = 0; i < 20; i++) {
                    try {
                        await pyInvoke("connect_pump", { address });
                        connected = { ...connected, [address]: true };
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
            return;
        }

        // Phase 2: Apply config to all connected pumps
        await Promise.all(
            addresses.map(async (address) => {
                try {
                    let response = await setConfig(address, configs[address]);
                    console.log("SETUP: ", response);
                } catch (err) {
                    console.error(`Config failed for ${address}:`, err);
                    message = `Failed to apply config to pump(s): ${address}.`;
                }
            }),
        );
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
