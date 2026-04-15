export type QuestionType =
  | "text"
  | "multipleChoice"
  | "cardSelection"
  | "rating";

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  options?: { id: string; label: string; description?: string }[];
  placeholder?: string;
}

export type StepType =
  | {
      kind: "field";
      id: string;
      label: string;
      placeholder: string;
      type: "text" | "date" | "name" | "telegram" | "number" | "email" | "phone" | "pin";
      minValue?: number;
    }
  | { kind: "question"; question: Question };

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export const allSteps: StepType[] = [
  {
    kind: "field",
    id: "firstName",
    label: "What is your first name?",
    placeholder: "First Name",
    type: "name",
  },
  {
    kind: "field",
    id: "lastName",
    label: "What is your last name?",
    placeholder: "Last Name",
    type: "name",
  },
  {
    kind: "field",
    id: "dateOfBirth",
    label: "When is your birthday?",
    placeholder: "Date of Birth",
    type: "date",
  },
  {
    kind: "field",
    id: "telegramUsername",
    label: "What is your Telegram username?",
    placeholder: "@username",
    type: "telegram",
  },
  {
    kind: "question",
    question: {
      id: "skill-level",
      question: "What is your current skill level?",
      type: "cardSelection",
      options: [
        {
          id: "A",
          label: "Beginner",
          description: "I have no experience at all",
        },
        {
          id: "B",
          label: "Intermediate",
          description: "I have some hands-on experience",
        },
        {
          id: "C",
          label: "Expert",
          description: "I want to master advanced topics",
        },
      ],
    },
  },
  {
    kind: "field",
    id: "budget",
    label: "How much are you investing?",
    placeholder: "Enter amount",
    type: "number",
  },
  {
    kind: "question",
    question: {
      id: "payment-structure",
      question: "What is your preferred payment structure?",
      type: "multipleChoice",
      options: [
        { id: "monthly", label: "Monthly payments" },
        { id: "quarterly", label: "Quarterly payments" },
        { id: "upfront", label: "One-off payment (with discount)" },
      ],
    },
  },
  {
    kind: "field",
    id: "phone",
    label: "What is your phone number?",
    placeholder: "e.g. 09018464044",
    type: "phone",
  },
  {
    kind: "field",
    id: "email",
    label: "What is your email address?",
    placeholder: "you@example.com",
    type: "email",
  },
  {
    kind: "field",
    id: "pin",
    label: "Create a 6-digit login PIN",
    placeholder: "Enter 6 digits",
    type: "pin",
  },
].map((step) => {
  if (step.kind === "question") {
    const q = step.question!;
    if (q.id === "placeholder") {
      return { ...step, question: { ...q, id: toSlug(q.question) } };
    }
  }
  return step;
}) as StepType[];