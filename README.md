# 🕵️ Comment Cascade

A Reddit-based word-guessing game where players try to identify famous Reddit posts based on progressively revealed comments. Built on Reddit's Devvit platform, this game combines the thrill of deduction with the authentic content that makes Reddit special.

## How It Works

**Comment Cascade** presents players with redacted comments from real Reddit posts. Your mission: guess the original Reddit post URL! 

- **Start**: See 5 redacted comments with key words hidden as `[___]`
- **Guess**: Enter what you think is the Reddit post URL
- **Reveal**: Each wrong guess reveals more words from the comments
- **Win**: Correctly identify the post to win the game!

The game features a **progressive reveal system** similar to Wordle - making each wrong guess more helpful than the last, while still maintaining the challenge.

## Project Story

### The Vision
The idea for Comment Cascade emerged from a simple observation: Reddit's comment sections often contain the most interesting and revealing content about a post. What if we could turn this into a game? A game where players use their knowledge of Reddit culture, subreddit patterns, and comment context to solve puzzles.

### Development Journey

#### **Sprint 1: Foundation & Core Mechanics**
The project began with building a solid foundation using Reddit's Devvit platform:

- **Project Setup**: Created the app using `npx create-devvit-app@latest --template=react`
- **Backend Architecture**: Implemented Express.js server with Reddit API integration
- **Frontend Development**: Built React-based UI with TypeScript for type safety
- **Game Logic**: Developed the core puzzle generation and validation system
- **Redaction System**: Created intelligent text redaction that preserves context while hiding key details

#### **Sprint 2: Dynamic Content & Progressive Reveals**
The second phase focused on making the game truly dynamic and engaging:

- **Real Reddit Integration**: Replaced mock data with live Reddit posts and comments
- **Subreddit Curation**: Selected 10 text-focused subreddits for optimal puzzle content:
  - AskReddit, TIFU, TodayILearned, ExplainLikeImFive
  - UnpopularOpinion, AmItheAsshole, Relationship_Advice
  - LifeProTips, Showerthoughts, MildlyInfuriating
- **Progressive Reveal System**: Implemented Wordle-style word revelation based on incorrect guesses
- **Daily Puzzle System**: Added Redis caching for consistent daily puzzles across all users
- **Error Handling**: Built robust fallback systems for API failures

#### **Technical Challenges & Solutions**

**Challenge 1: Reddit API Integration**
- **Problem**: Initial attempts to fetch Reddit data were failing silently
- **Solution**: Implemented comprehensive error handling and multiple API call methods
- **Result**: Reliable data fetching from 10+ subreddits with real-time content

**Challenge 2: Dynamic Puzzle Generation**
- **Problem**: Ensuring puzzles were challenging but solvable
- **Solution**: Developed intelligent redaction algorithms that preserve context while hiding key identifiers
- **Result**: Balanced difficulty with engaging gameplay

**Challenge 3: Performance & Caching**
- **Problem**: Reddit API rate limits and slow response times
- **Solution**: Implemented Redis-based daily puzzle caching
- **Result**: Fast, responsive gameplay with reduced API calls

**Challenge 4: Progressive Reveal Logic**
- **Problem**: Creating a fair and engaging reveal system
- **Solution**: Built word-tracking system that reveals words in order of importance
- **Result**: Each wrong guess provides meaningful hints without spoiling the answer

### Current State: Production Ready

The app is now fully functional with:
- ✅ **Real Reddit Data**: Live posts and comments from curated subreddits
- ✅ **Progressive Difficulty**: 6 attempts with increasing word reveals
- ✅ **Daily Puzzles**: Same puzzle for all users throughout the day
- ✅ **Robust Error Handling**: Graceful fallback to mock data if needed
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Performance Optimized**: Redis caching and efficient API usage

## Technical Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for immersive games
- **[React](https://react.dev/)**: Modern UI framework with hooks and state management
- **[Express.js](https://expressjs.com/)**: Backend API server with middleware support
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development across client and server
- **[Redis](https://redis.io/)**: In-memory caching for daily puzzle persistence
- **[Vite](https://vite.dev/)**: Fast build tool for development and production
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework

## Game Features

### Core Gameplay
- **5 Redacted Comments**: Carefully selected from real Reddit posts
- **6 Attempts**: Progressive difficulty with word reveals
- **URL Validation**: Smart matching of Reddit post URLs
- **Real-time Feedback**: Immediate response to guesses

### Technical Features
- **Daily Puzzle Rotation**: New puzzle every 24 hours
- **Cross-Platform**: Works on any Reddit subreddit
- **Responsive Design**: Optimized for all screen sizes
- **Error Recovery**: Graceful handling of API failures

## Deployment

The app is currently in **playtest mode** and ready for production deployment:

### Current Status
- **Development**: ✅ Complete
- **Testing**: ✅ Playtest mode active
- **Production Ready**: ✅ Yes
- **Next Step**: Submit to Reddit App Store

### Deployment Process
1. **Final Testing**: Thorough testing in playtest environment
2. **App Store Submission**: Submit to Reddit for review
3. **Reddit Review**: 1-2 week review process
4. **Public Launch**: Available to all Reddit users worldwide

## Try It Now

**Playtest Version**: [https://www.reddit.com/r/comment_cascade_dev2/?playtest=comment-cascade](https://www.reddit.com/r/comment_cascade_dev2/?playtest=comment-cascade)

## Future Enhancements

- **Leaderboards**: Track high scores and streaks
- **Difficulty Levels**: Easy, Medium, Hard modes
- **Hint System**: Optional hints for struggling players
- **Achievements**: Unlock badges for different accomplishments
- **Social Features**: Share scores and compete with friends

## Contributing

This project was built as a demonstration of Reddit's Devvit platform capabilities. The codebase showcases:
- Modern React patterns with hooks and state management
- Server-side API development with Express.js
- Real-time data integration with external APIs
- Caching strategies for performance optimization
- Type-safe development practices

## License

This project is licensed under the MIT License.