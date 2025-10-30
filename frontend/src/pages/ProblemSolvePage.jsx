import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Play,
  Send,
  RotateCcw,
  Settings,
  ChevronLeft,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import problems from "../assets/problems.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Editor from "@monaco-editor/react";

const AI_GUIDE_STORAGE_KEY = "aiGuideCache";

const ProblemSolvePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [passedTestCases, setPassedTestCases] = useState(0);
  const { id } = useParams();
  const containerRef = useRef(null);
  let editorRef = useRef(null);
  let totalTestCases = 0;
  const username = localStorage.getItem('email')

  // results: array of { index, input, expected, output, pass }
  const [results, setResults] = useState([]);
  const [showFailed, setShowFailed] = useState(false);

  // console.log(problems)
  const [currentProblemId, setCurrentProblemId] = useState(id);
  const currentProblem = problems[currentProblemId - 1];

  // console.log(currentProblem);

  // Set default code based on problem and language
  React.useEffect(() => {
    const getDefaultCode = () => {
      const problemName = currentProblem.name.replace(/-/g, "_");

      switch (language) {
        case "python":
          return `# Write your solution here`;
        case "java":
          return `public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}`;
        case "cpp":
          return `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`;
        default:
          return "";
      }
    };
    setCode(getDefaultCode());
  }, [currentProblem, language]);

  const handleSubmit = async () => {
    try {
      if (!localStorage.getItem("email")) {
        toast.warning("Please Login to Continue");
        navigate("/login");
        return;
      }
      console.log(passedTestCases)
      if (passedTestCases !== currentProblem.testCases.length) {
        toast.warning("Please run all test cases first!", { autoClose: 2000 });
        return;
      }
      const res = await fetch("http://localhost:8000/code/submit/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({userId:username, code, language, problemId:currentProblemId }),
      });
      const data = await res.json();
      toast.success("Code submitted successfully!");
      console.log(data);
    } catch (e) {
      toast.error("Error in submitting code");
      console.log(e);
    }
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newWidth >= 30 && newWidth <= 70) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing]);

  const handleRunCode = async () => {
    setLoading(true);
    setOutput("Running all test cases...\n\n");
    setResults([]);
    setShowFailed(false);
    try {
      if (!localStorage.getItem("email")) {
        toast.warning("Please Login to Continue",{autoClose:2000});
        navigate("/login");
        return;
      }
      const tests = currentProblem.testCases || [];
      if (!tests.length) {
        setOutput("No test cases defined for this problem.");
        toast.info("No test cases to run.", { autoClose: 2500 });
        setLoading(false);
        return;
      }

      const localResults = [];
      for (let i = 0; i < tests.length; i++) {
        const tc = tests[i];
        // call the run API
        try {
          let data;
          const res = await fetch("http://localhost:8000/code/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, language, input: tc.input }),
          });

          // Try to parse successful response as JSON
          if (res.ok) {
            data = await res.json();
          } else {
            // For non-2xx responses, read text and try to parse JSON to extract stderr/error
            const text = await res.text();
            try {
              const json = JSON.parse(text);
              // Prefer stderr (traceback) if present, then error field, otherwise fallback to full text
              const extracted =
                (json.stderr && String(json.stderr).trim()) ||
                (json.error && String(json.error).trim()) ||
                text;
              data = { output: extracted, raw: json };
            } catch (parseErr) {
              // Not JSON - show raw text
              data = { output: text };
            }
          }

          // Prefer stderr (traceback) first, then output/result/error fields
          const out =
            (data && data.stderr && String(data.stderr).trim()) ||
            (data && (data.output ?? data.result ?? data.error)) ||
            (typeof data === "string" ? data : JSON.stringify(data));
          const normalize = (s) => String(s).trim().replace(/\r\n/g, "\n");
          const pass =
            tc.expected !== undefined && tc.expected !== ""
              ? normalize(out) === normalize(tc.expected)
              : null;

          const resultObj = {
            index: i + 1,
            input: tc.input,
            expected: tc.expected,
            output: out,
            pass,
          };
          localResults.push(resultObj);
          // update results state progressively so UI can reflect pass/fail
          setResults((prev) => [...prev, resultObj]);

          const status = pass === null ? "N/A" : pass ? "PASS" : "FAIL";
          // append test result to output progressively
          setOutput(
            (prev) =>
              prev +
              `Test ${i + 1} [${status}]\nInput:\n${tc.input}\nExpected:\n${
                tc.expected ?? "—"
              }\nOutput:\n${out}\n\n-----------------\n\n`
          );
        } catch (e) {
          const data = { output: `Network error: ${e.message}` };
          const out = data.output;
          const resultObj = {
            index: i + 1,
            input: tc.input,
            expected: tc.expected,
            output: out,
            pass: false,
          };
          localResults.push(resultObj);
          setResults((prev) => [...prev, resultObj]);
          setOutput(
            (prev) =>
              prev +
              `Test ${i + 1} [FAIL]\nInput:\n${tc.input}\nExpected:\n${
                tc.expected ?? "—"
              }\nOutput:\n${out}\n\n-----------------\n\n`
          );
        }
      }

      const total = localResults.length;
      const passed = localResults.filter((r) => r.pass === true).length;
      totalTestCases = total;
      setPassedTestCases(passed);

      if (passed === total) {
        toast.success("All test cases passed ✅", { autoClose: 3000 });
      } else if (passed === 0) {
        toast.error("No test cases passed ❌", { autoClose: 3000 });
        // show failed button automatically
        setShowFailed(true);
      } else {
        toast.warn(`${passed}/${total} test cases passed ⚠️`, {
          autoClose: 3500,
        });
        setShowFailed(true);
      }
    } catch (err) {
      setOutput("Error running tests: " + err.message);
      toast.error("Error running tests.", { autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "hard":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const tabs = [
    { id: "description", label: "Description" },
    { id: "ai-learn", label: "AI Learn" },
    { id: "editorial", label: "Editorial" },
    { id: "solutions", label: "Solutions" },
    { id: "submissions", label: "Submissions" },
  ];

  const [aiGuide, setAiGuide] = useState(() => {
    const cache = JSON.parse(
      localStorage.getItem(AI_GUIDE_STORAGE_KEY) || "{}"
    );
    const now = Date.now();
    if (cache[id] && cache[id].expire && cache[id].expire > now) {
      return cache[id].guide;
    }
    return "";
  });
  const [aiGuideLoading, setAiGuideLoading] = useState(false);
  const [aiGuideError, setAiGuideError] = useState("");
  const [aiCode, setAiCode] = useState("");
  const [aiCodeLoading, setAiCodeLoading] = useState(false);
  const [codeLanguageForAI, setCodeLanguageForAI] = useState("python");

  const fetchAiCode = React.useCallback(() => {
    setAiCodeLoading(true);
    setAiCode("");
    fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/gemini/code/${currentProblemId}?lang=${codeLanguageForAI}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.code) {
          setAiCode(data.code);
        } else {
          setAiCode("// Failed to fetch code solution");
        }
      })
      .catch(() => setAiCode("// Network error"))
      .finally(() => setAiCodeLoading(false));
  }, [currentProblemId, codeLanguageForAI]);

  const saveAiGuide = (problemId, guide) => {
    const cache = JSON.parse(
      localStorage.getItem(AI_GUIDE_STORAGE_KEY) || "{}"
    );
    const now = Date.now();
    const expireTime = now + 24 * 60 * 60 * 1000; // 24 hours
    cache[problemId] = { guide, expire: expireTime };
    localStorage.setItem(AI_GUIDE_STORAGE_KEY, JSON.stringify(cache));
  };

  const handleGenerateAiGuide = () => {
    setAiGuideLoading(true);
    setAiGuideError("");
    fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      }/gemini/learn/${currentProblemId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.guide) {
          setAiGuide(data.guide);
          saveAiGuide(currentProblemId, data.guide);
        } else {
          setAiGuideError(data.message || "Failed to fetch AI guide");
        }
      })
      .catch(() => setAiGuideError("Network error"))
      .finally(() => setAiGuideLoading(false));
  };

  // When switching problems, load from cache if available
  React.useEffect(() => {
    const cache = JSON.parse(
      localStorage.getItem(AI_GUIDE_STORAGE_KEY) || "{}"
    );
    setAiGuide(cache[currentProblemId] || "");
    setAiGuideError("");
    setAiGuideLoading(false);
  }, [currentProblemId]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-500 text-sm font-medium">
                  {currentProblem.id}.
                </span>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentProblem.title}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyStyle(
                    currentProblem.difficulty
                  )}`}
                >
                  {currentProblem.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Solved by 2.1M+</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Acceptance: 67.8%</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {currentProblem.description}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Examples
              </h2>
              <div className="space-y-4">
                {currentProblem.example.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Example {index + 1}:
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Input:
                        </div>
                        <div className="bg-gray-800 text-gray-100 px-3 py-2 rounded text-sm font-mono">
                          {example.input}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Output:
                        </div>
                        <div className="bg-gray-800 text-gray-100 px-3 py-2 rounded text-sm font-mono">
                          {example.output}
                        </div>
                      </div>
                      {example.explanation && (
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-2">
                            Explanation:
                          </div>
                          <div className="text-sm text-gray-700">
                            {example.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Input Format
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm text-gray-700">
                    {currentProblem.inputFormat}
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Output Format
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-sm text-gray-700">
                    {currentProblem.outputFormat}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Constraints
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {currentProblem.constraints}
                </pre>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentProblem.category}
                </span>
              </div>
            </div>
          </div>
        );
      case "ai-learn":
        return (
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  AI Step-by-Step Solution Guide
                </h2>
                <p className="text-gray-600">
                  Master this problem with intelligent guidance
                </p>
              </div>

              {/* Show button if no guide, else show guide */}
              {!aiGuide && !aiGuideLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <button
                    onClick={handleGenerateAiGuide}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
                    disabled={aiGuideLoading}
                  >
                    {aiGuideLoading ? "Generating..." : "Generate AI Guide"}
                  </button>
                  {aiGuideError && (
                    <div className="text-red-600 mt-4">{aiGuideError}</div>
                  )}
                </div>
              )}

              {aiGuideLoading && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                  </div>
                  <p className="text-gray-500 mt-6">
                    Generating personalized solution guide...
                  </p>
                </div>
              )}

              {aiGuide && !aiGuideLoading && (
                <>
                  {/* Render your guide as before */}
                  <div className="space-y-6">
                    {aiGuide &&
                      aiGuide.split(/(?=###\s)/).map((section, idx) => {
                        const lines = section.trim().split("\n");
                        const titleMatch =
                          lines[0]?.match(/^###\s+\d+\.\s+(.+)/);
                        const title = titleMatch ? titleMatch[1] : null;
                        const content = title
                          ? lines.slice(1).join("\n").trim()
                          : section.trim();

                        if (!title) {
                          return (
                            <div
                              key={idx}
                              className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
                            >
                              <div className="prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                                  {content}
                                </pre>
                              </div>
                            </div>
                          );
                        }

                        const getIconAndColor = (title) => {
                          if (
                            title.includes("Analysis") ||
                            title.includes("Intuition")
                          ) {
                            return {
                              icon: "🎯",
                              color: "blue",
                              bg: "bg-blue-50",
                              border: "border-blue-500",
                            };
                          }
                          if (title.includes("Hints")) {
                            return {
                              icon: "💡",
                              color: "yellow",
                              bg: "bg-yellow-50",
                              border: "border-yellow-500",
                            };
                          }
                          if (title.includes("Mistakes")) {
                            return {
                              icon: "⚠️",
                              color: "red",
                              bg: "bg-red-50",
                              border: "border-red-500",
                            };
                          }
                          if (title.includes("Visual")) {
                            return {
                              icon: "🎨",
                              color: "purple",
                              bg: "bg-purple-50",
                              border: "border-purple-500",
                            };
                          }
                          if (
                            title.includes("Solution") ||
                            title.includes("Approach")
                          ) {
                            return {
                              icon: "✅",
                              color: "green",
                              bg: "bg-green-50",
                              border: "border-green-500",
                            };
                          }
                          if (title.includes("Code")) {
                            return {
                              icon: "💻",
                              color: "indigo",
                              bg: "bg-indigo-50",
                              border: "border-indigo-500",
                            };
                          }
                          if (title.includes("Complexity")) {
                            return {
                              icon: "⚡",
                              color: "orange",
                              bg: "bg-orange-50",
                              border: "border-orange-500",
                            };
                          }
                          return {
                            icon: "📝",
                            color: "gray",
                            bg: "bg-gray-50",
                            border: "border-gray-500",
                          };
                        };

                        const { icon, bg, border } = getIconAndColor(title);

                        return (
                          <div
                            key={idx}
                            className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${border}`}
                          >
                            <div
                              className={`${bg} px-6 py-4 border-b border-gray-200`}
                            >
                              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="text-2xl">{icon}</span>
                                {title}
                              </h3>
                            </div>
                            <div className="p-6">
                              <div className="prose prose-sm max-w-none">
                                {content.split("```").map((block, blockIdx) => {
                                  if (blockIdx % 2 === 1) {
                                    const [lang, ...codeLines] =
                                      block.split("\n");
                                    const code = codeLines.join("\n").trim();
                                    return (
                                      <div key={blockIdx} className="my-4">
                                        <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center justify-between">
                                          <span className="text-xs font-mono text-gray-400">
                                            {lang || "code"}
                                          </span>
                                          <button
                                            onClick={() => {
                                              navigator.clipboard.writeText(
                                                code
                                              );
                                              toast.info("Code copied!", {
                                                autoClose: 1000,
                                              });
                                            }}
                                            className="text-xs text-gray-400 hover:text-white transition-colors"
                                          >
                                            Copy
                                          </button>
                                        </div>
                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
                                          <code className="text-sm font-mono">
                                            {code}
                                          </code>
                                        </pre>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div
                                      key={blockIdx}
                                      className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                                    >
                                      {block
                                        .split("\n")
                                        .map((line, lineIdx) => {
                                          if (
                                            line.trim().startsWith("*   ") ||
                                            line.trim().startsWith("- ")
                                          ) {
                                            return (
                                              <div
                                                key={lineIdx}
                                                className="flex gap-2 my-2"
                                              >
                                                <span className="text-blue-500 font-bold">
                                                  •
                                                </span>
                                                <span>
                                                  {line.replace(
                                                    /^[\s]*[\*\-]\s+/,
                                                    ""
                                                  )}
                                                </span>
                                              </div>
                                            );
                                          }
                                          if (
                                            line.trim().startsWith("**") &&
                                            line.trim().endsWith("**")
                                          ) {
                                            return (
                                              <div
                                                key={lineIdx}
                                                className="font-bold text-gray-900 mt-4 mb-2"
                                              >
                                                {line.replace(/\*\*/g, "")}
                                              </div>
                                            );
                                          }
                                          return (
                                            line && (
                                              <div
                                                key={lineIdx}
                                                className="my-1"
                                              >
                                                {line}
                                              </div>
                                            )
                                          );
                                        })}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleGenerateAiGuide}
                      className="px-5 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                      disabled={aiGuideLoading}
                    >
                      Generate Again
                    </button>
                  </div>
                </>
              )}

              <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What's Included
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This AI-generated guide includes problem analysis,
                      step-by-step hints, common mistakes to avoid, visual
                      explanations, solution approach, complete Python code, and
                      complexity analysis to help you master this problem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "editorial":
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">Coming Soon</div>
              <div className="text-gray-500 text-sm">
                This section is under development
              </div>
            </div>
          </div>
        );
      case "solutions":
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">Coming Soon</div>
              <div className="text-gray-500 text-sm">
                This section is under development
              </div>
            </div>
          </div>
        );
      case "submissions":
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">Coming Soon</div>
              <div className="text-gray-500 text-sm">
                This section is under development
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 text-lg mb-2">Coming Soon</div>
              <div className="text-gray-500 text-sm">
                This section is under development
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <ToastContainer position="top-right" />
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Problems</span>
          </button>

          {/* Problem Navigator */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() =>
                setCurrentProblemId(Math.max(1, currentProblemId - 1))
              }
              disabled={currentProblemId === 1}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <select
              value={currentProblemId}
              onChange={(e) => setCurrentProblemId(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {problems.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.id}. {problem.title}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setCurrentProblemId(
                  Math.min(problems.length, currentProblemId + 1)
                )
              }
              disabled={currentProblemId === problems.length}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleRunCode}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">
                {loading ? "Running" : "Run"}
              </span>
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">Submit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - make children independently scrollable */}
      <div className="flex-1 flex min-h-0" ref={containerRef}>
        {/* Left Panel */}
        <div
          className="flex flex-col bg-white border-r border-gray-200 overflow-y-auto min-h-0"
          style={{ width: `${leftPanelWidth}%` }}
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content -> left side scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {renderTabContent()}
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-200 hover:bg-gray-300 cursor-col-resize flex-shrink-0 transition-colors"
          onMouseDown={handleMouseDown}
        />

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-white min-h-0">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="python">Python3</option>
                {/* <option value="javascript">JavaScript</option> */}
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Online</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Editor area fills available height; editor and bottom panel scroll independently */}
          <div className="flex-1 relative min-h-0 flex flex-col">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between gap-3 px-3 py-2 bg-gray-900 text-gray-100 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="text-xs font-semibold text-gray-300">
                  Solution
                </div>
                <div className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                  main.
                  {language === "python"
                    ? "py"
                    : language === "javascript"
                    ? "js"
                    : language === "java"
                    ? "java"
                    : language === "cpp"
                    ? "cpp"
                    : "txt"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs bg-gray-800 text-gray-200 border border-gray-700 px-2 py-1 rounded"
                >
                  <option value="python">Python3</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>

                <button
                  onClick={() => {
                    // format document if available
                    if (editorRef?.current) {
                      try {
                        editorRef.current
                          .getAction("editor.action.formatDocument")
                          ?.run();
                      } catch (_) {}
                    }
                  }}
                  className="text-xs bg-gray-800 text-gray-200 px-3 py-1 rounded hover:bg-gray-700"
                >
                  Format
                </button>

                <button
                  onClick={() => {
                    if (navigator.clipboard)
                      navigator.clipboard.writeText(code);
                    toast.info("Copied code to clipboard", { autoClose: 1200 });
                  }}
                  className="text-xs bg-gray-800 text-gray-200 px-3 py-1 rounded hover:bg-gray-700"
                >
                  Copy
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([code], {
                      type: "text/plain;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `solution.${
                      language === "python"
                        ? "py"
                        : language === "javascript"
                        ? "js"
                        : language === "java"
                        ? "java"
                        : "cpp"
                    }`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-xs bg-gray-800 text-gray-200 px-3 py-1 rounded hover:bg-gray-700"
                >
                  Download
                </button>
              </div>
            </div>

            {/* Monaco Editor - fills remaining area and scrolls if content larger than view */}
            <div className="flex-1 min-h-0 overflow-auto">
              <Editor
                height="100%"
                defaultLanguage={language === "cpp" ? "cpp" : language}
                language={language === "cpp" ? "cpp" : language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val ?? "")}
                onMount={(editor, monaco) => {
                  // expose editor for toolbar actions
                  editorRef.current = editor;
                  // enable formatting for some languages if extension available
                }}
                options={{
                  automaticLayout: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: "on",
                  renderWhitespace: "boundary",
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  acceptSuggestionOnEnter: "on",
                  cursorBlinking: "smooth",
                }}
              />
            </div>
          </div>

          {/* Bottom Panel - independent scroll area, constrain max height so editor keeps space */}
          <div className="border-t border-gray-200 bg-gray-50 overflow-y-auto max-h-[40vh]">
            {/* Test Cases */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Test Cases
                </h3>
                <div className="flex items-center gap-2">
                  {currentProblem.testCases.slice(0, 3).map((_, index) => {
                    const res = results[index];
                    const passed = res?.pass === true;
                    const failed = res?.pass === false;
                    const baseClass =
                      selectedTestCase === index
                        ? "ring-2 ring-offset-1"
                        : "hover:scale-[1.02]";
                    const colorClass = passed
                      ? "bg-green-100 text-green-700"
                      : failed
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200";
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedTestCase(index)}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${baseClass} ${colorClass}`}
                      >
                        Case {index + 1}
                      </button>
                    );
                  })}
                  {/* Show failed button */}
                  {results.length > 0 && (
                    <button
                      onClick={() => setShowFailed((s) => !s)}
                      className="ml-2 px-3 py-1 text-xs rounded-md font-medium bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Show Failed (
                      {results.filter((r) => r.pass === false).length})
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Input:
                  </div>
                  <div
                    className={`bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs whitespace-pre-wrap border ${
                      results[selectedTestCase]?.pass === true
                        ? "border-green-500"
                        : results[selectedTestCase]?.pass === false
                        ? "border-red-500"
                        : "border-gray-800"
                    }`}
                  >
                    {currentProblem.testCases[selectedTestCase]?.input}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-600 mb-2">
                    Expected:
                  </div>
                  <div
                    className={`bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs whitespace-pre-wrap border ${
                      results[selectedTestCase]?.pass === true
                        ? "border-green-500"
                        : results[selectedTestCase]?.pass === false
                        ? "border-red-500"
                        : "border-gray-800"
                    }`}
                  >
                    {currentProblem.testCases[selectedTestCase]?.expected}
                  </div>
                </div>
              </div>
            </div>

            {/* Failed Cases Panel */}
            {showFailed && results.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Failed Test Cases</div>
                  <button
                    onClick={() => setShowFailed(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {results.filter((r) => r.pass === false).length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No failed cases.
                    </div>
                  ) : (
                    results
                      .map((r, idx) => ({ r, idx }))
                      .filter(({ r }) => r.pass === false)
                      .map(({ r, idx }) => (
                        <div
                          key={idx}
                          className="p-3 rounded border border-red-200 bg-red-50 text-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-red-700">
                              Test {r.index}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedTestCase(r.index - 1);
                                setShowFailed(false);
                              }}
                              className="text-xs text-red-700 underline"
                            >
                              Open
                            </button>
                          </div>
                          <div className="text-xs text-gray-700 whitespace-pre-wrap mb-1">
                            <strong>Input:</strong> {r.input}
                          </div>
                          <div className="text-xs text-gray-700 mb-1">
                            <strong>Expected:</strong> {r.expected ?? "—"}
                          </div>
                          <div className="text-xs text-gray-700">
                            <strong>Your Output:</strong> {r.output}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Output */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Console</h3>
                {output && (
                  <div className="flex items-center gap-1">
                    {output.includes("✅") ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : output.includes("❌") ? (
                      <XCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm min-h-32 max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap">
                  {output || 'Click "Run Code" to execute your solution...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvePage;
