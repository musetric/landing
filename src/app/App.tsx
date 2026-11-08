import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import { findRoute } from './routes.js';
import { theme } from './theme.js';

type AppProps = {
  pathname: string;
};

export const App = (props: AppProps) => {
  const { pathname } = props;
  const { page: Page } = findRoute(pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: {
            scrollBehavior: 'smooth',
          },
          body: {
            backgroundColor: theme.palette.background.default,
          },
        }}
      />
      <Page />
    </ThemeProvider>
  );
};
