<script>
    import PumpSelectTab from "./ PumpSelectTab.svelte";

    let { currentAddress = $bindable(), addresses, selectAddress } = $props();
</script>

<div class="flex flex-row gap-2 bg-gray-100 rounded-t-lg rounded-tl-lg">
    {#each addresses as address}
        <PumpSelectTab {currentAddress} {address} {selectAddress}
        ></PumpSelectTab>
    {/each}
</div>
