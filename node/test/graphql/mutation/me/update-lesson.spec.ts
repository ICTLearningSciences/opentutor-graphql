/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import createApp, { appStart, appStop } from 'app';
import { expect } from 'chai';
import { describe } from 'mocha';
import { Express, json, response } from 'express';
import mongoUnit from 'mongo-unit';
import request from 'supertest';
import { getToken } from 'test/helpers';

const GQL_UPDATE_LESSON_FULL = {
  query: `mutation UpdateLesson($lessonId: ID!, $lesson: UpdateLessonInputType!) {
    me {
      updateLesson(lessonId: $lessonId, lesson: $lesson) {
        lessonId
        name
        intro
        dialogCategory
        question
        expectations {
          expectation
          hints {
            text
          }
        }
        conclusion
        createdByName
      }   
    }
  }`,
  variables: {
    lessonId: 'lesson1',
    lesson: {
      lessonId: 'lesson1-updated',
    },
  },
};

const GQL_UPDATE_LESSON_DEFAULT = {
  query: `mutation UpdateLesson($lessonId: ID!, $lesson: UpdateLessonInputType!) {
  me {
    updateLesson(lessonId: $lessonId, lesson: $lesson) {
      lessonId
    }   
  }
}`,
  variables: {
    lessonId: 'lesson1',
    lesson: {
      lessonId: 'lesson1-updated',
    },
  },
};

