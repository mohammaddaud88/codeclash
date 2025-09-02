const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const runCodeInDocker = require('../utils/dockerRunner'); // your docker runner utility

// Read problems from the correct location: Backend/assest/problem.json
const problemsFilePath = path.join(__dirname, '../assest/problems.json');
let problems = [];
try {
  const data = fs.readFileSync(problemsFilePath, "utf-8");
  problems = JSON.parse(data).problems || [];
} catch (err) {
  console.error("Failed to load problems from:", problemsFilePath, err.message);
  problems = [];
}

// GET all problems
exports.getProblems = (req, res) => {
  res.json(problems.map(p => ({ id: p.id, title: p.title })));
};

// GET problem by ID
exports.getProblemById = (req, res) => {
  const problem = problems.find(p => p.id == req.params.id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });
  res.json(problem);
};

// RUN code inside Docker
exports.runCode = async (req, res) => {
  const { code, language, input, testCases } = req.body;

  // If custom input, run once
  if (input) {
    try {
      const result = await runCodeInDocker(code, language, input);
      return res.json({ output: result });
    } catch (err) {
      return res.json({ error: err.message });
    }
  }

  // If testCases array, run for each
  if (Array.isArray(testCases)) {
    const testResults = [];
    for (const tc of testCases) {
      try {
        const output = await runCodeInDocker(code, language, tc.input);
        const passed = output.trim() === (tc.expected || tc.output || '').trim();
        testResults.push({
          input: tc.input,
          expected: tc.expected || tc.output,
          actual: output,
          passed
        });
      } catch (err) {
        testResults.push({
          input: tc.input,
          expected: tc.expected || tc.output,
          actual: err.message,
          passed: false
        });
      }
    }
    return res.json({
      testResults,
      summary: `Passed ${testResults.filter(r => r.passed).length} of ${testResults.length} test cases.`
    });
  }

  // Fallback
  return res.status(400).json({ error: 'No input or test cases provided.' });
};


exports.runSingleTestCase = async (req, res) => {
  const { code, language, testCase } = req.body;

  if (!testCase || typeof testCase.input === 'undefined') {
    return res.status(400).json({ error: 'No test case or input provided.' });
  }

  try {
    const output = await runCodeInDocker(code, language, testCase.input);
    const passed = output.trim() === (testCase.expected || '').trim();
    res.json({
      input: testCase.input,
      expected: testCase.expected,
      actual: output,
      passed,
    });
  } catch (err) {
    res.json({
      input: testCase.input,
      expected: testCase.expected,
      actual: err.message,
      passed: false,
      error: true, // indicate it was an execution error
    });
  }
};