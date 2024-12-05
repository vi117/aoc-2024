const txt = await Deno.readTextFile("input.txt");
const lst = txt.split("\r\n").map((x) => x.split(" ")
    .filter((x) => x.length > 0))
    .map(x=> x.map(x => parseInt(x)));

    
function isSafeReport(
    arr: number[]
){
    let isIncreasing = true;
    let isDecreasing = true;
    for(let i = 1; i < arr.length; i++){
        const diff = arr[i] - arr[i - 1];
        if (Math.abs(diff) > 3){
            return false;
        }
        if (diff === 0) {
            // if the difference is 0, the array is neither increasing nor decreasing
            return false;
        }
        if(arr[i] > arr[i - 1]){
            isDecreasing = false;
        } else {
            isIncreasing = false;
        }
    }
    if (isIncreasing || isDecreasing){
        return true;
    }
    // if the array is neither increasing nor decreasing
    return false;
}


function isSafeReportEr(
    array: number[],
    options = {
       errorMargin: 3,
       errorThreshold: 1
    }
){
    if (array.length < 2){
        throw new Error("Array must have at least 2 elements");
    }
    const arr = array.slice();
    const isIncreasingCount = arr.reduce((acc, x, i) => {
        if (i === 0){
            return acc;
        }
        if (x > arr[i - 1]){
            return acc + 1;
        }
        return acc;
    }, 0);
    const isDecreasingCount = arr.reduce((acc, x, i) => {
        if (i === 0){
            return acc;
        }
        if (x < arr[i - 1]){
            return acc + 1;
        }
        return acc;
    }, 0);
    const isIncreasingMostly = isIncreasingCount > isDecreasingCount;
    const errorMargin = options.errorMargin;
    let errorThreshold = options.errorThreshold;

    for (let i = 1; i < arr.length; i++){
        const diff = arr[i] - arr[i - 1];
        const overErrorMargin = Math.abs(diff) > errorMargin;
        const isZero = diff === 0;
        const orderMismatch = isIncreasingMostly ? diff < 0 : diff > 0;
        if (overErrorMargin
        || isZero
        || orderMismatch){
            // return false;
            if (errorThreshold === 0){
                console.log(`Error threshold reached`);
                console.log(arr);
                return false;
            }
            errorThreshold--;
            console.log(arr);
            console.log(`Removing ${arr[i]} at index ${i}`);
            arr.splice(i, 1);
            console.log(arr);
            i--;
        }
    }
    return true;
}
// console.log(isSafeReportEr([4,6,7,9,11,12,12]))

const safeReports = lst.filter(x=> isSafeReportEr(x));
// console.log(safeReports.length);
// const safeReports2 = lst.filter(x=> isSafeReport(x));
// console.log(
//     new Set(safeReports.map(x => x.join(","))).difference(new Set(safeReports2.map(x => x.join(","))))
// );

const safeReports3 = lst.filter(x=> {
    const safe = isSafeReport(x);
    if (!safe){
        // remove one element at a time
        for (let i = 0; i < x.length; i++){
            const copy = x.slice();
            copy.splice(i, 1);
            if (isSafeReport(copy)){
                // console.log(`Removed ${x[i]} at index ${i}`);
                return true;
            }
        }
        return false;
    }
    return safe;
})

console.log(safeReports3.length);
console.log(safeReports.length);
console.log(
    new Set(safeReports3.map(x => x.join(","))).difference(new Set(safeReports.map(x => x.join(","))))
);