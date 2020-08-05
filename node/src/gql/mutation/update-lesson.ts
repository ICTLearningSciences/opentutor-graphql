/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLString } from 'graphql';
import LessonType from 'gql/types/lesson';
import { Lesson } from 'models';

export const updateLesson = {
  type: LessonType,
  args: {
    lessonId: { type: GraphQLString },
    lesson: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    if (args.lessonId === undefined) {
      throw new Error('missing required param lessonId');
    }
    if (args.lesson === undefined) {
      throw new Error('missing required param lesson');
    }
    const lesson = JSON.parse(decodeURI(args.lesson));

    if (
      !args.lessonId.match(/^[a-z0-9\-]+$/) ||
      !lesson.lessonId.match(/^[a-z0-9\-]+$/)
    ) {
      throw new Error('lessonId must match [a-z0-9-]');
    }

    return await Lesson.findOneAndUpdate(
      {
        lessonId: args.lessonId,
      },
      {
        $set: {
          ...lesson,
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
