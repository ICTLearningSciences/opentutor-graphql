/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLInputObjectType,
} from 'graphql';
import { Session as SessionModel } from 'models';
import { Session } from 'models/Session';
import SessionType from 'gql/types/session';

interface InvalidateResponse {
  sessionId: string;
  responseId: string;
  expectation: number;
  invalid: boolean;
}

const InvalidateResponseInputType = new GraphQLInputObjectType({
  name: 'InvalidateResponseInputType',
  fields: () => ({
    sessionId: { type: GraphQLNonNull(GraphQLString) },
    responseId: { type: GraphQLNonNull(GraphQLID) },
    expectation: { type: GraphQLNonNull(GraphQLInt) },
    invalid: { type: GraphQLNonNull(GraphQLBoolean) },
  }),
});

export const invalidateResponse = {
  type: SessionType,
  args: {
    invalidateResponse: { type: GraphQLNonNull(InvalidateResponseInputType) },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: {
      invalidateResponse: InvalidateResponse;
    }
  ): Promise<Session> => {
    const session = await SessionModel.invalidateResponse(
      args.invalidateResponse.sessionId,
      args.invalidateResponse.responseId,
      args.invalidateResponse.expectation,
      args.invalidateResponse.invalid
    );
    return session;
  },
};

export default invalidateResponse;
