export type Category = "discipline" | "ownership" | "toughness" | "sportsiq"

export interface Question {
  id: number
  text: string
  category: Category
}

export const categories: Record<Category, { name: string; description: string }> = {
  discipline: {
    name: "Discipline",
    description: "Consistency, preparation, and commitment to the process",
  },
  ownership: {
    name: "Ownership",
    description: "Accountability, leadership, and taking responsibility",
  },
  toughness: {
    name: "Toughness",
    description: "Mental resilience, grit, and composure under pressure",
  },
  sportsiq: {
    name: "Sports IQ",
    description: "Game awareness, decision-making, and adaptability",
  },
}

export const questions: Question[] = [
  // Discipline (13 questions)
  { id: 1, text: "I show up early to practice and games.", category: "discipline" },
  { id: 2, text: "I follow through on commitments I make to my team.", category: "discipline" },
  { id: 3, text: "I maintain focus during long practices.", category: "discipline" },
  { id: 4, text: "I stick to my training routine even when I don't feel like it.", category: "discipline" },
  { id: 5, text: "I prepare my equipment the night before games.", category: "discipline" },
  { id: 6, text: "I listen carefully when coaches give instructions.", category: "discipline" },
  { id: 7, text: "I avoid distractions during important team moments.", category: "discipline" },
  { id: 8, text: "I take care of my body with proper rest and nutrition.", category: "discipline" },
  { id: 9, text: "I complete drills with full effort, even when tired.", category: "discipline" },
  { id: 10, text: "I stay patient when learning new skills.", category: "discipline" },
  { id: 11, text: "I review game film or my performance regularly.", category: "discipline" },
  { id: 12, text: "I set goals and track my progress.", category: "discipline" },
  { id: 13, text: "I respect team rules and expectations.", category: "discipline" },

  // Ownership (12 questions)
  { id: 14, text: "I take responsibility when I make a mistake.", category: "ownership" },
  { id: 15, text: "I admit when I don't know something and ask for help.", category: "ownership" },
  { id: 16, text: "I encourage teammates when they're struggling.", category: "ownership" },
  { id: 17, text: "I speak up when something isn't right on the team.", category: "ownership" },
  { id: 18, text: "I lead by example, even when no one is watching.", category: "ownership" },
  { id: 19, text: "I accept coaching feedback without making excuses.", category: "ownership" },
  { id: 20, text: "I help new players feel welcome on the team.", category: "ownership" },
  { id: 21, text: "I take initiative to improve without being asked.", category: "ownership" },
  { id: 22, text: "I own my role on the team, whatever it is.", category: "ownership" },
  { id: 23, text: "I apologize when I let a teammate down.", category: "ownership" },
  { id: 24, text: "I hold myself to a higher standard than others expect.", category: "ownership" },
  { id: 25, text: "I celebrate my teammates' successes genuinely.", category: "ownership" },

  // Toughness (13 questions)
  { id: 26, text: "I bounce back quickly after making an error.", category: "toughness" },
  { id: 27, text: "I stay calm when the game is on the line.", category: "toughness" },
  { id: 28, text: "I perform well even when facing tough opponents.", category: "toughness" },
  { id: 29, text: "I don't let trash talk affect my performance.", category: "toughness" },
  { id: 30, text: "I push through fatigue during critical moments.", category: "toughness" },
  { id: 31, text: "I stay positive when the team is losing.", category: "toughness" },
  { id: 32, text: "I handle criticism without getting defensive.", category: "toughness" },
  { id: 33, text: "I compete hard regardless of the score.", category: "toughness" },
  { id: 34, text: "I recover quickly from disappointment.", category: "toughness" },
  { id: 35, text: "I stay focused when facing adversity.", category: "toughness" },
  { id: 36, text: "I don't make excuses when things go wrong.", category: "toughness" },
  { id: 37, text: "I embrace challenges as opportunities to grow.", category: "toughness" },
  { id: 38, text: "I maintain my composure when things don't go my way.", category: "toughness" },

  // Sports IQ (12 questions)
  { id: 39, text: "I anticipate what's going to happen next in a game.", category: "sportsiq" },
  { id: 40, text: "I understand my role in different game situations.", category: "sportsiq" },
  { id: 41, text: "I make quick decisions under pressure.", category: "sportsiq" },
  { id: 42, text: "I adjust my approach based on the opponent.", category: "sportsiq" },
  { id: 43, text: "I recognize patterns in the other team's play.", category: "sportsiq" },
  { id: 44, text: "I know when to take risks and when to play it safe.", category: "sportsiq" },
  { id: 45, text: "I communicate effectively with teammates during play.", category: "sportsiq" },
  { id: 46, text: "I learn from watching other players.", category: "sportsiq" },
  { id: 47, text: "I understand the strategy behind different plays.", category: "sportsiq" },
  { id: 48, text: "I adapt my game when my usual approach isn't working.", category: "sportsiq" },
  { id: 49, text: "I position myself well based on the game situation.", category: "sportsiq" },
  { id: 50, text: "I see the bigger picture, not just my individual role.", category: "sportsiq" },
]

export const answerOptions = [
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Almost Always" },
  { value: 5, label: "Always" },
]
