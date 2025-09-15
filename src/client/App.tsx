// src/client/App.tsx

import { useState, useEffect } from 'react';
import type { PuzzleData, GameState } from '../shared/types/puzzle.js'; 

export const App = () => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('Enter a full Reddit URL to guess.');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [displayedComments, setDisplayedComments] = useState<string[]>([]);

  // Use useEffect to fetch data when the component loads
  useEffect(() => {
    fetch('/api/puzzle')
      .then(response => response.json())
      .then(data => {
        setPuzzle(data);
        setDisplayedComments(data.comments); // Start with redacted comments
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch puzzle:", error);
        setLoading(false);
      });
  }, []);

  // Function to update displayed comments based on attempts
  const updateDisplayedComments = async (attemptCount: number) => {
    try {
      const response = await fetch('/api/reveal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attempts: attemptCount }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDisplayedComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to reveal comments:', error);
    }
  };

  // Standard React form submission handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!puzzle || gameWon) return;
    
    const normalize = (url: string) => url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    
    if (normalize(guess) === normalize(puzzle.correctUrl)) {
      setFeedback('Correct! You got it! 🎉');
      setGameWon(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 6) {
        setFeedback('Game Over! The correct answer was: ' + puzzle.correctUrl);
        // Show full comments on game over
        setDisplayedComments(puzzle.originalComments);
      } else {
        setFeedback(`That is not the correct post. Try again! (${newAttempts}/6 attempts)`);
        // Update displayed comments with more revealed words
        await updateDisplayedComments(newAttempts);
      }
    }
  };

  if (loading) { 
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>🕵️</div>
          <p style={{ 
            fontSize: '18px', 
            color: '#333',
            fontWeight: '600',
            margin: 0
          }}>Loading Puzzle...</p>
        </div>
      </div>
    ); 
  }
  
  if (!puzzle) { 
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <p style={{ fontSize: '18px', color: '#333', fontWeight: '600', margin: 0 }}>
            Error: Could not load puzzle data.
          </p>
        </div>
      </div>
    ); 
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        .slide-in {
          animation: slideIn 0.4s ease-out;
        }
      `}</style>
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
      <div className="fade-in-up" style={{
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: '#2c3e50',
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🕵️ Comment Cascade
          </h1>
          <p style={{ 
            color: '#7f8c8d',
            fontSize: '1.1rem',
            fontWeight: '500',
            margin: '0 0 20px 0'
          }}>
            Guess the Reddit post based on these redacted comments!
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f8f9fa',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: '#6c757d',
            fontWeight: '600'
          }}>
            <span>Attempts: {attempts}/6</span>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: attempts >= 6 ? '#dc3545' : attempts >= 4 ? '#ffc107' : '#28a745'
            }}></div>
          </div>
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '16px',
          padding: '24px',
          margin: '30px 0',
          border: '2px solid #e9ecef',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57)',
            borderRadius: '16px 16px 0 0'
          }}></div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '8px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ff6b6b'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4ecdc4'
            }}></div>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#45b7d1'
            }}></div>
            <span style={{
              marginLeft: '8px',
              fontSize: '0.9rem',
              color: '#6c757d',
              fontWeight: '600'
            }}>Reddit Comments</span>
          </div>
          {displayedComments.map((comment: string, index: number) => (
            <div key={index} className="slide-in" style={{
              backgroundColor: 'white',
              padding: '16px',
              margin: '12px 0',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              position: 'relative',
              animationDelay: `${index * 0.1}s`
            }}>
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                bottom: '0',
                width: '4px',
                background: `linear-gradient(180deg, ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][index % 5]}, ${['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][index % 5]}80)`,
                borderRadius: '12px 0 0 12px'
              }}></div>
              <p style={{ 
                fontSize: '15px', 
                lineHeight: '1.6',
                margin: '0',
                color: '#2c3e50',
                fontWeight: '500',
                paddingLeft: '12px'
              }}>
                {comment}
              </p>
            </div>
          ))}
        </div>

        {!gameWon && attempts < 6 && (
          <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginBottom: '20px',
              flexDirection: 'column'
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Paste Reddit post URL here..."
                  style={{ 
                    padding: '16px 20px', 
                    fontSize: '16px', 
                    width: '100%',
                    border: '2px solid #e9ecef',
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff6b6b';
                    e.target.style.boxShadow = '0 4px 20px rgba(255, 107, 107, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>🔗</div>
              </div>
              <button 
                type="submit" 
                style={{ 
                  padding: '16px 32px', 
                  fontSize: '16px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.3)';
                }}
              >
                🎯 Make Guess
              </button>
            </div>
          </form>
        )}
      
        <div style={{ 
          marginTop: '30px', 
          padding: '24px',
          background: gameWon 
            ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
            : attempts >= 6 
            ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' 
            : 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
          border: `2px solid ${gameWon ? '#c3e6cb' : attempts >= 6 ? '#f5c6cb' : '#bee5eb'}`,
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: gameWon 
              ? 'linear-gradient(90deg, #28a745, #20c997)' 
              : attempts >= 6 
              ? 'linear-gradient(90deg, #dc3545, #fd7e14)' 
              : 'linear-gradient(90deg, #17a2b8, #6f42c1)',
            borderRadius: '16px 16px 0 0'
          }}></div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '12px',
            flexWrap: 'wrap',
            width: '100%'
          }}>
            <div style={{
              fontSize: '24px'
            }}>
              {gameWon ? '🎉' : attempts >= 6 ? '😞' : '💡'}
            </div>
            <p style={{ 
              margin: 0, 
              fontWeight: '700',
              fontSize: '18px',
              color: gameWon ? '#155724' : attempts >= 6 ? '#721c24' : '#0c5460',
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              maxWidth: '100%'
            }}>
              {feedback}
            </p>
          </div>
          {gameWon && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#155724',
              fontWeight: '600'
            }}>
              🏆 Congratulations! You solved the puzzle!
            </div>
          )}
          {attempts >= 6 && !gameWon && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              fontSize: '14px',
              color: '#721c24',
              fontWeight: '600'
            }}>
              💭 Better luck next time! The puzzle resets daily.
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};