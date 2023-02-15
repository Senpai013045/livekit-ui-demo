import {Participant, Room} from "livekit-client";
import {useMemo} from "react";
import {FocusedVideoRenderer} from "../components/FocuedVideoRenderer";
import {ProfileChip} from "../components/ProfileChip";
import {sortParticipants} from "../utils/sorting";
import {twMerge} from "tailwind-merge";
import {useLocalCallState} from "../hooks/useCallState";

interface Props {
  participants: Participant[];
  room: Room;
}

const Slash = () => {
  return (
    <div className="absolute w-full h-full flex justify-center items-center p-2">
      <div className="w-full h-[1px] bg-ui-light rounded-full origin-center rotate-45" />
    </div>
  );
};

export const CallScreen = ({participants, room}: Props) => {
  const sortedParticipants = useMemo(() => sortParticipants(participants), [participants]);
  const {callState, toggle} = useLocalCallState(room);
  const focusedParticipant = sortedParticipants[0];
  const otherParticipants = sortedParticipants.slice(1);

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 bg-ui-dark-gray relative">
        <FocusedVideoRenderer
          participant={focusedParticipant}
          className="absolute top-0 left-0 w-full h-full"
        />
        <div className="absolute w-full bottom-9 z-10 text-ui-light flex justify-center gap-x-4 items-center">
          <button
            className={twMerge(
              "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative"
            )}
            onClick={() => toggle("isMicOn")}
          >
            {!callState.isMicOn && <Slash />}
            <img src="./mic.svg" alt="mic" />
          </button>
          <button
            className={twMerge(
              "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative"
            )}
            onClick={() => toggle("isCameraOn")}
          >
            {!callState.isCameraOn && <Slash />}

            <img src="./video.svg" alt="video" />
          </button>
          <button
            className={twMerge(
              "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative"
            )}
            onClick={() => toggle("isScreenShareOn")}
          >
            {!callState.isScreenShareOn && <Slash />}
            <img src="./screen-share.svg" alt="screen" />
          </button>
          <button className="flex justify-center items-center rounded-full w-12 h-12 bg-ui-danger">
            <img src="./call-end.svg" alt="end call" />
          </button>
        </div>
      </div>
      <footer className="bg-ui-dark-gray flex justify-center items-center gap-x-4 p-5">
        {otherParticipants.map(participant => {
          return <ProfileChip key={participant.sid} participant={participant} />;
        })}
      </footer>
    </main>
  );
};
