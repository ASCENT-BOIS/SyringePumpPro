<script>
    // Expose the props with some sensible defaults
    let { title = "Button", onclick } = $props();
</script>

<button
    {onclick}
    class="px-5 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-xl
         shadow-sm transition-all duration-200 ease-in-out
         hover:bg-indigo-700 hover:shadow-md
         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
         active:scale-95"
>
    {title}
</button>
