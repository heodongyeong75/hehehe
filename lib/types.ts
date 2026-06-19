export interface Profile {
  username: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  scenario: string;
  createdAt: number;
}

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}
