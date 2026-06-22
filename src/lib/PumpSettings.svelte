<script lang="ts">
    import UnitSelect from "./UnitSelect.svelte";
    import ModeToggle from "./ModeToggle.svelte";
    import { onMount } from "svelte";

    let { config = $bindable(), setConfig } = $props();

    let volume = $state(0);
    let volumeUnit = $state("mL");
    let rate = $state(0);
    let rateUnit = $state("mL/min");
    let diameter = $state(20.0);
    let diameterUnit = $state("mm");
    let mode = $state<"inflow" | "withdraw">("inflow");

    $effect(() => {
        volume = config.volume;
        volumeUnit = config.volumeUnit;
        rate = config.rate;
        rateUnit = config.rateUnit;
        diameter = config.diameter;
        mode = config.mode;
    });

    async function onSet() {
        config = {
            address: config.address,
            volume,
            volumeUnit,
            rate,
            rateUnit,
            diameter,
            mode,
        };
        await setConfig(config.address, config);
    }

    const inputClass =
        "w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

    const fields = [
        {
            id: "volume",
            label: "Target Volume",
            bind: () => volume,
            set: (v) => (volume = v),
            step: 0.01,
            units: ["mL", "uL"],
            unitBind: () => volumeUnit,
            unitSet: (u) => (volumeUnit = u),
        },
        {
            id: "rate",
            label: "Pumping Rate",
            bind: () => rate,
            set: (v) => (rate = v),
            step: 0.1,
            units: ["mL/min", "mL/hr", "uL/min", "uL/hr"],
            unitBind: () => rateUnit,
            unitSet: (u) => (rateUnit = u),
        },
        {
            id: "diameter",
            label: "Diameter",
            bind: () => diameter,
            set: (v) => (diameter = v),
            step: 0.01,
            units: ["mm"],
            unitBind: () => diameterUnit,
            unitSet: (u) => (diameterUnit = u),
        },
    ];
</script>

<div
    class="flex flex-col gap-5 p-6 bg-gray-100 rounded-lg shadow-sm w-full max-w-sm text-gray-800"
>
    <h2 class="text-xl font-bold mb-1">Configuration</h2>

    <ModeToggle bind:mode />

    {#each fields as field}
        <div class="flex flex-col gap-1.5">
            <label for={field.id} class="text-sm font-semibold text-gray-700"
                >{field.label}</label
            >
            <div class="flex gap-2">
                <input
                    id={field.id}
                    type="number"
                    value={field.bind()}
                    oninput={(e) => field.set(+e.currentTarget.value)}
                    min="0"
                    step={field.step}
                    class={inputClass}
                />
                <UnitSelect
                    value={field.unitBind()}
                    options={field.units}
                    onchange={(u) => field.unitSet(u)}
                />
            </div>
        </div>
    {/each}

    <button
        onclick={() => {
            onSet();
        }}
        class="mt-2 w-full px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
    >
        Push Settings to Pump
    </button>
</div>
