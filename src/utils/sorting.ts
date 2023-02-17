import {Participant} from "livekit-client";

export const SUPERVISOR = "supervisor" as const;

export const sortParticipants = (participants: Participant[]) => {
  //if name or identity is supervisor, put them at the top
  //then prioritize isLocal and the ones who are speaking
  const sortedParticipants = participants.sort(a => {
    const aName = (a.name || a.identity).toLowerCase();
    if (aName === SUPERVISOR) return -1;
    if (a.isLocal) return -1;
    if (a.isSpeaking) return -1;
    return 0;
  });
  return sortedParticipants;
};
