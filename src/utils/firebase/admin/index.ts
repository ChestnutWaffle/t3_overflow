import { apps } from "firebase-admin";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAcc = JSON.parse(
  process.env.ADMIN_FIREBASE_SERVICE_ACC_KEY as string
);

if (!apps.length) {
  initializeApp(
    {
      credential: cert(serviceAcc),
    },
    "only"
  );
}

export const app = getApp("only");
export const db = getFirestore(app) as FirebaseFirestore.Firestore;
export const adminAuth = getAuth(app);

export const writeBatch = () => db.batch();

export const usersColl = db.collection("users");

export const userDoc = (user: string) => usersColl.doc(user);

export const questionsColl = (user: string) =>
  userDoc(user).collection("questions");

export const questionDoc = (user: string, question: string) =>
  questionsColl(user).doc(question);

export const questionReplyColl = (user: string, question: string) =>
  questionDoc(user, question).collection("replies");

export const questionReplyDoc = (
  user: string,
  question: string,
  replyId: string
) => questionReplyColl(user, question).doc(replyId);

export const questionUpvotesColl = (user: string, question: string) =>
  questionDoc(user, question).collection("upvotes");

export const questionUpvoteDoc = (
  user: string,
  question: string,
  sessionUser: string
) => questionUpvotesColl(user, question).doc(sessionUser);

export const questionDownvotesColl = (user: string, question: string) =>
  questionDoc(user, question).collection("downvotes");

export const questionDownvoteDoc = (
  user: string,
  question: string,
  sessionUser: string
) => questionDownvotesColl(user, question).doc(sessionUser);

export const answerColl = (user: string, question: string) =>
  questionDoc(user, question).collection("answers");

export const answerDoc = (user: string, question: string, answer: string) =>
  answerColl(user, question).doc(answer);

export const answerReplyColl = (
  user: string,
  question: string,
  answer: string
) => answerDoc(user, question, answer).collection("replies");

export const answerReplyDoc = (
  user: string,
  question: string,
  answer: string,
  replyId: string
) => answerReplyColl(user, question, answer).doc(replyId);

export const answerUpvotesColl = (
  user: string,
  question: string,
  answer: string
) => answerDoc(user, question, answer).collection("upvotes");

export const answerUpvoteDoc = (
  user: string,
  question: string,
  answer: string,
  sessionUser: string
) => answerUpvotesColl(user, question, answer).doc(sessionUser);

export const answerDownvotesColl = (
  user: string,
  question: string,
  answer: string
) => answerDoc(user, question, answer).collection("downvotes");

export const answerDownvoteDoc = (
  user: string,
  question: string,
  answer: string,
  sessionUser: string
) => answerDownvotesColl(user, question, answer).doc(sessionUser);

export const tagsColl = db.collection("tags");

export const tagsDoc = (tagname: string) => tagsColl.doc(tagname);

export const questionsCollGrp = db.collectionGroup("questions");
export const answersCollGrp = db.collectionGroup("answers");
export const repliesCollGrp = db.collectionGroup("replies");

export const docWithPath = (path: string) => db.doc(path);
