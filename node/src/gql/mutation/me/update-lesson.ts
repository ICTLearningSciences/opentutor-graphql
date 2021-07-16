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
} from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import LessonType from 'gql/types/lesson';
import { Lesson as LessonModel } from 'models';
import { Lesson, UpdateLesson } from 'models/Lesson';
import { User } from 'models/User';
export const UpdateHintInputType = new GraphQLInputObjectType({
  name: 'UpdateHintInputType',
  fields: () => ({
    text: { type: GraphQLString },
  }),
});

export const UpdateLessonExpectationInputType = new GraphQLInputObjectType({
  name: 'UpdateLessonExpectationInputType',
  fields: () => ({
    expectationId: { type: GraphQLString },
    expectation: { type: GraphQLString },
    features: { type: GraphQLJSON },
    hints: { type: GraphQLList(UpdateHintInputType) },
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
    lastTrainedAt: { type: GraphQLString },
    features: { type: GraphQLJSON },
    createdBy: { type: GraphQLID },
    deleted: { type: GraphQLBoolean },
  }),
});

export const updateLesson = {
  type: LessonType,
  args: {
    lessonId: { type: GraphQLNonNull(GraphQLID) },
    lesson: { type: GraphQLNonNull(UpdateLessonInputType) },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { lessonId: string; lesson: UpdateLesson },
    context: { user: User }
  ): Promise<Lesson> => {
    try {
      if (!args.lessonId) {
        throw new Error('missing required param lessonId');
      }
      if (!args.lesson) {
        throw new Error('missing required param lesson');
      }
      const lessonUpdates = args.lesson;
      if (lessonUpdates.deleted) {
        throw new Error('lesson was deleted');
      }
      if (!LessonModel.userCanEdit(context.user, lessonUpdates)) {
        throw new Error('user does not have permission to edit this lesson');
      }
      return await LessonModel.findAndUpdateLessonById(
        args.lessonId,
        lessonUpdates
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};

export default updateLesson;
