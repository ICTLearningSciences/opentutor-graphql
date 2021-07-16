/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import csvStringify from 'csv-stringify';
import mongoose, { Schema, Document, Model, Error } from 'mongoose';
import calculateScore from 'models/utils/calculate-score';
import { HasPaginate, pluginPagination } from './Paginatation';
import LessonModel, { Lesson } from './Lesson';
import UserModel, { User } from './User';

interface Expectation extends Document {
  expectationId: string;
  text: string;
}

const ExpectationSchema = new Schema({
  expectationId: { type: String },
  text: { type: String },
});

interface Question extends Document {
  text: string;
  expectations: [Expectation];
}

enum Grade {
  Good = 'Good',
  Bad = 'Bad',
  Neutral = 'Neutral',
}

const QuestionSchema = new Schema({
  text: { type: String },
  expectations: [ExpectationSchema],
});

export interface ExpectationScore extends Document {
  expectationId: string;
  invalidated: boolean;
  classifierGrade: Grade;
  graderGrade?: Grade;
}

const ExpectationScoreSchema = new Schema({
  expectationId: {
    type: String,
  },
  invalidated: { type: Boolean, default: false },
  classifierGrade: {
    type: String,
    enum: ['Good', 'Bad', 'Neutral'],
    default: 'Neutral',
  },
  graderGrade: {
    type: String,
    enum: ['Good', 'Bad', 'Neutral', null],
    default: null,
  },
});

interface Response extends Document {
  text: string;
  expectationScores: [ExpectationScore];
}

const ResponseSchema = new Schema({
  text: { type: String },
  expectationScores: [ExpectationScoreSchema],
});

export interface Session extends Document {
  sessionId: string;
  lessonId: string;
  lessonName: string;
  lessonCreatedBy: string;
  lastGradedBy: mongoose.Types.ObjectId;
  lastGradedByName: string;
  lastGradedAt: Date;
  username: string;
  graderGrade: number;
  classifierGrade: number;
  question: Question;
  userResponses: [Response];
  deleted: boolean;
}

export const SessionSchema = new Schema<Session>(
  {
    sessionId: { type: String, unique: true, required: '{PATH} is required!' },
    lessonId: { type: String, required: '{PATH} is required!' },
    lessonName: { type: String },
    lessonCreatedBy: { type: String },
    lastGradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastGradedByName: { type: String },
    lastGradedAt: { type: Date },
    username: { type: String },
    graderGrade: { type: Number },
    classifierGrade: { type: Number },
    question: { type: QuestionSchema },
    userResponses: [ResponseSchema],
    deleted: { type: Boolean },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

export interface GradingStats {
  Bad: number;
  Good: number;
  Neutral: number;
  total: number;
}

export interface TrainingData {
  data: GradingStats[];
  csv: string;
  isTrainable: boolean;
}

export interface TrainingDataAll {
  data: GradingStats;
  csv: string;
  isTrainable: boolean;
}

export interface SessionModel extends Model<Session>, HasPaginate<Session> {
  getTrainingData(lessonId: string): Promise<TrainingData>;

  getAllTrainingData(): Promise<TrainingData>;

  updateLesson(
    lessonId: string,
    updatedLesson: { lessonId: string; createdBy: string; name: string }
  ): void;

  setGrade(
    sessionId: string,
    userAnswerIndex: number,
    userExpectationIndex: number,
    grade: string,
    grader: User
  ): Promise<Session>;

  invalidateResponses(
    sessionId: string,
    responseId: string[],
    expectation: number,
    invalid: boolean
  ): Promise<Session>;
}

function _toCsv(data: string[][]): Promise<string> {
  return new Promise((resolve, reject) => {
    csvStringify(data, (err: Error, csv: string | PromiseLike<string>) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(csv);
      }
    });
  });
}

SessionSchema.statics.getAllTrainingData =
  async function (): Promise<TrainingDataAll> {
    const sessions: Session[] = await this.find({});
    const gradingStats = { Good: 0, Bad: 0, Neutral: 0, total: 0 };
    const lessons: Lesson[] = await LessonModel.find({});
    const trainingData = [['exp_num', 'text', 'label', 'exp_data']];
    sessions.forEach((session: Session) => {
      const lesson: Lesson = lessons.find((current: Lesson) => {
        return current.lessonId === session.lessonId;
      });
      if (!lesson && Array.isArray(lesson.expectations)) {
        return;
      }
      session.userResponses.forEach((response: Response) => {
        for (
          let expIx = 0;
          expIx < response.expectationScores.length;
          expIx++
        ) {
          const exp = response.expectationScores[expIx];
          const grade = exp.graderGrade;
          if (!exp.invalidated && grade) {
            gradingStats.total += 1;
            gradingStats[grade] += 1;
            // Classifier cannot use Neutral data
            if (grade === 'Neutral') {
              continue;
            }
            if (expIx >= lesson.expectations.length) {
              continue;
            }
            const expData = JSON.stringify({
              question: lesson.question,
              ideal: lesson.expectations[expIx].expectation,
            });
            trainingData.push([
              response.expectationScores[expIx].expectationId,
              response.text,
              grade,
              expData,
            ]);
          }
        }
      });
    });
    return {
      data: gradingStats,
      csv: await _toCsv(trainingData),
      // Does the lesson have enough data for training, based on these requirements:
      //   * At least 10 graded answers per expectation
      //   * At least 2 Good and 2 Bad answers per expectation
      isTrainable:
        gradingStats.total >= 10 &&
        gradingStats.Bad >= 2 &&
        gradingStats.Good >= 2,
    };
  };

