import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import problems from '../assets/problems.json'
import Editor from '@monaco-editor/react'

const ProblemSolvePage = () => {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('description')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [leftPanelWidth, setLeftPanelWidth] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef(null)

  // NEW: test-cases state & inputs for adding new cases locally
  const [testCasesList, setTestCasesList] = useState([])
  const [newTestInput, setNewTestInput] = useState('')
  const [newTestExpected, setNewTestExpected] = useState('')

  // Find the specific problem
  const problem = problems.find(p => p.id.toString() === id)
  // console.log(problem)

  // Initialize testCasesList from problem.testCases when problem loads
  React.useEffect(() => {
    if (problem) {
      setTestCasesList(problem.testCases || [])
    }
  }, [problem])


  // Add a test case to the local list
  const addTestCase = () => {
    if (!newTestInput.trim()) return
    setTestCasesList(prev => [
      ...prev,
      { input: newTestInput, expected: newTestExpected || '', isPublic: true }
    ])
    setNewTestInput('')
    setNewTestExpected('')
  }

  // Remove a test case by index
  const removeTestCase = (index) => {
    setTestCasesList(prev => prev.filter((_, i) => i !== index))
  }

  // Handle mouse down on resizer
  const handleMouseDown = (e) => {
    setIsResizing(true)
    e.preventDefault()
  }

  // Handle mouse move for resizing
  const handleMouseMove = (e) => {
    if (!isResizing || !containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
    
    // Constrain between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth)
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsResizing(false)
  }

  // Add event listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  // Run code handler with custom input (unchanged)
  const handleRunCode = async () => {
    setLoading(true)
    setOutput('')
    try {
      const inputToUse = customInput.trim() || (problem?.example && problem.example[0] ? problem.example[0].input : '')
      const res = await fetch('http://localhost:8000/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          input: inputToUse,
          runInDocker: true,
          // include the prepared test cases list so backend can run them later if you choose
          testCases: testCasesList
        })
      })
      const data = await res.json()
      setOutput(data.output || data.result || data.error || JSON.stringify(data) || 'No output')
    } catch (err) {
      setOutput('Server error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'description', label: 'Description', icon: '📋' },
    { id: 'approaches', label: 'Approaches', icon: '💡' },
    { id: 'discussion', label: 'Discussion', icon: '💬' },
    { id: 'submission', label: 'Submission', icon: '✅' }
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="space-y-6">
            {/* Problem Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-700">#{problem.id}</span>
                  <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
                </div>
                {problem.difficulty && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  📚 {problem.category}
                </span>
                {problem.tags && problem.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Problem Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Problem Statement</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {problem.description}
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Examples</h2>
              <div className="space-y-4">
                {problem.example.map((example, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h3 className="font-medium text-gray-900 mb-3">Example {index + 1}:</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-20">Input:</span>
                        <code className="bg-gray-200 px-2 py-1 rounded font-mono text-gray-800">
                          {example.input}
                        </code>
                      </div>
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-20">Output:</span>
                        <code className="bg-gray-200 px-2 py-1 rounded font-mono text-gray-800">
                          {example.output}
                        </code>
                      </div>
                      {example.explanation && (
                        <div className="flex">
                          <span className="font-medium text-gray-700 w-20">Explanation:</span>
                          <span className="text-gray-600">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Input Format</h3>
                  <p className="text-blue-800 text-sm">{problem.inputFormat}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Output Format</h3>
                  <p className="text-green-800 text-sm">{problem.outputFormat}</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg mt-4">
                <h3 className="font-medium text-yellow-900 mb-2">Constraints</h3>
                <p className="text-yellow-800 text-sm">{problem.constraints}</p>
              </div>
            </div>
          </div>
        )
      
      case 'approaches':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💡</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Solution Approaches</h2>
              <p className="text-gray-600">Different approaches and algorithms will be shown here.</p>
            </div>
          </div>
        )
      
      case 'discussion':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Discussion Forum</h2>
              <p className="text-gray-600">Community discussions and hints will appear here.</p>
            </div>
          </div>
        )
      
      case 'submission':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Submissions</h2>
              <p className="text-gray-600">Your submission history will be displayed here.</p>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" ref={containerRef}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                ← Back to Problems
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                onClick={handleRunCode}
                disabled={loading}
              >
                {loading ? 'Running...' : 'Run Code'}
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div 
          ref={containerRef}
          className="flex gap-2 h-[calc(100vh-120px)] relative"
          style={{ cursor: isResizing ? 'col-resize' : 'default' }}
        >
          {/* Left Panel */}
          <div 
            className="flex flex-col space-y-4"
            style={{ width: `${leftPanelWidth}%` }}
          >
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex space-x-1 p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>

          {/* Resize Handle */}
          <div
            className="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex-shrink-0 rounded"
            onMouseDown={handleMouseDown}
          />

          {/* Right Panel - Code Editor */}
          <div className="flex flex-col">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900">Code Editor</h2>
                  <select
                    className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    onClick={handleRunCode}
                    disabled={loading}
                  >
                    {loading ? 'Running...' : 'Run Code'}
                  </button>
                </div>
              </div>

              {/* MONACO EDITOR */}
              <div className="h-72"> 
                <Editor
                  height="100%"
                  defaultLanguage={language}
                  language={language}
                  value={code}
                  onChange={(value) => {
                    setCode(value || '')
                    // console.log(value)
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    tabSize: 2
                  }}
                />
              </div>

              {/* Test cases manager */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Test Cases to Run</h3>

                {/* Add new test case */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <textarea
                    className="col-span-2 border rounded p-2 text-sm"
                    placeholder="Input (stdin) for test case"
                    value={newTestInput}
                    onChange={(e) => setNewTestInput(e.target.value)}
                    rows={2}
                  />
                  <input
                    className="border rounded p-2 text-sm"
                    placeholder="Expected output (optional)"
                    value={newTestExpected}
                    onChange={(e) => setNewTestExpected(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={addTestCase}
                  >
                    Add Test Case
                  </button>
                  <button
                    className="bg-gray-200 px-3 py-1 rounded"
                    onClick={() => { setNewTestInput(''); setNewTestExpected('') }}
                  >
                    Clear
                  </button>
                </div>

                {/* List of prepared test cases */}
                <div className="space-y-2 max-h-48 overflow-auto">
                  {testCasesList.length > 0 ? (
                    testCasesList.map((tc, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-gray-50 p-2 rounded">
                        <div className="text-sm">
                          <div className="text-gray-700"><strong>Input:</strong> <pre className="inline font-mono">{tc.input}</pre></div>
                          {tc.expected !== undefined && tc.expected !== '' && (
                            <div className="text-gray-600"><strong>Expected:</strong> <pre className="inline font-mono">{tc.expected}</pre></div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button className="text-sm text-red-600" onClick={() => removeTestCase(idx)}>Remove</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 italic">No test cases prepared.</div>
                  )}
                </div>
              </div>

              {/* Output Section */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Output:</h3>
                <pre className="bg-gray-100 p-3 rounded text-gray-700 whitespace-pre-wrap">{output}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemSolvePage
