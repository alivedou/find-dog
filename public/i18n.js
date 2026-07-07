/* i18n module — auto-detect browser language, zh/en */
const I18N = {
  zh: {
    pageTitle: '找着了，就是你。- find.exp.dog',
    scanTitle: '🔍 正在全网寻找水经验的人…',
    scanSub: 'find.exp.dog 正在分析论坛发帖记录',
    dbConnected: '✓ 已连接论坛数据库',
    scanReady: '准备扫描…',
    scanning: 'Scanning...',
    resultTitle: '🎯 找着了，就是你。',
    resultSub: '（不要慌，只是随机抽中的一只狗 🐶）',
    nextDog: '🐶 再抓一只',
    copyBtn: '📋 分享',
    copiedBtn: '✅ 已复制',
    wallTitle: '🐾 水狗留言墙',
    wallLoading: '加载中…',
    wallPlaceholder: '被抓到了，留下句话…',
    wallEmpty: '还没有留言，做第一个被抓到的狗 🐶',
    counter: '🏆 你是第 {count} 个被找到的水狗',
    footer: 'find.exp.dog \u00a0|\u00a0 留言墙内容为用户发布，不代表本站立场',
    manualCopy: '手动复制：',
    tips: [
      '经验+1。',
      '今天也是认真水经验的一天。',
      '已通知版主（假的）。',
      '水帖嫌疑人已锁定。',
      '论坛最靓的狗出现了。',
      '放心，这只是随机抽中的狗。',
      '今日水经验指数：99%。'
    ],
    scanMsgs: ['读取发帖记录...', '分析水经验指数...', '锁定可疑目标...', '目标确认...']
  },
  en: {
    pageTitle: 'Found you. - find.exp.dog',
    scanTitle: '🔍 Scanning the forum for serial posters…',
    scanSub: 'find.exp.dog is reviewing posting records',
    dbConnected: '✓ Forum database connected',
    scanReady: 'Preparing scan…',
    scanning: 'Scanning...',
    resultTitle: '🎯 Found you.',
    resultSub: '(Relax — just a randomly picked dog 🐶)',
    nextDog: '🐶 Another one',
    copyBtn: '📋 Copy',
    copiedBtn: '✅ Copied',
    wallTitle: '🐾 Dog Wall',
    wallLoading: 'Loading…',
    wallPlaceholder: 'You got caught — leave a note…',
    wallEmpty: 'No notes yet. Be the first caught dog 🐶',
    counter: '🏆 You\'re the {count}th dog found',
    footer: 'find.exp.dog \u00a0|\u00a0 User posts only; not site views',
    manualCopy: 'Copy manually:',
    tips: [
      'XP +1.',
      'Another day of quality posting.',
      'Mods notified (not really).',
      'Suspect locked in.',
      'The forum\'s finest dog has arrived.',
      'Relax — it\'s just a random dog.',
      'Today\'s posting index: 99%.'
    ],
    scanMsgs: ['Reading posts...', 'Analyzing posting index...', 'Locking target...', 'Target confirmed...']
  }
};

let currentLang = detectLang();

function detectLang() {
  const saved = localStorage.getItem('find-dog-lang');
  if (saved === 'zh' || saved === 'en') return saved;
  const nav = (navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase();
  return nav.startsWith('zh') ? 'zh' : 'en';
}

function t(key, vars) {
  let str = (I18N[currentLang] && I18N[currentLang][key]) || I18N.zh[key] || key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      str = str.replace('{' + k + '}', vars[k]);
    });
  }
  return str;
}

function getTips() {
  return I18N[currentLang].tips;
}

function getScanMsgs() {
  return I18N[currentLang].scanMsgs;
}

function setLang(lang) {
  if (lang !== 'zh' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem('find-dog-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  applyI18n();
}

function applyI18n() {
  document.title = t('pageTitle');
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn && !shareBtn.classList.contains('copied')) {
    shareBtn.textContent = t('copyBtn');
  }
  var wallList = document.getElementById('wallList');
  if (wallList) {
    if (wallList.dataset.state === 'loading') wallList.textContent = t('wallLoading');
    else if (wallList.dataset.state === 'empty') {
      wallList.innerHTML = '<div style="color:#666;font-size:.85rem">' + t('wallEmpty') + '</div>';
    }
  }
  if (typeof window.lastCount === 'number') {
    var counter = document.getElementById('counter');
    if (counter) counter.textContent = t('counter', { count: window.lastCount });
  }
  var langZh = document.getElementById('langZh');
  var langEn = document.getElementById('langEn');
  if (langZh) langZh.classList.toggle('active', currentLang === 'zh');
  if (langEn) langEn.classList.toggle('active', currentLang === 'en');
  var status = document.getElementById('status');
  if (status && !window.scanDone) status.textContent = t('scanReady');
}

applyI18n();