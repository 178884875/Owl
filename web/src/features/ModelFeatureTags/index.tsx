import { Icon, Tooltip } from '@lobehub/ui';
import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { LucideEye, ToyBrick } from 'lucide-react';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import { formatTokenNumber } from '@/utils/format';

const useStyles = createStyles(({ css, token }) => ({
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
  token: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorTextSecondary};
    background: ${token.colorFillSecondary};
  `,
}));

interface TagsProps extends FlexboxProps {
  functionCall?: boolean;
  tokens?: number;
  vision?: boolean;
}

const ModelFeatureTags = memo<TagsProps>(({ children, tokens, vision, functionCall, ...rest }) => {
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} gap={4} horizontal wrap={'wrap'} {...rest}>
      {vision && (
        <Tooltip
          styles={{
            root: { pointerEvents: 'none' },
          }}
          title={'视觉模型'}
        >
          <Tag
            bordered={false}
            className={styles.tagGreen}
            icon={<Icon icon={LucideEye} />}
            style={{ flex: 'none', margin: 0 }}
          />
        </Tooltip>
      )}
      {functionCall && (
        <Tooltip
          styles={{
            root: { maxWidth: 'unset', pointerEvents: 'none' },
          }}
          title={'支持函数调用'}
        >
          <Tag
            bordered={false}
            className={styles.tagBlue}
            icon={<Icon icon={ToyBrick} />}
            style={{ flex: 'none', margin: 0 }}
          />
        </Tooltip>
      )}
      {tokens && (
        <Tooltip
          styles={{
            root: { pointerEvents: 'none' },
          }}
          title={'可用Token数量'}
        >
          <Tag bordered={false} className={styles.token} style={{ flex: 'none', margin: 0 }}>
            {formatTokenNumber(tokens)}
          </Tag>
        </Tooltip>
      )}
      {children}
    </Flexbox>
  );
});

export default ModelFeatureTags;
