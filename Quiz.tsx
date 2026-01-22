
import React, { useState } from 'react';
import { QuizQuestion } from './types';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (idx === questions[currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const passed = score >= questions.length * 0.7;
    return (
      <div className="text-center p-12 bg-white rounded-3xl shadow-xl border-4 border-sky-200">
        <Trophy className={`mx-auto mb-6 ${passed ? 'text-yellow-400' : 'text-slate-300'}`} size={80} />
        <h2 className="text-4xl font-heading text-slate-800 mb-2">
          {passed ? 'Awesome Job!' : 'Keep Practicing!'}
        </h2>
        <p className="text-xl text-slate-600 mb-8 font-medium">
          You scored {score} out of {questions.length}!
        </p>
        <button 
          onClick={onComplete}
          className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 px-12 rounded-2xl text-xl transition-all hover:scale-105"
        >
          {passed ? 'Unlock Next Module' : 'Continue Lesson'}
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl border-4 border-sky-100">
      <div className="flex justify-between items-center mb-8">
        <span className="bg-sky-100 text-sky-700 px-4 py-1 rounded-full text-sm font-bold">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
        {q.question}
      </h3>

      <div className="grid gap-4">
        {q.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={isAnswered}
            className={`p-5 rounded-2xl text-left font-bold transition-all flex justify-between items-center border-2
              ${isAnswered && i === q.correctAnswer ? 'bg-green-100 border-green-500 text-green-700' : 
                isAnswered && i === selectedAnswer ? 'bg-red-100 border-red-500 text-red-700' :
                selectedAnswer === i ? 'bg-sky-100 border-sky-500 text-sky-700' : 'bg-slate-50 border-slate-200 hover:border-sky-300'}
            `}
          >
            {option}
            {isAnswered && i === q.correctAnswer && <CheckCircle className="text-green-500" />}
            {isAnswered && i === selectedAnswer && i !== q.correctAnswer && <XCircle className="text-red-500" />}
          </button>
        ))}
      </div>

      {isAnswered && (
        <button 
          onClick={nextQuestion}
          className="mt-10 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all"
        >
          Next Question
        </button>
      )}
    </div>
  );
};
