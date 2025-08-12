import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, RotateCcw, Settings, Maximize2, Minimize2,
  Clock, Users, Heart, CheckCircle, Building, Tag, Copy,
  ChevronDown, ChevronRight, Lightbulb, Eye, EyeOff, Share2,
  Download, Bookmark, BookmarkCheck, Send, Terminal, Zap, X
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';

// Import your problems data
import problemsData from '../assets/problems.json';
import { generateLargeTestCases } from '../utils/testCaseGenerator';

const ProblemSolvePage = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [showTestCases, setShowTestCases] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [fontSize, setFontSize] = useState(14);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [codeHistory, setCodeHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const editorRef = useRef(null);

  const languages = [
    { 
      id: 'python', 
      name: 'Python', 
      template: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Write your solution here
    pass`,
      extension: '.py'
    },
    { 
      id: 'java', 
      name: 'Java', 
      template: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[0];
    }
}`,
      extension: '.java'
    },
    { 
      id: 'cpp', 
      name: 'C++', 
      template: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
      extension: '.cpp'
    },
    { 
      id: 'javascript', 
      name: 'JavaScript', 
      template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here
};`,
      extension: '.js'
    }
  ];

  useEffect(() => {
    if (problemId) {
      const foundProblem = problemsData.problems.find(p => p.id === problemId);
      if (foundProblem) {
        // Process dynamic test cases
        const processedProblem = loadProblemWithDynamicTestCases(foundProblem);
        setProblem(processedProblem);
        
        // Set default code template based on problem and language
        const langConfig = languages.find(l => l.id === language);
        const defaultCode = getDefaultCodeForProblem(processedProblem, language);
        setCode(defaultCode || langConfig?.template || '');
        
        // Initialize code history
        setCodeHistory([defaultCode || langConfig?.template || '']);
        setCurrentHistoryIndex(0);
      } else {
        navigate('/problems');
      }
    }
  }, [problemId]);

  const loadProblemWithDynamicTestCases = (problem) => {
    const processedTestCases = problem.testCases.map(testCase => {
      if (typeof testCase.input.nums === 'string' && 
          testCase.input.nums.includes('PLACEHOLDER')) {
        
        const dynamicData = generateLargeTestCases(problem.id, testCase.id);
        if (dynamicData) {
          return {
            ...testCase,
            input: dynamicData,
            expectedOutput: dynamicData.expectedOutput
          };
        }
      }
      
      return testCase;
    });
    
    return {
      ...problem,
      testCases: processedTestCases
    };
  };

  const getDefaultCodeForProblem = (problem, lang) => {
    if (problem?.solution?.code?.[lang]) {
      // Return a template based on the solution structure
      const solutionCode = problem.solution.code[lang];
      
      // Extract function signature and create template
      const lines = solutionCode.split('\n');
      const functionStart = lines.findIndex(line => 
        line.includes('def ') || line.includes('public ') || 
        line.includes('class Solution') || line.includes('var ')
      );
      
      if (functionStart !== -1) {
        const templateLines = lines.slice(0, functionStart + 2);
        templateLines.push('    # Write your solution here');
        if (lang === 'python') {
          templateLines.push('    pass');
        } else if (lang === 'java' || lang === 'cpp') {
          templateLines.push('    return null; // or appropriate default');
        } else if (lang === 'javascript') {
          templateLines.push('    // return your result');
        }
        templateLines.push(...lines.slice(-2)); // closing braces
        
        return templateLines.join('\n');
      }
    }
    
    return languages.find(l => l.id === lang)?.template || '';
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    const defaultCode = getDefaultCodeForProblem(problem, newLanguage);
    setCode(defaultCode);
    
    // Add to history
    const newHistory = [...codeHistory.slice(0, currentHistoryIndex + 1), defaultCode];
    setCodeHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    
    // Debounced history update
    setTimeout(() => {
      if (newCode !== codeHistory[currentHistoryIndex]) {
        const newHistory = [...codeHistory.slice(0, currentHistoryIndex + 1), newCode];
        setCodeHistory(newHistory);
        setCurrentHistoryIndex(newHistory.length - 1);
      }
    }, 1000);
  };

  const handleUndo = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setCode(codeHistory[currentHistoryIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < codeHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setCode(codeHistory[currentHistoryIndex + 1]);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Simulate API call to run code against visible test cases
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get visible test cases
      const visibleTestCases = problem.testCases.filter(tc => !tc.hidden).slice(0, 3);
      
      const mockResults = visibleTestCases.map((testCase, index) => {
        const passed = Math.random() > 0.3; // Random for demo
        return {
          id: testCase.id,
          passed,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: passed ? testCase.expectedOutput : `Wrong Answer`,
          runtime: `${Math.floor(Math.random() * 100) + 10}ms`,
          memory: `${(Math.random() * 5 + 10).toFixed(1)}MB`,
          stderr: passed ? null : `AssertionError: Expected ${JSON.stringify(testCase.expectedOutput)}, but got Wrong Answer`,
          testCase: testCase.description
        };
      });
      
      setTestResults(mockResults);
      
      // Show execution output
      const passedTests = mockResults.filter(r => r.passed).length;
      setExecutionOutput({
        status: passedTests === mockResults.length ? 'success' : 'error',
        message: `${passedTests}/${mockResults.length} test cases passed`,
        details: mockResults
      });
      
    } catch (error) {
      console.error('Code execution error:', error);
      setExecutionOutput({
        status: 'error',
        message: 'Runtime Error: Failed to execute code',
        details: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunWithCustomInput = async () => {
    if (!code.trim() || !customInput.trim()) return;
    
    setIsRunning(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Parse custom input and simulate execution
      const result = {
        status: 'success',
        output: 'Your Output:\n[0, 1]',
        stdout: '[0, 1]',
        stderr: null,
        runtime: `${Math.floor(Math.random() * 50) + 5}ms`,
        memory: `${(Math.random() * 3 + 8).toFixed(1)}MB`
      };
      
      setExecutionOutput(result);
      
    } catch (error) {
      setExecutionOutput({
        status: 'error',
        message: 'Failed to execute with custom input',
        details: error.message
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate submission with all test cases (including hidden ones)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const allPassed = Math.random() > 0.4;
      const totalTests = problem.testCases.length;
      const passedTests = allPassed ? totalTests : Math.floor(totalTests * 0.7);
      
      if (allPassed) {
        setExecutionOutput({
          status: 'accepted',
          message: `✅ Accepted!`,
          details: {
            runtime: `${Math.floor(Math.random() * 100) + 20}ms`,
            memory: `${(Math.random() * 5 + 12).toFixed(1)}MB`,
            passedTests: totalTests,
            totalTests: totalTests,
            beats: `${Math.floor(Math.random() * 30) + 60}% of submissions`
          }
        });
      } else {
        setExecutionOutput({
          status: 'wrong_answer',
          message: `❌ Wrong Answer`,
          details: {
            passedTests,
            totalTests,
            failedTestCase: passedTests + 1,
            error: 'Output does not match expected result'
          }
        });
      }
    } catch (error) {
      setExecutionOutput({
        status: 'error',
        message: 'Submission failed',
        details: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCode = () => {
    const defaultCode = getDefaultCodeForProblem(problem, language);
    setCode(defaultCode);
    setTestResults([]);
    setExecutionOutput(null);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const downloadCode = () => {
    const langConfig = languages.find(l => l.id === language);
    const filename = `${problem.id}${langConfig.extension}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In real app, this would save to user's bookmarks
  };

  const shareCode = () => {
    const shareData = {
      title: `${problem.title} - CodeClash`,
      text: `Check out my solution to ${problem.title}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {}); // Catch errors for unsupported shares
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!problem) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading problem...</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'wrong_answer': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'error': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'success': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className={`h-screen bg-slate-950 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/problems')}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Problems</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty} • Level {problem.level}
              </span>
              <h1 className="text-lg font-semibold text-white">{problem.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <span className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{problem.statistics.likes.toLocaleString()}</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>{problem.statistics.acceptanceRate}%</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{problem.statistics.totalSubmissions.toLocaleString()}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
              
              <button
                onClick={shareCode}
                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-y-auto overflow-x-hidden">
          {/* Enhanced Tabs */}
          <div className="flex border-b border-slate-800">
            {[
              { id: 'description', label: 'Description', icon: BookmarkCheck },
              { id: 'editorial', label: 'Editorial', icon: Lightbulb },
              { id: 'discussion', label: 'Discussion', icon: Users },
              { id: 'submissions', label: 'Submissions', icon: Send }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === id
                    ? 'text-cyan-400 border-cyan-400'
                    : 'text-slate-400 hover:text-slate-300 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Enhanced Content */}
          <div className="flex-1 overflow-y-auto" >
            {activeTab === 'description' && (
              <div className="p-6 space-y-6">
                {/* Problem Statement */}
                <div>
                  <div className="prose prose-slate prose-invert max-w-none">
                    <div 
                      className="text-slate-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: problem.description
                          .replace(/\n/g, '<br/>')
                          .replace(/##\s+/g, '<h3 class="text-white font-semibold text-lg mt-6 mb-3">')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                          .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-2 py-1 rounded text-cyan-400 text-sm">$1</code>')
                      }}
                    />
                  </div>
                </div>

                {/* Enhanced Examples */}
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
                    <Terminal className="w-5 h-5" />
                    <span>Examples</span>
                  </h3>
                  <div className="space-y-4">
                    {problem.examples.map((example, index) => (
                      <div key={index} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium text-white">Example {index + 1}</div>
                          <button
                            onClick={() => setCustomInput(example.input)}
                            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                          >
                            Use as input
                          </button>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="bg-slate-900 p-3 rounded-lg">
                            <span className="text-slate-400 font-medium">Input: </span>
                            <code className="text-cyan-400">{example.input}</code>
                          </div>
                          <div className="bg-slate-900 p-3 rounded-lg">
                            <span className="text-slate-400 font-medium">Output: </span>
                            <code className="text-green-400">{example.output}</code>
                          </div>
                          {example.explanation && (
                            <div className="bg-slate-900 p-3 rounded-lg">
                              <span className="text-slate-400 font-medium">Explanation: </span>
                              <span className="text-slate-300">{example.explanation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Constraints */}
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Constraints</h3>
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <ul className="space-y-2">
                      {problem.constraints.map((constraint, index) => (
                        <li key={index} className="text-slate-300 text-sm flex items-start space-x-2">
                          <span className="text-cyan-400 mt-1">•</span>
                          <code className="text-cyan-400 break-all">{constraint}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Enhanced Hints */}
                {problem.hints && problem.hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center space-x-2 text-white font-semibold text-lg mb-4 hover:text-cyan-400 transition-colors w-full text-left"
                    >
                      <Lightbulb className="w-5 h-5" />
                      <span>Hints ({problem.hints.length})</span>
                      <div className="flex items-center space-x-2 ml-auto">
                        {showHints ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showHints ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                    {showHints && (
                      <div className="space-y-3">
                        {problem.hints.map((hint, index) => (
                          <div key={index} className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border border-yellow-400/20 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-yellow-400" />
                              <div className="text-yellow-400 text-sm font-medium">Hint {index + 1}</div>
                            </div>
                            <div className="text-slate-300 text-sm leading-relaxed">{hint}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Enhanced Companies Section */}
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Companies</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {problem.companies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
                        <div className="flex items-center space-x-3">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-300 font-medium">{company.name}</span>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`text-xs px-2 py-1 rounded ${
                            company.frequency === 'Very High' ? 'bg-red-400/20 text-red-400' :
                            company.frequency === 'High' ? 'bg-orange-400/20 text-orange-400' :
                            company.frequency === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                            'bg-slate-400/20 text-slate-400'
                          }`}>
                            {company.frequency}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(company.lastAsked).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Related Problems */}
                {problem.relatedProblems && problem.relatedProblems.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
                      <Tag className="w-5 h-5" />
                      <span>Related Problems</span>
                    </h3>
                    <div className="space-y-2">
                      {problem.relatedProblems.map((related, index) => (
                        <button
                          key={index}
                          onClick={() => navigate(`/problems/${related.id}`)}
                          className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all duration-200 group"
                        >
                          <span className="text-slate-300 group-hover:text-white transition-colors">{related.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(related.difficulty)}`}>
                              {related.difficulty}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Other tabs content */}
            {activeTab === 'editorial' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <Lightbulb className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Editorial Coming Soon</h3>
                  <p className="text-slate-400">Official solution and explanation will be available soon.</p>
                </div>
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Discussion Forum</h3>
                  <p className="text-slate-400">Community discussions and Q&A will be available soon.</p>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Your Submissions</h3>
                  <p className="text-slate-400">Your submission history will appear here.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Enhanced Code Editor */}
        <div className="w-1/2 flex flex-col bg-slate-950">
          {/* Enhanced Editor Header */}
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[120px]"
                >
                  {languages.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
                
                <div className="flex items-center space-x-3">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-slate-400 min-w-[35px]">{fontSize}px</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={handleUndo}
                    disabled={currentHistoryIndex <= 0}
                    className="p-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Undo (Ctrl+Z)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={currentHistoryIndex >= codeHistory.length - 1}
                    className="p-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed rotate-180"
                    title="Redo (Ctrl+Y)"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={copyCode}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Copy Code"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={downloadCode}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Download Code"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={resetCode}
                  className="flex items-center space-x-1 px-3 py-2 text-slate-400 hover:text-white transition-colors"
                  title="Reset to Template"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm">Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <MonacoEditor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              onMount={(editor) => {
                editorRef.current = editor;
                
                // Add keyboard shortcuts
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                  handleRunCode();
                });
                
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
                  handleSubmit();
                });
              }}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: language === 'python' ? 4 : 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                selectOnLineNumbers: true,
                matchBrackets: 'always',
                autoIndent: 'full',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                quickSuggestions: true,
                parameterHints: { enabled: true },
                hover: { enabled: true }
              }}
            />
            
            {/* Loading overlay */}
            {(isRunning || isSubmitting) && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-slate-800 rounded-lg p-6 flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white">
                    {isSubmitting ? 'Submitting solution...' : 'Running code...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Test Results */}
          {(testResults.length > 0 || executionOutput) && (
            <div className="border-t border-slate-700 max-h-64 bg-slate-900">
              <div className="p-4">
                {executionOutput && (
                  <div className="mb-4">
                    <div className={`p-3 rounded-lg border ${getStatusColor(executionOutput.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{executionOutput.message}</span>
                        {executionOutput.details?.runtime && (
                          <div className="flex space-x-4 text-xs">
                            <span>Runtime: {executionOutput.details.runtime}</span>
                            <span>Memory: {executionOutput.details.memory}</span>
                            {executionOutput.details.beats && (
                              <span>Beats: {executionOutput.details.beats}</span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {executionOutput.details?.passedTests !== undefined && (
                        <div className="text-sm">
                          Passed: {executionOutput.details.passedTests}/{executionOutput.details.totalTests} test cases
                        </div>
                      )}
                      
                      {executionOutput.stdout && (
                        <div className="mt-2 p-2 bg-slate-800 rounded font-mono text-sm">
                          <div className="text-slate-400 mb-1">Output:</div>
                          <div className="text-green-400">{executionOutput.stdout}</div>
                        </div>
                      )}
                      
                      {executionOutput.stderr && (
                        <div className="mt-2 p-2 bg-red-400/10 rounded font-mono text-sm">
                          <div className="text-red-400 mb-1">Error:</div>
                          <div className="text-red-300">{executionOutput.stderr}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {testResults.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                      <Terminal className="w-4 h-4" />
                      <span>Test Results</span>
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {testResults.map((result) => (
                        <div
                          key={result.id}
                          className={`p-3 rounded-lg border ${
                            result.passed 
                              ? 'bg-green-400/10 border-green-400/20' 
                              : 'bg-red-400/10 border-red-400/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                              {result.testCase}: {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            <div className="flex space-x-3 text-xs text-slate-400">
                              <span>{result.runtime}</span>
                              <span>{result.memory}</span>
                            </div>
                          </div>
                          
                          {!result.passed && (
                            <div className="space-y-1 text-xs">
                              <div className="text-slate-400">
                                <span className="font-medium">Input:</span> {JSON.stringify(result.input)}
                              </div>
                              <div className="text-slate-400">
                                <span className="font-medium">Expected:</span> {JSON.stringify(result.expectedOutput)}
                              </div>
                              <div className="text-red-400">
                                <span className="font-medium">Got:</span> {JSON.stringify(result.actualOutput)}
                              </div>
                              {result.stderr && (
                                <div className="text-red-300 mt-1 p-2 bg-red-400/10 rounded">
                                  {result.stderr}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Input Panel */}
          {showCustomInput && (
            <div className="border-t border-slate-700 bg-slate-900 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Custom Input</h4>
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your custom input here..."
                className="w-full h-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                onClick={handleRunWithCustomInput}
                disabled={isRunning || !customInput.trim()}
                className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                Run with Custom Input
              </button>
            </div>
          )}

          {/* Enhanced Bottom Action Bar */}
          <div className="bg-slate-800 border-t border-slate-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowTestCases(!showTestCases)}
                  className="text-sm text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <Terminal className="w-4 h-4" />
                  <span>{showTestCases ? 'Hide' : 'Show'} Test Cases</span>
                </button>
                
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-sm text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span>Custom Input</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-xs text-slate-500">
                  Ctrl+Enter to run • Ctrl+Shift+Enter to submit
                </div>
                
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting || !code.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  <span>{isRunning ? 'Running...' : 'Run'}</span>
                </button>
                
                <button
                  onClick={handleSubmit}
                  disabled={isRunning || isSubmitting || !code.trim()}
                  className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolvePage;
