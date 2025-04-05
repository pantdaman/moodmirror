import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { EmotionType, EmotionData, Recommendation } from '../types';

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Validate API key
if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.error('Invalid API key. Please set a valid API key in your .env file.');
  throw new Error('Invalid API key. Please set a valid API key in your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Cache for recommendations to reduce API calls
const recommendationCache = new Map<string, { recommendation: Recommendation; timestamp: number }>();
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Test API connection
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection with key:', API_KEY.substring(0, 5) + '...');
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const result = await model.generateContent('Hello, this is a test message.');
    const response = await result.response;
    const text = response.text();
    
    console.log('API test successful:', text.substring(0, 50) + '...');
    return true;
  } catch (error) {
    console.error('API test failed:', error);
    return false;
  }
};

// Generate a recommendation based on the detected emotion
export const generateRecommendation = async (emotionData: EmotionData, forceRefresh = false): Promise<Recommendation> => {
  console.log('Generating recommendation for emotion:', emotionData, 'forceRefresh:', forceRefresh);
  
  if (!emotionData || !emotionData.emotion) {
    console.error('No emotion data provided');
    throw new Error('No emotion data provided');
  }

  // Check cache first, but only if forceRefresh is false
  const cacheKey = `${emotionData.emotion}-${emotionData.confidence}`;
  const cachedData = recommendationCache.get(cacheKey);
  
  if (!forceRefresh && cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
    console.log('Using cached recommendation for:', emotionData.emotion);
    return cachedData.recommendation;
  }

  if (forceRefresh) {
    console.log('Force refresh requested, bypassing cache for:', emotionData.emotion);
  }

  try {
    console.log('Calling Gemini API for emotion:', emotionData.emotion);
    console.log('API Key available:', !!API_KEY);
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Add random elements to the prompt for variety
    const randomElements = [
      "focus on physical activities and exercise",
      "suggest creative outlets like art or music",
      "recommend social interactions with friends or family",
      "suggest mindfulness and meditation practices",
      "focus on professional development and learning",
      "suggest entertainment options like movies or books",
      "recommend educational content on this topic",
      "suggest outdoor activities and nature experiences",
      "recommend journaling or self-reflection exercises",
      "suggest a change of environment or scenery",
      "focus on healthy eating and nutrition",
      "recommend a hobby or skill-building activity",
      "suggest a challenge or goal-setting exercise",
      "recommend a relaxation technique or breathing exercise",
      "suggest a productivity or organization activity"
    ];
    
    // Select 2-3 random elements to include in the prompt
    const numElements = Math.floor(Math.random() * 2) + 2; // 2 or 3 elements
    const selectedElements = [];
    
    for (let i = 0; i < numElements; i++) {
      const randomIndex = Math.floor(Math.random() * randomElements.length);
      selectedElements.push(randomElements[randomIndex]);
      // Remove the selected element to avoid duplicates
      randomElements.splice(randomIndex, 1);
    }
    
    // Add a random timestamp to further encourage variety
    const timestamp = Date.now();
    
    const prompt = `Generate a recommendation for someone feeling ${emotionData.emotion} (confidence: ${emotionData.confidence}).
    ${selectedElements.join('. ')}.
    The response should be in JSON format with the following structure:
    {
      "title": "string",
      "description": "string",
      "source": "string",
      "mediaType": "string (one of: audio, video, text, activity)",
      "duration": "string (optional)",
      "mediaSuggestion": "string (optional)",
      "youtubeLink": "string (required for video/audio content, especially for motivation)",
      "contentType": "string (for motivation: speech, movie-clip, sports, or general)",
      "contentContext": "string (brief context about the content)",
      "isAIGenerated": true
    }

    For motivation-related content, include specific YouTube links to:
    - Inspirational speeches
    - Movie clips showing motivation
    - Sports highlights
    - Success stories

    For other emotions, focus on appropriate content types.
    Keep suggestions practical and immediately actionable.
    
    Timestamp: ${timestamp}`;

    console.log('Sending prompt to Gemini API:', prompt);
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    
    const response = await result.response;
    const text = response.text();
    console.log('Raw response from Gemini API:', text);
    
    // Clean and parse the response
    const cleanedJson = cleanJsonResponse(text);
    console.log('Cleaned JSON:', cleanedJson);
    
    let recommendation: Recommendation;
    try {
      recommendation = JSON.parse(cleanedJson) as Recommendation;
      // Ensure isAIGenerated is set to true
      recommendation.isAIGenerated = true;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      // Create a fallback recommendation
      recommendation = {
        title: `AI Recommendation for ${emotionData.emotion}`,
        description: `Here's a personalized recommendation for when you're feeling ${emotionData.emotion}.`,
        source: 'AI Assistant',
        mediaType: 'activity',
        duration: '5 minutes',
        mediaSuggestion: 'Try this activity to help with your current emotion.',
        isAIGenerated: true,
        youtubeLink: 'https://www.youtube.com/results?search_query=motivation+inspiration',
        contentType: 'general',
        contentContext: 'AI-generated content to help with your current emotion.'
      };
    }
    
    // Cache the recommendation
    recommendationCache.set(cacheKey, {
      recommendation,
      timestamp: Date.now()
    });
    
    console.log('Final recommendation:', recommendation);
    return recommendation;
  } catch (error) {
    console.error('Error generating recommendation:', error);
    // Return a fallback recommendation instead of throwing
    return {
      title: `AI Recommendation for ${emotionData.emotion}`,
      description: `Here's a personalized recommendation for when you're feeling ${emotionData.emotion}.`,
      source: 'AI Assistant',
      mediaType: 'activity',
      duration: '5 minutes',
      mediaSuggestion: 'Try this activity to help with your current emotion.',
      isAIGenerated: true,
      youtubeLink: 'https://www.youtube.com/results?search_query=motivation+inspiration',
      contentType: 'general',
      contentContext: 'AI-generated content to help with your current emotion.'
    };
  }
};

