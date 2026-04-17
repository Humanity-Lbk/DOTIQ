import { create } from "zustand"
import type { Category } from "./assessment-data"

interface AssessmentState {
  currentQuestion: number
  answers: Record<number, number>
  isComplete: boolean
  setAnswer: (questionId: number, value: number) => void
  setAllAnswers: (answers: Record<number, number>) => void
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  completeAssessment: () => void
  resetAssessment: () => void
  calculateScores: () => {
    total: number
    categories: Record<Category, number>
  }
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  currentQuestion: 0,
  answers: {},
  isComplete: false,

  setAnswer: (questionId, value) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: value },
    }))
  },

  setAllAnswers: (newAnswers) => {
    set({ answers: newAnswers })
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestion: Math.min(state.currentQuestion + 1, 49),
    }))
  },

  prevQuestion: () => {
    set((state) => ({
      currentQuestion: Math.max(state.currentQuestion - 1, 0),
    }))
  },

  goToQuestion: (index) => {
    set({ currentQuestion: Math.max(0, Math.min(index, 49)) })
  },

  completeAssessment: () => {
    set({ isComplete: true })
  },

  resetAssessment: () => {
    set({
      currentQuestion: 0,
      answers: {},
      isComplete: false,
    })
  },

  calculateScores: () => {
    const { answers } = get()
    
    const categoryQuestions: Record<Category, number[]> = {
      discipline: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      ownership: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
      toughness: [26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
      sportsiq: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
    }

    const categoryScores: Record<Category, number> = {
      discipline: 0,
      ownership: 0,
      toughness: 0,
      sportsiq: 0,
    }

    for (const [category, questionIds] of Object.entries(categoryQuestions)) {
      const categoryAnswers = questionIds.map((id) => answers[id] || 1)
      const maxScore = questionIds.length * 10  // slider is 1–10
      const actualScore = categoryAnswers.reduce((sum, val) => sum + val, 0)
      // Produce a score on a 1–10 scale, capped at 10
      const raw = (actualScore / maxScore) * 10
      categoryScores[category as Category] = Math.min(Math.round(raw * 10) / 10, 10)
    }

    const totalAnswers = Object.values(answers)
    const maxTotal = 50 * 10  // slider is 1–10
    const actualTotal = totalAnswers.reduce((sum, val) => sum + val, 0)
    // Produce an overall score on a 1–10 scale, capped at 10
    const raw = (actualTotal / maxTotal) * 10
    const totalScore = Math.min(Math.round(raw * 10) / 10, 10)

    return {
      total: totalScore,
      categories: categoryScores,
    }
  },
}))
