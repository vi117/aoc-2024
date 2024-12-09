export async function readDiskData(path: string) {
    const text = await Deno.readTextFile(path);
    return text.trim().split("").map(Number);
}

export type Block = {
    id: number;
} | null;

export function translateToBlocks(data: number[]) {
    const blocks: Block[] = [];
    let idGen = 0;
    let empty = false;
    for (const num of data) {
        if (empty) {
            for (let i = 0; i < num; i++) {
                blocks.push(null);
            }
        } else {
            const id = idGen++;
            for (let i = 0; i < num; i++) {
                blocks.push({ id });
            }
        }
        empty = !empty;
    }
    return blocks;
}

export function compressBlocks(blocks: Block[]) {
    let left = 0;
    let right = blocks.length - 1;
    while (left < right) {
        // advance left if it's empty
        if (blocks[left] !== null) {
            left++;
            continue;
        }
        // advance right if it's not empty
        if (blocks[right] === null) {
            right--;
            continue;
        }
        // swap left and right
        blocks[left] = blocks[right];
        blocks[right] = null;
        left++;
    }
    return blocks;
}

export function displayBlocks(blocks: Block[]) {
    const strs = [];
    for (const block of blocks) {
        if (block === null) {
            strs.push(".");
        } else {
            strs.push(block.id);
        }
    }
    console.log(strs.join(""));
}

if (import.meta.main) {
    const data = await readDiskData("input.txt");
    const blocks = translateToBlocks(data);
    // displayBlocks(blocks);
    compressBlocks(blocks);
    // displayBlocks(blocks);

    // multiply index and sum
    const result = blocks.reduce((acc, block, i) => {
       if (block === null) {
        return acc;
        }
        return acc + block.id * i;
    }, 0);
    console.log(result);
}
    
