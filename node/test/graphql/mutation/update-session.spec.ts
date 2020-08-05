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

describe('updateSession', () => {
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

  it(`returns an error if no sessionId`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          updateSession(userSession: "") { 
            username
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param sessionId'
    );
  });

  it(`returns an error if no userSession`, async () => {
    const response = await request(app).post('/grading-api').send({
      query: `mutation { 
          updateSession(sessionId: "new session") { 
            username
          } 
        }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param userSession'
    );
  });

  it(`returns an error if userSession has no lessonId`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        sessionId: 'new session',
      })
    );
    const response = await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
          updateSession(sessionId: "new session", userSession: "${userSession}") { 
            sessionId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'userSession is missing a lessonId'
    );
  });

  it(`returns an error if userSession has no sessionId`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
      })
    );
    const response = await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
          updateSession(sessionId: "new session", userSession: "${userSession}") { 
            sessionId
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'userSession is missing a sessionId'
    );
  });

  it(`returns updated user session`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
          updateSession(sessionId: "new session", userSession: "${userSession}") { 
            sessionId
            username
            lesson {
              name
            }
            question {
              text
              expectations {
                text
              }
            }
            userResponses {
              text
              expectationScores {
                classifierGrade
                graderGrade
              }
            }
          } 
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.updateSession).to.eql({
      sessionId: 'new session',
      username: 'new username',
      lesson: {
        name: 'lesson name',
      },
      question: {
        text: 'new question?',
        expectations: [{ text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`adds new userSession to database`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "new session", userSession: "${userSession}") { 
              username
            } 
          }`,
      });

    const response = await request(app).post('/grading-api').send({
      query: `query { 
            userSession(sessionId: "new session") { 
              sessionId
              username
              question {
                text
                expectations {
                  text
                }
              }
              userResponses {
                text
                expectationScores {
                  classifierGrade
                  graderGrade
                }
              }
            } 
          }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.userSession).to.eql({
      sessionId: 'new session',
      username: 'new username',
      question: {
        text: 'new question?',
        expectations: [{ text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`updates userSession in database`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'session 1',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "session 1", userSession: "${userSession}") { 
              username
            } 
          }`,
      });

    const response = await request(app).post('/grading-api').send({
      query: `query { 
            userSession(sessionId: "session 1") { 
              sessionId
              username
              question {
                text
                expectations {
                  text
                }
              }
              userResponses {
                text
                expectationScores {
                  classifierGrade
                  graderGrade
                }
              }
            } 
          }`,
    });
    expect(response.status).to.equal(200);
    expect(response.body.data.userSession).to.eql({
      sessionId: 'session 1',
      username: 'new username',
      question: {
        text: 'new question?',
        expectations: [{ text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`calculates grader and classifier scores`, async () => {
    const userSession = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question',
          expectations: [{ text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                classifierGrade: 'Good',
                graderGrade: 'Bad',
              },
            ],
          },
        ],
      })
    );
    const updated = await request(app)
      .post('/grading-api')
      .send({
        query: `mutation { 
            updateSession(sessionId: "new session", userSession: "${userSession}") { 
              graderGrade
              classifierGrade
            }
          }`,
      });
    expect(updated.status).to.equal(200);
    expect(updated.body.data.updateSession).to.eql({
      graderGrade: 0,
      classifierGrade: 1,
    });
  });
});
