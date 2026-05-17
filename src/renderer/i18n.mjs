export const DEFAULT_LOCALE = 'en';

const COPY = {
  en: {
    appLabel: 'Bird Companion',
    buttons: {
      mute: 'Mute',
      unmute: 'Unmute',
      global: 'Toggle global listening',
      language: '中',
      minimize: 'Minimize',
      close: 'Close'
    },
    stats: {
      keys: 'keys',
      total: 'total',
      session: 'session',
      kps: 'kps'
    },
    modes: {
      focus: 'Focus',
      global: 'Global'
    },
    states: {
      waiting: 'waiting'
    },
    settings: {
      rate: 'Rate',
      volume: 'Vol'
    },
    moods: {
      idle: 'Idle branch',
      curious: 'Curious chirp',
      busy: 'Busy flock',
      alert: 'Sharp alert',
      chorus: 'Small chorus',
      sleepy: 'Quiet perch'
    },
    fallbackBirdName: 'Silent branch',
    keyLabels: {
      erase: 'del',
      chorus: 'enter',
      rest: 'space'
    }
  },
  zh: {
    appLabel: '小鸟伴侣',
    buttons: {
      mute: '静音',
      unmute: '取消静音',
      global: '切换全局监听',
      language: 'EN',
      minimize: '最小化',
      close: '关闭'
    },
    stats: {
      keys: '键',
      total: '总数',
      session: '本次',
      kps: '键/秒'
    },
    modes: {
      focus: '聚焦',
      global: '全局'
    },
    states: {
      waiting: '等待'
    },
    settings: {
      rate: '频',
      volume: '音'
    },
    moods: {
      idle: '安静枝头',
      curious: '好奇啾鸣',
      busy: '忙碌鸟群',
      alert: '警觉短鸣',
      chorus: '小型合唱',
      sleepy: '静静栖息'
    },
    fallbackBirdName: '安静枝头',
    keyLabels: {
      erase: '删除',
      chorus: '回车',
      rest: '空格'
    }
  }
};

export function normalizeLocale(locale = DEFAULT_LOCALE) {
  if (locale === 'zh-CN' || locale === 'zh-Hans' || locale === 'zh') return 'zh';
  return Object.hasOwn(COPY, locale) ? locale : DEFAULT_LOCALE;
}

export function nextLocale(locale = DEFAULT_LOCALE) {
  return normalizeLocale(locale) === 'en' ? 'zh' : 'en';
}

export function getCopy(locale = DEFAULT_LOCALE) {
  return COPY[normalizeLocale(locale)];
}
