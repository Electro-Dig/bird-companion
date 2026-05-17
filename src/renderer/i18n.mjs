export const DEFAULT_LOCALE = 'en';

const COPY = {
  en: {
    appLabel: 'Bird Companion',
    buttons: {
      mute: 'Mute',
      unmute: 'Unmute',
      global: 'Toggle global listening',
      language: '中',
      help: 'Help',
      support: 'Support the maker',
      moreInfo: 'More',
      minimize: 'Minimize',
      close: 'Close'
    },
    stats: {
      keys: 'keys',
      total: 'total',
      today: 'today',
      session: 'session',
      kps: 'kps',
      noData: 'no keys yet'
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
    guide: {
      title: 'Quick guide',
      lines: {
        drag: 'Drag the bird body to place it.',
        global: 'G listens across apps by default.',
        sound: 'Use 1/3/5 and the slider to tune calls.',
        stats: 'Open keys for daily key heatmaps.'
      },
      note: 'Only aggregate key counts are stored locally.'
    },
    support: {
      title: 'Buy me a coffee',
      copy: 'If you like this app, you are welcome to support the maker.'
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
      help: '使用指南',
      support: '支持参与者',
      moreInfo: '更多',
      minimize: '最小化',
      close: '关闭'
    },
    stats: {
      keys: '键',
      total: '总数',
      today: '今天',
      session: '本次',
      kps: '键/秒',
      noData: '暂无按键'
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
    guide: {
      title: '使用指南',
      lines: {
        drag: '拖动小鸟身体来摆放位置。',
        global: 'G 默认开启，监听全局键盘。',
        sound: '用 1/3/5 和音量条调节鸟叫。',
        stats: '打开 keys 查看每日按键热区。'
      },
      note: '本地只保存聚合按键次数，不保存输入文本。'
    },
    support: {
      title: '给我一杯咖啡',
      copy: '如果你喜欢这个应用，欢迎支持创作者。'
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
