<script>
    import { draggable } from '@neodrag/svelte'
    import { vec2 } from "../helpers/helpers";
    import {
        sortedFrequencies,
        settings, wordScales,
        boundingBoxes,
        areaConstraint,
        } from "../stores";

    
    $: width = $settings.svg.width;
    $: height = $settings.svg.height;
    let font = $settings.svg.font;
    let fontSize = $settings.svg.fontSize;
    // canvas is used to measure the size of words and create bounding boxes
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // min and max word frequencies for normalization
    $: min = $sortedFrequencies[$sortedFrequencies.length - 1].count;
    $: max = $sortedFrequencies[0].count;

    let estimatedArea;
    
    const maxVertices = 8;
    let angles = Array.from({length: maxVertices}, () => 0);
    
    $: {
        getWordScalingValues($sortedFrequencies);
        getBoundingBoxes($sortedFrequencies);
       
        estimatedArea = sumArea($boundingBoxes) + $settings.areaAdjustmentValue;
        $areaConstraint.area = sumArea($boundingBoxes) + $settings.areaAdjustmentValue;
        getAreaConstraint($settings.constraintVertices, $areaConstraint, angles);
        placeBoundingBoxes($areaConstraint);         
    }

    function getWordScalingValues(sortedFrequencies) {
        $wordScales = [];
        sortedFrequencies.forEach((elem) => {
            // normalize and scale with sqrt to get fitting word size scaling values
            let normalized_freq = (max === min) ? 1 : (elem.count - min) / (max - min);
            let scaled_norm_freq = Math.sqrt(normalized_freq);
            let scale = 1 + 2 * scaled_norm_freq;
            $wordScales.push(scale);
        });
    }
    
    function getBoundingBoxes(sortedFrequencies) {
        $boundingBoxes = [];
        sortedFrequencies.forEach((elem, idx) => {
            let boundingBox = getBoundingBox(elem.word, $wordScales[idx]);
            $boundingBoxes.push(boundingBox);
        });
    }

    /**
     * @param estimatedArea
     * @param numVertices
     */
    function getAreaConstraint(numVertices, areaConstraint, angles) {
        areaConstraint.vertices = [];
        areaConstraint.area += adjustForAreaDiff(numVertices, areaConstraint);
        let radius = Math.sqrt(areaConstraint.area / Math.PI);
        areaConstraint.radius = radius;

        let angle = Math.PI * 1.5;
        let step = 2 * Math.PI / numVertices;
        for (let i = 0; i < numVertices; i++)
        {
            let currentVertexAngle = angles[i] === 0 ? angle : angles[i];
            let x = radius * Math.cos(currentVertexAngle);
            let y = radius * Math.sin(currentVertexAngle);
            areaConstraint.vertices.push(new vec2(x, y));
            angle += step;
            offsets[i] = {x: 0, y: 0};
        }
    }

    function adjustForAreaDiff(numVertices, areaConstraint) {
        let radius = Math.sqrt(areaConstraint.area / Math.PI);
        let polygonArea = 0.5 * radius * radius * Math.sin(2 * Math.PI / numVertices) * numVertices;
        let areaDiff = areaConstraint.area - polygonArea;
        return areaDiff;
    }

    function sumArea(boundingBoxes) {
        let area = 0;
        if (boundingBoxes.length > 0) {
            boundingBoxes.forEach((box) => {
                area += box.width * box.height;
            }); 
        }
        
        return area;
    }

    function placeBoundingBoxes(areaConstraint) {
        /* reset placed values to false in case function is called 
         * without resetting the word frequency table
         */
        $boundingBoxes.forEach((box) => {
            box.placed = false;
        })

        $boundingBoxes.forEach((box) => {
            placeBoundingBox(box, areaConstraint);         
        });

        $boundingBoxes = $boundingBoxes;
    }

    /**
     * gets outer bounding box of a word
     * x and y refer to the bottom left corner (note when converting to svg space)
     */
    function getBoundingBox(word, scale) {
        context.font = `${fontSize * scale}px ${font}`;
        let wordInfo = context.measureText(word);
        let boxWidth = wordInfo.width;
        let boxHeight =
            wordInfo.actualBoundingBoxAscent +
            wordInfo.actualBoundingBoxDescent;
        
        let boundingBox = {
            placed: false,
            x: 0,
            y: 0,
            width: boxWidth,
            height: boxHeight,
            ascend: wordInfo.actualBoundingBoxAscent,
            descend: wordInfo.actualBoundingBoxDescent,
            word,
        };
        return boundingBox;
    }

    function getInitialPlacementHorizontal(areaConstraint, box) {
        const cx = (Math.random() - 0.5) * areaConstraint.radius  * $settings.initialPlacementRadius;
        const cy = (Math.random() - 0.5) * areaConstraint.radius / 2  * $settings.initialPlacementRadius;
        const x = cx - box.width / 2;
        const y = cy - box.height / 2;
        return { x, y};
    }

    function placeBoundingBox(box, areaConstraint) {
        let initialPlacement = getInitialPlacementHorizontal(areaConstraint, box);
        let startingPoint = initialPlacement;
        box.x = initialPlacement.x;
        box.y = initialPlacement.y;
        let i = 0;
        let distance = 0;
        while (boundingBoxIntersects(box)) {  
            do {
                distance = moveBoundingBox(box, i , startingPoint);
                i++;    
            } while ((!insideAreaConstraint(box, areaConstraint)) && distance < areaConstraint.radius );
        }
        box.placed = true;
    } 

    /**
     * checks if @param {*} box intersects with any other box
     * inside the boundingBoxes array
    */
    function boundingBoxIntersects(box) {
        let intersection = false;

        for (let i = 0; i < $boundingBoxes.length; i++)
        {
            let otherBox = $boundingBoxes[i];
            if (box === otherBox) continue; // skip intersection test with self
            if (otherBox.placed) {
                let xOverlap = (box.x < otherBox.x + otherBox.width) && (box.x + box.width > otherBox.x);
                let yOverlap = (box.y < otherBox.y + otherBox.height) && (box.y + box.height > otherBox.y);
                intersection = xOverlap && yOverlap;
                if (intersection) break;
            }
            
        }
        return intersection;
    }

    function insideAreaConstraint(box, areaConstraint) {
        let vs = areaConstraint.vertices;
        let boxA = new vec2(box.x, box.y);
        let boxB = new vec2(box.x, box.y + box.height);
        let boxC = new vec2(box.x + box.width, box.y);
        let boxD = new vec2(box.x + box.width, box.y + box.height);

        for (let i = 0; i < vs.length; i++) {
            let a = vs[i];
            let b = vs[(i + 1) % vs.length];
            
            // Check if each point of the box is on the same side of the edge
            let sideA = side(boxA, a, b) > 0;
            let sideB = side(boxB, a, b) > 0;
            let sideC = side(boxC, a, b) > 0;
            let sideD = side(boxD, a, b) > 0;

            if (!(sideA && sideB && sideC && sideD)) return false;
        }

        return true;
    }

    function side(p, a, b) {
        return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    }


    /**
     * moves the bounding box along a spiral around the starting point
     * returns distance to the starting point 
    */
    function moveBoundingBox(box, i, startingPoint) {
        const t = i / $settings.angleStep;
        box.x = startingPoint.x + t * Math.cos(t);
        box.y = startingPoint.y + t * Math.sin(t);

        const center = new vec2(0,0);
        return Math.max(
            distance(box, center),
            distance(new vec2(box.x, box.y + box.height), center),
            distance(new vec2(box.x + box.width, box.y), center),
            distance(new vec2(box.x + box.width, box.y + box.height), center)
        );
    }

    function distance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }

    let m = {x: 0, y:0};
    function handleMouseMove(event) {
        const svgElement = document.getElementById("viz");
        const svgRect = svgElement.getBoundingClientRect();

        // Calculate the mouse position relative to the SVG element
        m.x = event.clientX - svgRect.left - width / 2;
        m.y = event.clientY - svgRect.top - height / 2;
    }

    let offsets = [];
    for (let i = 0; i < $settings.constraintVertices; i++)
    {
        offsets.push({x: 0, y: 0});
    }

