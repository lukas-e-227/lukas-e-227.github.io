<script>
    import WordFrequency from "./components/WordFrequency.svelte";
    import Settings from "./components/Settings.svelte";
    import BasicWordle from "./components/BasicWordle.svelte";

</script>

<main>

    <div style="display: flex;  gap: 80px">
        <div style="display: flex; flex-direction: column;">
            <div>
                <WordFrequency />
            </div>
            <div>
                <Settings />
            </div>
        </div>
        <div style="display: flex; flex-direction:column">
            <BasicWordle />
        </div>
    </div>

</main>

<style>


</style>
