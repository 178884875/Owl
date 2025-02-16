import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      user-select: none;
      cursor: pointer;
      color: ${token.colorTextTertiary};
      width: auto;
      background-color: ${token.colorFillSecondary};
      padding: 8px;
      border-radius: 8px;
      &:active {
        background-color: ${token.colorFillSecondary};
      }

      &:hover {
        background-color: ${token.colorFillTertiary};
      }
    `,
    title: css`
        font-size: 16px;
        color: ${token.colorTextHeading};
        margin-left: 10px;
        align-items: center;
        display: flex;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
        font-weight: 500;
    `,
    top:css`
        margin-top: 5px;
    `,
  };
});
