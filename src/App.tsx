import {
  MdMic,
  MdMicOff,
  MdVideocamOff,
  MdVideocam,
  MdCallEnd,
  MdScreenShare,
  MdStopScreenShare,
} from "react-icons/md";
import {useCallState} from "./hooks/useCallState";
import {useRoom} from "@livekit/react-core";
import {useEffect, useRef, useMemo} from "react";
import {livekitConfig} from "./config/livekit";
import {ParticipantVideoRenderer} from "./components/ParticipantVideoRenderer";
import {twMerge} from "tailwind-merge";
import {useElementSize} from "./hooks/useElementSize";
import {Participant} from "livekit-client";

const token = new URLSearchParams(window.location.search).get("token") || "";

function App() {
  const {connect, isConnecting, room, error, participants, audioTracks, connectionState} =
    useRoom();
  const {callState, toggle} = useCallState(room);
  useEffect(() => {
    if (!token) return;
    connect(livekitConfig.host, token).catch(err => {
      alert(err.message);
      console.error(err);
    });
    return () => {
      room?.disconnect();
    };
  }, [connect, room]);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useElementSize(containerRef);

  const sortedParticipants = useMemo(() => {
    return participants.reduce<{
      local: Participant[];
      remote: Participant[];
    }>(
      (accumulator, current) => {
        if (current.isLocal) {
          accumulator.local.push(current);
        } else {
          accumulator.remote.push(current);
        }
        return accumulator;
      },
      {local: [], remote: []}
    );
  }, [participants]);

  return (
    <div className="w-screen h-screen p-4 bg-skype-dark text-skype-light flex flex-col gap-y-4 overflow-hidden">
      <nav>{connectionState}</nav>
      <main className="flex-1 flex gap-4">
        {sortedParticipants.local[0] && (
          <div className="h-full w-full relative bg-skype-dark-overlay flex-5">
            <ParticipantVideoRenderer
              participant={sortedParticipants.local[0]}
              className={twMerge(
                "absolute left-0 top-0 w-full h-full",
                sortedParticipants.local[0].isSpeaking && "ring-4 ring-skype-green"
              )}
            />
          </div>
        )}
        {sortedParticipants.remote.length > 0 && (
          <div className="flex-1 flex flex-col gap-4">
            {sortedParticipants.remote.map(participant => {
              return (
                <ParticipantVideoRenderer
                  key={participant.sid}
                  participant={participant}
                  className="w-full object-contain"
                />
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
            {!callState.isCameraOn ? <MdVideocamOff className="text-skype-red" /> : <MdVideocam />}
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
      </footer>
    </div>
  );
}

export default App;
