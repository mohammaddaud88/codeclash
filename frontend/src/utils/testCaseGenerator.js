// utils/testCaseGenerator.js
export const generateLargeTestCases = (problemId, testCaseId) => {
  switch (problemId) {
    case 'two-sum':
      if (testCaseId === 11) {
        // Generate large array for TLE/MLE test
        const nums = Array.from({length: 10000}, () => 
          Math.floor(Math.random() * 2000000000 - 1000000000)
        );
        const target = 0;
        
        // Find a valid solution by ensuring two elements sum to target
        nums[0] = 500000000;
        nums[1] = -500000000;
        
        return {
          nums,
          target,
          expectedOutput: [0, 1]
        };
      }
      break;
      
    case 'maximum-subarray':
      if (testCaseId === 9) {
        // Large random array
        const nums = Array.from({length: 50000}, () => 
          Math.floor(Math.random() * 20000 - 10000)
        );
        return {
          nums,
          expectedOutput: calculateMaxSubarraySum(nums)
        };
      }
      if (testCaseId === 10) {
        // Mostly negative with positive end
        const nums = Array.from({length: 100000}, () => -1).concat([10000]);
        return {
          nums,
          expectedOutput: 10000
        };
      }
      if (testCaseId === 11) {
        // All positive large array
        const nums = Array.from({length: 100000}, () => 1);
        return {
          nums,
          expectedOutput: 100000
        };
      }
      break;
  }
  
  return null;
};

const calculateMaxSubarraySum = (nums) => {
  let maxSum = nums[0];
  let currentSum = nums[0];
  
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  
  return maxSum;
};
