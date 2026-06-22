<script>
    import "./app.css";
    let { children } = $props();
</script>

<div>
    {@render children()}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        background-color: lightgrey;
    }
</style>
