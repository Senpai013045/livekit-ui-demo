import {useCallback, useMemo, useState, useEffect} from "react";
import {FocusedVideoRenderer} from "../components/FocuedVideoRenderer";
import {ProfileChip} from "../components/ProfileChip";
import {sortParticipants, SUPERVISOR} from "../utils/sorting";
import {twMerge} from "tailwind-merge";
import {useLocalCallState} from "../hooks/useCallState";
import {MdOutlineBackHand} from "react-icons/md";
import {HandRaiseCallBack, useHandRaise} from "../hooks/useHandRaise";
import {toast} from "react-toastify";
import {updatePermission} from "../services/room";
import {notifyErrorMessage} from "../lib/handleError";
import {AudioRenderer, useRoom} from "@livekit/react-core";
import {PageLoader} from "../components/PageLoader";
import {livekitConfig} from "../config/livekit";

interface Props {
  token: string;
}

const Slash = () => {
  return (
    <div className="absolute w-full h-full flex justify-center items-center p-2">
      <div className="w-full h-[1px] bg-ui-light rounded-full origin-center rotate-45" />
    </div>
  );
};

export const CallScreen = ({token}: Props) => {
  const {participants, audioTracks, connect, room} = useRoom();
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const notifyHandRaise: HandRaiseCallBack = useCallback((data, participant) => {
    if (!data.payload.isRaised) return;
    toast(`${participant.name || participant.identity || "Someone"} raised hand`, {
      theme: "dark",
      autoClose: 3000,
      hideProgressBar: true,
      position: "bottom-right",
      closeOnClick: true,
    });
  }, []);

  const {rissenSids, lowerHand, raiseHand} = useHandRaise(room, notifyHandRaise);
  const [canLocalPublish, setCanLocalPublish] = useState(false);

  useEffect(() => {
    if (!token) return;
    connect(livekitConfig.host, token)
      .then(connectedRoom => {
        if (!connectedRoom) return;
        let name = connectedRoom.localParticipant.identity;
        if (connectedRoom.localParticipant.name) {
          name = connectedRoom.localParticipant.name;
        }
        if (name === SUPERVISOR) {
          setCanLocalPublish(true);
        }
      })
      .catch(notifyErrorMessage);
  }, [connect, token]);

  const sortedParticipants = useMemo(() => sortParticipants(participants), [participants]);
  const {callState, toggle} = useLocalCallState(room);
  const [_changeWhenClicked, setChangeWhenClicked] = useState(false);

  const triggerParticipantRerender = useCallback(() => {
    setChangeWhenClicked(prev => !prev);
  }, []);

  useEffect(() => {
    if (!room) return;
    setCanLocalPublish(Boolean(room.localParticipant.permissions?.canPublish));
    const permissionChangedHandler = () => {
      lowerHand();
      const permission = room.localParticipant.permissions;
      if (!permission) return;
      if (callState.isMicOn && !permission.canPublish) {
        toggle("isMicOn");
      }
      const message = permission.canPublish ? "You can now speak" : "You have been muted";
      toast.info(message);
      setCanLocalPublish(permission.canPublish);
    };
    room.localParticipant.addListener("participantPermissionsChanged", permissionChangedHandler);
    return () => {
      room.localParticipant.removeListener(
        "participantPermissionsChanged",
        permissionChangedHandler
      );
    };
  }, [callState.isMicOn, lowerHand, room, toggle]);

  const focusedParticipant = sortedParticipants[0];
  const otherParticipants = sortedParticipants.slice(1);

  if (!room) return <PageLoader />;

  const isSuperVisor = Boolean(
    (room.localParticipant.name || room.localParticipant.identity) === SUPERVISOR
  );

  return (
    <main className="flex-1 flex flex-col">
      <nav className="bg-ui-dark">
        {audioTracks.map((track, index) => {
          return <AudioRenderer key={index} isLocal={false} track={track} />;
        })}
        <h1 className="text-ui-light capitalize text-center py-2 font-bold">{room.name}</h1>
      </nav>
      <div className="flex-1 bg-ui-dark-gray relative">
        {/* modal chip */}
        <button
          onClick={() => setIsParticipantsOpen(true)}
          className="absolute top-4 left-4 bg-ui-dark-gray text-ui-light flex items-center gap-x-2 px-2 py-1 rounded-lg z-20"
        >
          <img src="./group.svg" alt="group" className="w-4 h-4" />
          {sortedParticipants.length}
        </button>
        {focusedParticipant && (
          <FocusedVideoRenderer
            participant={focusedParticipant}
            className="absolute top-0 left-0 w-full h-full"
          />
        )}

        {/* controls section */}
        <div className="absolute w-full bottom-9 z-10 text-ui-light flex justify-center gap-x-4 items-center">
          {/* hand raise */}
          {!isSuperVisor && (
            <button
              className={twMerge(
                "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative transition-all",
                "active:scale-95",
                rissenSids.has(room.localParticipant.sid) && "bg-ui-secondary"
              )}
              onClick={() => {
                if (rissenSids.has(room.localParticipant.sid)) {
                  return lowerHand();
                }
                raiseHand();
              }}
            >
              <MdOutlineBackHand className="w-6 h-6" />
            </button>
          )}
          {/* mic */}
          <button
            disabled={!canLocalPublish}
            className={twMerge(
              "flex justify-center items-center rounded-full w-12 h-12 bg-ui-dark-gray relative disabled:opacity-50"
            )}
            onClick={() => toggle("isMicOn")}
            title={`You are ${canLocalPublish ? "allowed" : "Not allowed"} to publish`}
          >
            {!callState.isMicOn && <Slash />}
            <img src="./mic.svg" alt="mic" />
          </button>
          {/* video */}
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
          {/* screen share */}
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
          {/* end call */}
          <button
            className="flex justify-center items-center rounded-full w-12 h-12 bg-ui-danger"
            onClick={() => {
              window.location.reload();
            }}
          >
            <img src="./call-end.svg" alt="end call" />
          </button>
        </div>
      </div>
      {otherParticipants.length > 0 && (
        <footer className="bg-ui-dark-gray">
          <div className="max-w-[90%] mx-auto py-4 overflow-x-scroll flex items-center justify-start gap-x-4 scrollbar-hide">
            {otherParticipants.map(participant => {
              return (
                <div key={participant.sid} className="flex items-center">
                  <ProfileChip participant={participant} />;
                </div>
              );
            })}
          </div>
        </footer>
      )}
      {isParticipantsOpen && (
        //it is a bottom sheet
        <aside className="fixed inset-0 bg-ui-dark-gray bg-opacity-50 z-30 flex justify-end items-end">
          <div className="bg-ui-dark-gray text-ui-light p-8 rounded-l-3xl max-h-[50%] overflow-y-scroll scrollbar-hide">
            {/* cross close */}
            <nav className="flex justify-between items-center sticky top-0">
              <h3 className="font-semibold">Participants</h3>{" "}
              <button onClick={() => setIsParticipantsOpen(false)}>&#10005;</button>
            </nav>

            <ul className="mt-4" key={String(_changeWhenClicked)}>
              {sortedParticipants.map(participant => {
                const canParticipantPublish = Boolean(participant.permissions?.canPublish);
                return (
                  <li key={participant.sid} className="flex items-center gap-x-4 mb-4">
                    <ProfileChip participant={participant} />
                    <span>{participant.name || participant.identity}</span>
                    {(participant.name || participant.identity) ===
                      (room.localParticipant.name || room.localParticipant.identity) && (
                      <span>(You)</span>
                    )}
                    {isSuperVisor && rissenSids.has(participant.sid) && (
                      <button>
                        <MdOutlineBackHand className="font-normal" />
                      </button>
                    )}
                    {!(
                      (participant.name || participant.identity) ===
                      (room.localParticipant.name || room.localParticipant.identity)
                    ) &&
                      isSuperVisor && (
                        <button
                          title={
                            canParticipantPublish
                              ? "Revoke publishing permission"
                              : "Provide publishing permission"
                          }
                          onClick={() => {
                            updatePermission({
                              premissionFor: participant.name || participant.identity,
                              publish: !canParticipantPublish,
                              roomId: room.name,
                              supervisorToken: token,
                            })
                              .then(message => {
                                toast.info(message, {
                                  autoClose: 1000,
                                });
                              })
                              .catch(notifyErrorMessage)
                              .finally(() => {
                                triggerParticipantRerender();
                              });
                          }}
                        >
                          {canParticipantPublish ? (
                            <img src="./mic-on-sm.svg" alt="mic" />
                          ) : (
                            <img src="./mic-off-sm.svg" alt="mic off" />
                          )}
                        </button>
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
