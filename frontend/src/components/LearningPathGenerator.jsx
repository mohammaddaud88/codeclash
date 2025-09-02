import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const LearningPathGenerator = ({ topicName, userId }) => {
    const [goal, setGoal] = useState('');
    const [level, setLevel] = useState('');
    const [blogContent, setBlogContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateBlog = async () => {
        if (!goal || !level) {
            alert('Please select both a goal and your level.');
            return;
        }
        setIsLoading(true);
        setBlogContent('');
        try {
            const response = await axios.post('/api/gemini/generate-blog', {
                userId,
                goal,
                level,
                topic: topicName
            });
            setBlogContent(response.data.blogContent);
        } catch (error) {
            console.error('Error generating blog:', error);
            setBlogContent('Sorry, there was an error generating the content.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="bg-slate-800/50 p-6 rounded-xl text-center"><p>Generating your personalized blog...</p></div>;
    }

    if (blogContent) {
        return (
            <div className="bg-slate-800/50 p-6 rounded-xl">
                <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>{blogContent}</ReactMarkdown>
                </div>
                <button 
                    onClick={() => setBlogContent('')} 
                    className="mt-6 px-4 py-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-lg"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Learning Path</h2>
            <select onChange={(e) => setGoal(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 mb-4 text-white">
                <option value="">Select a goal</option>
                <option value="ace technical interviews">Ace Technical Interviews</option>
                <option value="master the basics">Master the Basics</option>
            </select>
            <select onChange={(e) => setLevel(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 mb-4 text-white">
                <option value="">Select your level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
            </select>
            <button 
                onClick={handleGenerateBlog} 
                className="w-full px-6 py-3 font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg"
            >
                Start Learning
            </button>
        </div>
    );
};

export default LearningPathGenerator;