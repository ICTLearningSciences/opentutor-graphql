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
      _id: ObjectId('5f0cfea3395d762ca65405c3'),
      lessonId: 'lesson1',
      name: 'lesson name',
      intro: 'intro text',
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
        },
      ],
      conclusion: ['conclusion text'],
    },
    {
      _id: ObjectId('5f0cfea3395d762ca65405c4'),
      lessonId: 'lesson2',
      name: 'name',
      intro: 'intro',
      question: 'question',
      expectations: [
        {
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
  ],

  usersessions: [
    {
      _id: ObjectId('5f20c63646f6110a6a5b2134'),
      sessionId: 'session 1',
      lessonId: 'lesson1',
      username: 'username1',
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
              graderGrade: '',
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
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2135'),
      sessionId: 'session 2',
      username: 'username2',
      question: {
        text: 'question',
        expectations: [{ text: 'expectation 1' }, { text: 'expectation 2' }],
      },
      userResponses: [
        {
          text: 'answer1',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: '',
            },
            {
              classifierGrade: 'Bad',
              graderGrade: '',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2136'),
      lessonId: 'lesson1',
      sessionId: 'session 3',
      userResponses: [
        {
          text: 'a good answer',
          expectationScores: [
            {
              classifierGrade: 'Good',
              graderGrade: 'Good',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2137'),
      lessonId: 'lesson1',
      sessionId: 'session 4',
      userResponses: [
        {
          text: 'a bad answer',
          expectationScores: [
            {
              classifierGrade: 'Bad',
              graderGrade: 'Bad',
            },
          ],
        },
      ],
    },
    {
      _id: ObjectId('5f20c63646f6110a6a5b2138'),
      lessonId: 'lesson1',
      sessionId: 'session 5',
      userResponses: [
        {
          text: 'a neutral answer',
          expectationScores: [
            {
              classifierGrade: 'Neutral',
              graderGrade: 'Neutral',
            },
          ],
        },
      ],
    },
  ],
};
