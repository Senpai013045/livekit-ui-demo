import {
  MdMic,
  MdMicOff,
  MdVideocamOff,
  MdVideocam,
  MdCallEnd,
  MdScreenShare,
  MdStopScreenShare,
  MdFrontHand,
} from "react-icons/md";
import {useLocalCallState} from "./hooks/useCallState";
import {AudioRenderer, useRoom} from "@livekit/react-core";
import {useEffect, useMemo, useCallback, useState} from "react";
import {livekitConfig} from "./config/livekit";
import {ParticipantVideoRenderer} from "./components/ParticipantVideoRenderer";
import {twMerge} from "tailwind-merge";
import {Participant} from "livekit-client";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useHandRaise, HandRaiseCallBack} from "./hooks/useHandRaise";
import {Container} from "./components/Container";
import {JoinForm} from "./components/JoinForm";
import {getToken} from "./services/room";
import {notifyErrorMessage} from "./lib/handleError";

function App() {
  const {connect, room, participants, audioTracks, connectionState} = useRoom();
  const {callState, toggle} = useLocalCallState(room);
  const [token, setToken] = useState("");

  const onRemoteHandRaise: HandRaiseCallBack = useCallback((data, participant) => {
    if (!data.payload.isRaised) return;
    toast(`${participant.identity || "Someone"} raised their hand`, {
      theme: "dark",
      autoClose: 3000,
      hideProgressBar: true,
      position: "bottom-right",
    });
  }, []);

  const {raiseHand, rissenSids, lowerHand} = useHandRaise(room, onRemoteHandRaise);

  useEffect(() => {
    if (!token) return;
    connect(livekitConfig.host, token).catch(err => {
      alert(err.message);
      console.error(err);
    });
    return () => {
      room?.disconnect();
    };
  }, [connect, room, token]);

  const sortedParticipants = useMemo(() => {
    return participants.reduce<{
      local: Participant | null;
      remote: Participant[];
    }>(
      (accumulator, current) => {
        if (current.isLocal) {
          accumulator.local = current;
        } else {
          // accumulator.remote.push(current);
          accumulator.remote.push(current);
        }
        return accumulator;
      },
      {local: null, remote: []}
    );
  }, [participants]);

  const handleJoinFormSUbmit = useCallback((values: {user: string; room: string}) => {
    getToken(values.room, values.user).then(setToken).catch(notifyErrorMessage);
  }, []);

  return (
    <div>
      <ToastContainer />
      {!token ? (
        <Container>
          <JoinForm onSubmit={handleJoinFormSUbmit} />
        </Container>
      ) : (
        <Container>
          <nav>
            {connectionState}
            {audioTracks.map((track, index) => {
              return <AudioRenderer key={index} isLocal={false} track={track} />;
            })}
          </nav>
          <main
            className={twMerge(
              "flex-1 gap-4 grid",
              sortedParticipants.remote.length > 0 &&
                "grid-rows-[2fr,1fr] lg:grid-rows-1 lg:grid-cols-[2fr,1fr]"
            )}
          >
            {sortedParticipants.local && (
              <div
                className={twMerge(
                  "flex-1 relative bg-skype-dark-overlay w-full",
                  sortedParticipants.local.isSpeaking && "ring-4 ring-skype-light"
                )}
              >
                <p className="absolute top-0 left-0 p-2 bg-skype-dark-overlay opacity-75 z-10 text-sm">
                  {sortedParticipants.local.name || sortedParticipants.local.identity}
                </p>
                <ParticipantVideoRenderer
                  participant={sortedParticipants.local}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            {sortedParticipants.remote.length > 0 && (
              <div
                className={twMerge(
                  "flex-1 grid grid-cols-1 gap-4 align-middle justify-center",
                  sortedParticipants.remote.length >= 6 && "sm:grid-cols-3 lg:grid-cols-2",
                  sortedParticipants.remote.length >= 4 &&
                    "grid-cols-2 md:grid-cols-3 lg:grid-cols-2",
                  sortedParticipants.remote.length >= 3 &&
                    "grid-cols-2 md:grid-cols-3 lg:grid-cols-2",
                  sortedParticipants.remote.length >= 2 && "grid-cols-2 lg:grid-cols-1"
                )}
              >
                {sortedParticipants.remote.slice(0, 6).map(participant => {
                  return (
                    <div
                      key={participant.sid}
                      className={twMerge(
                        "relative bg-skype-dark-overlay",
                        participant.isSpeaking && "ring-4 ring-skype-light"
                      )}
                    >
                      <p className="absolute top-0 left-0 p-2 bg-skype-dark-overlay opacity-75 z-10 text-sm flex gap-x-4">
                        <span>{participant.name || participant.identity}</span>
                        {rissenSids.has(participant.sid) && (
                          <figure>
                            <MdFrontHand />
                          </figure>
                        )}
                      </p>
                      <ParticipantVideoRenderer
                        participant={participant}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </main>
          <footer className="flex justify-center items-center text-2xl gap-x-4">
            {/* pill */}
            <div className="bg-skype-dark-overlay rounded-full p-2 flex gap-x-3">
              <button className="p-1" onClick={() => toggle("isMicOn")}>
                {!callState.isMicOn ? <MdMicOff className="text-skype-red" /> : <MdMic />}
              </button>
              <button className="p-1" onClick={() => toggle("isCameraOn")}>
                {!callState.isCameraOn ? (
                  <MdVideocamOff className="text-skype-red" />
                ) : (
                  <MdVideocam />
                )}
              </button>
            </div>
            <button className="p-2 rounded-full bg-skype-red" onClick={() => room?.disconnect()}>
              <MdCallEnd />
            </button>
            <button onClick={() => toggle("isScreenShareOn")}>
              {!callState.isScreenShareOn ? (
                <MdStopScreenShare className="text-skype-red" />
              ) : (
                <MdScreenShare />
              )}
            </button>
            <button
              onClick={rissenSids.has(room?.localParticipant?.sid || "") ? lowerHand : raiseHand}
            >
              <MdFrontHand
                className={twMerge(
                  "text-skype-red",
                  rissenSids.has(room?.localParticipant?.sid || "") && "text-skype-light"
                )}
              />
            </button>
          </footer>
        </Container>
      )}
    </div>
  );
}

export default App;
