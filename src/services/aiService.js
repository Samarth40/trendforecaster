import axios from 'axios';

class AIService {
  constructor() {
    this.openRouterClient = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'HTTP-Referer': import.meta.env.VITE_APP_URL || 'http://localhost:3000',
        'X-Title': import.meta.env.VITE_APP_NAME || 'TrendForecaster',
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.openRouterClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });

          // Handle specific error cases
          if (error.response.status === 401) {
            throw new Error('API key is invalid or missing. Please check your configuration.');
          } else if (error.response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a few minutes.');
          } else if (error.response.status === 402) {
            throw new Error('API quota exceeded. Please try again later.');
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          throw new Error('No response from AI service. Please check your internet connection.');
        } else {
          console.error('Error setting up request:', error.message);
          throw new Error('Failed to connect to AI service. Please try again.');
        }
        return Promise.reject(error);
      }
    );
  }

  async generateResponse(userMessage) {
    try {
      const payload = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert social media content creator and strategist. You help users create engaging content, provide marketing strategies, and offer insights about social media trends. Your responses should be creative, practical, and tailored to the specific platform mentioned (if any). Include emojis where appropriate and format your responses for easy reading."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1
      };

      const response = await this.openRouterClient.post('/chat/completions', payload);

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response format from API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.response?.data?.error?.code === 402) {
        throw new Error('Insufficient credits. Please try again with a different model.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw error;
    }
  }

  async generateContentIdeas(topic) {
    const prompt = `Generate 5 creative content ideas for ${topic} that would work well on social media. Include hashtags and engagement hooks.`;
    return this.generateResponse(prompt);
  }

  async generateHashtags(content) {
    const prompt = `Suggest relevant and trending hashtags for the following content: ${content}`;
    return this.generateResponse(prompt);
  }

  async analyzeEngagement(content) {
    const prompt = `Analyze this content and suggest ways to improve engagement: ${content}`;
    return this.generateResponse(prompt);
  }

  async generateSummary(trend) {
    try {
      if (!trend || !trend.name) {
        throw new Error('Invalid trend data provided');
      }

      const payload = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are an expert trend analyst providing insightful summaries of trending topics."
          },
          {
            role: "user",
            content: `Generate a comprehensive summary of this trending topic:
Name: ${trend.name}
Platform: ${trend.platform || 'Unknown'}
Engagement: ${trend.volume || trend.views || 0}
Growth: ${trend.growth || 0}%
Sentiment: ${trend.sentiment || 'neutral'}
Description: ${trend.description || 'No description available'}

Please provide a detailed analysis of this trend, including its significance, engagement metrics, and potential impact.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1
      };

      console.log('Sending request with payload:', JSON.stringify(payload, null, 2));

      const response = await this.openRouterClient.post('/chat/completions', payload);

      console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response format from API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating summary:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : undefined,
        stack: error.stack
      });

      if (error.response?.data?.error?.code === 402) {
        return 'Insufficient credits. Please try again with a different model or upgrade your account.';
      } else if (error.response?.status === 400) {
        return `Invalid request format: ${error.response.data?.error?.message || 'Please check the trend data and try again.'}`;
      } else if (error.response?.status === 401) {
        return 'Authentication error. Please check your API key.';
      } else if (error.response?.status === 429) {
        return 'Rate limit exceeded. Please try again later.';
      } else if (error.message === 'Invalid trend data provided') {
        return 'Missing or invalid trend data provided.';
      }

      return 'Unable to generate AI summary at this time. Please try again later.';
    }
  }

  async generateContentIdeas(trend) {
    try {
      if (!trend || !trend.name) {
        throw new Error('Invalid trend data provided');
      }

      const payload = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a creative content strategist helping to generate engaging content ideas based on trending topics. Provide detailed, actionable content suggestions."
          },
          {
            role: "user",
            content: `Generate 5 unique content ideas for this trending topic:
Name: ${trend.name}
Platform: ${trend.platform || 'Unknown'}
Category: ${trend.category || 'General'}
Description: ${trend.description || 'No description available'}

For each idea, provide:
1. A creative title
2. A brief description
3. Content type (Video, Article, Infographic, etc.)
4. Recommended platform
5. Target audience
6. Difficulty level
7. Estimated time to create
8. Potential engagement estimate`
          }
        ],
        temperature: 0.8,
        max_tokens: 1500,
        top_p: 1
      };

      console.log('Sending request with payload:', JSON.stringify(payload, null, 2));

      const response = await this.openRouterClient.post('/chat/completions', payload);

      console.log('API Response:', JSON.stringify(response.data, null, 2));

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        throw new Error('Invalid response format from API');
      }

      const aiResponse = response.data.choices[0].message.content;
      return this.parseContentIdeas(aiResponse);
    } catch (error) {
      console.error('Error generating content ideas:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : undefined,
        stack: error.stack
      });

      if (error.response?.data?.error?.code === 402) {
        console.error('Insufficient credits for content generation');
        return [];
      }
      if (error.response?.status === 400) {
        console.error('Bad request details:', JSON.stringify(error.response.data, null, 2));
      }
      return [];
    }
  }

  parseContentIdeas(aiResponse) {
    try {
      if (!aiResponse) {
        throw new Error('Empty AI response');
      }

      // Split the response into individual ideas
      const ideaSections = aiResponse.split(/\d+\.\s+/).filter(Boolean);
      
      if (ideaSections.length === 0) {
        throw new Error('No content ideas found in response');
      }

      return ideaSections.map(section => {
        const lines = section.split('\n').filter(Boolean);
        
        // Extract information from the AI response with fallbacks
        const title = lines[0]?.trim() || 'Untitled Idea';
        const description = this.extractField(lines, 'description') || 'No description available';
        const contentType = this.extractField(lines, 'content type') || 'Article';
        const platform = this.extractField(lines, 'platform') || 'Multiple Platforms';
        const audience = this.extractField(lines, 'target audience') || 'General Audience';
        const difficulty = this.extractField(lines, 'difficulty') || 'Medium';
        const timeToCreate = this.extractField(lines, 'time to create') || '2-4 hours';
        
        return {
          title,
          description,
          contentType,
          recommendedPlatforms: platform.split(',').map(p => p.trim()),
          targetAudience: audience.split(',').map(a => a.trim()),
          difficulty,
          timeToCreate,
          estimatedEngagement: Math.floor(Math.random() * 10000) + 1000
        };
      });
    } catch (error) {
      console.error('Error parsing content ideas:', error);
      return [];
    }
  }

  extractField(lines, fieldName) {
    const line = lines.find(line => 
      line.toLowerCase().includes(`${fieldName.toLowerCase()}:`)
    );
    return line?.split(':')[1]?.trim() || '';
  }
}

export const aiService = new AIService(); 