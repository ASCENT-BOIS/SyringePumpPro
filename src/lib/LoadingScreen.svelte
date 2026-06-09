<script>
    import LoadingSpinner from "./LoadingSpinner.svelte";

    let { address, message = $bindable() } = $props();
</script>

<div
    class="flex justify-center items-center flex-col w-full h-full gap-2 bg-white rounded-b-2xl rounded-bl-2xl"
>
    <LoadingSpinner></LoadingSpinner>
    <p class="text-2xl">Pumps are connecting...</p>
    <p class="text-xl text-red-500">{message}</p>
</div>
