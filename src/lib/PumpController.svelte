<script lang="ts">
    import Button from "./Button.svelte";
    import Syringe from "./Syringe.svelte";
    import AsyncButton from "./AsyncButton.svelte";
    import { pyInvoke } from "tauri-plugin-pytauri-api";
    import LoadingScreen from "./LoadingScreen.svelte";
    import PumpSettings from "./PumpSettings.svelte";
    import Popup from "./Popup.svelte";
    import CommandInput from "./CommandInput.svelte";

    let {
        address = $bindable(),
        connected = $bindable(),
        message = $bindable(),
        config = $bindable(),
        setConfig,
        runAll,
        stopAll,
    } = $props();

    let currentVolume = $state(0);
    let commandsOpen = $state(false);

    async function run() {
        try {
            const result = await pyInvoke("run_pump", { address: address });
            console.log(result);
        } catch (e) {
            console.error(e);
        }
    }

    async function stop() {
        try {
            const result = await pyInvoke("stop_pump", { address: address });
            console.log(result);
        } catch (e) {
            console.error(e);
        }
    }
</script>

{#if connected}
    <div
        class="flex flex-col h-full w-full bg-white shadow-lg rounded-b-lg rounded-bl-lg p-6"
    >
        <div class="flex flex-row items-start w-full shrink-0">
            <p class="mb-2 font-bold text-3xl">Pump {address}</p>
        </div>
        <hr class="w-full shrink-0 mb-4 border-dotted border-slate-400" />

        <div class="flex flex-row items-start gap-4 justify-center w-full">
            <div class="flex flex-col rounded-lg max-w-60 gap-5">
                <div class="flex flex-col bg-gray-100 rounded-lg w-full p-6">
                    <h2 class="text-xl font-bold">Control</h2>
                    <h3 class="text-sm mb-1 text-gray-400">Pump {address}</h3>
                    <div class="flex flex-row m-2 gap-2 justify-center">
                        <AsyncButton title="Run" asynconclick={run}
                        ></AsyncButton>
                        <AsyncButton title="Stop/Pause" asynconclick={stop}
                        ></AsyncButton>
                    </div>

                    <h3 class="text-sm mb-1 text-gray-400">All Pumps</h3>
                    <div class="flex flex-row m-2 gap-2 justify-center">
                        <AsyncButton title="Run" asynconclick={runAll}
                        ></AsyncButton>
                        <AsyncButton title="Stop/Pause" asynconclick={stopAll}
                        ></AsyncButton>
                    </div>
                </div>

                <div class="flex flex-col bg-gray-100 rounded-lg w-full p-6">
                    <h2 class="text-xl font-bold mb-1">Status</h2>
                    <p class="text-gray-500">Connected: {connected}</p>
                    <p class="text-gray-500">State: Paused</p>
                    <p class="text-gray-500">
                        Volume: {config.volume}
                        {config.volumeUnit}
                    </p>
                    <p class="text-gray-500">
                        Rate: {config.rate}
                        {config.rateUnit}
                    </p>
                    <p class="text-gray-500">Volume Dispensed: {connected}</p>
                </div>

                <Button
                    title="Enter Commands"
                    onclick={() => (commandsOpen = true)}
                />
            </div>

            <div class="flex flex-row items-center justify-center gap-12">
                <div class="w-full max-h-full">
                    <PumpSettings bind:config {setConfig} />
                </div>
            </div>
        </div>

        <!-- The Popup to enter commands to the machine -->
        <Popup
            open={commandsOpen}
            title="Enter Command"
            onClose={() => (commandsOpen = false)}
        >
            <CommandInput {address} />
        </Popup>
    </div>
{:else}
    <LoadingScreen {address} bind:message></LoadingScreen>
{/if}
