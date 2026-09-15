export interface ElirSource {
  id: string;
  name: string;
  page: number;
  score: number;
  quote: string;
}

export type ElirMessageRole = 'user' | 'elir';

export interface ElirMessage {
  id: string;
  role: ElirMessageRole;
  text: string;
  sources?: ElirSource[];
  streaming?: boolean;
}

export interface ElirConversation {
  id: string;
  title: string;
  courseRef?: string;
  startedAt: string;
  messages: ElirMessage[];
}

export interface ElirAnswerTemplate {
  match: RegExp;
  text: string;
  sources: ElirSource[];
}

export interface ElirAnalysis {
  summary: string;
  objectives: string[];
  activities: string[];
  dates: string[];
  tasks: string[];
}

export type ElirQuestionType = 'multiple' | 'truefalse' | 'open';

export interface ElirQuizQuestion {
  id: string;
  type: ElirQuestionType;
  question: string;
  options?: string[];
  correct?: string;
  feedback: string;
}

export interface ElirQuiz {
  title: string;
  topic: string;
  questions: ElirQuizQuestion[];
}

export const createElirConversation = (
  welcomeText: string,
  overrides: Partial<Omit<ElirConversation, 'messages'>> = {},
): ElirConversation => ({
  id: `conv-${Date.now()}`,
  title: 'Nueva conversación',
  startedAt: new Date().toISOString().slice(0, 10),
  messages: [{ id: 'msg-0', role: 'elir', text: welcomeText }],
  ...overrides,
});
