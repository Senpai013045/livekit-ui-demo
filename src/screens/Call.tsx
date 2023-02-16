import {Participant, Room} from "livekit-client";
import {useMemo, useState} from "react";
import {FocusedVideoRenderer} from "../components/FocuedVideoRenderer";
import {ProfileChip} from "../components/ProfileChip";
import {sortParticipants, SUPERVISOR} from "../utils/sorting";
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
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const focusedParticipant = sortedParticipants[0];
  const otherParticipants = sortedParticipants.slice(1);
  const canPublish = Boolean(room.localParticipant.permissions?.canPublish);
  const isSuperVisor = Boolean(
    (room.localParticipant.name || room.localParticipant.identity) === SUPERVISOR
  );

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex-1 bg-ui-dark-gray relative">
        {/* modal chip */}
        <button
          onClick={() => setIsParticipantsOpen(true)}
          className="absolute top-4 left-4 bg-ui-dark-gray text-ui-light flex items-center gap-x-2 px-2 py-1 rounded-lg"
        >
          <img src="./group.svg" alt="group" className="w-4 h-4" />
          {sortedParticipants.length}
        </button>
        <FocusedVideoRenderer
          participant={focusedParticipant}
          className="absolute top-0 left-0 w-full h-full"
        />
        {/* controls section */}
        <div className="absolute w-full bottom-9 z-10 text-ui-light flex justify-center gap-x-4 items-center">
          <button
            disabled={!canPublish}
            className={twMerge(
              "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative",
              !canPublish && "opacity-50"
            )}
            onClick={() => toggle("isMicOn")}
            title={!canPublish ? "You are not allowed to publish audio" : undefined}
          >
            {!callState.isMicOn && <Slash />}
            <img src="./mic.svg" alt="mic" />
          </button>
          {isSuperVisor && (
            <button
              className={twMerge(
                "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative"
              )}
              onClick={() => toggle("isCameraOn")}
            >
              {!callState.isCameraOn && <Slash />}

              <img src="./video.svg" alt="video" />
            </button>
          )}

          {isSuperVisor && (
            <button
              className={twMerge(
                "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative"
              )}
              onClick={() => toggle("isScreenShareOn")}
            >
              {!callState.isScreenShareOn && <Slash />}
              <img src="./screen-share.svg" alt="screen" />
            </button>
          )}

          <button className="flex justify-center items-center rounded-full w-12 h-12 bg-ui-danger">
            <img src="./call-end.svg" alt="end call" />
          </button>
        </div>
      </div>
      {otherParticipants.length > 0 && (
        <footer className="bg-ui-dark-gray">
          <div className="max-w-[90%] mx-auto pt-4 overflow-x-scroll flex items-center gap-x-4 scrollbar-hide">
            {otherParticipants.map(participant => {
              return (
                <div key={participant.sid} className="flex-1">
                  <ProfileChip participant={participant} />;
                </div>
              );
            })}
          </div>
        </footer>
      )}
      {isParticipantsOpen && (
        //it is a bottom sheet
        //backdrop
        <aside className="fixed inset-0 bg-ui-dark-gray bg-opacity-50 z-20 flex justify-end">
          <div className="bg-ui-dark-gray text-ui-light p-8 rounded-l-3xl max-h-[50%] overflow-y-scroll scrollbar-hide">
            {/* corss close */}
            <nav className="flex justify-end items-center sticky top-0">
              <button onClick={() => setIsParticipantsOpen(false)}>&#10005;</button>
            </nav>
            <ul className="mt-4">
              {sortedParticipants.map(participant => {
                return (
                  <li key={participant.sid} className="flex items-center gap-x-4 mb-4">
                    <ProfileChip participant={participant} />
                    <span>{participant.name || participant.identity}</span>
                    {(participant.name || participant.identity) ===
                      (room.localParticipant.name || room.localParticipant.identity) && (
                      <span>(You)</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      )}
    </main>
  );
};
