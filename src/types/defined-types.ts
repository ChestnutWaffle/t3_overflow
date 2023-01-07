import { type Timestamp } from "firebase-admin/firestore";

export type Question = {
  id: string;
  createdAt: number;
  tags: string[];
  title: string;
  uid: string;
  user: {
    displayName: string;
    photoURL: string;
    username: string;
  };
};

export type UserData = {
  displayName: string;
  email: string;
  emailVerified: boolean;
  createdAt: Timestamp;
  photoURL: string;
  uid: string;
  username: string;
};

export type QuestionData = {
  createdAt: Timestamp;
  detail: string;
  slug: string;
  tags: string[];
  title: string;
  uid: string;
  updatedAt: Timestamp;
  likes: number;
};

export type AnswerData = {
  createdAt: Timestamp;
  detail: string;
  questionUid: string;
  uid: string;
  updatedAt: Timestamp;
  likes: number;
};

export type AnswerResult = {
  id: string;
  createdAt: number;
  upvote: boolean;
  downvote: boolean;
  detail: string;
  uid: string;
  updatedAt: number;
  likes: number;
  user: {
    username: string;
    photoURL: string;
    displayName: string;
  };
};

export type ReplyResult = {
  id: string;
  reply: string;
  uid: string;
  createdAt: number;
  updatedAt: number;
  displayName: string;
  username: string;
};
