<script>
    import { tokens, frequencyTable, sortedFrequencies, settings } from "../stores";
    import { stopwords } from "../assets/stopwords";
    import { input } from "../assets/input";

    let text = input;

    $: {
        tokenize(text);
        countFrequencies($tokens, $settings.topN);
    }

    function tokenize(text) {
        $tokens = text.toLowerCase().split(/[ ,.\n]+/);
        $tokens = $tokens.filter((token) => !stopwords.includes(token));
    }

    function countFrequencies(tokens, take_top_n) {
        $frequencyTable = [];
        tokens.forEach((token) => {
            if ($frequencyTable[token]) $frequencyTable[token] += 1;
            else $frequencyTable[token] = 1;
        });

        $sortedFrequencies = Object.entries($frequencyTable).sort(
            (a, b) => b[1] - a[1],
        );

        $sortedFrequencies = $sortedFrequencies
            .slice(0, take_top_n)
            .map(([word, count]) => ({ word, count }));
    }
</script>

<div>
    <textarea id="input-text-area" rows="20" cols="50" bind:value={text} />
</div>

<style>
    textarea {
        box-sizing: border-box;
        resize: none;
    }
</style>
