import { useState, useEffect, useCallback } from "react";
import { DataPacket_Kind, Participant, Room, RoomEvent } from "livekit-client";
import { decoder, encoder, isRaiseHandObject, RaiseHandObject } from "../utils/hand";

export type HandRaiseCallBack = (data: RaiseHandObject, participant: Participant) => void;

/**
 * @param room
 * @param callback Callback function to be called when a participant raises hand, useCallback is recommended
 */
export const useHandRaise = (room?: Room, callback?: HandRaiseCallBack) => {
  const [rissenSids, setRissenSids] = useState(() => {
    return new Set<string>();
  });
  useEffect(() => {
    room?.on(RoomEvent.DataReceived, (data, participant) => {
      if (!participant) return;
      const text = decoder.decode(data);
      const payload = JSON.parse(text);
      if (isRaiseHandObject(payload)) {
        setRissenSids(prev => {
          if (payload.payload.isRaised) {
            prev.add(participant.sid);
          } else {
            prev.delete(participant.sid);
          }
          return new Set(prev);
        });
        callback?.(payload, participant);
      }
    });
  }, [room, callback]);

  const raiseHand = useCallback(() => {
    if (!room) return;
    const data: RaiseHandObject = {
      type: "raise-hand",
      payload: {
        isRaised: true,
      },
    };
    const text = JSON.stringify(data);
    const uint8 = encoder.encode(text);
    room.localParticipant
      .publishData(uint8, DataPacket_Kind.LOSSY)
      .then(() => {
        setRissenSids(prev => {
          prev.add(room.localParticipant.sid);
          return new Set(prev);
        });
      })
      .catch(console.error);
  }, [room]);

  const lowerHand = useCallback(() => {
    if (!room) return;
    const data: RaiseHandObject = {
      type: "raise-hand",
      payload: {
        isRaised: false,
      },
    };
    const text = JSON.stringify(data);
    const uint8 = encoder.encode(text);
    room.localParticipant
      .publishData(uint8, DataPacket_Kind.LOSSY)
      .then(() => {
        setRissenSids(prev => {
          prev.delete(room.localParticipant.sid);
          return new Set(prev);
        });
      })
      .catch(console.error);
  }, [room]);

  return {
    rissenSids,
    raiseHand,
    lowerHand,
  };
};
