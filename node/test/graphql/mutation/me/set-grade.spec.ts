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
import { getToken } from '../../../helpers';

describe('setGrade', () => {
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
    const response = await request(app).post('/graphql').send({
      query: `mutation {
          me {
            setGrade(userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
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

  it(`returns an error if no sessionId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
              username
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param sessionId'
    );
  });

  it(`returns an error if no userAnswerIndex`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 1", userExpectationIndex: 0, grade: "Bad") { 
              username
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param userAnswerIndex'
    );
  });

  it(`returns an error if no userExpectationIndex`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 1", userAnswerIndex: 0, grade: "Bad") { 
              username
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param userExpectationIndex'
    );
  });

  it(`returns an error if no grade`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0) { 
              username
            } 
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param grade'
    );
  });

  it(`returns an error if invalid sessionId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "111111111111111111111111", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
              username
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'failed to find session with sessionId 111111111111111111111111'
    );
  });

  it(`returns an error if no edit permission`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
            me {
              setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
                username
              } 
            }
          }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user does not have permission to grade this lesson'
    );
  });

  it('returns updated session', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const setGrade = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
              username
              graderGrade
              classifierGrade
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
          }
        }`,
      });
    expect(setGrade.status).to.equal(200);
    expect(setGrade.body.data.me.setGrade).to.eql({
      username: 'username1',
      graderGrade: null,
      classifierGrade: null,
      question: {
        text: 'question?',
        expectations: [
          { text: 'expected text 1' },
          { text: 'expected text 2' },
        ],
      },
      userResponses: [
        {
          text: 'answer1',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'answer2',
          expectationScores: [
            {
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    });
  });

  it('updates session in database', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 1", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
              username
            }  
          }
        }`,
      });
    const session = await request(app).post('/graphql').send({
      query: `query { 
          session(sessionId: "session 1") { 
            username
            graderGrade
            classifierGrade
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
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      username: 'username1',
      graderGrade: null,
      classifierGrade: null,
      question: {
        text: 'question?',
        expectations: [
          { text: 'expected text 1' },
          { text: 'expected text 2' },
        ],
      },
      userResponses: [
        {
          text: 'answer1',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'answer2',
          expectationScores: [
            {
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    });
  });

  it('calculates and updates GOOD graderGrade', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Good") { 
              username
            }   
          }
        }`,
      });
    const session = await request(app).post('/graphql').send({
      query: `query { 
          session(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      graderGrade: 1,
    });
  });

  it('calculates and updates BAD graderGrade', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Bad") { 
              username
            }  
          }
        }`,
      });
    const session = await request(app).post('/graphql').send({
      query: `query { 
          session(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      graderGrade: 0,
    });
  });

  it('calculates and updates NEUTRAL graderGrade', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "Neutral") { 
              username
            }   
          }
        }`,
      });
    const session = await request(app).post('/graphql').send({
      query: `query { 
          session(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      graderGrade: 0.5,
    });
  });

  it('calculates and updates NO graderGrade', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            setGrade(sessionId: "session 2", userAnswerIndex: 0, userExpectationIndex: 0, grade: "") { 
              username
            }   
          }
        }`,
      });
    const session = await request(app).post('/graphql').send({
      query: `query { 
          session(sessionId: "session 2") { 
            graderGrade
          } 
        }`,
    });
    expect(session.status).to.equal(200);
    expect(session.body.data.session).to.eql({
      graderGrade: null,
    });
  });
});