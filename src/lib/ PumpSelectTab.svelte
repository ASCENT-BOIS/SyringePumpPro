<script>
    let { currentAddress = $bindable(), address, selectAddress } = $props();
</script>

<button
    onclick={() => {
        selectAddress(address);
    }}
>
    <div
        class={"flex flex-row gap-2 rounded-t-lg rounded-tl-lg py-2 px-7 cursor-pointer" +
            (currentAddress === address
                ? " bg-white"
                : " bg-gray border-t border-r border-l border-gray-300")}
    >
        <p>{address}</p>
    </div>
</button>
