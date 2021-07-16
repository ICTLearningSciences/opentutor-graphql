/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLObjectType, GraphQLString } from 'graphql';
import { Lesson as LessonModel } from 'models';
import { User } from 'models/User';
import { Config, ConfigType } from 'gql/types/config';
import * as YAML from 'yaml';

export const config = {
  type: ConfigType,
  args: {
    lessonId: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { lessonId: string },
    context: { user: User }
  ): Promise<Config> => {
    if (!args.lessonId) {
      throw new Error('missing required param lessonId');
    }
    const lesson = await LessonModel.findOne({
      lessonId: args.lessonId,
    });
    if (!lesson) {
      throw new Error(`lesson not found for lessonId '${args.lessonId}'`);
    }
    if (!LessonModel.userCanEdit(context.user, lesson)) {
      throw new Error(
        'user does not have permission to get training data for this lesson'
      );
    }
    try {
      const config = {
        expectations: lesson.expectations.map((exp) => {
          return {
            expectationId: exp.expectationId,
            ideal: exp.expectation,
            features: exp.features,
          };
        }),
        question: lesson.question,
      };
      return {
        stringified: YAML.stringify(config),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};

export default config;
