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
import {AudioRenderer, useRoom} from "@livekit/react-core";
import {useEffect, useRef, useMemo} from "react";
import {livekitConfig} from "./config/livekit";
import {ParticipantVideoRenderer} from "./components/ParticipantVideoRenderer";
import {twMerge} from "tailwind-merge";
import {useElementSize} from "./hooks/useElementSize";
import {DataPacket_Kind, Participant, RoomEvent} from "livekit-client";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const token = new URLSearchParams(window.location.search).get("token") || "";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type RaiseHandObject = {
  type: "raise-hand";
  payload: {
    isRaised: boolean;
  };
};

const isRaiseHandObject = (obj: any): obj is RaiseHandObject => {
  return typeof obj === "object" && obj.type === "raise-hand";
};

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

  useEffect(() => {
    room?.on(RoomEvent.DataReceived, (data, participant, kind) => {
      if (!participant) return;
      const text = decoder.decode(data);
      const payload = JSON.parse(text);
      if (isRaiseHandObject(payload)) {
        toast(`${participant.name || "Someone"} raised their hand`, {
          position: "bottom-right",
          theme: "dark",
          autoClose: 5000,
        });
      }
    });
  }, [room]);

  const raiseHand = () => {
    if (!room) return;
    const data: RaiseHandObject = {
      type: "raise-hand",
      payload: {
        isRaised: true,
      },
    };
    room.localParticipant.publishData(encoder.encode(JSON.stringify(data)), DataPacket_Kind.LOSSY);
  };

  return (
    <div onClick={raiseHand}>
      <ToastContainer />
      <div className="w-screen h-screen p-4 bg-skype-dark text-skype-light flex flex-col gap-y-4">
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
                    <p className="absolute top-0 left-0 p-2 bg-skype-dark-overlay opacity-75 z-10 text-sm">
                      {participant.name || participant.identity}
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
        </footer>
      </div>
    </div>
  );
}

export default App;
