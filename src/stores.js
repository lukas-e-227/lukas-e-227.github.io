import { writable } from 'svelte/store';

export const tokens = writable([]);


export const frequencyTable = writable([]);

/**
 * Array of {word: string, count: number}
 */
export const sortedFrequencies = writable([]);

export const boundingBoxes = writable([]);

export const twoLevelBBs = writable([]);

export const wordScales  = writable([]);

export const settings = writable({
    topN: 20,
    initialPlacementRadius: 0.1,
    areaAdjustmentValue: 20000,
    angleStep: 20,
    constraintVertices: 4,
    svg : {
        font: "serif",
        fontSize: 16,
        width: 500,
        height: 500,
    },
});

export const simSettings = writable({
    mCentral: 1,
    forceDamping: 1,
    velocityDamping: 0.8,
    timeStep: 0.01,
});

export const areaConstraint = writable({
    area: 0,
    radius: 0,
    vertices: [],
});
