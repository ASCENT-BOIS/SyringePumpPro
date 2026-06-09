<script>
    // Accept volume as a bindable prop, default max to 10mL
    let { volume = $bindable(0), maxVolume = 10 } = $props();

    // Ensure volume never goes below 0 or above maxVolume
    let safeVolume = $derived(Math.max(0, Math.min(volume, maxVolume)));

    // Calculate the percentage of the syringe that is filled
    let fillRatio = $derived(safeVolume / maxVolume);

    // SVG Layout Constants
    const bodyY = 80;
    const bodyHeight = 200;
    const rodLength = 220;

    // Derived Y positions for the liquid and the plunger
    let liquidHeight = $derived(bodyHeight * fillRatio);
    let liquidY = $derived(bodyY + bodyHeight - liquidHeight);

    // Plunger sits right on top of the liquid
    let plungerY = $derived(liquidY - 10); // 10 is the thickness of the rubber seal
</script>

<svg viewBox="0 -80 100 400" class="w-full h-full max-w-xs drop-shadow-sm">
    <g
        class="transition-all duration-300 ease-in-out"
        style="transform: translateY({plungerY - bodyY}px);"
    >
        <rect
            x="46"
            y={bodyY - rodLength}
            width="8"
            height={rodLength}
            fill="#e2e8f0"
        />
        <rect
            x="30"
            y={bodyY - rodLength - 6}
            width="40"
            height="6"
            rx="3"
            fill="#cbd5e1"
        />
        <rect x="26" y={bodyY} width="48" height="10" rx="2" fill="#334155" />
    </g>

    <rect
        x="26"
        y={liquidY}
        width="48"
        height={liquidHeight}
        fill="#6366f1"
        class="transition-all duration-300 ease-in-out opacity-80"
    />

    <rect x="12" y="80" width="76" height="6" rx="3" fill="#cbd5e1" />

    <rect
        x="25"
        y="80"
        width="50"
        height="200"
        rx="2"
        fill="none"
        stroke="#94a3b8"
        stroke-width="3"
    />

    <polygon points="35,280 65,280 55,295 45,295" fill="#cbd5e1" />

    <rect x="48" y="295" width="4" height="40" rx="1" fill="#94a3b8" />

    {#each Array(11) as _, i}
        {@const yPos = bodyY + bodyHeight - i * (bodyHeight / 10)}
        <line
            x1="25"
            x2="35"
            y1={yPos}
            y2={yPos}
            stroke="#64748b"
            stroke-width="2"
        />

        {#if i % 2 === 0 && i !== 0}
            <text
                x="18"
                y={yPos + 3}
                font-size="10"
                fill="#64748b"
                text-anchor="end"
                class="font-sans font-semibold"
            >
                {(maxVolume / 10) * i}
            </text>
        {/if}
    {/each}
</svg>