</script>

<div>
    <div style="margin-bottom: 10px;">
    <button on:click={placeBoundingBoxes}>
        Re-place words
    </button>
    <button on:click={() => angles = angles.map((a) => 0)}>
        Reset Angles
    </button>
    </div>
    <div>
        Estimated area of wordcloud + adjustment value: {estimatedArea.toFixed(2)} <br/>
    </div>

    <svg role="img" id="viz" { width } {height} on:mousemove={handleMouseMove}>
        <rect class="rBorder visualization"
            x={0}
            y={0}
            width={width}
            height={height}
        />
        <circle class="rBorder area"
            cx={width / 2}
            cy={height / 2}
            r={$areaConstraint.radius}
        />
        
        {#each $areaConstraint.vertices as v, i}
            <g 
                class="groupTransform"
                transform="translate({width / 2 }, {height / 2})"
            >
                <line   
                    x1={v.x}
                    y1={v.y}
                    x2={$areaConstraint.vertices[(i + 1) % $areaConstraint.vertices.length].x}
                    y2={$areaConstraint.vertices[(i + 1) % $areaConstraint.vertices.length].y}
                    stroke="orange"
                />
            </g>
        {/each}
        
        {#each $boundingBoxes as box, i}
            <g 
                class="groupTransform"
                transform="translate({width / 2 }, {height / 2})"
            >
                <rect class="rBorder outer"
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                />        
                <text class="words"
                    x={box.x}
                    y={box.y - box.descend + box.height}
                    font-size={$settings.svg.fontSize * $wordScales[i]}
                >
                {$sortedFrequencies[i].word}
                </text>
            </g>
        {/each}
        {#each $areaConstraint.vertices as v, i}
            <g 
                class="groupTransform"
                transform="translate({width / 2 }, {height / 2})"
            >
                <g use:draggable={{  
                    // is offset to original position
                    position: offsets[i]
                }}
                on:neodrag={(e) => {
                    const angle = Math.atan2(m.y, m.x);
                    angles[i] = angle;

                    const constrainedX = $areaConstraint.radius * Math.cos(angle);
                    const constrainedY = $areaConstraint.radius * Math.sin(angle);
                    
                    let offsetX = constrainedX - v.x;
                    let offsetY = constrainedY - v.y;

                    offsets[i].x = offsetX;
                    offsets[i].y = offsetY; 
                }}>
                <circle class="draggableVertex"
                    cx={v.x}
                    cy={v.y}
                    r="8"
                />
                </g>
            </g>    
        {/each}
</div>
<style>
    .words {
        fill: red;
        font-family: serif;
        user-select: none;
    }

    .draggableVertex {
        fill:green;
    }

    .rBorder {
        fill: none;
        stroke-width: 1;
    }

    .area {
        stroke:chartreuse;
    }

    .visualization {
        stroke: black;
    }

    .outer {
        stroke: blue;
    }

</style>
