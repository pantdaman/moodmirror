import { Recommendation } from '../types';

// Cache for website details to reduce API calls
const websiteDetailsCache = new Map<string, { details: string; timestamp: number }>();
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetches details from a website URL
 * @param url The URL to fetch details from
 * @returns A promise that resolves to the website details
 */
export const fetchWebsiteDetails = async (url: string): Promise<string> => {
  // Check cache first
  const cachedData = websiteDetailsCache.get(url);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
    console.log('Using cached website details for:', url);
    return cachedData.details;
  }

  try {
    console.log('Fetching details from URL:', url);
    
    // Use a proxy service to avoid CORS issues
    // You can replace this with your own proxy service or backend endpoint
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the HTML content
    const htmlContent = data.contents;
    
    // Extract title and description
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    const descriptionMatch = htmlContent.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    
    const title = titleMatch ? titleMatch[1] : 'No title found';
    const description = descriptionMatch ? descriptionMatch[1] : 'No description found';
    
    // Create a summary of the website
    const details = `Title: ${title}\nDescription: ${description}\n\nThis content is from: ${url}`;
    
    // Cache the details
    websiteDetailsCache.set(url, {
      details,
      timestamp: Date.now()
    });
    
    return details;
  } catch (error) {
    console.error('Error fetching website details:', error);
    return `Unable to fetch details from ${url}. Please visit the website directly.`;
  }
};

/**
 * Fetches details for a recommendation's media suggestion
 * @param recommendation The recommendation to fetch details for
 * @returns A promise that resolves to the website details
 */
export const fetchRecommendationDetails = async (recommendation: Recommendation): Promise<string> => {
  if (!recommendation.mediaSuggestion) {
    return 'No media suggestion available for this recommendation.';
  }
  
  // Check if the mediaSuggestion is a URL
  try {
    new URL(recommendation.mediaSuggestion);
    return await fetchWebsiteDetails(recommendation.mediaSuggestion);
  } catch {
    // If it's not a URL, return the mediaSuggestion as is
    return recommendation.mediaSuggestion;
  }
};

/**
 * Fetches details for a recommendation's YouTube link
 * @param recommendation The recommendation to fetch details for
 * @returns A promise that resolves to the YouTube video details
 */
export const fetchYouTubeDetails = async (recommendation: Recommendation): Promise<string> => {
  if (!recommendation.youtubeLink) {
    return 'No YouTube link available for this recommendation.';
  }
  
  try {
    // Extract video ID from YouTube URL
    const videoId = extractYouTubeVideoId(recommendation.youtubeLink);
    
    if (!videoId) {
      return 'Invalid YouTube URL.';
    }
    
    // Use YouTube Data API to get video details
    // Note: You'll need to set up a YouTube Data API key in your environment variables
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return `YouTube video: ${recommendation.youtubeLink}\n\nTo view more details, please visit the link directly.`;
    }
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0].snippet;
      return `Title: ${video.title}\nDescription: ${video.description}\n\nWatch on YouTube: ${recommendation.youtubeLink}`;
    } else {
      return `YouTube video: ${recommendation.youtubeLink}\n\nTo view more details, please visit the link directly.`;
    }
  } catch (error) {
    console.error('Error fetching YouTube details:', error);
    return `YouTube video: ${recommendation.youtubeLink}\n\nTo view more details, please visit the link directly.`;
  }
};

/**
 * Extracts the video ID from a YouTube URL
 * @param url The YouTube URL
 * @returns The video ID or null if not found
 */
const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
}; 