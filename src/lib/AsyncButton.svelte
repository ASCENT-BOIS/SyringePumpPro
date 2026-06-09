<script>
    // Expose the props with some sensible defaults
    let { title = "Button", asynconclick } = $props();
    let loading = $state(false);

    async function handleClick() {
        if (loading) return;

        loading = true;
        try {
            // Fixed capitalization to match the prop
            await asynconclick();
        } finally {
            // finally ensures the button unlocks even if the pump throws an error
            loading = false;
        }
    }
</script>

<button
    onclick={handleClick}
    disabled={loading}
    class="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
    class:opacity-50={loading}
    class:cursor-not-allowed={loading}
>
    {title}
</button>
