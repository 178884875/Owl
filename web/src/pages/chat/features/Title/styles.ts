import { createStyles } from 'antd-style';

export const useStyles = createStyles(
  ({ css, token}) => {
    return {
      active: css`
        background-color: ${token.colorFillSecondary};
  
        &:hover {
          background-color: ${token.colorFill};
        }
      `,
    };
  },
);
