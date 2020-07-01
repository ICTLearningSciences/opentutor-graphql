import { GraphQLString, GraphQLInt } from 'graphql';
import UserSessionType from '../types/user-session';
import UserSessionSchema from '../../models/UserSession';

export const setGrade = {
  type: UserSessionType,
  args: {
    sessionId: { type: GraphQLString },
    userAnswerIndex: { type: GraphQLInt },
    userExpectationIndex: { type: GraphQLInt },
    grade: { type: GraphQLString },
  },
  resolve: async (root: any, args: any) => {
    if (args.sessionId === undefined) {
      throw new Error('missing required param sessionId');
    }
    if (args.userAnswerIndex === undefined) {
      throw new Error('missing required param userAnswerIndex');
    }
    if (args.userExpectationIndex === undefined) {
      throw new Error('missing required param userExpectationIndex');
    }
    if (args.grade === undefined) {
      throw new Error('missing required param grade');
    }
    return await UserSessionSchema.setGrade(
      args.sessionId,
      args.userAnswerIndex,
      args.userExpectationIndex,
      args.grade
    );
  },
};

export default setGrade;
