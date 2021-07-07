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
import timekeeper from 'timekeeper';
import { getToken } from '../../../helpers';

describe('updateLastTraining', () => {
  let app: Express;

  beforeEach(async () => {
    await mongoUnit.load(require('test/fixtures/mongodb/data-default.js'));
    app = await createApp();
    await appStart();
  });

  afterEach(async () => {
    timekeeper.reset();
    await appStop();
    await mongoUnit.drop();
  });

  it.only(`throws an error if not logged in`, async () => {
    const response = await request(app)
      .post('/graphql')
      .send({
        query: `mutation UpdateTraining($lesson: String!, $training: TrainingInputType!) {
          me {
            updateLastTraining(lessonId: $lesson, training: $training) { 
              trainedAt
              accuracy
            }   
          }
        }`,
        variables: {
          lesson : "lesson1",
          training: {
            trainedAt: new Date(),
            accuracy: [1.50, 2.00]
          }
        }
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'Only authenticated users'
    );
  });

  it(`throws an error if user does not have permissions`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const date = new Date();
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson1", date: "${date}") { 
              lastTrainedAt
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
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "") { 
              lastTrainedAt
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body).to.have.deep.nested.property(
      'errors[0].message',
      'missing required param lessonId'
    );
  });

  it('succeeds for api key', async () => {
    const date = new Date();
    const response = await request(app)
      .post('/graphql')
      .set('opentutor-api-req', 'true')
      .set('Authorization', `bearer ${process.env.API_SECRET}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson1", date: "${date}") { 
              lastTrainedAt
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLastTrainedAt).to.eql({
      lastTrainedAt: date.toLocaleString(),
    });
  });

  it('succeeds for admin', async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const date = new Date();
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson1", date: "${date}") { 
              lastTrainedAt
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLastTrainedAt).to.eql({
      lastTrainedAt: date.toLocaleString(),
    });
  });

  it('succeeds for content manager', async () => {
    const token = getToken('5f0cfea3395d762ca65405d2');
    const date = new Date();
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson1", date: "${date}") { 
              lastTrainedAt
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLastTrainedAt).to.eql({
      lastTrainedAt: date.toLocaleString(),
    });
  });

  it('succeeds for lesson creator', async () => {
    const token = getToken('5f0cfea3395d762ca65405d3');
    const date = new Date();
    timekeeper.freeze(date);
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson2", date: "${date}") { 
              lastTrainedAt
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLastTrainedAt).to.eql({
      lastTrainedAt: date.toLocaleString(),
    });
  });

  it(`update with given date`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const date = new Date();
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson1", date: "${date}") { 
              lastTrainedAt
            }   
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLastTrainedAt).to.eql({
      lastTrainedAt: date.toLocaleString(),
    });
  });

  it(`update with current date`, async () => {
    const token = getToken('5f0cfea3395d762ca65405d1');
    const response = await request(app)
      .post('/graphql')
      .set('Authorization', `bearer ${token}`)
      .send({
        query: `mutation {
          me {
            updateLastTrainedAt(lessonId: "lesson1") { 
              lastTrainedAt
            }               
          }
        }`,
      });
    expect(response.status).to.equal(200);
    expect(response.body.data.me.updateLastTrainedAt.lastTrainedAt).to.not.eql(
      null
    );
  });
});
