/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import { describe } from 'mocha';
import mongoUnit from 'mongo-unit';
import request from 'supertest';
import * as YAML from 'yaml';
import { authGql } from 'test/helpers';

const GQL_QUERY_CONFIG = `query Config($lessonId: String!) {
  me {
    config(lessonId: $lessonId) {
      stringified
    }  
  }
}
`;

interface Expectation {
  expectationId: string;
  ideal: string;
  features?: Record<string, unknown> | null;
}

interface Config {
  question: string;
  expectations: Expectation[];
}

const LESSON_1_CONFIG: Config = {
  question: 'question?',
  expectations: [
    {
      expectationId: '0',
      ideal: 'expected text 1',
      features: null,
    },
    {
      expectationId: '1',
      ideal: 'expected text 2',
      features: null,
    },
  ],
};

function gqlQueryConfig(lessonId: string = 'lesson1') {
  return {
    query: GQL_QUERY_CONFIG,
    variables: {
      lessonId,
    },
  };
}

function parseConfig(stringified: string): Config {
  return YAML.parse(stringified);
}

async function assertLoadsConfig(args: {
  app: Express;
  userId?: string;
  lessonId?: string;
  expectedConfig?: Config;
}): Promise<void> {
  const response = await authGql({
    app: args.app,
    body: gqlQueryConfig(args.lessonId),
    userId: args.userId,
  });
  expect(parseConfig(response.body.data.me.config.stringified)).to.eql(
    args.expectedConfig || LESSON_1_CONFIG
  );
}

describe('config', () => {
  let app: Express;

  beforeEach(async () => {
    await mongoUnit.load(require('test/fixtures/mongodb/data-default.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    await appStop();
    await mongoUnit.drop();
  });

  it(`throws an error if not logged in`, async () => {
    const response = await request(app).post('/graphql').send(gqlQueryConfig());
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if user does not have permissions`, async () => {
    const response = await authGql({ app, body: gqlQueryConfig() });
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user does not have permission to get training data for this lesson'
    );
  });

  it(`throws an error if lesson does not exist`, async () => {
    const response = await authGql({
      app,
      body: gqlQueryConfig('noSuchLesson'),
    });
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      "lesson not found for lessonId 'noSuchLesson'"
    );
  });

  it('succeeds for api key', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send(gqlQueryConfig());
    expect(response.status).to.equal(200);
    expect(parseConfig(response.body.data.me.config.stringified)).to.eql(
      LESSON_1_CONFIG
    );
  });

  it('succeeds for admin', async () => {
    await assertLoadsConfig({
      app,
      userId: '5f0cfea3395d762ca65405d1',
    });
  });

  it('succeeds for content manager', async () => {
    await assertLoadsConfig({
      app,
      userId: '5f0cfea3395d762ca65405d2',
    });
  });

  it('config includes additional properties', async () => {
    await assertLoadsConfig({
      app,
      lessonId: 'lesson8',
      userId: '5f0cfea3395d762ca65405d1',
      expectedConfig: {
        question: 'question',
        expectations: [
          {
            expectationId: '0',
            ideal: 'answer1',
            features: {
              bad: ['bad regex 1'],
              good: ['good regex 1'],
              ideal: 'new ideal answer',
            },
          },
          {
            expectationId: '1',
            ideal: 'answer2',
            features: {
              bad: ['bad regex 2'],
              good: ['good regex 2'],
            },
          },
        ],
      },
    });
  });
});
