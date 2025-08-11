import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Code, FileText } from 'lucide-react';

const TopicPage = () => {
  const { topicName } = useParams();
  const formattedTopicName = topicName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Dummy data - replace with actual data fetching
  const topicData = {
    blog: `This is a detailed blog post about ${formattedTopicName}. It covers the core concepts, data structures, and algorithms related to this topic. We will explore the theory behind it and provide practical examples to solidify your understanding.`,
    timeComplexity: 'O(n log n) for sorting, O(1) for access, etc.',
    problems: [
      { id: 1, title: `Two Sum with ${formattedTopicName}`, difficulty: 'Easy' },
      { id: 2, title: `Median of Two Sorted ${formattedTopicName}`, difficulty: 'Hard' },
      { id: 3, title: `Container With Most Water using ${formattedTopicName}`, difficulty: 'Medium' },
    ],
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/topics" className="inline-flex items-center text-slate-400 hover:text-cyan-400 transition-colors duration-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Topics
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {formattedTopicName}
          </h1>
        </div>

        <div className="space-y-12">
          {/* Blog Section */}
          <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-8">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-cyan-400 mr-4" />
              <h2 className="text-3xl font-bold text-slate-100">Blog</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {topicData.blog}
            </p>
          </div>

          {/* Time Complexity Section */}
          <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-8">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-cyan-400 mr-4" />
              <h2 className="text-3xl font-bold text-slate-100">Time Complexity</h2>
            </div>
            <p className="text-slate-300 font-mono bg-slate-900/50 p-4 rounded-md">
              {topicData.timeComplexity}
            </p>
          </div>

          {/* Problems Section */}
          <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-800 p-8">
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-cyan-400 mr-4" />
              <h2 className="text-3xl font-bold text-slate-100">Related Problems</h2>
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
      </div>
    </div>
  );
};

export default TopicPage;
