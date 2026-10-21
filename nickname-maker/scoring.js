(function (root) {
  'use strict';
  function nearest(answers, profiles) {
    if (!Array.isArray(answers) || answers.length !== 6 || Array.from(answers).some(x => x !== 0 && x !== 1)) throw new Error('6つの回答が必要です');
    if (!profiles.length || profiles.some(p => !/^[01]{6}$/.test(p))) throw new Error('6項目の採点設定が必要です');
    const distances = profiles.map(p => [...p].reduce((n, bit, i) => n + (Number(bit) !== answers[i] ? 1 : 0), 0));
    const min = Math.min(...distances);
    return {index: distances.indexOf(min), tied: distances.filter(x => x === min).length > 1};
  }
  function family(answers, data) { return nearest(answers, data.roleProfiles); }
  function result(answers, data) {
    if (!Array.isArray(answers) || answers.length !== 12) throw new Error('12問に回答してください');
    const f = family(answers.slice(0, 6), data);
    const candidates = data.results.slice(f.index * 10, f.index * 10 + 10);
    const detail = nearest(answers.slice(6), candidates.map(r => r.profile));
    return {entry: candidates[detail.index], tied: f.tied || detail.tied};
  }
  root.NicknameScoring = {nearest, family, result};
  if (typeof module !== 'undefined') module.exports = root.NicknameScoring;
})(typeof window === 'undefined' ? globalThis : window);
