const geminiModel = require('../services/gemini');

// Handler for AI Learn
const handleLearn = async (req, res) => {
    try {
        const problemId = parseInt(req.params.problemId);
        const problems = require('../assest/problems.json');
        const problem = problems.find(p => p.id === problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // Prompt for Gemini API (focus on solving)
        const prompt = `You are an expert competitive programmer and educator. Help a student solve the following coding problem step-by-step.\n\nTitle: ${problem.title}\nDescription: ${problem.description}\nConstraints: ${problem.constraints}\nInput Format: ${problem.inputFormat}\nOutput Format: ${problem.outputFormat}\nExamples: ${problem.example.map(e => `Input: ${e.input} Output: ${e.output}`).join(' | ')}\n\nYour response should include:\n1. Problem analysis and intuition\n2. Step-by-step hints to reach the solution\n3. Common mistakes to avoid\n4. Visual explanation (describe in words)\n5. Final solution approach\n6. Python code\n7. Complexity analysis`;

        // Call Gemini API
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ guide: text });
    } catch (error) {
        console.error("Error generating AI guide:", error);
        res.status(500).json({ message: "Failed to generate AI guide" });
    }
};

// Handler for Editorial
const handleEditorial = async (req, res) => {
    try {
        const problemId = parseInt(req.params.problemId);
        const problems = require('../assest/problems.json');
        const problem = problems.find(p => p.id === problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        // Prompt for Gemini API
        const prompt = `You are an expert competitive programmer. Write a detailed editorial for the following problem.\n\nTitle: ${problem.title}\nDescription: ${problem.description}\nConstraints: ${problem.constraints}\nInput Format: ${problem.inputFormat}\nOutput Format: ${problem.outputFormat}\nExamples: ${problem.example.map(e => `Input: ${e.input} Output: ${e.output}`).join(' | ')}\n\nEditorial should include: 1. Problem analysis, 2. Step-by-step solution approach, 3. Code snippets (in Python), 4. Edge cases, 5. Complexity analysis.`;

        // Call Gemini API
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ editorial: text });
    } catch (error) {
        console.error("Error generating editorial:", error);
        res.status(500).json({ message: "Failed to generate editorial" });
    }
};

module.exports = { handleLearn, handleEditorial };