describe('updateLesson', () => {
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
    const response = await request(app)
      .post('/graphql')
      .send(GQL_UPDATE_LESSON_DEFAULT);
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if no edit permission`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const lesson = JSON.stringify({
      lessonId: 'newlesson',
      name: 'new name',
      intro: 'new intro',
      dialogCategory: 'sensitive',
      question: 'new question',
      conclusion: ['new conclusion'],
      createdBy: '5f0cfea3395d762ca65405d1',
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "newlesson", lesson: ${lesson}) {
              lessonId
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

  it(`throws an error if no lessonId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        ...GQL_UPDATE_LESSON_DEFAULT,
        variables: {
          lesson: GQL_UPDATE_LESSON_DEFAULT.variables.lesson,
        },
      });
    expect(response.status).to.equal(500);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Variable "$lessonId" of required type "ID!" was not provided.'
    );
  });

  it(`throws an error if no lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1") { 
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(400);
  });

  it(`throws an error if lesson was deleted`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: '_deleted_lesson',
      deleted: true,
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "_deleted_lesson", lesson: ${lesson}) {
              lessonId
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

  it(`args.lessonId must be lowercase`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        ...GQL_UPDATE_LESSON_DEFAULT,
        variables: {
          lessonId: GQL_UPDATE_LESSON_DEFAULT.variables.lessonId,
          lesson: {
            lessonId: 'A',
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`lesson.lessonId must be lowercase`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: 'A',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "a", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`args.lessonId cannot contain special chars`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: 'a',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        ...GQL_UPDATE_LESSON_DEFAULT,
        variables: {
          lessonId: GQL_UPDATE_LESSON_DEFAULT.variables.lessonId,
          lesson: {
            lessonId: '$1',
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it(`lesson.lessonId cannot contain special chars`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: '!',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "a", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lessonId must match [a-z0-9-]'
    );
  });

  it('updates for api key', async () => {
    const lesson = JSON.stringify({
      lessonId: 'lesson1',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        ...GQL_UPDATE_LESSON_DEFAULT,
        variables: {
          lessonId: 'lesson1',
          lesson: {
            lessonId: 'lesson1-updated',
          },
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLesson).to.eql({
      lessonId: 'lesson1-updated',
    });
  });

  it('updates for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: 'lesson1',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLesson).to.eql({
      lessonId: 'lesson1',
    });
  });

  it('updates for content manager', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const lesson = JSON.stringify({
      lessonId: 'lesson1',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLesson).to.eql({
      lessonId: 'lesson1',
    });
  });

  it('updates for lesson creator', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const lesson = JSON.stringify({
      lessonId: 'lesson2',
      createdBy: '5f0cfea3395d762ca65405d3',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson2", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLesson).to.eql({
      lessonId: 'lesson2',
    });
  });

  it(`creates a new lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = {
      lessonId: 'newlesson',
      name: 'new name',
      intro: 'new intro',
      dialogCategory: 'sensitive',
      question: 'new question',
      conclusion: ['new conclusion'],
      createdBy: '5f0cfea3395d762ca65405d1',
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
    };
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        ...GQL_UPDATE_LESSON_FULL,
        variables: {
          lessonId: 'newlesson',
          lesson: lesson,
        },
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLesson).to.eql({
      lessonId: 'newlesson',
      name: 'new name',
      intro: 'new intro',
      dialogCategory: 'sensitive',
      question: 'new question',
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
      conclusion: ['new conclusion'],
      createdByName: 'Admin',
    });
  });

  it(`adds new lesson to database`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: 'newlesson',
      createdBy: '5f0cfea3395d762ca65405d1',
      name: 'new name',
      intro: 'new intro',
      dialogCategory: 'sensitive',
      question: 'new question',
      conclusion: ['new conclusion'],
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
    }).replace(/"([^"]+)":/g, '$1:');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "newlesson", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });

    const newLesson = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "newlesson") { 
            lessonId
            name
            intro
            dialogCategory
            question
            expectations {
              expectation
              hints {
                text
              }
            }
            conclusion
          }   
        }
      }`,
      });
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.me.lesson).to.eql({
      lessonId: 'newlesson',
      name: 'new name',
      intro: 'new intro',
      dialogCategory: 'sensitive',
      question: 'new question',
      expectations: [
        {
          expectation: 'new expectation',
          hints: [
            {
              text: 'new hint',
            },
          ],
        },
      ],
      conclusion: ['new conclusion'],
    });
  });

  it(`returns updated lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const lesson = JSON.stringify({
      lessonId: 'lesson1',
      name: 'updated name',
      intro: 'updated intro',
      dialogCategory: 'sensitive',
      question: 'updated question',
      conclusion: ['updated conclusion'],
      expectations: [
        {
          expectation: 'updated expectation',
          hints: [
            {
              text: 'updated hint',
            },
          ],
        },
      ],
      createdBy: '5f0cfea3395d762ca65405d3',
    }).replace(/"([^"]+)":/g, '$1:');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
              name
              intro
              dialogCategory
              question
              expectations {
                expectation
                hints {
                  text
                }
              }
              conclusion
              createdByName
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLesson).to.eql({
      lessonId: 'lesson1',
      name: 'updated name',
      intro: 'updated intro',
      dialogCategory: 'sensitive',
      question: 'updated question',
      expectations: [
        {
          expectation: 'updated expectation',
          hints: [
            {
              text: 'updated hint',
            },
          ],
        },
      ],
      conclusion: ['updated conclusion'],
      createdByName: 'Editor',
    });
  });

  it(`updates lesson in database`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      createdBy: '5f0cfea3395d762ca65405d1',
      lessonId: 'lesson1',
      name: 'updated name',
      intro: 'updated intro',
      dialogCategory: 'sensitive',
      question: 'updated question',
      conclusion: ['updated conclusion'],
      expectations: [
        {
          expectation: 'updated expectation',
          hints: [
            {
              text: 'updated hint',
            },
          ],
        },
      ],
    }).replace(/"([^"]+)":/g, '$1:');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
            }   
          }
        }`,
      });
    const newLesson = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "lesson1") { 
            lessonId
            name
            intro
            dialogCategory
            question
            expectations {
              expectation
              hints {
                text
              }
            }
            conclusion
          }  
        }
      }`,
      });
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.me.lesson).to.eql({
      lessonId: 'lesson1',
      name: 'updated name',
      intro: 'updated intro',
      dialogCategory: 'sensitive',
      question: 'updated question',
      expectations: [
        {
          expectation: 'updated expectation',
          hints: [
            {
              text: 'updated hint',
            },
          ],
        },
      ],
      conclusion: ['updated conclusion'],
    });
  });

  it(`updates lessonId`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      createdBy: '5f0cfea3395d762ca65405d1',
      lessonId: 'newlessonid',
      name: 'lesson name',
    }).replace(/"([^"]+)":/g, '$1:');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
              name
            }   
          }
        }`,
      });

    const newLesson = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "newlessonid") {
            lessonId
          }  
        }
      }`,
      });
    expect(newLesson.status).to.equal(200);
    expect(newLesson.body.data.me.lesson).to.eql({
      lessonId: 'newlessonid',
    });
    const oldLesson = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "lesson1") {
            lessonId
          }  
        }
      }`,
      });
    expect(oldLesson.status).to.equal(200);
    expect(oldLesson.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"lesson1"}"'
    );
  });

  it(`updates session lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const lesson = JSON.stringify({
      lessonId: 'newlessonid',
      name: 'new lesson name',
      createdBy: '5f0cfea3395d762ca65405d1',
    }).replace(/"([^"]+)":/g, '$1:');
    await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLesson(lessonId: "lesson1", lesson: ${lesson}) {
              lessonId
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
              lessonId
              lessonName
              lessonCreatedBy
            }
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.session).to.eql({
      lessonId: 'newlessonid',
      lessonName: 'new lesson name',
      lessonCreatedBy: 'Admin',
    });
  });
});
