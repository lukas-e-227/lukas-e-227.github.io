<script>
    import { settings, simSettings } from "../stores";
</script>


<div style="display: flex; gap:20px">
    <div style="display: flex; flex-direction: column">
        <div class="input-group">
            <label>
                Number of words visualized:
                <input type="number" bind:value={$settings.topN} min="10" max="100" />
                <input type="range" bind:value={$settings.topN} min="10" max="100" />
            </label>
        </div>

        <div class="input-group">
            <label>
                Initial placement scattering:
                <input
                    type="number"
                    bind:value={$settings.initialPlacementRadius}
                    min="0.1"
                    max="2"
                    step="0.1"
                />
                <input
                    type="range"
                    bind:value={$settings.initialPlacementRadius}
                    min="0.1"
                    max="2"
                    step="0.1"
                />
            </label>
        </div>

        <div class="input-group">
            <label>
                Adjust area of word cloud by:
                <input
                    type="number"
                    bind:value={$settings.areaAdjustmentValue}
                    min="-10000"
                    max="100000"
                />
                <input
                    type="range"
                    bind:value={$settings.areaAdjustmentValue}
                    min="-10000"
                    max="100000"
                />
            </label>
        </div>
    </div>
    <div style="display:flex; flex-direction: column">
        <!-- <div class="input-group">
            <label>
                Central mass:
                <input
                    type="number"
                    bind:value={$simSettings.mCentral}
                    min="1"
                    max="1000"
                />
                <input
                    type="range"
                    bind:value={$simSettings.mCentral}
                    min="1"
                    max="1000"
                />
            </label>
        </div>

        <div class="input-group">
            <label>
                Force Damping
                <input
                    type="number"
                    bind:value={$simSettings.forceDamping}
                    min="1"
                    max="1000"
                />
                <input
                    type="range"
                    bind:value={$simSettings.forceDamping}
                    min="1"
                    max="1000"
                />
            </label>
        </div>
        <div class="input-group">
            <label>
                Timestep
                <input
                    type="number"
                    bind:value={$simSettings.timeStep}
                    min="0"
                    max="1"
                    step="0.01"
                />
                <input
                    type="range"
                    bind:value={$simSettings.timeStep}
                    min="0"
                    max="1"
                    step="0.01"
                />
            </label>
        </div> -->
        <div class="input-group">
            <label>
                Constraining area vertices
                <input
                    type="number"
                    bind:value={$settings.constraintVertices}
                    min="3"
                    max="8"
                    step="1"
                />
                <input
                    type="range"
                    bind:value={$settings.constraintVertices}
                    min="3"
                    max="8"
                    step="1"
                />
            </label>
        </div> 
    </div>
</div>
<style>
    /* Add your styling here */
    .input-group {
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .input-group label {
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
    }

    .input-group input {
        width: 200px; /* You can adjust the width based on your preference */
        margin-top: 4px;
        padding: 8px;
        font-size: 14px;
    }
</style>
