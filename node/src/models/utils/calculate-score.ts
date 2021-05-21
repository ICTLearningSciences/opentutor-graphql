/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Session, ExpectationScore } from 'models/Session';

const calculateScore = (
  session: Session,
  gradeField: keyof ExpectationScore = 'graderGrade'
): number => {
  const expGrades = [];
  let score = 0;

  for (let i = 0; i < session.userResponses.length; i++) {
    const userResponse = session.userResponses[i];
    let isGraded = false;
    for (let j = 0; j < userResponse.expectationScores.length; j++) {
      const expectationScore = userResponse.expectationScores[j];
      if (expectationScore[gradeField]) {
        isGraded = true;
        if (!expGrades[j]) {
          expGrades[j] = [];
        }
        expGrades[j].push(expectationScore[gradeField]);
      }
    }
    // each response needs at least one grade
    if (!isGraded) {
      return null;
    }
  }

  expGrades.forEach((expectation: [string]) => {
    let expectationScore = 0;
    expectation.forEach((grade: string) => {
      if (grade === 'Good') {
        expectationScore += 1;
      } else if (grade === 'Neutral') {
        expectationScore += 0.5;
      }
    });
    score += expectationScore / expectation.length;
  });

  return score / expGrades.length;
};

export default calculateScore;
