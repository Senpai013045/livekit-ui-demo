import {DataPacket_Kind, Room} from "livekit-client";

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

export type RaiseHandObject = {
  type: "raise-hand";
  payload: {
    isRaised: boolean;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isRaiseHandObject = (obj: any): obj is RaiseHandObject => {
  return typeof obj === "object" && obj.type === "raise-hand";
};

export const raiseHand = (room: Room) => {
  if (!room) return;
  const data: RaiseHandObject = {
    type: "raise-hand",
    payload: {
      isRaised: true,
    },
  };
  room.localParticipant.publishData(encoder.encode(JSON.stringify(data)), DataPacket_Kind.LOSSY);
};
