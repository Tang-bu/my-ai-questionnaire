// 响应式设计工具和样式常量

// 断点定义
export const BREAKPOINTS = {
  xs: 375,    // 手机小屏幕
  sm: 640,    // 手机大屏幕/平板竖屏
  md: 768,    // 平板横屏
  lg: 1024,   // 小桌面
  xl: 1280,   // 桌面
  '2xl': 1536, // 大桌面
} as const;

// 媒体查询字符串
export const MEDIA_QUERIES = {
  xs: `@media (min-width: ${BREAKPOINTS.xs}px)`,
  sm: `@media (min-width: ${BREAKPOINTS.sm}px)`,
  md: `@media (min-width: ${BREAKPOINTS.md}px)`,
  lg: `@media (min-width: ${BREAKPOINTS.lg}px)`,
  xl: `@media (min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `@media (min-width: ${BREAKPOINTS['2xl']}px)`,
} as const;

// 字体大小系统
export const FONT_SIZES = {
  // 标题
  h1: {
    base: '28px',
    sm: '32px',
    md: '36px',
    lg: '42px',
  },
  h2: {
    base: '24px',
    sm: '26px',
    md: '28px',
    lg: '32px',
  },
  h3: {
    base: '20px',
    sm: '22px',
    md: '24px',
    lg: '28px',
  },

  // 正文
  bodyLg: {
    base: '18px',
    sm: '19px',
    md: '20px',
  },
  body: {
    base: '16px',
    sm: '17px',
    md: '18px',
  },
  bodySm: {
    base: '14px',
    sm: '15px',
    md: '16px',
  },

  // 标签和小字
  label: {
    base: '14px',
    sm: '15px',
  },
  caption: {
    base: '12px',
    sm: '13px',
  },
} as const;

// 间距系统 (基于8px网格)
export const SPACING = {
  // 内边距
  padding: {
    page: {
      base: '20px 16px',
      sm: '32px 20px',
      md: '40px 24px',
      lg: '48px 32px',
    },
    container: {
      base: '24px 20px',
      sm: '32px 28px',
      md: '40px 36px',
      lg: '48px 40px',
    },
    card: {
      base: '20px',
      sm: '24px',
      md: '28px',
    },
  },

  // 元素间距
  gap: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
} as const;

// 布局系统
export const LAYOUT = {
  grid: {
    // 网格列数配置
    columns: {
      1: '1fr',
      2: 'repeat(2, 1fr)',
      3: 'repeat(auto-fit, minmax(240px, 1fr))',
      4: 'repeat(auto-fit, minmax(200px, 1fr))',
    },

    // 网格间距
    gap: {
      base: '16px',
      sm: '20px',
      md: '24px',
    },
  },

  // 容器最大宽度
  containerWidth: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

// 表单样式
export const FORM_STYLES = {
  input: {
    height: {
      base: '48px', // 手机触摸友好
      sm: '44px',
    },
    fontSize: {
      base: '16px', // 手机字体稍大
      sm: '15px',
    },
    padding: {
      horizontal: '14px',
      vertical: '12px',
    },
    borderRadius: '10px',
  },

  button: {
    height: {
      base: '48px', // 手机触摸友好
      sm: '44px',
    },
    minWidth: {
      base: '100%', // 手机全宽
      sm: '120px',
    },
    fontSize: '16px',
    borderRadius: '12px',
  },
} as const;

// 卡片样式
export const CARD_STYLES = {
  default: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  },
  elevated: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
  },
} as const;

// 实用工具函数
export const responsive = {
  // 创建响应式字体
  fontSize(size: keyof typeof FONT_SIZES): Record<string, any> {
    const sizes = FONT_SIZES[size];
    const style: Record<string, any> = {
      fontSize: sizes.base,
    };

    // 添加媒体查询
    if (sizes.sm) {
      style[MEDIA_QUERIES.sm] = { fontSize: sizes.sm };
    }
    if (sizes.md) {
      style[MEDIA_QUERIES.md] = { fontSize: sizes.md };
    }
    if (sizes.lg) {
      style[MEDIA_QUERIES.lg] = { fontSize: sizes.lg };
    }

    return style;
  },

  // 创建响应式间距
  spacing(type: keyof typeof SPACING.padding, level: keyof typeof SPACING.padding['page']): Record<string, any> {
    const spacing = SPACING.padding[type];
    const style: Record<string, any> = {
      padding: spacing.base,
    };

    // 添加媒体查询
    if (spacing.sm) {
      style[MEDIA_QUERIES.sm] = { padding: spacing.sm };
    }
    if (spacing.md) {
      style[MEDIA_QUERIES.md] = { padding: spacing.md };
    }
    if (spacing.lg) {
      style[MEDIA_QUERIES.lg] = { padding: spacing.lg };
    }

    return style;
  },

  // 创建响应式网格
  grid(columns: keyof typeof LAYOUT.grid.columns = '1', gap: keyof typeof SPACING.gap = 'lg'): Record<string, any> {
    const baseColumns = LAYOUT.grid.columns[1]; // 手机默认单列
    const responsiveColumns = LAYOUT.grid.columns[columns as any];

    const style: Record<string, any> = {
      display: 'grid',
      gridTemplateColumns: baseColumns,
      gap: SPACING.gap[gap],
    };

    // 添加媒体查询
    if (responsiveColumns !== baseColumns) {
      style[MEDIA_QUERIES.sm] = { gridTemplateColumns: responsiveColumns };
    }

    return style;
  },

  // 创建响应式按钮
  button(minWidth: keyof typeof FORM_STYLES.button.minWidth = 'base'): Record<string, any> {
    const style: Record<string, any> = {
      minHeight: FORM_STYLES.button.height.base,
      width: '100%', // 手机全宽
      minWidth: '100%',
    };

    // 添加媒体查询
    style[MEDIA_QUERIES.sm] = {
      minHeight: FORM_STYLES.button.height.sm,
      width: 'auto',
      minWidth: FORM_STYLES.button.minWidth[minWidth],
    };

    return style;
  },
};

// 样式混合器
export const mixins = {
  // 触摸友好按钮
  touchFriendly: {
    minHeight: '48px',
    padding: '12px 20px',
    fontSize: '16px',
    lineHeight: '1.5',
    cursor: 'pointer',
    userSelect: 'none',
  },

  // 阴影卡片
  cardShadow: {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    transition: 'box-shadow 0.2s ease',
    '&:hover': {
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    },
  },

  // 文字截断
  textTruncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // 多行文字截断
  textClamp(lines: number = 2): Record<string, any> {
    return {
      display: '-webkit-box',
      WebkitLineClamp: lines,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
    };
  },
};

// 主题颜色
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

// 导出默认样式配置
export const DEFAULT_STYLES = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    ...responsive.spacing('page', 'base'),
  },
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Arial, sans-serif',
    ...responsive.spacing('page', 'base'),
  },
  card: {
    ...CARD_STYLES.elevated,
    ...responsive.spacing('container', 'base'),
  },
} as const;