// Get detailed steps for a recommendation
export const getDetailedSteps = async (recommendation: Recommendation): Promise<string> => {
  if (!recommendation) {
    throw new Error('No recommendation provided');
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const prompt = `Based on this recommendation:
Title: ${recommendation.title}
Description: ${recommendation.description}
Media Type: ${recommendation.mediaType}
${recommendation.mediaSuggestion ? `Media Suggestion: ${recommendation.mediaSuggestion}` : ''}

Please provide a concise response based on the media type:
- For quotes: Provide 2-3 relevant, inspiring quotes
- For jokes: Share 2-3 light-hearted, appropriate jokes
- For activities: Give 2-3 quick, actionable steps
- For meditation: Provide a brief, focused breathing technique
- For music: Suggest 2-3 specific songs or playlists
- For videos: Recommend 2-3 specific video titles or channels

Keep the response brief and focused. No lengthy explanations needed.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response to ensure it's properly formatted
    return text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
  } catch (error) {
    console.error('Error generating detailed steps:', error);
    throw new Error('Failed to generate detailed steps. Please try again later.');
  }
};

// Helper function to clean JSON response
const cleanJsonResponse = (text: string): string => {
  // Remove markdown code block formatting if present
  let cleaned = text.replace(/```json\s*|\s*```/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // Ensure null values are properly formatted
  cleaned = cleaned.replace(/: null/g, ': null');
  
  return cleaned;
};

// List available models and their supported methods
export const listAvailableModels = async (): Promise<void> => {
  try {
    console.log('Fetching available models...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Available models:', JSON.stringify(data, null, 2));
    
    // Log each model's name and supported methods
    if (data.models) {
      console.log('\nModel Details:');
      data.models.forEach((model: any) => {
        console.log(`\nModel: ${model.name}`);
        console.log('Supported methods:', model.supportedMethods || 'None specified');
        console.log('Description:', model.description || 'No description available');
      });
    }
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}; 