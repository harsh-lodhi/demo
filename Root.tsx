import { App } from "expo-router/_app";
import { RecoilRoot } from "recoil";
import { PaperProvider, DefaultTheme } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const Root = () => {
  return (
    <PaperProvider theme={DefaultTheme}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </RecoilRoot>
    </PaperProvider>
  );
};

export default Root;
