import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Code, FileText, BrainCircuit, Search, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios'; // <-- 1. IMPORT AXIOS

// Import the new AskAI component
import AskAI from './AskAI';

// Dummy data - replace with actual data fetching
const topicData = {
  blog: {
    introduction: {
      title: 'Introduction to Arrays',
      content: 'An array is a collection of items of same data type stored at contiguous memory locations.',
      next: 'visualization',
    },
    visualization: {
      title: 'Visualization',
      content: 'Imagine a row of boxes, each holding a value. That\'s an array!',
      next: 'code',
    },
    code: {
      title: 'Code Implementation',
      content: 'Show code examples in different languages.',
      code: {
        javascript: `const arr = [1, 2, 3];`,
        python: `arr = [1, 2, 3]`,
        cpp: `int arr[] = {1, 2, 3};`,
      },
      next: 'edge-cases',
    },
    'edge-cases': {
      title: 'Edge Cases',
      content: 'What about empty arrays? Or arrays with one element?',
      next: 'performance',
    },
    performance: {
      title: 'Performance',
      content: 'Arrays have O(1) access time, but O(n) insertion/deletion time.',
      next: 'real-world-analogy',
    },
    'real-world-analogy': {
      title: 'Real-World Analogy',
      content: 'A bookshelf is like an array. Each book has a specific position.',
      next: 'common-pitfalls',
    },
    'common-pitfalls': {
      title: 'Common Pitfalls',
      content: 'Off-by-one errors are common when working with arrays.',
      next: null,
    },
  },
  timeComplexity: 'O(1) for access, O(n) for search, insertion, and deletion.',
  spaceComplexity: 'O(n)',
  problems: [
    { id: 1, title: 'Two Sum', difficulty: 'Easy' },
    { id: 2, title: '3Sum', difficulty: 'Medium' },
    { id: 3, title: 'Median of Two Sorted Arrays', difficulty: 'Hard' },
  ],
  quiz: {
    questions: [
      {
        question: 'What is the time complexity for accessing an element in an array by its index?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
        answer: 'O(1)',
        explanation: 'Accessing an element by its index is a constant time operation in an array because the memory location can be calculated directly.',
        relatedSection: 'performance',
      },
      {
        question: 'What is a common error when working with arrays?',
        options: ['Type errors', 'Off-by-one errors', 'Syntax errors', 'Network errors'],
        answer: 'Off-by-one errors',
        explanation: 'Off-by-one errors are common due to zero-based indexing.',
        relatedSection: 'common-pitfalls',
      },
    ],
  },
};

