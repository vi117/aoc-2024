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

const safeReports = lst.filter(isSafeReport);
console.log(safeReports);
console.log(lst.length,safeReports.length);