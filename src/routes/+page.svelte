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

    let name = $state("");
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
    }

    onMount(async () => {
        await Promise.all(
            addresses.map(async (address) => {
                for (let i = 0; i < 20; i++) {
                    try {
                        await connect(address);
                        connected[address] = true;
                        break; // success, stop retrying this address
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

        const failed = addresses.filter((a) => !connected[a]);
        if (failed.length > 0) {
            message = `Failed to connect to pump(s): ${failed.join(", ")} after 20 attempts.`;
        }
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
            ></PumpController>
        </div>
    </div>
</div>
