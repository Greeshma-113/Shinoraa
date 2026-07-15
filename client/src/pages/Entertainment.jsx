import React, { useState } from 'react';
import { Gamepad2, Heart, RotateCcw, HelpCircle, HelpCircle as Dice, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const TRUTH_OR_DARES = [
  { type: 'truth', text: 'What was your very first impression of me? 🌸' },
  { type: 'dare', text: 'Sing the chorus of your favorite anime theme song! 🎵' },
  { type: 'truth', text: 'If we could travel anywhere in Japan tomorrow, where would we go? 🗺️' },
  { type: 'dare', text: 'Send a cute selfie right now! 📸' },
  { type: 'truth', text: 'What is a small habit of mine that makes you smile? 🥰' },
  { type: 'dare', text: 'Give me 3 compliments in a funny dramatic accent! 😂' }
];

const NEVER_HAVES = [
  "Never have I ever fallen asleep during a movie night with you. 💤",
  "Never have I ever re-read our chat messages when I missed you. ❤️",
  "Never have I ever bought a gift and couldn't wait, so I gave it early. 🎁",
  "Never have I ever pretended to like an anime just because you liked it. 🍿",
  "Never have I ever wanted to steal your favorite cozy hoodie. 🧥"
];

const WOULD_YOUS = [
  { a: 'Travel to Kyoto for Cherry Blossoms 🌸', b: 'Visit Tokyo at Night for Neon Lights 🌆' },
  { a: 'Have a cozy Kotatsu movie date at home 🍵', b: 'Go on a fancy arcade date night 🎮' },
  { a: 'Eat limitless sushi forever 🍣', b: 'Eat limitless ramen forever 🍜' }
];

const COIN_SIDES = ['🌸 SAKURA', '🪙 GOLD'];

const MEMORY_CARDS = ['🍣', '🍜', '🍡', '🍵', '🌸', '🦊', '🍣', '🍜', '🍡', '🍵', '🌸', '🦊'];

export default function Entertainment() {
  const [activeGame, setActiveGame] = useState('menu'); // menu, truth, compatibility, bottle, dice, coin, memory, tictactoe

  // 1. Truth or Dare state
  const [todIdx, setTodIdx] = useState(0);
  const [revealTod, setRevealTod] = useState(false);

  // 2. Compatibility state
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [compatScore, setCompatScore] = useState(null);

  // 3. Spin Bottle state
  const [bottleAngle, setBottleAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [bottleResult, setBottleResult] = useState('');

  // 4. Dice Roll state
  const [diceNum, setDiceNum] = useState(1);
  const [rollingDice, setRollingDice] = useState(false);

  // 5. Coin Flip state
  const [coinSide, setCoinSide] = useState('🌸 SAKURA');
  const [flippingCoin, setFlippingCoin] = useState(false);

  // 6. Memory Match state
  const [cards, setCards] = useState([]);
  const [flippedIdxs, setFlippedIdxs] = useState([]);
  const [matchedIdxs, setMatchedIdxs] = useState([]);

  // 7. Tic Tac Toe state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // Helper to trigger compatibility math
  const calculateCompatibility = (e) => {
    e.preventDefault();
    if (!partner1Name || !partner2Name) return;
    const score = Math.floor(Math.random() * 21) + 80; // 80 - 100% compatibility
    setCompatScore(score);
    confetti({ particleCount: 80, spread: 60, colors: ['#FFC1CC', '#FF7693'] });
  };

  // Spin the bottle logic
  const spinBottle = () => {
    if (spinning) return;
    setSpinning(true);
    const newAngle = bottleAngle + 1080 + Math.floor(Math.random() * 360);
    setBottleAngle(newAngle);
    
    setTimeout(() => {
      setSpinning(false);
      const isPartner1 = (newAngle % 360) < 180;
      setBottleResult(isPartner1 ? 'Points to: Partner 1 🌸' : 'Points to: Partner 2 ✨');
      confetti({ particleCount: 30 });
    }, 2000);
  };

  // Dice roll logic
  const rollDice = () => {
    if (rollingDice) return;
    setRollingDice(true);
    let interval = setInterval(() => {
      setDiceNum(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setDiceNum(Math.floor(Math.random() * 6) + 1);
      setRollingDice(false);
    }, 1000);
  };

  // Coin flip logic
  const flipCoin = () => {
    if (flippingCoin) return;
    setFlippingCoin(true);
    let interval = setInterval(() => {
      setCoinSide(COIN_SIDES[Math.floor(Math.random() * 2)]);
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      setCoinSide(COIN_SIDES[Math.floor(Math.random() * 2)]);
      setFlippingCoin(false);
      confetti({ particleCount: 20 });
    }, 1200);
  };

  // Memory match logic
  const startMemoryGame = () => {
    const shuffled = [...MEMORY_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIdxs([]);
    setMatchedIdxs([]);
    setActiveGame('memory');
  };

  const handleCardClick = (idx) => {
    if (flippedIdxs.length === 2 || flippedIdxs.includes(idx) || matchedIdxs.includes(idx)) return;
    const newFlipped = [...flippedIdxs, idx];
    setFlippedIdxs(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatchedIdxs([...matchedIdxs, ...newFlipped]);
        setFlippedIdxs([]);
        if (matchedIdxs.length + 2 === cards.length) {
          setTimeout(() => {
            confetti({ particleCount: 100 });
            alert('Congratulations! You matched all cozy items! 🍡');
          }, 500);
        }
      } else {
        setTimeout(() => setFlippedIdxs([]), 1000);
      }
    }
  };

  // Tic Tac Toe logic
  const handleTicClick = (idx) => {
    if (board[idx] || calculateTicWinner(board)) return;
    const newBoard = [...board];
    newBoard[idx] = isXNext ? '🌸' : '⭐';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winner = calculateTicWinner(newBoard);
    if (winner) {
      confetti({ particleCount: 50 });
    }
  };

  const calculateTicWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const ticWinner = calculateTicWinner(board);

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 py-6 w-full flex flex-col items-center justify-center select-none">
      
      {/* Menu / Game board shell */}
      {activeGame === 'menu' ? (
        <div className="w-full">
          <div className="text-center mb-8">
            <h2 className="font-kosugi text-2xl font-bold text-sakura-600 dark:text-sakura-400 flex items-center justify-center gap-2">
              <Gamepad2 size={24} /> Cozy Couple Arcade
            </h2>
            <p className="text-xs text-slate-500 mt-1">Play mini games and challenge each other</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            
            <button
              onClick={() => { setTodIdx(0); setRevealTod(false); setActiveGame('truth'); }}
              className="glass-card p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">🃏</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Truth or Dare</h4>
              <p className="text-[10px] text-slate-400">Sweet prompts & fun challenges</p>
            </button>

            <button
              onClick={() => { setCompatScore(null); setActiveGame('compatibility'); }}
              className="glass-card p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">💖</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Love Compatibility</h4>
              <p className="text-[10px] text-slate-400">Calculate your sakura score</p>
            </button>

            <button
              onClick={() => { setBottleAngle(0); setBottleResult(''); setActiveGame('bottle'); }}
              className="glass-card p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">🍾</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Spin the Bottle</h4>
              <p className="text-[10px] text-slate-400">Who goes first spinner</p>
            </button>

            <button
              onClick={() => { setDiceNum(1); setActiveGame('dice'); }}
              className="glass-card p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">🎲</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Dice Roller</h4>
              <p className="text-[10px] text-slate-400">Roll for decisions</p>
            </button>

            <button
              onClick={() => { setCoinSide('🌸 SAKURA'); setActiveGame('coin'); }}
              className="glass-card p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">🪙</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Coin Toss</h4>
              <p className="text-[10px] text-slate-400">Sakura vs Gold coin flip</p>
            </button>

            <button
              onClick={startMemoryGame}
              className="glass-card p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">🍡</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Memory Match</h4>
              <p className="text-[10px] text-slate-400">Match the kawaii treats</p>
            </button>

            <button
              onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); setActiveGame('tictactoe'); }}
              className="glass-card col-span-2 md:col-span-1 p-5 hover:bg-sakura-50/50 dark:hover:bg-slate-800/40 border-pink-100 flex flex-col items-center gap-3 active:scale-95 transition-all text-center"
            >
              <span className="text-3xl">⭕❌</span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Tic Tac Toe</h4>
              <p className="text-[10px] text-slate-400">Cherry vs Star match</p>
            </button>

          </div>
        </div>
      ) : (
        /* Back to Menu container */
        <div className="w-full max-w-md">
          <button 
            onClick={() => setActiveGame('menu')}
            className="text-xs text-sakura-500 hover:underline mb-4 font-bold flex items-center gap-1"
          >
            ← Back to Arcade Menu
          </button>

          {/* 1. Truth or Dare */}
          {activeGame === 'truth' && (
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800 text-center flex flex-col items-center gap-5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sakura-400">
                {TRUTH_OR_DARES[todIdx].type} card
              </span>
              
              <div className="min-h-36 bg-pink-50/50 dark:bg-slate-900/50 border border-pink-100 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-center w-full">
                <p className="font-kosugi text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                  {revealTod ? TRUTH_OR_DARES[todIdx].text : 'Click reveal to read prompt! 🃏'}
                </p>
              </div>

              <div className="flex gap-2 w-full">
                {!revealTod ? (
                  <button onClick={() => setRevealTod(true)} className="btn-sakura flex-1 py-3 text-xs">Reveal Prompt</button>
                ) : (
                  <button 
                    onClick={() => { setTodIdx((prev) => (prev + 1) % TRUTH_OR_DARES.length); setRevealTod(false); }} 
                    className="btn-sakura flex-1 py-3 text-xs"
                  >
                    Next Prompt
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. Love Compatibility */}
          {activeGame === 'compatibility' && (
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800 text-center">
              <h3 className="font-kosugi font-bold text-lg text-sakura-600 mb-4">💖 Compatibility Calculator</h3>
              
              <form onSubmit={calculateCompatibility} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Partner 1 Name"
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="glass-input text-center text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Partner 2 Name"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="glass-input text-center text-xs"
                  required
                />
                <button type="submit" className="btn-sakura py-3 text-xs">Calculate Love Percentage</button>
              </form>

              {compatScore !== null && (
                <div className="mt-6 p-4 bg-pink-100/30 rounded-2xl border border-pink-100 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-sakura-500">{compatScore}%</span>
                  <span className="text-xs text-slate-500 font-bold mt-1">🌸 A Match Made in Heaven! 🌸</span>
                </div>
              )}
            </div>
          )}

          {/* 3. Spin the Bottle */}
          {activeGame === 'bottle' && (
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800 text-center flex flex-col items-center gap-6">
              <h3 className="font-kosugi font-bold text-lg text-sakura-600">🍾 Spin the Bottle</h3>

              {/* Animated bottle */}
              <div className="w-48 h-48 rounded-full border-2 border-dashed border-pink-200 flex items-center justify-center relative bg-pink-50/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="w-32 h-32 transition-transform duration-[2000ms] ease-out"
                  style={{ transform: `rotate(${bottleAngle}deg)` }}
                >
                  {/* Sakura Bottle illustration */}
                  <rect x="44" y="10" width="12" height="25" rx="3" fill="#FF7693" />
                  <path d="M30 35 L70 35 L70 90 L30 90 Z" rx="10" fill="#FFC1CC" />
                  <circle cx="50" cy="62" r="10" fill="#FFFFFF" opacity="0.6" />
                </svg>
                <div className="absolute top-2 text-[10px] font-bold text-slate-400">P2</div>
                <div className="absolute bottom-2 text-[10px] font-bold text-slate-400">P1</div>
              </div>

              <p className="text-xs font-bold text-slate-500">{bottleResult || 'Click button below to spin!'}</p>

              <button
                onClick={spinBottle}
                disabled={spinning}
                className="btn-sakura w-full py-3 text-xs"
              >
                {spinning ? 'Spinning...' : 'Spin Bottle 🍾'}
              </button>
            </div>
          )}

          {/* 4. Dice Roller */}
          {activeGame === 'dice' && (
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800 text-center flex flex-col items-center gap-6">
              <h3 className="font-kosugi font-bold text-lg text-sakura-600">🎲 Dice Roller</h3>

              <div className={`w-24 h-24 bg-white dark:bg-slate-900 border-2 border-pink-200 rounded-3xl shadow flex items-center justify-center text-4xl font-extrabold text-sakura-500 transition-all ${
                rollingDice ? 'animate-bounce scale-90' : ''
              }`}>
                {diceNum}
              </div>

              <button
                onClick={rollDice}
                disabled={rollingDice}
                className="btn-sakura w-full py-3 text-xs"
              >
                {rollingDice ? 'Rolling...' : 'Roll Dice'}
              </button>
            </div>
          )}

          {/* 5. Coin Toss */}
          {activeGame === 'coin' && (
            <div className="glass-panel p-6 border-pink-200 dark:border-slate-800 text-center flex flex-col items-center gap-6">
              <h3 className="font-kosugi font-bold text-lg text-sakura-600">🪙 Coin Toss</h3>

              <div className={`w-24 h-24 bg-gradient-to-tr from-amber-300 to-yellow-500 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-xs font-bold text-white transition-all ${
                flippingCoin ? 'animate-spin scale-75' : ''
              }`}>
                {coinSide}
              </div>

              <button
                onClick={flipCoin}
                disabled={flippingCoin}
                className="btn-sakura w-full py-3 text-xs"
              >
                {flippingCoin ? 'Flipping...' : 'Toss Coin'}
              </button>
            </div>
          )}

          {/* 6. Memory Match */}
          {activeGame === 'memory' && (
            <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 text-center flex flex-col items-center gap-4">
              <h3 className="font-kosugi font-bold text-lg text-sakura-600">🍡 Memory Match</h3>

              <div className="grid grid-cols-4 gap-2.5 w-full">
                {cards.map((card, idx) => {
                  const isFlipped = flippedIdxs.includes(idx) || matchedIdxs.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCardClick(idx)}
                      className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                        isFlipped 
                          ? 'bg-pink-100 text-slate-800 dark:bg-pink-900/30' 
                          : 'bg-sakura-500 text-transparent hover:bg-sakura-600'
                      }`}
                    >
                      {isFlipped ? card : '🌸'}
                    </button>
                  );
                })}
              </div>

              <button onClick={startMemoryGame} className="text-xs text-sakura-500 font-bold flex items-center gap-1">
                <RotateCcw size={12} /> Reset Game
              </button>
            </div>
          )}

          {/* 7. Tic Tac Toe */}
          {activeGame === 'tictactoe' && (
            <div className="glass-panel p-5 border-pink-200 dark:border-slate-800 text-center flex flex-col items-center gap-4">
              <h3 className="font-kosugi font-bold text-lg text-sakura-600">⭕ Tic Tac Toe ❌</h3>
              
              <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
                {board.map((sq, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTicClick(idx)}
                    className="aspect-square bg-pink-100/50 dark:bg-slate-900/40 border border-pink-100 dark:border-slate-800 rounded-xl text-xl flex items-center justify-center font-bold text-sakura-500"
                  >
                    {sq}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-slate-500 mt-2">
                {ticWinner 
                  ? `Winner: ${ticWinner}! 🎉` 
                  : board.every(s => s) 
                    ? "It's a draw!" 
                    : `Next turn: ${isXNext ? '🌸 (X)' : '⭐ (O)'}`
                }
              </div>

              <button 
                onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); }}
                className="text-xs text-sakura-500 font-bold flex items-center gap-1"
              >
                <RotateCcw size={12} /> Reset Game
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
