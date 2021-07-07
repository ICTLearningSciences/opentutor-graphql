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
import { getToken } from '../../../helpers';

describe('lesson', () => {
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
          lesson(lessonId: "111111111111111111111111") {
            lessonId
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

  it(`returns an error if invalid id`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "111111111111111111111111") {
            lessonId
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"111111111111111111111111"}"'
    );
  });

  it(`cannot find a deleted lesson`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "_deleted_lesson") {
            lessonId
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'lesson not found for args "{"lessonId":"_deleted_lesson"}"'
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
          lesson(lessonId: "lesson1") {
            lessonId
          }
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      lessonId: 'lesson1',
    });
  });

  it('succeeds with logged in user', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
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
            image
            expectations {
              expectation
              hints {
                text
              }
              features
            }
            conclusion
            lastTraining
            features
            createdBy
            createdByName
          }
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      lessonId: 'lesson1',
      name: 'lesson name',
      intro: 'intro text',
      dialogCategory: 'default',
      question: 'question?',
      expectations: [
        {
          expectation: 'expected text 1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
            {
              text: 'expectation 1 hint 2',
            },
          ],
          features: null,
        },
        {
          expectation: 'expected text 2',
          hints: [
            {
              text: 'expectation 2 hint 1',
            },
            {
              text: 'expectation 2 hint 2',
            },
          ],
          features: null,
        },
      ],
      conclusion: ['conclusion text'],
      features: null,
      image: 'some/image.png',
      createdBy: '5f0cfea3395d762ca65405d1',
      createdByName: 'Admin',
      lastTraining: null,
    });
  });

  it('get training additional features', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            lesson(lessonId: "lesson8") {
              features
              expectations {
                features
              }
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      features: {
        test: 'test',
        question: 'fake question',
      },
      expectations: [
        {
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          features: {
            good: ['good regex 2'],
            bad: ['bad regex 2'],
          },
        },
      ],
    });
  });

  it('is not trainable if fewer than 10 grades per expectation', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            lesson(lessonId: "lesson3") {
              lessonId
              isTrainable
            }  
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      lessonId: 'lesson3',
      isTrainable: false,
    });
  });

  it('is not trainable if fewer than 2 Good grades per expectation', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
          me {
            lesson(lessonId: "lesson4") {
              lessonId
              isTrainable
            }    
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      lessonId: 'lesson4',
      isTrainable: false,
    });
  });

  it('is not trainable if fewer than 2 Bad grades per expectation', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "lesson5") {
            lessonId
            isTrainable
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      lessonId: 'lesson5',
      isTrainable: false,
    });
  });

  it('is trainable if at least 2 good, 2 bad, and 10 total grades per expectation', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `query {
        me {
          lesson(lessonId: "lesson6") {
            lessonId
            isTrainable
          }  
        }
      }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.lesson).to.eql({
      lessonId: 'lesson6',
      isTrainable: true,
    });
  });
});
