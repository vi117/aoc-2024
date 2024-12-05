export async function readFormat(path: string) {
    const data = await Deno.readTextFile(path);
    // assume LF line endings.
    // TODO: handle CRLF line endings.
    const [orderTxt, pageNumbersTxt] = data.split("\n\n");

    const order = orderTxt.split("\n").map((line) => {
        const [left, right] = line.split("|");
        return {
            left: parseInt(left.trim()),
            right: parseInt(right.trim()),
        };
    });
    const pageNumbers = pageNumbersTxt.split("\n").map((line) => {
        const numbers = line.split(",");
        return numbers.map((num) => parseInt(num.trim()));
    });
    return { order, pageNumbers };
}

// topology sort order
export function makeTopologySortOrder(
    orderMap: Map<number, Set<number>>,
): number[] {
    const visited = new Set<number>();
    const sorted = new Array<number>();
    for (const key of orderMap.keys()) {
        if (!visited.has(key)) {
            visit(key);
        }
    }
    function visit(node: number) {
        if (visited.has(node)) return;
        visited.add(node);
        const set = orderMap.get(node);
        if (set) {
            for (const next of set) {
                visit(next);
            }
        }
        sorted.push(node);
    }
    return sorted;
}

async function main() {
    const path = new URL("input.txt", import.meta.url).pathname;
    const { order, pageNumbers } = await readFormat(path);

    // create order map
    const orderMap = new Map<number, Set<number>>();
    for (const { left, right } of order) {
        const leftSet = orderMap.get(left) ?? new Set<number>();
        leftSet.add(right);
        orderMap.set(left, leftSet);
    }
    // it's not transitive closure...
    //
    // apply transitive closure
    // const topologySortOrder = makeTopologySortOrder(orderMap);
    // const completedSetMap = new Map<number, Set<number>>();
    // for (const num of topologySortOrder) {
    //     // console.log(num, "\n===");
    //     const set = orderMap.get(num) ?? new Set<number>();
    //     const completedSet = completedSetMap.get(num) ?? new Set<number>();
    //     set.forEach((elem) => completedSet.add(elem));
    //     for (const next of set) {
    //         const nextSet = completedSetMap.get(next) ?? new Set<number>();
    //         nextSet.forEach((elem) => completedSet.add(elem));
    //     }
    //     console.log(completedSet);
    //     // console.log("===");
    //     completedSetMap.set(num, completedSet);
    // }

    const completedSetMap = orderMap;

    // check order is valid or not by comparing with pageNumbers
    function checkPageNumberOrder(pageNumbers: number[]): boolean {
        const notAllowed = new Set<number>();
        for (let i = pageNumbers.length - 1; i >= 0; i--) {
            const current = pageNumbers[i];
            if (notAllowed.has(current)) {
                return false;
            }
            notAllowed.add(current);
            const biggerThanCurrent = completedSetMap.get(current);
            biggerThanCurrent?.forEach((elem) => notAllowed.add(elem));
        }
        return true;
    }

    let sum = 0;
    for (const pages of pageNumbers) {
        if (!checkPageNumberOrder(pages)) {
            // console.log("invalid order", pages);
        } else {
            // get middle number
            const middle = pages[pages.length >> 1];
            sum += middle;
        }
    }
    console.log(sum);
}

if (import.meta.main) {
    main();
}
