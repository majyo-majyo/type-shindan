'use strict';
const data = window.NICKNAME_DATA;
const scoring = window.NicknameScoring;
const FAMILY_COUNT = data.roleQuestions.length;
const TOTAL_COUNT = FAMILY_COUNT + data.detailQuestions[0].length;
const $ = id => document.getElementById(id);
let answers = [], step = 0, appearance = 'female', current = null, currentTie = false, preview = false;
function screen(id) { for (const name of ['home', 'quiz', 'result']) $(name).hidden = name !== id; }
function showQuestion() {
  screen('quiz');
  const family = step < FAMILY_COUNT ? null : scoring.family(answers.slice(0, FAMILY_COUNT), data).index;
  const q = step < FAMILY_COUNT ? data.roleQuestions[step] : data.detailQuestions[family][step - FAMILY_COUNT];
  $('stage').textContent = step < FAMILY_COUNT ? '01 / いつもの動き方' : '02 / もう少し、あなたのこと';
  $('count').textContent = `${step + 1} / ${TOTAL_COUNT}`;
  $('bar').style.width = `${step / TOTAL_COUNT * 100}%`;
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuemax', TOTAL_COUNT);
  document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', step);
  $('question').textContent = q[0];
  $('choices').replaceChildren();
  [1, 0].forEach((value, index) => {
    const button = document.createElement('button'); button.className = 'choice';
    button.textContent = `${q[index + 1]}　→`;
    button.setAttribute('aria-pressed', String(answers[step] === value));
    button.onclick = () => {
      // Changing any early response invalidates the adaptive follow-up answers.
      if (step < FAMILY_COUNT && answers[step] !== value) answers = answers.slice(0, step);
      answers[step] = value;
      if (step === TOTAL_COUNT - 1) { const found = scoring.result(answers, data); preview = false; showResult(found.entry, found.tied); }
      else { step++; showQuestion(); }
    };
    $('choices').append(button);
  });
  $('back').hidden = step === 0;
  $('question').focus();
}
function shareText() { return `私のあだ名は「${current.nickname}」でした。\nあなたはどのキャラクター？\n#あだ名メーカー #タイプ診断`; }
function resultText() {
  return [current.nickname, current.description, ...current.reading.map(section =>
    [section.title, ...(section.paragraphs || []), ...(section.items || []).map(text => `・${text}`)].join('\n'))].join('\n\n');
}
function paintArt() {
  $('male').setAttribute('aria-pressed', String(appearance === 'male'));
  $('female').setAttribute('aria-pressed', String(appearance === 'female'));
  $('pose').textContent = `イラストの予定：${current[appearance + '_pose']}`;
  $('pose').hidden = true;
  const holder = $('result-art'); holder.replaceChildren();
  const src = current.images[appearance];
  function pending() {
    holder.replaceChildren(); const div = document.createElement('div'); div.className = 'art-pending';
    const num = document.createElement('span'); num.className = 'number'; num.textContent = current.id.slice(1);
    const text = document.createElement('p'); text.textContent = 'このキャラクターの専用イラストは制作中です。';
    const small = document.createElement('p'); small.className = 'small'; small.textContent = '男女それぞれ、違うポーズで描きます。'; div.append(num, text, small); holder.append(div);
  }
  if (src) { const img = document.createElement('img'); img.src = src; img.alt = `${current.nickname}・${appearance === 'male' ? '男の子' : '女の子'}版`; img.onerror = pending; holder.append(img); } else pending();
}
function showResult(entry, tied = false) {
  current = entry; currentTie = tied; screen('result');
  $('result-id').textContent = `${preview ? 'RESULT PREVIEW' : 'YOUR CHARACTER'} / ${entry.id}`;
  $('result-name').textContent = entry.nickname;
  $('result-copy').textContent = entry.description;
  const reading = $('result-reading');
  reading.replaceChildren();
  for (const [index, section] of entry.reading.entries()) {
    const card = document.createElement('section'); card.className = 'reading-section';
    const heading = document.createElement('h2'); heading.textContent = section.title;
    const number = document.createElement('span'); number.className = 'reading-number';
    number.textContent = String(index + 1).padStart(2, '0');
    card.append(number, heading);
    for (const text of section.paragraphs || []) {
      const paragraph = document.createElement('p'); paragraph.textContent = text; card.append(paragraph);
    }
    if (section.items) {
      const list = document.createElement('ul');
      for (const text of section.items) { const item = document.createElement('li'); item.textContent = text; list.append(item); }
      card.append(list);
    }
    reading.append(card);
  }
  $('tie').textContent = currentTie ? 'あなたには、ほかにも近い傾向がありそうです。今回はこのキャラクターとして楽しんでみてください。' : '';
  const url = new URL('https://twitter.com/intent/tweet'); url.searchParams.set('text', shareText());
  // Never put a localhost or file URL into a public share.
  if (location.protocol === 'https:' && !['localhost','127.0.0.1'].includes(location.hostname)) url.searchParams.set('url', location.href.split('#')[0]);
  $('share').href = url.href;
  $('toast').textContent = ''; paintArt(); $('result-name').focus();
  const ad = entry.affiliate;
  $('affiliate').hidden = !ad;
  if (ad) {
    $('affiliate-image-link').href = ad.url;
    $('affiliate-image').src = ad.image_url;
    $('affiliate-image').alt = 'もこもこ毛布・ブランケットの商品画像';
    $('affiliate-title').textContent = ad.title;
    $('affiliate-copy').textContent = ad.copy;
    $('affiliate-link').textContent = ad.label;
    $('affiliate-link').href = ad.url;
  }
}
$('start').onclick = () => { answers = []; step = 0; showQuestion(); };
$('back').onclick = () => { if (step > 0) { step--; showQuestion(); } };
$('restart').onclick = () => { answers = []; step = 0; current = null; screen('home'); $('start').focus(); window.scrollTo({top:0, behavior:'smooth'}); };
for (const value of ['male','female']) $(value).onclick = () => { appearance = value; if (current) paintArt(); };
$('copy').onclick = async () => {
  try { await navigator.clipboard.writeText(resultText()); $('toast').textContent = '詳しい診断結果をコピーしました。'; }
  catch { $('toast').textContent = 'コピーできませんでした。あだ名の文字を選択してコピーしてください。'; }
};
for (const entry of data.results) {
  const button = document.createElement('button'); button.textContent = `${entry.id} ${entry.nickname}`;
  button.onclick = () => { preview = true; showResult(entry); window.scrollTo({top:0, behavior:'smooth'}); };
  $('catalog').append(button);
}
