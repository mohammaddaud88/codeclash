import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, SlidersHorizontal, Code, Clock, Users, 
  Heart, Eye, TrendingUp, ChevronRight, Star, CheckCircle,
  ArrowUpDown, ChevronDown, X, Building, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import your enhanced problems data
import problemsData from '../assets/problems.json';

const ProblemsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    // In real app, this would be an API call
    setProblems(problemsData.problems);
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getCompanyFrequencyColor = (frequency) => {
    switch (frequency.toLowerCase()) {
      case 'very high': return 'text-red-400 bg-red-400/10';
      case 'high': return 'text-orange-400 bg-orange-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const handleSolveProblem = (problemId) => {
    navigate(`/problems/${problemId}`);
  };

  const filteredAndSortedProblems = useMemo(() => {
    let filtered = problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           problem.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           problem.companies.some(comp => comp.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || problem.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || problem.difficulty === selectedDifficulty;
      const matchesCompany = selectedCompany === 'All' || 
                            problem.companies.some(comp => comp.name === selectedCompany);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesCompany;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          aValue = difficultyOrder[a.difficulty];
          bValue = difficultyOrder[b.difficulty];
          break;
        case 'acceptance':
          aValue = a.statistics.acceptanceRate;
          bValue = b.statistics.acceptanceRate;
          break;
        case 'likes':
          aValue = a.statistics.likes;
          bValue = b.statistics.likes;
          break;
        case 'submissions':
          aValue = a.statistics.totalSubmissions;
          bValue = b.statistics.totalSubmissions;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [problems, searchQuery, selectedCategory, selectedDifficulty, selectedCompany, sortBy, sortOrder]);

  // Get unique companies from all problems
  const allCompanies = useMemo(() => {
    const companies = new Set();
    problems.forEach(problem => {
      problem.companies.forEach(comp => companies.add(comp.name));
    });
    return Array.from(companies).sort();
  }, [problems]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedCompany('All');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedDifficulty !== 'All' || 
                          selectedCompany !== 'All' || searchQuery !== '';

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header - Same as before */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Practice <span className="text-cyan-400">Problems</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Solve {problemsData.metadata.totalProblems}+ coding challenges from top tech companies. Master algorithms and data structures.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by name, category, tags, or company..."
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle and Stats */}
          <div className="flex items-center justify-between max-w-4xl mx-auto mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
              )}
            </button>

            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <span>{filteredAndSortedProblems.length} problems found</span>
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Easy: {problemsData.metadata.difficultyDistribution.Easy}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Medium: {problemsData.metadata.difficultyDistribution.Medium}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Hard: {problemsData.metadata.difficultyDistribution.Hard}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid md:grid-cols-5 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="All">All Categories</option>
                  {Object.keys(problemsData.metadata.categoryDistribution).map(category => (
                    <option key={category} value={category}>
                      {category} ({problemsData.metadata.categoryDistribution[category]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="All">All Difficulties</option>
                  {Object.keys(problemsData.metadata.difficultyDistribution).map(difficulty => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty} ({problemsData.metadata.difficultyDistribution[difficulty]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="All">All Companies</option>
                  {allCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="acceptance">Acceptance Rate</option>
                  <option value="likes">Likes</option>
                  <option value="submissions">Submissions</option>
                </select>
              </div>

              {/* Sort Order */}
              <div className="flex items-end">
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">Active filters:</span>
                  {selectedCategory !== 'All' && (
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full flex items-center space-x-1">
                      <span>{selectedCategory}</span>
                      <button onClick={() => setSelectedCategory('All')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedDifficulty !== 'All' && (
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full flex items-center space-x-1">
                      <span>{selectedDifficulty}</span>
                      <button onClick={() => setSelectedDifficulty('All')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {selectedCompany !== 'All' && (
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full flex items-center space-x-1">
                      <span>{selectedCompany}</span>
                      <button onClick={() => setSelectedCompany('All')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
                <button
                  onClick={resetFilters}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Problems List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredAndSortedProblems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No problems found</h3>
            <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-slate-900 rounded-2xl border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 hover:transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header with difficulty, category, and stats */}
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty} • Level {problem.level}
                      </span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                        {problem.category}
                      </span>
                      <div className="flex items-center space-x-4 text-slate-400 text-xs">
                        <span className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span>{problem.statistics.likes.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>{problem.statistics.acceptanceRate}%</span>
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3 hover:text-cyan-400 transition-colors cursor-pointer">
                      {problem.title}
                    </h3>
                    
                    {/* Enhanced description preview */}
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {problem.description.split('\n')[0].replace(/##\s+/, '').substring(0, 200)}...
                    </p>

                    {/* Detailed statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 mb-4">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{problem.statistics.totalSubmissions.toLocaleString()} submissions</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>{problem.statistics.acceptedSubmissions.toLocaleString()} accepted</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{problem.statistics.averageRuntime}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{problem.statistics.memoryUsage}</span>
                      </span>
                    </div>

                    {/* Companies section with frequency */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">Asked by companies:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {problem.companies.slice(0, 4).map((company, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">
                              {company.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${getCompanyFrequencyColor(company.frequency)}`}>
                              {company.frequency}
                            </span>
                          </div>
                        ))}
                        {problem.companies.length > 4 && (
                          <span className="text-slate-400 text-xs">+{problem.companies.length - 4} more</span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-slate-400">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.slice(0, 5).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 hover:bg-slate-700 cursor-pointer transition-colors">
                            {tag}
                          </span>
                        ))}
                        {problem.tags.length > 5 && (
                          <span className="text-xs text-slate-400">+{problem.tags.length - 5}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="ml-6 flex flex-col items-end space-y-3">
                    <button
                      onClick={() => handleSolveProblem(problem.id)}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 hover:transform hover:scale-105"
                    >
                      <Code className="w-4 h-4" />
                      <span>Solve</span>
                    </button>
                    
                    <div className="text-right text-xs text-slate-500">
                      <div>Last asked:</div>
                      <div className="text-slate-400">
                        {new Date(problem.companies[0]?.lastAsked).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemsPage;
