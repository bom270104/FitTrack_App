import { StatusBar } from "react-native";
import { AppProvider } from "./app/app-context";
import Page from "./app/page";
import Toast from "react-native-toast-message";

export default function App() {
    return (
        <AppProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <Page />
            <Toast topOffset={64} />
        </AppProvider>
    );
}