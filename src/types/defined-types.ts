import type { Timestamp, FieldValue } from "firebase/firestore/lite";

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

export type User = {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  photo_URL: string;
};

export type Reply = {
  user: User;
  id: number;
  content: string;
  createdAt: number;
  updatedAt: number;
};
export type ReplyChanged = {
  user: User;
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type MockData = {
  user: User;
  post: {
    id: number;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
    replies: Reply[];
    answers: {
      user: User;
      id: number;
      content: string;
      createdAt: number;
      updatedAt: number;
      replies: Reply[];
    }[];
  };
}[];

export type MutatedQuestionData = [
  {
    user: User;
    post: {
      id: number;
      title?: string;
      content: string;
      createdAt: string;
      updatedAt: string;
      replies: {
        user: User;
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
      }[];
    };
  },
  {
    answers: {
      user: User;
      post: {
        id: number;
        content: string;
        createdAt: string;
        updatedAt: string;
        replies: {
          user: User;
          id: number;
          content: string;
          createdAt: string;
          updatedAt: string;
        }[];
      };
    }[];
  }
];

export type UserData = {
  displayName: string;
  email: string;
  emailVerified: boolean;
  createdAt: FieldValue;
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

export type ReplyData = {
  reply: string;
  uid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  displayName: string;
  username: string;
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
