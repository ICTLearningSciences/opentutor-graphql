/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaginatedResolveResult } from './PaginatedResolveResult';

interface Hint extends Document {
  text: string;
}

const HintSchema = new Schema({
  text: { type: String },
});

interface LessonExpectation extends Document {
  expectation: string;
  hints: [Hint];
}

const LessonExpectationSchema = new Schema({
  expectation: { type: String },
  hints: { type: [HintSchema] },
});

export interface Lesson extends Document {
  lessonId: string;
  name: string;
  intro: string;
  question: string;
  expectations: [LessonExpectation];
  conclusion: [string];
  createdBy: string;
  lastTrainedAt: Date;
}

export const LessonSchema = new Schema(
  {
    lessonId: { type: String, required: '{PATH} is required!' },
    name: { type: String },
    intro: { type: String },
    question: { type: String },
    expectations: { type: [LessonExpectationSchema] },
    conclusion: { type: [String] },
    createdBy: { type: String },
    lastTrainedAt: { type: Date },
  },
  { timestamps: true }
);

export interface LessonModel extends Model<Lesson> {
  paginate(
    query?: any,
    options?: any,
    callback?: any
  ): Promise<PaginatedResolveResult<Lesson>>;
}

LessonSchema.index({
  name: -1,
  createdBy: -1,
  createdAt: -1,
  _id: -1,
});
LessonSchema.plugin(require('mongo-cursor-pagination').mongoosePlugin);

export default mongoose.model<Lesson, LessonModel>('Lesson', LessonSchema);
