<script lang="ts">
    let { value = $bindable(), options }: { value: string; options: string[] } =
        $props();
</script>

<select
    bind:value
    class="w-28 px-2 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
>
    {#each options as option}
        <option value={option}>{option}</option>
    {/each}
</select>