SessionSchema.statics.getTrainingData = async function (
  lessonId: string
): Promise<TrainingData> {
  const lesson: Lesson = await LessonModel.findOne({ lessonId });
  if (!lesson && Array.isArray(lesson.expectations)) {
    throw new Error(`no lesson found for id '${lessonId}'`);
  }
  const sessions: Session[] = await this.find({ lessonId });
  const expectationGradingStats = lesson.expectations.map(() => {
    return { Good: 0, Bad: 0, Neutral: 0, total: 0 };
  });
  const trainingData = [['exp_num', 'text', 'label']];
  sessions.forEach((session: Session) => {
    session.userResponses.forEach((response: Response) => {
      for (let expIx = 0; expIx < response.expectationScores.length; expIx++) {
        if (expIx >= lesson.expectations.length) {
          continue;
        }
        const exp = response.expectationScores[expIx];
        const grade = exp.graderGrade;
        if (!exp.invalidated && grade) {
          expectationGradingStats[expIx].total += 1;
          expectationGradingStats[expIx][grade] += 1;
          // Classifier cannot use Neutral data
          if (grade !== 'Neutral') {
            trainingData.push([
              response.expectationScores[expIx].expectationId,
              response.text,
              grade,
            ]);
          }
        }
      }
    });
  });
  return {
    data: expectationGradingStats,
    csv: await _toCsv(trainingData),
    // Does the lesson have enough data for training, based on these requirements:
    //   * At least 10 graded answers per expectation
    //   * At least 2 Good and 2 Bad answers per expectation
    isTrainable: expectationGradingStats.every((exp) => {
      return exp.total >= 10 && exp.Bad >= 2 && exp.Good >= 2;
    }),
  };
};

SessionSchema.statics.updateLesson = async function (
  lessonId: string,
  updatedLesson: { lessonId?: string; createdBy?: string; name?: string }
) {
  const sessionUpdates: Partial<Session> = {};
  if (updatedLesson.lessonId) {
    sessionUpdates.lessonId = updatedLesson.lessonId;
  }
  if (updatedLesson.createdBy) {
    const createdBy = await UserModel.findOne({ _id: updatedLesson.createdBy });
    if (createdBy) {
      sessionUpdates.lessonCreatedBy = createdBy ? createdBy.name : '';
    }
  }
  if (updatedLesson.name) {
    sessionUpdates.lessonName = updatedLesson.name;
  }
  await this.updateMany(
    {
      lessonId: lessonId,
    },
    {
      $set: sessionUpdates,
    }
  );
};

SessionSchema.statics.setGrade = async function (
  sessionId: string,
  userAnswerIndex: number,
  userExpectationIndex: number,
  grade: string,
  grader: User
) {
  const session = await this.findOne({ sessionId: sessionId });
  if (!session) {
    throw new Error(`failed to find session with sessionId ${sessionId}`);
  }
  session.userResponses[userAnswerIndex].expectationScores[
    userExpectationIndex
  ].graderGrade = grade;
  const score = calculateScore(session);
  session.score = score;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changesAsSet: any = {};
  changesAsSet[
    `userResponses.${userAnswerIndex}.expectationScores.${userExpectationIndex}.graderGrade`
  ] = grade;
  changesAsSet['lastGradedBy'] = grader.id;
  changesAsSet['lastGradedByName'] = grader.name;
  changesAsSet['lastGradedAt'] = new Date();
  changesAsSet['graderGrade'] = score;
  return await this.findOneAndUpdate(
    {
      sessionId: sessionId,
    },
    {
      $set: changesAsSet,
    },
    {
      new: true,
    }
  );
};

SessionSchema.statics.invalidateResponses = async function (
  sessionId: string,
  responseIds: string[],
  expectation: number,
  invalid: boolean
) {
  const session: Session = await this.findOne({ sessionId: sessionId });
  if (!session) {
    throw new Error(`failed to find session with sessionId ${sessionId}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changesAsSet: any = {};
  const responses = session.userResponses;
  for (const rId of responseIds) {
    const rIdx = responses.findIndex((u) => `${u._id}` === rId);
    if (rIdx === -1) {
      continue;
    }
    const expectations = responses[rIdx].expectationScores;
    if (expectation > expectations.length - 1 || expectation < 0) {
      continue;
    }
    changesAsSet[
      `userResponses.${rIdx}.expectationScores.${expectation}.invalidated`
    ] = invalid;
  }
  return await this.findOneAndUpdate(
    {
      sessionId: sessionId,
    },
    {
      $set: changesAsSet,
    },
    {
      new: true,
    }
  );
};

SessionSchema.index({ lessonName: -1, _id: -1 });
SessionSchema.index({ lessonCreatedBy: -1, _id: -1 });
SessionSchema.index({ createdAt: -1, _id: -1 });
SessionSchema.index({ classifierGrade: -1, _id: -1 });
SessionSchema.index({ graderGrade: -1, _id: -1 });
SessionSchema.index({ lastGradedByName: -1, _id: -1 });
SessionSchema.index({ lastGradedAt: -1, _id: -1 });
pluginPagination(SessionSchema);

export default mongoose.model<Session, SessionModel>('Session', SessionSchema);
