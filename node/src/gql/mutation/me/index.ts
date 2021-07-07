/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { GraphQLObjectType } from 'graphql';
import { User } from 'models/User';
import deleteLesson from './delete-lesson';
import setGrade from './set-grade';
import updateLastTraining from './update-last-trained-at';
import updateLesson from './update-lesson';
import updateLessonFeatures from './update-lesson-features';
import updateSession from './update-session';
import updateUserPermissions from './update-user-permissions';

export const Me: GraphQLObjectType = new GraphQLObjectType({
  name: 'MeMutation',
  fields: {
    deleteLesson,
    setGrade,
    updateLastTraining,
    updateLesson,
    updateLessonFeatures,
    updateSession,
    updateUserPermissions,
  },
});

interface Me {
  user: User;
}
export const me = {
  type: Me,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  resolve: (_: GraphQLObjectType, args: any, context: { user: User }): Me => {
    if (!context.user) {
      throw new Error('Only authenticated users');
    }
    return {
      user: context.user,
    };
  },
};

export default me;
