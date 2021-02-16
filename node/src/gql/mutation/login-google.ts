/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import axios from 'axios';
import { GraphQLString, GraphQLObjectType } from 'graphql';
import { User as UserSchema } from 'models';
import {
  UserAccessTokenType,
  UserAccessToken,
  generateAccessToken,
} from 'gql/types/user-access-token';

export const loginGoogle = {
  type: UserAccessTokenType,
  args: {
    accessToken: { type: GraphQLString },
  },
  resolve: async (
    _root: GraphQLObjectType,
    args: { accessToken: string }
  ): Promise<UserAccessToken> => {
    if (!args.accessToken) {
      throw new Error('missing required param accessToken');
    }
    const endpoint = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${args.accessToken}`;
    const response = await axios.get(endpoint);
    const user = await UserSchema.findOneAndUpdate(
      {
        googleId: response.data.id,
      },
      {
        $set: {
          googleId: response.data.id,
          name: response.data.name,
          email: response.data.email,
          lastLoginAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    return generateAccessToken(user);
  },
};

export default loginGoogle;
