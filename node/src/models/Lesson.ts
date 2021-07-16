/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import { HasPaginate, pluginPagination } from './Paginatation';
import UserModel, { User, UserRole } from './User';
import { v4 as uuidv4 } from 'uuid';

export interface UpdateHint {
  text: string;
}

export interface UpdateLessonExpectation {
  expectationId: string;
  expectation: string;
  features: any;
  hints: UpdateHint[];
}

export interface UpdateLesson {
  lessonId: string;
  name: string;
  intro: string;
  dialogCategory: string;
  question: string;
  image: string;
  expectations: UpdateLessonExpectation[];
  conclusion: string[];
  lastTrainedAt: Date;
  features: any;
  createdBy: string;
  deleted: boolean;
}

interface Hint extends Document {
  text: string;
}

const HintSchema = new Schema({
  text: { type: String },
});

export interface LessonExpectation extends Document {
  expectationId: string;
  expectation: string;
  features: Features;
  hints: [Hint];
}

const LessonExpectationSchema = new Schema({
  expectationId: { type: String },
  expectation: { type: String },
  features: { type: Object },
  hints: { type: [HintSchema] },
});

export type Features = Record<string, unknown>;

export interface Lesson extends Document {
  lessonId: string;
  name: string;
  intro: string;
  dialogCategory: string;
  question: string;
  image: string;
  expectations: [LessonExpectation];
  conclusion: [string];
  lastTrainedAt: Date;
  features: Features;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  deleted: boolean;
}

export const LessonSchema = new Schema(
  {
    lessonId: { type: String, required: true, unique: true },
    name: { type: String },
    intro: { type: String },
    dialogCategory: { type: String },
    question: { type: String },
    image: { type: String },
    expectations: { type: [LessonExpectationSchema] },
    conclusion: { type: [String] },
    lastTrainedAt: { type: Date },
    features: { type: Object },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
    deleted: { type: Boolean },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

export interface LessonModel extends Model<Lesson>, HasPaginate<Lesson> {
  findAndUpdateLessonById(
    lessonId: string,
    lessonDoc: UpdateLesson
  ): Promise<Lesson>;

  userCanEdit(
    user: User,
    lesson: { createdBy: string | mongoose.Types.ObjectId }
  ): boolean;
}

/**
 * Update a lesson, setting any of it's provided props
 * This is functionally the same as mongoose findOneAndUpdate,
 * but enforces lesson-specific rules. Always use this and not findOneAndUpdate
 */
LessonSchema.statics.findAndUpdateLessonById = async function (
  lessonId: string,
  lessonUpdates: UpdateLesson
): Promise<Lesson> {
  const updateDoc = {
    ...lessonUpdates,
  } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (updateDoc.lessonId && !updateDoc.lessonId?.match(/^[a-z0-9\-]+$/)) {
    throw new Error('lessonId must match [a-z0-9-]');
  }
  if (updateDoc.expectations) {
    (updateDoc.expectations as UpdateLessonExpectation[]).forEach((element) => {
      if (!element.expectationId) element.expectationId = uuidv4().toString();
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (mongoose.model('Session') as any).updateLesson(lessonId, updateDoc);
  if (updateDoc.createdBy) {
    const createdBy = await UserModel.findOne({ _id: updateDoc.createdBy });
    if (createdBy) {
      updateDoc.createdByName = createdBy.name;
    }
  }
  return await this.findOneAndUpdate(
    {
      lessonId: lessonId,
    },
    {
      $set: updateDoc,
    },
    {
      new: true, // return the updated doc rather than pre update
      upsert: true,
    }
  );
};

LessonSchema.statics.userCanEdit = function (
  user: User,
  lesson: { createdBy: string }
) {
  return (
    user.userRole === UserRole.ADMIN ||
    user.userRole === UserRole.CONTENT_MANAGER ||
    `${user._id}` === `${lesson.createdBy}`
  );
};

LessonSchema.index({ name: -1, _id: -1 });
LessonSchema.index({ createdByName: -1, _id: -1 });
LessonSchema.index({ createdAt: -1, _id: -1 });
pluginPagination(LessonSchema);

export default mongoose.model<Lesson, LessonModel>('Lesson', LessonSchema);
