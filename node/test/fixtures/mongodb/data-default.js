/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

module.exports = {
  lessons: [
    {
      _id: ObjectId('5f0cfea3395d762ca65405c1'),
      lessonId: 'lesson1',
      name: 'lesson name',
      image: 'some/image.png',
      intro: 'intro text',
      dialogCategory: 'default',
      question: 'question?',
      expectations: [
        {
          expectationId: '0',
          expectation: 'expected text 1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
            {
              text: 'expectation 1 hint 2',
            },
          ],
        },
        {
          expectationId: '1',
          expectation: 'expected text 2',
          hints: [
            {
              text: 'expectation 2 hint 1',
            },
            {
              text: 'expectation 2 hint 2',
            },
          ],
        },
      ],
      conclusion: ['conclusion text'],
      createdBy: ObjectId('5f0cfea3395d762ca65405d1'),
      createdByName: 'Admin',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c2'),
      lessonId: 'lesson2',
      name: 'name',
      intro: 'intro',
      dialogCategory: 'default',
      question: 'question',
      expectations: [
        {
          expectationId: '0',
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
        },
      ],
      conclusion: ['conclusion'],
      createdBy: ObjectId('5f0cfea3395d762ca65405d3'),
      createdByName: 'Author',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c3'),
      lessonId: 'lesson3',
      name: 'name',
      intro: 'intro',
      dialogCategory: 'default',
      question: 'question',
      expectations: [
        {
          expectationId: '0',
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
        },
      ],
      conclusion: ['conclusion'],
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c4'),
      lessonId: 'lesson4',
      name: 'name',
      intro: 'intro',
      dialogCategory: 'default',
      question: 'question',
      expectations: [
        {
          expectationId: '0',
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
        },
      ],
      conclusion: ['conclusion'],
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c5'),
      lessonId: 'lesson5',
      name: 'name',
      intro: 'intro',
      dialogCategory: 'default',
      question: 'question',
      expectations: [
        {
          expectationId: '0',
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
        },
      ],
      conclusion: ['conclusion'],
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c6'),
      lessonId: 'lesson6',
      name: 'name',
      intro: 'intro',
      dialogCategory: 'default',
      question: 'question',
      expectations: [
        {
          expectationId: '0',
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
        },
      ],
      conclusion: ['conclusion'],
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c7'),
      lessonId: '_deleted_lesson',
      deleted: true,
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c8'),
      lessonId: 'lesson8',
      name: 'name',
      intro: 'intro',
      dialogCategory: 'default',
      question: 'question',
      expectations: [
        {
          expectationId: '0',
          expectation: 'answer1',
          hints: [
            {
              text: 'expectation 1 hint 1',
            },
          ],
          features: {
            ideal: 'new ideal answer',
            good: ['good regex 1'],
            bad: ['bad regex 1'],
          },
        },
        {
          expectationId: '1',
          expectation: 'answer2',
          hints: [
            {
              text: 'expectation 2 hint 1',
            },
          ],
          features: {
            good: ['good regex 2'],
            bad: ['bad regex 2'],
          },
        },
      ],
      conclusion: ['conclusion'],
      features: {
        test: 'test',
        question: 'fake question',
      },
    },
  ],

  sessions: [
    {
      _id: ObjectId('5f20c63646f6110a6a5b2131'),
      sessionId: 'session 1',
      lessonId: 'lesson1',
      username: 'username1',
      question: {
        text: 'question?',
        expectations: [
          {
            expectationId: '0',
            text: 'expected text 1',
          },
          {
            expectationId: '1',
            text: 'expected text 2',
          },
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
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2132'),
      sessionId: 'session 2',
      lessonId: 'lesson1',
      username: 'username2',
      question: {
        text: 'question',
        expectations: [
          {
            expectationId: '0',
            text: 'expectation 1',
          },
          {
            expectationId: '1',
            text: 'expectation 2',
          },
        ],
      },
      userResponses: [
        {
          _id: ObjectId('5f20c63646f6110a6a5b2135'),
          text: 'answer1',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Good',
              graderGrade: '',
            },
            {
              expectationId: '1',
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2133'),
      lessonId: 'lesson2',
      sessionId: 'session 3',
      userResponses: [
        {
          _id: ObjectId('5f20c63646f6110a5a5b2135'),
          text: 'a good answer',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Good',
              graderGrade: 'Good',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2134'),
      lessonId: 'lesson1',
      sessionId: 'session 4',
      userResponses: [
        {
          text: 'a bad answer',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Bad',
              graderGrade: 'Bad',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2135'),
      lessonId: 'lesson1',
      sessionId: 'session 5',
      userResponses: [
        {
          text: 'a neutral answer',
          expectationScores: [
            {
              expectationId: '0',
              classifierGrade: 'Neutral',
              graderGrade: 'Neutral',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2136'),
      lessonId: 'lesson3',
      sessionId: 'session 6',
      userResponses: [
        {
          _id: ObjectId('5f20c63646f6110a6a5b2131'),
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          _id: ObjectId('5f20c63646f6110a6a5b2132'),
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          _id: ObjectId('5f20c63646f6110a6a5b2133'),
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          _id: ObjectId('5f20c63646f6110a6a5b2134'),
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2137'),
      lessonId: 'lesson4',
      sessionId: 'session 7',
      userResponses: [
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2138'),
      lessonId: 'lesson5',
      sessionId: 'session 8',
      userResponses: [
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2139'),
      lessonId: 'lesson6',
      sessionId: 'session 9',
      userResponses: [
        {
          text: '"good, not bad"',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: 'good, not bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Good',
            },
          ],
        },
        {
          text: '"bad", not "good"',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'bad',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Bad',
            },
          ],
        },
        {
          text: 'neutral',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Neutral',
            },
          ],
        },
        {
          text: 'neutral',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Neutral',
            },
          ],
        },
        {
          text: 'neutral',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Neutral',
            },
          ],
        },
        {
          text: 'neutral',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Neutral',
            },
          ],
        },
        {
          text: 'neutral',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Neutral',
            },
          ],
        },
        {
          text: 'neutral',
          expectationScores: [
            {
              expectationId: '0',
              graderGrade: 'Neutral',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2130'),
      sessionId: 'session 10',
      lessonId: '_deleted_lesson',
      deleted: true,
    },
  ],

  users: [
    {
      _id: ObjectId('5f0cfea3395d762ca65405d1'),
      name: 'Admin',
      email: 'admin@opentutor.com',
      userRole: 'admin',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405d2'),
      name: 'Content Manager',
      email: 'manager@opentutor.com',
      userRole: 'contentManager',
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405d3'),
      name: 'Editor',
      email: 'editor@opentutor.com',
      userRole: 'author',
    },
  ],
};
