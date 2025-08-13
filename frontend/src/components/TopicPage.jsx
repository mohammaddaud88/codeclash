// In TopicPage.jsx

// 1. Remove the old LearningNavigator component and its related state/functions
//    (e.g., remove `learningPath`, `handleStartLearning`, `LearningNavigator`)

// 2. Import the new component
import React from 'react'
import AskAI from './AskAI'
import LearningPathGenerator from './LearningPathGenerator'; 
import { useParams, Link } from 'react-router-dom';
// ... other imports

const TopicPage = () => {
  const { topicName } = useParams();
  const formattedTopicName = topicName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Assume you have access to the current user's ID
  const currentUserId = 'user-123-abc'; // Replace with actual user ID from auth context

  // ... other existing state and functions for quiz, etc. ...

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ... */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (no changes needed here) */}
          <div className="lg:col-span-1 space-y-8">
            {/* ... */}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3. Replace the old logic with the new component */}
            <LearningPathGenerator topicName={formattedTopicName} userId={currentUserId} />
            
            {/* Keep your AskAI component */}
            <AskAI userId={currentUserId} topic={formattedTopicName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicPage;