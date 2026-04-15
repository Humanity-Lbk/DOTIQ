export type Category = "discipline" | "ownership" | "toughness" | "sportsiq"

export interface Question {
  id: number
  text: string
  // Third-person version for evaluators
  textThirdPerson: string
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

// New 50 questions from DOTIQ Assessment (randomized order from PDF)
// Each question has a first-person version (self) and third-person version (evaluator)
export const questions: Question[] = [
  // 1-10: Mixed categories
  { 
    id: 1, 
    text: "I understand how pressure situations change what decisions I should make.", 
    textThirdPerson: "They understand how pressure situations change what decisions they should make.",
    category: "sportsiq" 
  },
  { 
    id: 2, 
    text: "I handle pressure situations with a clear mind and remain calm.", 
    textThirdPerson: "They handle pressure situations with a clear mind and remain calm.",
    category: "toughness" 
  },
  { 
    id: 3, 
    text: "I stay disciplined throughout the year even if I don't feel motivated.", 
    textThirdPerson: "They stay disciplined throughout the year even if they don't feel motivated.",
    category: "discipline" 
  },
  { 
    id: 4, 
    text: "When I don't execute the way I wanted, I immediately address it and don't avoid it.", 
    textThirdPerson: "When they don't execute the way they wanted, they immediately address it and don't avoid it.",
    category: "ownership" 
  },
  { 
    id: 5, 
    text: "I am aware of everyone on the field and understand their role; not just my own role.", 
    textThirdPerson: "They are aware of everyone on the field and understand their role; not just their own role.",
    category: "sportsiq" 
  },
  { 
    id: 6, 
    text: "When the team struggles, I step up to find a solution and get us back to the right mindset.", 
    textThirdPerson: "When the team struggles, they step up to find a solution and get the team back to the right mindset.",
    category: "ownership" 
  },
  { 
    id: 7, 
    text: "I do not allow one bad play, game, or performance to carry into the next opportunity.", 
    textThirdPerson: "They do not allow one bad play, game, or performance to carry into the next opportunity.",
    category: "toughness" 
  },
  { 
    id: 8, 
    text: "I stay committed to my responsibility even when no one is watching.", 
    textThirdPerson: "They stay committed to their responsibility even when no one is watching.",
    category: "discipline" 
  },
  { 
    id: 9, 
    text: "My daily routines are geared towards long-term development, not just short-term results.", 
    textThirdPerson: "Their daily routines are geared towards long-term development, not just short-term results.",
    category: "discipline" 
  },
  { 
    id: 10, 
    text: "After a mistake/error/penalty, I focus on what I can correct.", 
    textThirdPerson: "After a mistake/error/penalty, they focus on what they can correct.",
    category: "ownership" 
  },
  
  // 11-20
  { 
    id: 11, 
    text: "During competition I know where to be and what to do without someone reminding me.", 
    textThirdPerson: "During competition they know where to be and what to do without someone reminding them.",
    category: "sportsiq" 
  },
  { 
    id: 12, 
    text: "I stay mentally engaged even when I face adversity and things are not going my way.", 
    textThirdPerson: "They stay mentally engaged even when they face adversity and things are not going their way.",
    category: "toughness" 
  },
  { 
    id: 13, 
    text: "I continually focus on growth, even when it is difficult or inconvenient.", 
    textThirdPerson: "They continually focus on growth, even when it is difficult or inconvenient.",
    category: "discipline" 
  },
  { 
    id: 14, 
    text: "I make the right decision even when emotions are high or the game speeds up.", 
    textThirdPerson: "They make the right decision even when emotions are high or the game speeds up.",
    category: "sportsiq" 
  },
  { 
    id: 15, 
    text: "I do not become defensive and accept feedback after mistakes are made.", 
    textThirdPerson: "They do not become defensive and accept feedback after mistakes are made.",
    category: "ownership" 
  },
  { 
    id: 16, 
    text: "I continue to grind and focus on my development even when things would be easier somewhere else.", 
    textThirdPerson: "They continue to grind and focus on their development even when things would be easier somewhere else.",
    category: "toughness" 
  },
  { 
    id: 17, 
    text: "I remain committed to my growth during long stretches when I feel like my hard work is not paying off.", 
    textThirdPerson: "They remain committed to their growth during long stretches when they feel like their hard work is not paying off.",
    category: "toughness" 
  },
  { 
    id: 18, 
    text: "I stay prepared even when I'm not getting the opportunity I thought I would.", 
    textThirdPerson: "They stay prepared even when they're not getting the opportunity they thought they would.",
    category: "discipline" 
  },
  { 
    id: 19, 
    text: "I complete required work (training, school, preparation, etc) without needing reminders.", 
    textThirdPerson: "They complete required work (training, school, preparation, etc) without needing reminders.",
    category: "discipline" 
  },
  { 
    id: 20, 
    text: "I quickly acknowledge my errors and mistakes, and work diligently to correct them.", 
    textThirdPerson: "They quickly acknowledge their errors and mistakes, and work diligently to correct them.",
    category: "ownership" 
  },
  
  // 21-30
  { 
    id: 21, 
    text: "Outside of structured team practices, I am consistent with strength, conditioning, nutrition, and recovery.", 
    textThirdPerson: "Outside of structured team practices, they are consistent with strength, conditioning, nutrition, and recovery.",
    category: "discipline" 
  },
  { 
    id: 22, 
    text: "I naturally take a leadership role during difficult moments or stretches without being asked.", 
    textThirdPerson: "They naturally take a leadership role during difficult moments or stretches without being asked.",
    category: "ownership" 
  },
  { 
    id: 23, 
    text: "In the heat of competition, I recognize small details that others often miss.", 
    textThirdPerson: "In the heat of competition, they recognize small details that others often miss.",
    category: "sportsiq" 
  },
  { 
    id: 24, 
    text: "In game, I clearly communicate the situation and what needs to be done with my teammates.", 
    textThirdPerson: "In game, they clearly communicate the situation and what needs to be done with their teammates.",
    category: "sportsiq" 
  },
  { 
    id: 25, 
    text: "When I make a mistake, my first response is to take responsibility rather than give an excuse.", 
    textThirdPerson: "When they make a mistake, their first response is to take responsibility rather than give an excuse.",
    category: "ownership" 
  },
  { 
    id: 26, 
    text: "I'm always thinking ahead during the game rather than reacting in the moment.", 
    textThirdPerson: "They're always thinking ahead during the game rather than reacting in the moment.",
    category: "sportsiq" 
  },
  { 
    id: 27, 
    text: "I stay patient with my growth and development even when success is delayed.", 
    textThirdPerson: "They stay patient with their growth and development even when success is delayed.",
    category: "toughness" 
  },
  { 
    id: 28, 
    text: "I stay engaged and mentally tough through slumps or bad games that last longer than expected.", 
    textThirdPerson: "They stay engaged and mentally tough through slumps or bad games that last longer than expected.",
    category: "toughness" 
  },
  { 
    id: 29, 
    text: "When I'm challenged through a rough stretch, I look inward before blaming external factors.", 
    textThirdPerson: "When they're challenged through a rough stretch, they look inward before blaming external factors.",
    category: "ownership" 
  },
  { 
    id: 30, 
    text: "The way I respond to a mistake increases trust from coaches and teammates.", 
    textThirdPerson: "The way they respond to a mistake increases trust from coaches and teammates.",
    category: "ownership" 
  },
  
  // 31-40
  { 
    id: 31, 
    text: "I hold myself accountable even when no one calls me out.", 
    textThirdPerson: "They hold themselves accountable even when no one calls them out.",
    category: "ownership" 
  },
  { 
    id: 32, 
    text: "My on and off the field behavior positively influence teammates.", 
    textThirdPerson: "Their on and off the field behavior positively influences teammates.",
    category: "discipline" 
  },
  { 
    id: 33, 
    text: "In the game I understand when to be aggressive and when to be patient.", 
    textThirdPerson: "In the game they understand when to be aggressive and when to be patient.",
    category: "sportsiq" 
  },
  { 
    id: 34, 
    text: "Understanding game situations comes easy to me and I adjust my decisions accordingly.", 
    textThirdPerson: "Understanding game situations comes easy to them and they adjust their decisions accordingly.",
    category: "sportsiq" 
  },
  { 
    id: 35, 
    text: "I take care of my responsibilities (Academics, supplemental training, family, etc) and manage my time effectively when I'm away from the game or practice.", 
    textThirdPerson: "They take care of their responsibilities (Academics, supplemental training, family, etc) and manage their time effectively when away from the game or practice.",
    category: "discipline" 
  },
  { 
    id: 36, 
    text: "Instead of disengaging or getting frustrated, I respond to mistakes with decisive positive action.", 
    textThirdPerson: "Instead of disengaging or getting frustrated, they respond to mistakes with decisive positive action.",
    category: "toughness" 
  },
  { 
    id: 37, 
    text: "When momentum turns in the game, I remain steady and composed.", 
    textThirdPerson: "When momentum turns in the game, they remain steady and composed.",
    category: "toughness" 
  },
  { 
    id: 38, 
    text: "I prepare with the same intent regardless of my recent performance or current role on the team.", 
    textThirdPerson: "They prepare with the same intent regardless of their recent performance or current role on the team.",
    category: "discipline" 
  },
  { 
    id: 39, 
    text: "I understand that my nutrition takes planning and sacrifice, and I take that seriously.", 
    textThirdPerson: "They understand that their nutrition takes planning and sacrifice, and they take that seriously.",
    category: "discipline" 
  },
  { 
    id: 40, 
    text: "Experience and situational awareness are a way that I am able to slow the game down.", 
    textThirdPerson: "Experience and situational awareness are a way that they are able to slow the game down.",
    category: "sportsiq" 
  },
  
  // 41-50
  { 
    id: 41, 
    text: "I quickly process information during live competition to make the best decision or play.", 
    textThirdPerson: "They quickly process information during live competition to make the best decision or play.",
    category: "sportsiq" 
  },
  { 
    id: 42, 
    text: "I compete with the same intensity even with limited opportunities.", 
    textThirdPerson: "They compete with the same intensity even with limited opportunities.",
    category: "toughness" 
  },
  { 
    id: 43, 
    text: "After a tough moment, I recover emotionally faster than most of my teammates.", 
    textThirdPerson: "After a tough moment, they recover emotionally faster than most of their teammates.",
    category: "toughness" 
  },
  { 
    id: 44, 
    text: "I remain committed to my development even when I'm not getting the results I'd like to see.", 
    textThirdPerson: "They remain committed to their development even when they're not getting the results they'd like to see.",
    category: "discipline" 
  },
  { 
    id: 45, 
    text: "I am tenacious even when the path forward requires patience.", 
    textThirdPerson: "They are tenacious even when the path forward requires patience.",
    category: "toughness" 
  },
  { 
    id: 46, 
    text: "I consistently make the right play rather than the flashy one.", 
    textThirdPerson: "They consistently make the right play rather than the flashy one.",
    category: "sportsiq" 
  },
  { 
    id: 47, 
    text: "After making a mistake, I reset quickly and am fully ready for the next play.", 
    textThirdPerson: "After making a mistake, they reset quickly and are fully ready for the next play.",
    category: "toughness" 
  },
  { 
    id: 48, 
    text: "I can explain game situations clearly to teammates.", 
    textThirdPerson: "They can explain game situations clearly to teammates.",
    category: "sportsiq" 
  },
  { 
    id: 49, 
    text: "I recognize patterns in opponents and use them to the advantage of myself or team.", 
    textThirdPerson: "They recognize patterns in opponents and use them to the advantage of themselves or their team.",
    category: "sportsiq" 
  },
  { 
    id: 50, 
    text: "Before the play develops, I consistently anticipate what might happen.", 
    textThirdPerson: "Before the play develops, they consistently anticipate what might happen.",
    category: "sportsiq" 
  },
]

// 1-10 scale for sliding scale
export const answerScale = {
  min: 1,
  max: 10,
  labels: {
    1: "Never",
    5: "Sometimes",
    10: "Always"
  }
}

// Legacy answer options (kept for backwards compatibility)
export const answerOptions = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Usually" },
  { value: 6, label: "Frequently" },
  { value: 7, label: "Most of the time" },
  { value: 8, label: "Very often" },
  { value: 9, label: "Almost always" },
  { value: 10, label: "Always" },
]
