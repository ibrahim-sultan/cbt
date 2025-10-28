// Auto-grading for objective questions (mcq, tf). Short answers left for manual grading.
export function gradeAttempt({ exam, questions, answers }) {
  const markCorrect = exam?.marking?.correct ?? 1;
  const markWrong = exam?.marking?.wrong ?? 0;
  const qById = new Map(questions.map((q) => [String(q._id), q]));

  let score = 0;
  const details = [];
  let hasSubjective = false;

  for (const ans of answers) {
    const q = qById.get(String(ans.question));
    if (!q) continue;

    let correct = false;
    if (q.type === 'mcq') {
      const correctIdxs = (q.options || []).map((o, i) => (o.isCorrect ? i : -1)).filter((i) => i >= 0);
      const given = (ans.selectedOptionIndexes || []).slice().sort();
      correct = JSON.stringify(given) === JSON.stringify(correctIdxs);
    } else if (q.type === 'tf') {
      const correctIdx = (q.options || []).findIndex((o) => o.isCorrect);
      const given = (ans.selectedOptionIndexes || [])[0];
      correct = given === correctIdx;
    } else if (q.type === 'short') {
      hasSubjective = true;
      correct = null; // manual grading later
    }

    if (correct === true) score += markCorrect;
    else if (correct === false) score += markWrong;

    details.push({ questionId: q._id, correct });
  }

  return { score, details, hasSubjective };
}
