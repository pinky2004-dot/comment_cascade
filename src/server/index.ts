import express from 'express';
import { reddit, createServer, context, getServerPort, redis } from '@devvit/web/server';
import { createPost } from './core/post.js';
import { PuzzleData, GameState } from '../shared/types/puzzle.js';

// Curated list of text-focused subreddits for puzzle generation
const PUZZLE_SUBREDDITS = [
  'AskReddit',
  'tifu',
  'todayilearned',
  'explainlikeimfive',
  'unpopularopinion',
  'AmItheAsshole',
  'relationship_advice',
  'LifeProTips',
  'Showerthoughts',
  'mildlyinfuriating'
];

const app = express();
const router = express.Router();

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced redaction function that tracks redacted words for reveal system
function redactTextWithTracking(text: string): { redactedText: string; redactedWords: string[] } {
  const wordsToRedact = [
    // Common words
    /\b(the|a|an|is|was|are|were|i|you|he|she|it|we|they|my|your|his|her|its|our|their)\b/gi,
    // Prepositions and conjunctions
    /\b(in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|around|near|far|here|there|where|when|why|how|what|who|which|that|this|these|those)\b/gi,
    // Common verbs
    /\b(am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|could|should|may|might|must|can|shall)\b/gi,
    // Common nouns (be more selective)
    /\b(thing|stuff|person|people|man|woman|guy|girl|boy|girl|child|kid|baby|family|friend|work|job|home|house|car|money|time|day|night|week|month|year)\b/gi,
    // Subreddit names
    /\b(r\/\w+|u\/\w+)\b/gi,
    // Numbers
    /\b\d+\b/g,
    // Specific Reddit terms
    /\b(OP|upvote|downvote|karma|mod|moderator|subreddit|reddit|post|comment|thread)\b/gi
  ];
  
  let redactedText = text;
  const redactedWords: string[] = [];
  
  wordsToRedact.forEach(pattern => {
    redactedText = redactedText.replace(pattern, (match) => {
      redactedWords.push(match);
      return '[___]';
    });
  });
  
  return { redactedText, redactedWords };
}

// Function to reveal words progressively
function revealWords(originalText: string, redactedWords: string[], revealedCount: number): string {
  let result = originalText;
  const wordsToReveal = redactedWords.slice(0, revealedCount);
  
  // Replace [___] with actual words in order
  wordsToReveal.forEach((word, index) => {
    result = result.replace('[___]', word);
  });
  
  return result;
}

// Generate a new puzzle from Reddit
async function generateNewPuzzle(): Promise<PuzzleData> {
  const randomSubreddit = PUZZLE_SUBREDDITS[Math.floor(Math.random() * PUZZLE_SUBREDDITS.length)];
  
  try {
    console.log(`Generating puzzle from r/${randomSubreddit}`);
    
    // Fetch top posts from the selected subreddit using Devvit Reddit API
    const posts = await reddit.getNewPosts({ 
      subredditName: randomSubreddit, 
      limit: 10 
    }).all();
    
    console.log(`Fetched ${posts ? posts.length : 0} posts from r/${randomSubreddit}`);
    
    if (!posts || posts.length === 0) {
      throw new Error('No posts found');
    }

    // Find a post with good comment activity
    let selectedPost = null;
    for (const post of posts) {
      if (post.numComments && post.numComments > 5) {
        selectedPost = post;
        break;
      }
    }

    if (!selectedPost) {
      selectedPost = posts[0]; // Fallback to first post
    }

    console.log(`Selected: ${selectedPost.title.substring(0, 50)}... (${selectedPost.numComments || 'unknown'} comments)`);

    // Get comments for the selected post
    let comments = [];
    try {
      // Try to get comments for the selected post
      comments = await reddit.getComments({ 
        postId: selectedPost.id, 
        limit: 10 
      }).all();
      
      console.log(`Found ${comments.length} comments for post`);
    } catch (commentError) {
      console.log('Comment fetch failed:', commentError.message);
      throw new Error('No comments found');
    }

    if (!comments || comments.length === 0) {
      throw new Error('No comments found');
    }

    // Take top 5 comments and redact them with tracking
    const topComments = comments.slice(0, 5);
    const originalComments = topComments.map(comment => comment.body);
    const redactionResults = topComments.map(comment => redactTextWithTracking(comment.body));
    const redactedComments = redactionResults.map(result => result.redactedText);
    const revealedWords = redactionResults.map(result => result.redactedWords);

    const puzzle = {
      comments: redactedComments,
      correctUrl: `https://www.reddit.com${selectedPost.permalink}`,
      originalComments: originalComments,
      revealedWords: revealedWords
    };
    
    console.log('✅ Puzzle generated successfully');
    return puzzle;
  } catch (error) {
    console.error('Error generating puzzle:', error.message);
    console.log('Falling back to mock data due to Reddit API error');
    // Return fallback puzzle
    return {
      comments: [
        "I can't believe [___] actually [___] [___] entire [___] in front of everyone.",
        "This is [___] most [___] thing I've [___] on [___] subreddit today.",
        "OP, you [___] to [___] this to [___] local [___] immediately.",
        "I [___] this [___] [___] times and I'm still [___].",
        "My [___] did [___] exact [___] thing last [___] and [___] [___] [___]."
      ],
      correctUrl: 'https://www.reddit.com/r/tifu/comments/mock123/example_post/',
      originalComments: [
        "I can't believe the manager actually fired the entire team in front of everyone.",
        "This is the most ridiculous thing I've seen on this subreddit today.",
        "OP, you need to report this to the local authorities immediately.",
        "I read this story three times and I'm still confused.",
        "My friend did the exact same thing last week and got the same result."
      ],
      revealedWords: [
        ["the", "manager", "actually", "fired", "the", "entire", "team", "in", "front", "of", "everyone"],
        ["This", "is", "the", "most", "ridiculous", "thing", "I've", "seen", "on", "this", "subreddit", "today"],
        ["OP", "you", "need", "to", "report", "this", "to", "the", "local", "authorities", "immediately"],
        ["I", "read", "this", "story", "three", "times", "and", "I'm", "still", "confused"],
        ["My", "friend", "did", "the", "exact", "same", "thing", "last", "week", "and", "got", "the", "same", "result"]
      ]
    };
  }
}

