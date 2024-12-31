// 
export type KeyImage = string[][];

export async function readKeyImageData(path: string): Promise<KeyImage[]> {
    const data = await Deno.readTextFile(path);
    const keyImage: KeyImage[] = data.replaceAll("\r","").split('\n\n').map((line) => line.split('\n').map((char) => char.split('')));
    return keyImage;
}

type KeyImageType = "key" | "lock";

export function getKeyImageType(keyImage: KeyImage): KeyImageType {
    return keyImage[0][0] === "." ? "key" : "lock";
}

export type LockShape = number[];

export function getLockShape(keyImage: KeyImage): LockShape {
    const lockShape: LockShape = [0,0,0,0,0]
    let start, increment, end;
    if (getKeyImageType(keyImage) === "key") {
        start = keyImage.length - 1;
        increment = -1;
        end = -1;
    }
    else {
        start = 0;
        increment = 1;
        end = keyImage.length;
    }

    for (let i = 0; i < keyImage[0].length; i++) {
        let height = 0;
        for (let j = start; j != end ; j += increment) {
            if (keyImage[j][i] === ".") {
                lockShape[i] = height - 1; 
                break;
            }
            height++;
        }
    }
    return lockShape;
}

if (import.meta.main) {
    const keyImage = await readKeyImageData(new URL('input.txt', import.meta.url).pathname.slice(1));
    const keys = keyImage.filter((key) => getKeyImageType(key) === "key").map(getLockShape);
    const locks = keyImage.filter((key) => getKeyImageType(key) === "lock").map(getLockShape);

    let fitCount = 0;
    for (const lock of locks) {
        for (const key of keys) {
            let fit = true;
            for (let i = 0; i < 5; i++) {
                if (key[i] + lock[i] > 5) {
                    fit = false;
                    break;
                }
            }
            if (fit) {
                fitCount++;
            }
        }
    }
    console.log(fitCount);
}