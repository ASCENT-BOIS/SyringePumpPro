<script lang="ts">
    let { mode = $bindable() }: { mode: "inflow" | "withdraw" } = $props();
</script>

<div class="flex flex-col gap-1.5">
    <span class="text-sm font-semibold text-gray-700">Direction</span>
    <div class="flex bg-gray-200/80 rounded-xl p-1 shadow-inner">
        {#each ["inflow", "withdraw"] as option}
            <button
                class="flex-1 py-1.5 cursor-pointer text-sm font-medium rounded-lg transition-all duration-200
                    {mode === option
                    ? 'bg-white shadow-sm text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'}"
                onclick={() => (mode = option)}
            >
                {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
        {/each}
    </div>
</div>
