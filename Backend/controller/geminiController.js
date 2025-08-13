const express = require('express');
const router = express.Router();
const geminiModel = require('../services/gemini');
const User = require('../models/User'); // Your Mongoose User model

router.post('/generate', async (req, res) => {
    try {
        const { userId, contentType, details } = req.body;

        // 1. Fetch user data from MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Craft a detailed prompt (The Magic Happens Here ✨)
        const prompt = createPersonalizedPrompt(user, contentType, details);

        // 3. Call the Gemini API
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Send the response back to the frontend
        res.status(200).json({ content: text });

    } catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ message: "Failed to generate content" });
    }
});

function createPersonalizedPrompt(user, contentType, details) {
    // Example for generating a DSA problem
    if (contentType === 'dsa_problem') {
        return `
            You are an expert problem setter for a competitive programming platform called CodeClash.AI.
            Generate a unique DSA problem for a user with the following profile:
            - Knowledge Level: ${user.knowledgeLevel} (e.g., Beginner, Intermediate)
            - Preferred Language: ${user.preferredLanguage}
            - Recent Topics Practiced: ${user.recentTopics.join(', ')}
            - Goal: ${user.goal}

            The requested problem is about: "${details.topic}".
            The difficulty should be tailored to their knowledge level.

            Generate the output in a clean JSON format with the following keys:
            - "title": A creative problem title.
            - "problemStatement": A clear and concise problem description, including a story if possible.
            - "constraints": Technical constraints (e.g., "1 <= N <= 10^5").
            - "exampleInput": A sample input.
            - "exampleOutput": The corresponding sample output.
        `;
    }
    // Add more prompt templates for other content types (e.g., explanations, roadmaps)
    return `Generate content about ${details.topic} for a ${user.knowledgeLevel} user.`;
}

module.exports = router;