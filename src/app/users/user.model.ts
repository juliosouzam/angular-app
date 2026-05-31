export type UserId = string;

export interface User {
  id: UserId;
  name: string;
  email: string;
  phone: string;
}

export type UserDraft = Omit<User, 'id'>;
