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
import { authGql, getToken } from '../../../helpers';

const GQL_QUERY_CONFIG = `query Config($lessonId: String!) {
  me {
    config(lessonId: $lessonId) {
      stringified
    }  
  }
}
`;

function gqlQueryConfig(lessonId: string = 'lesson1') {
  return {
    query: GQL_QUERY_CONFIG,
    variables: {
      lessonId,
    },
  };
}

describe.only('config', () => {
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

  // it('succeeds for api key', async () => {
  //   const response = await request(app)
  //     .post('/graphql')
  //     .set('opentutor-api-req', 'true')
  //     .set('Authorization', `bearer ${process.env.API_SECRET}`)
  //     .send(gqlQueryConfig());
  //   expect(response.status).to.equal(200);
  //   expect(response.body.data.me.config.stringified).to.eql(false);
  // });

  // it('succeeds for admin', async () => {
  //   const response = await authGql({
  //     app,
  //     body: gqlQueryConfig(),
  //     userId: '5f0cfea3395d762ca65405d1',
  //   });
  //   expect(response.body.data.me.config.stringified).to.eql(false);
  // });

  // it('succeeds for content manager', async () => {
  //   const token = getToken('5f0cfea3395d762ca65405d2');
  //   const response = await request(app)
  //     .post('/graphql')
  //     .set('Authorization', `bearer ${token}`)
  //     .send(gqlQueryConfig());
  //   expect(response.status).to.equal(200);
  //   expect(response.body.data.me.config.stringified).to.eql(false);
  // });

  // it('succeeds for lesson creator', async () => {
  //   const response = await authGql({
  //     app,
  //     body: gqlQueryConfig(),
  //     userId: '5f0cfea3395d762ca65405d2',
  //   });
  //   expect(response.body.data.me.config.stringified).to.eql(false);
  // });

  // it(`config includes additional properties `, async () => {
  //   const response = await authGql({
  //     app,
  //     body: gqlQueryConfig('lesson8'),
  //     userId: '5f0cfea3395d762ca65405d1',
  //   });
  //   expect(YAML.parse(response.body.data.me.trainingData.config)).to.eql({
  //     question: 'question',
  //     expectations: [
  //       {
  //         ideal: 'answer1',
  //         features: {
  //           ideal: 'new ideal answer',
  //           good: ['good regex 1'],
  //           bad: ['bad regex 1'],
  //         },
  //       },
  //       {
  //         ideal: 'answer2',
  //         features: {
  //           good: ['good regex 2'],
  //           bad: ['bad regex 2'],
  //         },
  //       },
  //     ],
  //   });
  // });

});