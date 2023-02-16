import {useCallback, useState} from "react";
import {CallScreen} from "./screens/Call";
import {LoginScreen} from "./screens/Login";
import {getToken} from "./services/room";
import {notifyErrorMessage} from "./lib/handleError";
import {AudioRenderer, useRoom} from "@livekit/react-core";
import {livekitConfig} from "./config/livekit";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {PageLoader} from "./components/PageLoader";
import {Room} from "livekit-client";

const ROOM = "ramailo" as const;

const App = () => {
  const {connect, participants, audioTracks} = useRoom();
  const [room, setRoom] = useState<Room>();

  const [isLoading, setIsLoading] = useState(false);

  const handleLoginPageSubmit = useCallback(
    (username: string) => {
      setIsLoading(true);
      getToken(username, ROOM)
        .then(receivedToken => {
          connect(livekitConfig.host, receivedToken)
            .then(async connectedRoom => {
              if (!connectedRoom) return;
              connectedRoom.startAudio();
              connectedRoom.localParticipant.setMicrophoneEnabled(false);
              connectedRoom.localParticipant.setCameraEnabled(false);
              connectedRoom.localParticipant.setScreenShareEnabled(false);
              setRoom(connectedRoom);
            })
            .catch(notifyErrorMessage);
        })
        .catch(notifyErrorMessage)
        .finally(() => setIsLoading(false));
    },
    [connect]
  );

  let mainContent = <LoginScreen onSubmit={handleLoginPageSubmit} />;

  if (room) {
    mainContent = <CallScreen participants={participants} room={room} />;
  }

  return (
    <div className="w-screen h-screen bg-gradient overflow-hidden flex flex-col">
      <ToastContainer />
      {isLoading && <PageLoader />}
      <nav>
        {audioTracks.map((track, index) => {
          return <AudioRenderer key={index} isLocal={false} track={track} />;
        })}
      </nav>
      <div className="flex-1 flex flex-col">{mainContent}</div>
    </div>
  );
};

export default App;
