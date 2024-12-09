import { Block, displayBlocks, readDiskData, translateToBlocks } from "./solve_1.ts";

function newCompressBlocks(blocks: Block[]) {
    
    function findEmptySpace(size: number, limit = blocks.length) {
        // find empty spaces
        let start = -1;
        for (let i = 0; i < limit; i++) {
            if (blocks[i] === null) {
                if (start === -1) {
                    start = i;
                }
            } else {
                if (start !== -1) {
                    if (i - start >= size) {
                        return start;
                    }
                    start = -1;
                }
            }
        }
        return -1;
    }

    // compress blocks
    let right = blocks.length - 1;
    while (right > 0) {
        if (blocks[right] === null) {
            right--;
            continue;
        }
        // get the size of the block
        let size = 1;
        let id = blocks[right]!.id;
        for (let i = right - 1; i >= 0; i--) {
            if (blocks[i] === null || blocks[i]!.id !== id) {
                break;
            }
            size++;
        }
        // find empty space
        const start = findEmptySpace(size, right);
        // console.log("Moved block", start, size, id);
        if (start === -1) {
            // no empty space found
            right = right - size;
            continue;
        }
        // move block
        for (let i = 0; i < size; i++) {
            blocks[start + i] = blocks[right - i];
            blocks[right - i] = null;
        }
        right = right - size;
    }
    return blocks;
}

if (import.meta.main) {
    const data = await readDiskData("input.txt");
    const blocks = translateToBlocks(data);
    displayBlocks(blocks);
    newCompressBlocks(blocks);
    displayBlocks(blocks);

    // multiply index and sum
    const result = blocks.reduce((acc, block, i) => {
       if (block === null) {
        return acc;
        }
        return acc + block.id * i;
    }, 0);
    console.log(result);
}