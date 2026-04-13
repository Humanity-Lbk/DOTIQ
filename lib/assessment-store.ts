import { create } from "zustand"
import type { Category } from "./assessment-data"

interface AssessmentState {
  currentQuestion: number
  answers: Record<number, number>
  isComplete: boolean
  setAnswer: (questionId: number, value: number) => void
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
      const categoryAnswers = questionIds.map((id) => answers[id] || 0)
      const maxScore = questionIds.length * 5
      const actualScore = categoryAnswers.reduce((sum, val) => sum + val, 0)
      categoryScores[category as Category] = Math.round((actualScore / maxScore) * 100)
    }

    const totalAnswers = Object.values(answers)
    const maxTotal = 50 * 5
    const actualTotal = totalAnswers.reduce((sum, val) => sum + val, 0)
    const totalScore = Math.round((actualTotal / maxTotal) * 100)

    return {
      total: totalScore,
      categories: categoryScores,
    }
  },
}))
