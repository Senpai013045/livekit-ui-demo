import {
  MdMic,
  MdMicOff,
  MdVideocamOff,
  MdVideocam,
  MdCallEnd,
  MdScreenShare,
  MdStopScreenShare,
  MdFrontHand,
  MdPeople,
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
  const [showParticipants, setShowParticipants] = useState(false);

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
    connect(livekitConfig.host, token)
      .then(connectedRoom => {
        if (!connectedRoom) return;
        connectedRoom.startAudio();
      })
      .catch(err => {
        alert(err.message);
        console.error(err);
      });
    return () => {
      room?.disconnect();
    };
  }, [connect, room, token]);

  const sortedParticipants = useMemo(() => {
    return participants.reduce<{
      focused: Participant | null;
      nonfocused: Participant[];
    }>(
      (accumulator, current) => {
        const name = current.name || current.identity;
        if (name === "supervisor") {
          return {...accumulator, focused: current};
        }
        return {...accumulator, nonfocused: [...accumulator.nonfocused, current]};
      },
      {
        focused: participants.find(p => p.isLocal) || null,
        nonfocused: [],
      }
    );
  }, [participants]);

  const handleJoinFormSUbmit = useCallback((values: {user: string; room: string}) => {
    getToken(values.user, values.room).then(setToken).catch(notifyErrorMessage);
  }, []);

  const canLocalPublish = Boolean(room?.localParticipant?.permissions?.canPublish);
  const isSupervisor = Boolean(
    room && (room.localParticipant.name || room.localParticipant.identity) === "supervisor"
  );

  return (
    <div>
      {showParticipants && (
        //modal for list of participants
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="bg-skype-dark-overlay rounded-lg shadow-lg p-4 text-skype-light text-base min-w-[300px]">
            <nav className="flex justify-end mb-4">
              {/* close modal */}
              <button onClick={() => setShowParticipants(false)}>&#10005;</button>
            </nav>
            <h2 className="text-lg font-bold mb-4 border-b border-skype-light">Participants</h2>
            <ul>
              {/* {room?.participants.map(participant => { */}
              {room &&
                Array.from(room.participants.values()).map(participant => {
                  return (
                    <li key={participant.sid} className="flex items-center gap-x-4">
                      <span>{participant.name || participant.identity}</span>
                      {/* <button>
                        <MdFrontHand className="text-skype-light" />
                      </button> */}
                      {rissenSids.has(participant.sid) && (
                        <button>
                          <MdFrontHand className="text-skype-light" />
                        </button>
                      )}
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
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
              sortedParticipants.nonfocused.length > 0 &&
                "grid-rows-[2fr,1fr] lg:grid-rows-1 lg:grid-cols-[2fr,1fr]",
              !sortedParticipants.focused && "grid-cols-1 lg:grid-cols-1"
            )}
          >
            {sortedParticipants.focused && (
              <div
                className={twMerge(
                  "flex-1 relative bg-skype-dark-overlay w-full",
                  sortedParticipants.focused.isSpeaking && "ring-4 ring-skype-light"
                )}
              >
                <p className="absolute top-0 left-0 p-2 bg-skype-dark-overlay opacity-75 z-10 text-sm">
                  {sortedParticipants.focused.name || sortedParticipants.focused.identity}
                </p>
                <ParticipantVideoRenderer
                  participant={sortedParticipants.focused}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            {sortedParticipants.nonfocused.length > 0 && (
              <div
                className={twMerge(
                  "flex-1 grid grid-cols-1 gap-4 align-middle justify-center",
                  "grid-cols-2 md:grid-cols-3 lg:grid-cols-2",
                  sortedParticipants.nonfocused.length >= 2 && "grid-cols-2 lg:grid-cols-1",
                  sortedParticipants.nonfocused.length >= 3 &&
                    sortedParticipants.nonfocused.length >= 4 &&
                    "grid-cols-2 md:grid-cols-3 lg:grid-cols-2",
                  sortedParticipants.nonfocused.length >= 6 && "sm:grid-cols-3 lg:grid-cols-2"
                )}
              >
                {sortedParticipants.nonfocused.slice(0, 6).map(participant => {
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
                        {rissenSids.has(participant.sid) && <MdFrontHand />}
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
            <div className={twMerge("bg-skype-dark-overlay rounded-full p-2 flex gap-x-3")}>
              <button
                className={twMerge("p-1", !canLocalPublish && "opacity-50 cursor-not-allowed")}
                title={
                  canLocalPublish ? "Toggle Mic" : "You don't have permission to publish audio"
                }
                onClick={() => toggle("isMicOn")}
                disabled={!canLocalPublish}
              >
                {!callState.isMicOn ? <MdMicOff className="text-skype-red" /> : <MdMic />}
              </button>
              <button
                disabled={!canLocalPublish}
                className={twMerge("p-1", !canLocalPublish && "opacity-50 cursor-not-allowed")}
                onClick={() => toggle("isCameraOn")}
                title={
                  canLocalPublish ? "Toggle Camera" : "You don't have permission to publish video"
                }
              >
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
            {
              //if only user is supervisor then
              isSupervisor && (
                <button
                  disabled={!canLocalPublish}
                  className={twMerge("p-1", !canLocalPublish && "opacity-50 cursor-not-allowed")}
                  onClick={() => toggle("isScreenShareOn")}
                  title={
                    canLocalPublish
                      ? "Toggle Screen Share"
                      : "You don't have permission to publish screen share"
                  }
                >
                  {!callState.isScreenShareOn ? (
                    <MdStopScreenShare className="text-skype-red" />
                  ) : (
                    <MdScreenShare />
                  )}
                </button>
              )
            }
            {isSupervisor && (
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
            )}

            {/* button for toggling participants */}
            <button onClick={() => setShowParticipants(prev => !prev)}>
              <MdPeople
                className={twMerge("text-skype-red", showParticipants && "text-skype-light")}
              />
            </button>
          </footer>
        </Container>
      )}
    </div>
  );
}

export default App;
