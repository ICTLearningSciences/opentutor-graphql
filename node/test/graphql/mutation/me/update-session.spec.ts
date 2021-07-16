/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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

  it(`throws an error if not logged in`, async () => {
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
      })
    );
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
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

  it(`throws an error if no edit permission`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'user does not have permission to edit this lesson'
    );
  });

  it(`throws an error if no sessionId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(session: "") {
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

  it(`throws an error if no session`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session") {
              username
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param session'
    );
  });

  it(`throws an error if session has no lessonId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session is missing a lessonId'
    );
  });

  it(`throws an error if session has no sessionId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session is missing a sessionId'
    );
  });

  it(`throws an error if session has no username`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session is missing a username'
    );
  });

  it(`throws an error if session has no question`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session is missing a question'
    );
  });

  it(`throws an error if session has invalid answer`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: ' ',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session has an invalid answer (empty response text)'
    );
  });

  it(`throws an error if session was deleted`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
        deleted: true,
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'session was deleted'
    );
  });

  it(`throws an error if lesson was deleted`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: '_deleted_lesson',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson was deleted'
    );
  });

  it('succeeds for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateSession).to.eql({
      sessionId: 'new session',
    });
  });

  it('succeeds for content manager', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateSession).to.eql({
      sessionId: 'new session',
    });
  });

  it('succeeds for lesson creator', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson2',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateSession).to.eql({
      sessionId: 'new session',
    });
  });

  it(`returns updated session`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateSession(sessionId: "new session", session: "${session}") {
              sessionId
              username
              lesson {
                name
                createdByName
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
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateSession).to.eql({
      sessionId: 'new session',
      username: 'new username',
      lesson: {
        name: 'lesson name',
        createdByName: 'Admin',
      },
      question: {
        text: 'new question?',
        expectations: [{ expectationId: '0', text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`adds new session to database`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
            me {
              updateSession(sessionId: "new session", session: "${session}") {
                username
              }
            }
          }`,
      });
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          session(sessionId: "new session") {
            sessionId
            username
            lesson {
              name
              createdByName
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
    expect(response.status).to.equal(200);
    expect(response.body.data.me.session).to.eql({
      sessionId: 'new session',
      username: 'new username',
      lesson: {
        name: 'lesson name',
        createdByName: 'Admin',
      },
      question: {
        text: 'new question?',
        expectations: [{ expectationId: '0', text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`updates session in database`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'session 1',
        username: 'new username',
        question: {
          text: 'new question?',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
              },
            ],
          },
        ],
      })
    );
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
            me {
              updateSession(sessionId: "session 1", session: "${session}") {
                username
              }  
            }
          }`,
      });

    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          session(sessionId: "session 1") {
            sessionId
            username
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
    expect(response.status).to.equal(200);
    expect(response.body.data.me.session).to.eql({
      sessionId: 'session 1',
      username: 'new username',
      question: {
        text: 'new question?',
        expectations: [{ expectationId: '0', text: 'new expected text' }],
      },
      userResponses: [
        {
          text: 'new answer',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Good',
              graderGrade: null,
            },
          ],
        },
      ],
    });
  });

  it(`calculates grader and classifier scores`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const session = encodeURI(
      JSON.stringify({
        lessonId: 'lesson1',
        sessionId: 'new session',
        username: 'new username',
        question: {
          text: 'new question',
          expectations: [{ expectationId: '0', text: 'new expected text' }],
        },
        userResponses: [
          {
            text: 'new answer',
            expectationScores: [
              {
                expectationId: '0',
                classifierGrade: 'Good',
                graderGrade: 'Bad',
              },
            ],
          },
        ],
      })
    );
    const updated = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
            me {
              updateSession(sessionId: "new session", session: "${session}") {
                graderGrade
                classifierGrade
              }                
            }
          }`,
      });
    expect(updated.status).to.equal(200);
    expect(updated.body.data.me.updateSession).to.eql({
      graderGrade: 0,
      classifierGrade: 1,
    });
  });
});