const ProgressiveDisclosure = ({ section, onNext, isUnlocked }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isUnlocked) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6 mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors duration-300">
          {section.title}
        </h3>
      </button>
      {isOpen && (
        <div className="mt-4">
          <p className="text-slate-300 leading-relaxed">{section.content}</p>
          {section.code && (
            <div className="space-y-4 mt-4">
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-2">JavaScript</h4>
                <pre className="bg-slate-900/50 p-4 rounded-md text-slate-300 font-mono">{section.code.javascript}</pre>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-2">Python</h4>
                <pre className="bg-slate-900/50 p-4 rounded-md text-slate-300 font-mono">{section.code.python}</pre>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-2">C++</h4>
                <pre className="bg-slate-900/50 p-4 rounded-md text-slate-300 font-mono">{section.code.cpp}</pre>
              </div>
            </div>
          )}
          {section.next && (
            <button onClick={onNext} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200">
              Next: {topicData.blog[section.next].title}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Quiz = ({ quiz, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (questionIndex, answer) => {
    setAnswers({ ...answers, [questionIndex]: answer });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = quiz.questions.reduce((acc, question, index) => {
      return acc + (answers[index] === question.answer ? 1 : 0);
    }, 0);
    onComplete(score, quiz.questions.length);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6">
      <h3 className="text-2xl font-bold text-slate-100 mb-4">Checkpoint Quiz</h3>
      {quiz.questions.map((q, i) => (
        <div key={i} className="mb-4">
          <p className="text-slate-200 mb-2">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((option, j) => (
              <button
                key={j}
                onClick={() => !submitted && handleAnswer(i, option)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                  answers[i] === option
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-700/50 hover:bg-slate-600/50'
                }`}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
          {submitted && (
            <div className={`mt-2 p-2 rounded-lg flex items-center ${
              answers[i] === q.answer ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {answers[i] === q.answer ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
              <p>{q.explanation}</p>
              {answers[i] !== q.answer && (
                <Link to={`#${q.relatedSection}`} className="ml-4 text-cyan-400 hover:underline">Review Section</Link>
              )}
            </div>
          )}
        </div>
      ))}
      {!submitted && (
        <button onClick={handleSubmit} className="mt-4 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200">
          Submit
        </button>
      )}
    </div>
  );
};

// <-- 2. ADD isLoading prop
const LearningNavigator = ({ onStart, isLoading }) => {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('');

  const handleStart = () => {
    if (!goal || !level) {
        alert("Please select your goal and level.");
        return;
    }
    onStart(goal, level);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6 mb-8">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Learning Path</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-2">Your Goal:</label>
          <select onChange={(e) => setGoal(e.target.value)} disabled={isLoading} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:opacity-50">
            <option value="">Select a goal</option>
            <option value="basics">Learn the basics</option>
            <option value="interview">Prepare for interviews</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-300 mb-2">Your Level:</label>
          <select onChange={(e) => setLevel(e.target.value)} disabled={isLoading} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:opacity-50">
            <option value="">Select your level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <button onClick={handleStart} disabled={isLoading} className="w-full px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Generating...' : 'Start Learning'}
        </button>
      </div>
    </div>
  );
};

// Assume you get the current user from your auth context or a higher-level component
const TopicPage = ({ currentUser = { id: 'mock-user-123' } }) => {
  const { topicName } = useParams();
  const formattedTopicName = topicName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // <-- 3. ADD STATE FOR LOADING AND PATH CONTENT
  const [isPathLoading, setIsPathLoading] = useState(false);
  const [hasStartedLearning, setHasStartedLearning] = useState(false);
  const [learningPathContent, setLearningPathContent] = useState('');
  const [unlockedSections, setUnlockedSections] = useState(['introduction']);

  // <-- 4. UPDATE handleStartLearning TO CALL THE API
  const handleStartLearning = async (goal, level) => {
    setIsPathLoading(true);
    setLearningPathContent('');

    try {
        const response = await axios.post('/api/gemini/generate', {
            userId: currentUser.id,
            contentType: 'learning_path',
            details: {
                goal: goal,
                level: level,
                topic: formattedTopicName
            }
        });
        setLearningPathContent(response.data.content);
        setHasStartedLearning(true); // Show the main content now
    } catch (error) {
        console.error("Failed to generate learning path:", error);
        setLearningPathContent("Sorry, we couldn't generate a learning path. Please try again.");
    } finally {
        setIsPathLoading(false);
    }
  };

  const handleNextSection = (currentSection) => {
    const nextSection = topicData.blog[currentSection].next;
    if (nextSection && !unlockedSections.includes(nextSection)) {
      setUnlockedSections([...unlockedSections, nextSection]);
    }
  };

  const handleQuizComplete = (score, total) => {
    console.log(`Quiz score: ${score}/${total}`);
    // Unlock more content based on quiz performance
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/topics" className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Topics
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">{formattedTopicName}</h2>
            </div>
            <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-8 h-8 text-cyan-400 mr-4" />
                <h2 className="text-2xl font-bold text-slate-100">Time & Space Complexity</h2>
              </div>
              <p className="text-slate-300 font-mono bg-slate-900/50 p-4 rounded-md">Time: {topicData.timeComplexity}</p>
              <p className="text-slate-300 font-mono bg-slate-900/50 p-4 rounded-md mt-2">Space: {topicData.spaceComplexity}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6">
              <div className="flex items-center mb-4">
                <Code className="w-8 h-8 text-cyan-400 mr-4" />
                <h2 className="text-2xl font-bold text-slate-100">Related Problems</h2>
              </div>
              <ul className="space-y-4">
                {topicData.problems.map((problem) => (
                  <li key={problem.id} className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg hover:bg-slate-700/50 transition-colors duration-300">
                    <span className="text-slate-200">{problem.title}</span>
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {!hasStartedLearning ? (
              <LearningNavigator onStart={handleStartLearning} isLoading={isPathLoading} />
            ) : (
              <div>
                {/* <-- 5. DISPLAY THE GENERATED PATH --> */}
                {learningPathContent && (
                    <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-6 mb-8">
                        <h3 className="text-2xl font-bold text-slate-100 mb-4">Your Personalized Path</h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{learningPathContent}</p>
                    </div>
                )}

                {Object.keys(topicData.blog).map((sectionKey) => (
                  <ProgressiveDisclosure
                    key={sectionKey}
                    section={topicData.blog[sectionKey]}
                    onNext={() => handleNextSection(sectionKey)}
                    isUnlocked={unlockedSections.includes(sectionKey)}
                  />
                ))}
                <Quiz quiz={topicData.quiz} onComplete={handleQuizComplete} />
              </div>
            )}
             {/* <-- 6. REPLACE THE OLD ASK AI SECTION WITH THE COMPONENT --> */}
             <AskAI userId={currentUser.id} topic={formattedTopicName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