// Get today's puzzle (from cache or generate new one)
async function getTodaysPuzzle(): Promise<PuzzleData> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const cacheKey = `puzzle_${today}`;

  try {
    // Try to get cached puzzle for today
    const cachedPuzzle = await redis.get(cacheKey);
    if (cachedPuzzle) {
      console.log('Using cached puzzle for', today);
      return JSON.parse(cachedPuzzle);
    }

    // Generate new puzzle for today with real Reddit data
    console.log('Generating new puzzle with real Reddit data for', today);
    const newPuzzle = await generateNewPuzzle();
    
    // Cache the puzzle for today (expires in 25 hours to ensure daily rotation)
    await redis.set(cacheKey, JSON.stringify(newPuzzle));
    await redis.expire(cacheKey, 25 * 60 * 60); // Set expiration separately
    
    return newPuzzle;
  } catch (error) {
    console.error('Error getting today\'s puzzle:', error);
    console.log('Falling back to mock data due to Redis/API error');
    // Return fallback puzzle
    return {
      comments: [
        "I can't believe [___] actually [___] [___] entire [___] in front of everyone.",
        "This is [___] most [___] thing I've [___] on [___] subreddit today.",
        "OP, you [___] to [___] this to [___] local [___] immediately.",
        "I [___] this [___] [___] times and I'm still [___].",
        "My [___] did [___] exact [___] thing last [___] and [___] [___] [___]."
      ],
      correctUrl: 'https://www.reddit.com/r/tifu/comments/mock123/example_post/',
      originalComments: [
        "I can't believe the manager actually fired the entire team in front of everyone.",
        "This is the most ridiculous thing I've seen on this subreddit today.",
        "OP, you need to report this to the local authorities immediately.",
        "I read this story three times and I'm still confused.",
        "My friend did the exact same thing last week and got the same result."
      ],
      revealedWords: [
        ["the", "manager", "actually", "fired", "the", "entire", "team", "in", "front", "of", "everyone"],
        ["This", "is", "the", "most", "ridiculous", "thing", "I've", "seen", "on", "this", "subreddit", "today"],
        ["OP", "you", "need", "to", "report", "this", "to", "the", "local", "authorities", "immediately"],
        ["I", "read", "this", "story", "three", "times", "and", "I'm", "still", "confused"],
        ["My", "friend", "did", "the", "exact", "same", "thing", "last", "week", "and", "got", "the", "same", "result"]
      ]
    };
  }
}

// Our game's API endpoint
router.get<{}, PuzzleData | { message: string }>('/api/puzzle', async (_req, res) => {
  try {
    const puzzle = await getTodaysPuzzle();
    res.json(puzzle);
  } catch (error) {
    console.error('API Puzzle Error:', error);
    res.status(500).json({ message: 'Failed to fetch puzzle data.' });
  }
});

// API endpoint to get revealed comments based on attempt number
router.post<{}, { comments: string[] } | { message: string }>('/api/reveal', async (req, res) => {
  try {
    const { attempts } = req.body;
    
    if (typeof attempts !== 'number' || attempts < 0 || attempts > 6) {
      return res.status(400).json({ message: 'Invalid attempts number' });
    }

    const puzzle = await getTodaysPuzzle();
    
    // Calculate how many words to reveal per comment based on attempts
    // More attempts = more words revealed
    const wordsPerComment = Math.min(attempts * 2, 8); // Max 8 words per comment
    
    const revealedComments = puzzle.comments.map((comment, index) => {
      const originalComment = puzzle.originalComments[index];
      const redactedWords = puzzle.revealedWords[index];
      
      if (wordsPerComment >= redactedWords.length) {
        return originalComment; // Show full comment if all words revealed
      }
      
      return revealWords(comment, redactedWords, wordsPerComment);
    });

    res.json({ comments: revealedComments });
  } catch (error) {
    console.error('API Reveal Error:', error);
    res.status(500).json({ message: 'Failed to reveal comments.' });
  }
});

// Post-creation routes from the original template
router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();
    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({ status: 'error', message: 'Failed to create post' });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();
    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({ status: 'error', message: 'Failed to create post' });
  }
});

// Code to start the server
app.use(router);
const port = getServerPort();
const server = createServer(app);
server.listen(port);