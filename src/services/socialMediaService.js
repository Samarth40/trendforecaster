import axios from 'axios';

class SocialMediaService {
  constructor() {
    this.redditClient = axios.create({
      baseURL: 'https://www.reddit.com',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.hackerNewsClient = axios.create({
      baseURL: 'https://hacker-news.firebaseio.com/v0',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.productHuntClient = axios.create({
      baseURL: 'https://api.producthunt.com/v2/api/graphql',
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  // Reddit Trending
  async getRedditTrending() {
    try {
      // Get trending from different subreddits
      const [techResponse, newsResponse, generalResponse] = await Promise.all([
        this.redditClient.get('/r/technology/hot.json?limit=10'),
        this.redditClient.get('/r/news/hot.json?limit=10'),
        this.redditClient.get('/r/popular/hot.json?limit=10')
      ]);

      const techTrends = techResponse.data.data.children.map(post => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score,
        subreddit: 'technology',
        comments: post.data.num_comments,
        source: 'reddit'
      }));

      const newsTrends = newsResponse.data.data.children.map(post => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score,
        subreddit: 'news',
        comments: post.data.num_comments,
        source: 'reddit'
      }));

      const generalTrends = generalResponse.data.data.children.map(post => ({
        title: post.data.title,
        url: `https://reddit.com${post.data.permalink}`,
        score: post.data.score,
        subreddit: post.data.subreddit_name_prefixed,
        comments: post.data.num_comments,
        source: 'reddit'
      }));

      return [...techTrends, ...newsTrends, ...generalTrends];
    } catch (error) {
      console.error('Error fetching Reddit trends:', error);
      return [];
    }
  }

  // HackerNews Top Stories
  async getHackerNewsTrends() {
    try {
      // Get top story IDs
      const topStoryIds = await this.hackerNewsClient.get('/topstories.json');
      const top20Ids = topStoryIds.data.slice(0, 20);

      // Fetch details for each story
      const storyPromises = top20Ids.map(id =>
        this.hackerNewsClient.get(`/item/${id}.json`)
      );
      const stories = await Promise.all(storyPromises);

      return stories.map(story => ({
        title: story.data.title,
        url: story.data.url,
        score: story.data.score,
        comments: story.data.descendants,
        by: story.data.by,
        time: new Date(story.data.time * 1000),
        source: 'hackernews'
      }));
    } catch (error) {
      console.error('Error fetching HackerNews trends:', error);
      return [];
    }
  }

  // GitHub Trending (using GitHub API)
  async getGithubTrending() {
    try {
      const response = await axios.get(
        'https://api.github.com/search/repositories',
        {
          params: {
            q: 'created:>' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            sort: 'stars',
            order: 'desc',
            per_page: 20
          }
        }
      );

      return response.data.items.map(repo => ({
        name: repo.full_name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        source: 'github'
      }));
    } catch (error) {
      console.error('Error fetching GitHub trends:', error);
      return [];
    }
  }
}

export const socialMediaService = new SocialMediaService(); 