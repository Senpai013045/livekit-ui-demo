import {useCallback, useState} from "react";
import {CallScreen} from "./screens/Call";
import {LoginScreen} from "./screens/Login";
import {getToken} from "./services/room";
import {notifyErrorMessage} from "./lib/handleError";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {PageLoader} from "./components/PageLoader";

const ROOM = "ramailo" as const;

const App = () => {
  const [token, setToken] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleLoginPageSubmit = useCallback((username: string) => {
    setIsLoading(true);
    getToken(username, ROOM)
      .then(setToken)
      .catch(notifyErrorMessage)
      .finally(() => setIsLoading(false));
  }, []);

  let mainContent = <LoginScreen onSubmit={handleLoginPageSubmit} />;

  if (token) {
    mainContent = <CallScreen token={token} />;
  }

  return (
    <div className="w-screen h-screen bg-gradient overflow-hidden flex flex-col">
      <ToastContainer />
      {isLoading && <PageLoader />}
      <div className="flex-1 flex flex-col">{mainContent}</div>
    </div>
  );
};

export default App;
