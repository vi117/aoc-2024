import { readFormat } from "./solve_1.ts";

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
    const completedSetMap = orderMap;
    
    // check order is valid or not by comparing with pageNumbers
    function checkPageNumberOrder(pageNumbers: number[]): boolean {
        const notAllowed = new Set<number>();
        for (let i = pageNumbers.length - 1; i >= 0; i--) {
            const current = pageNumbers[i];
            if (notAllowed.has(current)) {
                // console.log("not allowed", current, notAllowed  );
                return false;
            }
            notAllowed.add(current);
            const biggerThanCurrent = completedSetMap.get(current);
            biggerThanCurrent?.forEach((elem) => notAllowed.add(elem));
        }
        return true;
    }

    function findErrorIndex(n: number, pages: number[]) {
        return pages.findIndex(page => {
            const biggerThanCurrent = completedSetMap.get(page);
            if (biggerThanCurrent) {
                return biggerThanCurrent.has(n);
            }
            return false;
        })
    }
    
    function correctPageNumberOrder(pageNumbers: number[]): number[] {
        const result = [...pageNumbers];
        const notAllowed = new Set<number>();
        for (let i = result.length - 1; i >= 0; i--) {
            const current = result[i];
            if (notAllowed.has(current)) {
                const p = result.slice(i + 1);
                const errorIndex = findErrorIndex(current, p);
                if (errorIndex === undefined) {
                    // could not happen
                    throw new Error("cannot correct the order");
                }
                const ei = errorIndex + i + 1;
                result[i] = result[ei];
                result[ei] = current;

                return correctPageNumberOrder(result);
            }
            notAllowed.add(current);
            const biggerThanCurrent = completedSetMap.get(current);
            biggerThanCurrent?.forEach((elem) => notAllowed.add(elem));
        }
        return result;
    }

    let sum = 0;
    for (const pages of pageNumbers) {
        if (!checkPageNumberOrder(pages)) {
            // correct the order
            const corrected = correctPageNumberOrder(pages);
            if (!checkPageNumberOrder(corrected)) {
                console.log("cannot correct the order", pages);
                console.log("corrected", corrected);
                throw new Error("cannot correct the order");
            }
            const middle = corrected[corrected.length >> 1];
            sum += middle;
        }
    }
    console.log(sum);
}

if (import.meta.main) {
    main();
}
