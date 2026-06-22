<script lang="ts">
    import { pyInvoke } from "tauri-plugin-pytauri-api";

    let { address = "" } = $props();

    let command = $state("");
    let loading = $state(false);
    let response = $state("");

    async function send() {
        if (loading || !command.trim()) return;

        loading = true;
        response = "";
        try {
            const result = await pyInvoke("execute_command", {
                address: address,
                command: command.trim(),
            });
            response = String(result);
        } catch (e) {
            response = `Error: ${e}`;
        } finally {
            loading = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") send();
    }
</script>

<div class="flex flex-col gap-3">
    <p class="text-sm text-gray-500">
        Enter command for pump <span class="font-semibold text-gray-700">{address}</span>
    </p>

    <div class="flex flex-row gap-2">
        <input
            type="text"
            bind:value={command}
            onkeydown={handleKeydown}
            placeholder="e.g. run, stop, set rate 5"
            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
            onclick={send}
            disabled={loading || !command.trim()}
            class="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg
                   shadow-sm transition-all duration-200 ease-in-out
                   hover:bg-indigo-700 hover:shadow-md
                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                   active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Sending..." : "Send"}
        </button>
    </div>

    {#if response}
        <div
            class="mt-1 p-2 text-sm rounded-lg {response.startsWith('Error')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'}"
        >
            {response}
        </div>
    {/if}
</div>
