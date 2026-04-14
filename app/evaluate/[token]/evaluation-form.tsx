'use client'

import { useState } from 'react'
import { questions, categories, type Category } from '@/lib/assessment-data'

// Shortened evaluation - 20 questions (5 per pillar)
const evaluationQuestions = [
  // Discipline (5)
  { id: 1, text: "They show up early to practice and games.", category: "discipline" as Category },
  { id: 4, text: "They stick to their training routine even when they don't feel like it.", category: "discipline" as Category },
  { id: 6, text: "They listen carefully when coaches give instructions.", category: "discipline" as Category },
  { id: 9, text: "They complete drills with full effort, even when tired.", category: "discipline" as Category },
  { id: 13, text: "They respect team rules and expectations.", category: "discipline" as Category },
  
  // Ownership (5)
  { id: 14, text: "They take responsibility when they make a mistake.", category: "ownership" as Category },
  { id: 16, text: "They encourage teammates when they're struggling.", category: "ownership" as Category },
  { id: 18, text: "They lead by example, even when no one is watching.", category: "ownership" as Category },
  { id: 19, text: "They accept coaching feedback without making excuses.", category: "ownership" as Category },
  { id: 25, text: "They celebrate their teammates' successes genuinely.", category: "ownership" as Category },
  
  // Toughness (5)
  { id: 26, text: "They bounce back quickly after making an error.", category: "toughness" as Category },
  { id: 27, text: "They stay calm when the game is on the line.", category: "toughness" as Category },
  { id: 31, text: "They stay positive when the team is losing.", category: "toughness" as Category },
  { id: 33, text: "They compete hard regardless of the score.", category: "toughness" as Category },
  { id: 37, text: "They embrace challenges as opportunities to grow.", category: "toughness" as Category },
  
  // Sports IQ (5)
  { id: 39, text: "They anticipate what's going to happen next in a game.", category: "sportsiq" as Category },
  { id: 41, text: "They make quick decisions under pressure.", category: "sportsiq" as Category },
  { id: 42, text: "They adjust their approach based on the opponent.", category: "sportsiq" as Category },
  { id: 45, text: "They communicate effectively with teammates during play.", category: "sportsiq" as Category },
  { id: 50, text: "They see the bigger picture, not just their individual role.", category: "sportsiq" as Category },
]

interface EvaluationFormProps {
  requestId: string
  token: string
  evaluatorType: string
  athleteName: string
}

export function EvaluationForm({ requestId, token, evaluatorType, athleteName }: EvaluationFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  const currentQuestion = evaluationQuestions[currentIndex]
  const progress = ((currentIndex + 1) / evaluationQuestions.length) * 100
  
  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
    
    if (currentIndex < evaluationQuestions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 200)
    }
  }
  
  const handleSubmit = async () => {
    if (Object.keys(answers).length !== evaluationQuestions.length) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Calculate scores
      const categoryScores: Record<Category, { total: number; count: number }> = {
        discipline: { total: 0, count: 0 },
        ownership: { total: 0, count: 0 },
        toughness: { total: 0, count: 0 },
        sportsiq: { total: 0, count: 0 },
      }
      
      for (const question of evaluationQuestions) {
        const answer = answers[question.id] || 3
        categoryScores[question.category].total += answer
        categoryScores[question.category].count += 1
      }
      
      const scores = {
        discipline: Math.round((categoryScores.discipline.total / categoryScores.discipline.count) * 20),
        ownership: Math.round((categoryScores.ownership.total / categoryScores.ownership.count) * 20),
        toughness: Math.round((categoryScores.toughness.total / categoryScores.toughness.count) * 20),
        sportsiq: Math.round((categoryScores.sportsiq.total / categoryScores.sportsiq.count) * 20),
      }
      
      const overallScore = Math.round(
        (scores.discipline + scores.ownership + scores.toughness + scores.sportsiq) / 4
      )
      
      // Submit to API
      const response = await fetch('/api/verification/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          answers,
          scores,
          overallScore,
        }),
      })
      
      if (response.ok) {
        setIsComplete(true)
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isComplete) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black">Thank You!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your evaluation of {athleteName} has been submitted. Your feedback will help them understand their athletic mindset better.
        </p>
      </div>
    )
  }
  
  const allAnswered = Object.keys(answers).length === evaluationQuestions.length
  
  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{currentIndex + 1} of {evaluationQuestions.length}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Category Indicator */}
      <div className="text-center">
        <span className="px-4 py-1.5 bg-card border border-border rounded-full text-xs font-medium uppercase tracking-wider">
          {categories[currentQuestion.category].name}
        </span>
      </div>
      
      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <p className="text-xl md:text-2xl font-bold leading-relaxed">
          {currentQuestion.text}
        </p>
      </div>
      
      {/* Answer Options */}
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleAnswer(value)}
            className={`aspect-square rounded-xl border-2 transition-all font-bold text-xl
              ${answers[currentQuestion.id] === value
                ? 'bg-primary border-primary text-primary-foreground scale-105'
                : 'bg-card border-border hover:border-primary/50 hover:scale-105'
              }`}
          >
            {value}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Rarely</span>
        <span>Always</span>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {currentIndex < evaluationQuestions.length - 1 ? (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            disabled={!answers[currentQuestion.id]}
            className="px-6 py-3 bg-card border border-border rounded-full font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        )}
      </div>
      
      {/* Question Progress */}
      <div className="flex flex-wrap justify-center gap-2 pt-4">
        {evaluationQuestions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`w-8 h-8 rounded-full text-xs font-medium transition-all
              ${idx === currentIndex
                ? 'bg-primary text-primary-foreground'
                : answers[q.id]
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
