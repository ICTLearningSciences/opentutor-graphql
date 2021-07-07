/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLBoolean,
  GraphQLID,
  GraphQLFloat,
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import LessonType from 'gql/types/lesson';
import {
  Lesson as LessonModel,
  Session as SessionModel,
  User as UserModel,
} from 'models';
import { Lesson } from 'models/Lesson';
import { User } from 'models/User';
import { Training } from 'gql/types/training';
import { DateType } from 'gql/types/date';

export interface UpdateHint {
  text: string;
}

export interface UpdateLessonExpectation {
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
  lastTraining: Training;
  features: any;
  createdBy: string;
  deleted: boolean;
}

export const UpdateHintInputType = new GraphQLInputObjectType({
  name: 'UpdateHintInputType',
  fields: () => ({
    text: { type: GraphQLString },
  }),
});

export const UpdateLessonExpectationInputType = new GraphQLInputObjectType({
  name: 'UpdateLessonExpectationInputType',
  fields: () => ({
    expectation: { type: GraphQLString },
    features: { type: GraphQLJSON },
    hints: { type: GraphQLList(UpdateHintInputType) },
  }),
});

export const TrainingInputType = new GraphQLInputObjectType({
  name: 'TrainingInputType',
  fields: () => ({
    trainedAt: { type: DateType },
    accuracy: { type: GraphQLList(GraphQLFloat) },
  }),
});

export const UpdateLessonInputType = new GraphQLInputObjectType({
  name: 'UpdateLessonInputType',
  fields: () => ({
    lessonId: { type: GraphQLString },
    name: { type: GraphQLString },
    intro: { type: GraphQLString },
    dialogCategory: { type: GraphQLString },
    question: { type: GraphQLString },
    image: { type: GraphQLString },
    expectations: { type: GraphQLList(UpdateLessonExpectationInputType) },
    conclusion: { type: GraphQLList(GraphQLString) },
    lastTraining: { type: TrainingInputType },
    features: { type: GraphQLJSON },
    createdBy: { type: GraphQLID },
    deleted: { type: GraphQLBoolean },
  }),
});

export const updateLesson = {
  type: LessonType,
  args: {
    lessonId: { type: GraphQLString },
    lesson: { type: GraphQLNonNull(UpdateLessonInputType) },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { lessonId: string; lesson: UpdateLesson },
    context: { user: User }
  ): Promise<Lesson> => {
    if (!args.lessonId) {
      throw new Error('missing required param lessonId');
    }
    if (!args.lesson) {
      throw new Error('missing required param lesson');
    }
    const lesson = args.lesson;
    if (lesson.deleted) {
      throw new Error('lesson was deleted');
    }
    if (
      !args.lessonId.match(/^[a-z0-9\-]+$/) ||
      !lesson.lessonId.match(/^[a-z0-9\-]+$/)
    ) {
      throw new Error('lessonId must match [a-z0-9-]');
    }
    if (!LessonModel.userCanEdit(context.user, lesson)) {
      throw new Error('user does not have permission to edit this lesson');
    }
    await SessionModel.updateLesson(args.lessonId, lesson);
    const createdBy = await UserModel.findOne({ _id: lesson.createdBy });

    return await LessonModel.findOneAndUpdate(
      {
        lessonId: args.lessonId,
      },
      {
        $set: {
          ...lesson,
          createdByName: createdBy ? createdBy.name : '',
        },
      },
      {
        new: true, // return the updated doc rather than pre update
        upsert: true,
      }
    );
  },
};

export default updateLesson;
