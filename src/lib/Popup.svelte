<script>
    let { open = false, title = "", onClose, children } = $props();

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose?.();
    }

    function handleKeydown(e) {
        if (e.key === "Escape") onClose?.();
    }
</script>

<svelte:window on:keydown={open ? handleKeydown : null} />

{#if open}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        onclick={handleBackdropClick}
    >
        <div
            class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900"
            role="dialog"
            aria-modal="true"
        >
            <div class="mb-4 flex items-center justify-between">
                <h2
                    class="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
                >
                    {title}
                </h2>
                <button
                    class="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onclick={onClose}
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>

            {@render children?.()}
        </div>
    </div>
{/if}
