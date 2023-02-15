import {useCallback, useState} from "react";
import {CallScreen} from "./screens/Call";
import {LoginScreen} from "./screens/Login";
import {ToastContainer} from "react-toastify";
import {getToken} from "./services/room";
import {notifyErrorMessage} from "./lib/handleError";

const ROOM = "ramailo" as const;

const App = () => {
  const [token, setToken] = useState("");

  const handleLoginPageSubmit = useCallback((username: string) => {
    getToken(username, ROOM).then(setToken).catch(notifyErrorMessage);
  }, []);

  const mainContent = <LoginScreen onSubmit={handleLoginPageSubmit} />;

  if (token) {
    return <CallScreen token={token} />;
  }

  return (
    <div className="w-screen h-screen bg-gradient overflow-hidden flex flex-col">
      <ToastContainer />
      {mainContent}
    </div>
  );
};

export default App;
