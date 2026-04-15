'use client'

import { useState, useEffect } from 'react'
import { questions, categories, type Category, answerScale } from '@/lib/assessment-data'
import { cn } from '@/lib/utils'

interface EvaluationFormProps {
  requestId: string
  token: string
  evaluatorType: string
  athleteName: string
}

type Step = 'intro' | 'questions' | 'account' | 'submitting' | 'complete'
type RelationType = 'coach' | 'parent' | 'peer' | 'mentor'

const relationTypes: { type: RelationType; label: string }[] = [
  { type: 'coach', label: 'Coach' },
  { type: 'parent', label: 'Parent' },
  { type: 'peer', label: 'Peer / Teammate' },
  { type: 'mentor', label: 'Mentor / Trainer' },
]

export function EvaluationForm({ requestId, token, evaluatorType, athleteName }: EvaluationFormProps) {
  const [step, setStep] = useState<Step>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [sliderValue, setSliderValue] = useState(5)
  const [hasInteracted, setHasInteracted] = useState(false)
  
  // Evaluator info
  const [relation, setRelation] = useState<RelationType>(evaluatorType as RelationType || 'coach')
  const [evaluatorName, setEvaluatorName] = useState('')
  const [evaluatorEmail, setEvaluatorEmail] = useState('')
  const [createAccount, setCreateAccount] = useState(true)
  
  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  
  // Reset slider when question changes
  useEffect(() => {
    setSliderValue(answers[currentQuestion?.id] || 5)
    setHasInteracted(!!answers[currentQuestion?.id])
  }, [currentIndex, currentQuestion?.id, answers])
  
  const handleSliderChange = (value: number) => {
    setSliderValue(value)
    setHasInteracted(true)
  }
  
  const handleConfirm = () => {
    if (!hasInteracted) return
    
    setAnswers({ ...answers, [currentQuestion.id]: sliderValue })
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setStep('account')
    }
  }
  
  const handleSubmit = async () => {
    if (!evaluatorName) return
    
    setStep('submitting')
    
    try {
      // Calculate scores
      const categoryScores: Record<Category, { total: number; count: number }> = {
        discipline: { total: 0, count: 0 },
        ownership: { total: 0, count: 0 },
        toughness: { total: 0, count: 0 },
        sportsiq: { total: 0, count: 0 },
      }
      
      for (const question of questions) {
        const answer = answers[question.id] || 5
        categoryScores[question.category].total += answer
        categoryScores[question.category].count += 1
      }
      
      const scores = {
        discipline: parseFloat((categoryScores.discipline.total / categoryScores.discipline.count).toFixed(1)),
        ownership: parseFloat((categoryScores.ownership.total / categoryScores.ownership.count).toFixed(1)),
        toughness: parseFloat((categoryScores.toughness.total / categoryScores.toughness.count).toFixed(1)),
        sportsiq: parseFloat((categoryScores.sportsiq.total / categoryScores.sportsiq.count).toFixed(1)),
      }
      
      const overallScore = parseFloat(
        ((scores.discipline + scores.ownership + scores.toughness + scores.sportsiq) / 4).toFixed(1)
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
          evaluatorEmail: evaluatorEmail || undefined,
          evaluatorFullName: evaluatorName,
          evaluatorRelation: relation,
          createAccount: createAccount && !!evaluatorEmail,
        }),
      })
      
      if (response.ok) {
        setStep('complete')
      } else {
        setStep('account')
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error)
      setStep('account')
    }
  }
  
  // Get question text with athlete name
  const getQuestionText = () => {
    if (!currentQuestion) return ''
    // Replace "They/Their/Them" with athlete name
    return currentQuestion.textThirdPerson
      .replace(/^They /g, `${athleteName} `)
      .replace(/ they /g, ` ${athleteName} `)
      .replace(/^Their /g, `${athleteName}'s `)
      .replace(/ their /g, ` ${athleteName}'s `)
      .replace(/ them /g, ` ${athleteName} `)
      .replace(/ them\./g, ` ${athleteName}.`)
  }
  
  // Determine slider color based on value
  const getSliderColor = (value: number) => {
    if (value <= 3) return 'from-rose-500 to-rose-400'
    if (value <= 5) return 'from-amber-500 to-yellow-400'
    if (value <= 7) return 'from-primary to-primary'
    return 'from-emerald-500 to-emerald-400'
  }
  
  // Intro screen - select relation and start
  if (step === 'intro') {
    return (
      <div className="space-y-8">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-2">Your Relationship to {athleteName}</h2>
            <p className="text-sm text-muted-foreground">
              Select the option that best describes your relationship:
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {relationTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setRelation(type)}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  relation === type
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <span className="font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold">How this works:</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              <span>Answer 50 questions about {athleteName}&apos;s athletic mindset</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              <span>Rate each statement from 1 (Never) to 10 (Always)</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              <span>Your honest feedback helps verify their DOTIQ score</span>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            Estimated time: 8-12 minutes
          </p>
        </div>
        
        <button
          onClick={() => setStep('questions')}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          Start Evaluation
        </button>
      </div>
    )
  }
  
  // Questions screen
  if (step === 'questions' && currentQuestion) {
    return (
      <div className="space-y-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{currentIndex + 1} of {questions.length}</span>
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
        <div className="bg-card border border-border rounded-2xl p-8">
          <p className="text-lg md:text-xl font-bold leading-relaxed text-center">
            {getQuestionText()}
          </p>
        </div>
        
        {/* Sliding Scale */}
        <div className={cn(
          "space-y-6 p-6 rounded-2xl border-2 transition-all duration-300",
          hasInteracted 
            ? "bg-card/60 border-primary/30" 
            : "bg-card/40 border-border/50"
        )}>
          {/* Value display */}
          <div className="flex items-center justify-center">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300",
              hasInteracted ? "bg-primary/15" : "bg-muted/50"
            )}>
              <span className={cn(
                "text-3xl font-black transition-colors duration-300",
                hasInteracted ? "text-primary" : "text-muted-foreground"
              )}>
                {sliderValue}
              </span>
            </div>
          </div>

          {/* Slider */}
          <div className="relative px-2">
            {/* Track background */}
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-3 bg-muted/50 rounded-full" />
            
            {/* Filled track */}
            <div 
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 h-3 rounded-full bg-gradient-to-r transition-all duration-150",
                getSliderColor(sliderValue)
              )}
              style={{ width: `${((sliderValue - 1) / 9) * 100}%` }}
            />

            {/* Actual slider input */}
            <input
              type="range"
              min={answerScale.min}
              max={answerScale.max}
              value={sliderValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className={cn(
                "relative w-full h-8 appearance-none bg-transparent cursor-pointer z-10",
                "focus:outline-none",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7",
                "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white",
                "[&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary",
                "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab",
                "[&::-webkit-slider-thumb]:active:cursor-grabbing",
                "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110",
                "[&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7",
                "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white",
                "[&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-primary",
                "[&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:cursor-grab"
              )}
            />

            {/* Number indicators */}
            <div className="flex justify-between mt-3 px-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleSliderChange(num)}
                  className={cn(
                    "w-6 h-6 rounded-full text-xs font-semibold transition-all duration-200",
                    "hover:bg-primary/20 hover:text-primary",
                    sliderValue === num 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between text-sm px-1">
            <span className="text-muted-foreground">Never</span>
            <span className="text-muted-foreground">Sometimes</span>
            <span className="text-muted-foreground">Always</span>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!hasInteracted}
          className={cn(
            "w-full py-4 rounded-xl font-semibold text-base transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
            hasInteracted
              ? "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {currentIndex < questions.length - 1 ? 'Next Question' : 'Continue to Finish'}
        </button>
        
        {/* Navigation */}
        {currentIndex > 0 && (
          <button
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Previous Question
          </button>
        )}
      </div>
    )
  }
  
  // Account creation screen
  if (step === 'account') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black">Almost Done!</h2>
          <p className="text-muted-foreground">
            Enter your information to complete the evaluation
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={evaluatorEmail}
              onChange={(e) => setEvaluatorEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Optional — used to create your DOTIQ account
            </p>
          </div>
          
          {evaluatorEmail && (
            <label className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
              />
              <div>
                <span className="font-medium">Create my DOTIQ account</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Get your own dashboard to take assessments and see who you&apos;ve evaluated
                </p>
              </div>
            </label>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!evaluatorName}
          className={cn(
            "w-full py-4 rounded-xl font-bold text-base transition-all duration-200",
            evaluatorName
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          Submit Evaluation
        </button>
      </div>
    )
  }
  
  // Submitting screen
  if (step === 'submitting') {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <p className="text-muted-foreground">Submitting your evaluation...</p>
      </div>
    )
  }
  
  // Complete screen
  return (
    <div className="text-center space-y-6 py-12">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-black">Thank You!</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Your evaluation of {athleteName} has been submitted. Your feedback will help them understand their athletic mindset better.
      </p>
      
      {createAccount && evaluatorEmail && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-sm">
          <p className="font-medium text-primary">Account created!</p>
          <p className="text-muted-foreground mt-1">
            Check your email ({evaluatorEmail}) to set up your password and access your dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
