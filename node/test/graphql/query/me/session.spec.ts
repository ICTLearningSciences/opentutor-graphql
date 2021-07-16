/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { Express } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';
import { getToken } from 'test/helpers';

describe('session', () => {
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

  it(`returns an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `query { 
        me {
          session(sessionId: "111111111111111111111111") { 
            username
          }   
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`returns an error if invalid sessionId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
        me {
          session(sessionId: "111111111111111111111111") { 
            username
          }   
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session not found for args "{"sessionId":"111111111111111111111111"}"'
    );
  });

  it(`cannot find a deleted session`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
        me {
          session(sessionId: "session 10") { 
            username
          }
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session not found for args "{"sessionId":"session 10"}"'
    );
  });

  it('succeeds with api key', async () => {
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `query {
          me {
            session(sessionId: "session 1") {
              sessionId
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.session).to.eql({
      sessionId: 'session 1',
    });
  });

  it('succeeds with valid sessionId', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query { 
        me {
          session(sessionId: "session 1") { 
            sessionId
            username
            lesson {
              lessonId
            }
            question {
              text
              expectations {
                expectationId
                text
              }
            }
            userResponses {
              text
              expectationScores {
                expectationId
                classifierGrade
                graderGrade
              }
            }
          }
        }
      }`,
      });
    const session = response.body.data.me.session;
    expect(response.status).to.equal(200);
    expect(session).to.eql({
      sessionId: 'session 1',
      lesson: {
        lessonId: 'lesson1',
      },
      username: 'username1',
      question: {
        text: 'question?',
        expectations: [
          { expectationId: '0', text: 'expected text 1' },
          { expectationId: '1', text: 'expected text 2' },
        ],
      },
      userResponses: [
        {
          text: 'answer1',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Good',
              graderGrade: '',
            },
          ],
        },
        {
          text: 'answer2',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    });
  });
});
