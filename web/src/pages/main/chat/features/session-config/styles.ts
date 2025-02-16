import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => {
  return {
    expanded: css`
	    -webkit-animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
	        animation: slide-in-right 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    `,
    collapsed: css`
        -webkit-animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                animation: slide-out-right 0.3s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
    `,
    container: css`
        background-color: ${token.colorFillSecondary};
        overflow: 'hidden';
    `,
  };
});
