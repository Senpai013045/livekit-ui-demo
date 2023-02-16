import { Room } from "livekit-client";
import { useReducer, useCallback } from "react";

const initialCallState = {
  isMicOn: false,
  isCameraOn: false,
  isScreenShareOn: false,
};

type Action_Toggle = {
  toggle: keyof typeof initialCallState;
  room: Room;
};

const reducer = (state = initialCallState, action: Action_Toggle) => {
  let nextState = state;
  const room = action.room;
  switch (action.toggle) {
    case "isMicOn":
      nextState = { ...state, isMicOn: !state.isMicOn };
      break;
    case "isCameraOn":
      //disable screen share if camera is on
      nextState = {
        ...state,
        isCameraOn: !state.isCameraOn,
        isScreenShareOn: state.isCameraOn ? false : state.isScreenShareOn,
      };
      break;
    case "isScreenShareOn":
      //disable camera if screen share is on
      nextState = {
        ...state,
        isScreenShareOn: !state.isScreenShareOn,
        isCameraOn: state.isScreenShareOn ? false : state.isCameraOn,
      };
      break;
    default:
      nextState = state;
      break;
  }
  //update room state only if there is a change - this is an optimization
  const passMethods: Record<keyof typeof initialCallState, (bool: boolean) => void> = {
    isMicOn: bl => {
      room.localParticipant.setMicrophoneEnabled.bind(room.localParticipant)(bl);
      room.startAudio();
    },
    isCameraOn: room.localParticipant.setCameraEnabled.bind(room.localParticipant),
    isScreenShareOn: room.localParticipant.setScreenShareEnabled.bind(room.localParticipant),
  };
  if (nextState[action.toggle] !== state[action.toggle]) {
    const methodToCall = passMethods[action.toggle];
    methodToCall(nextState[action.toggle]);
  }
  return nextState;
};

export const useLocalCallState = (room?: Room) => {
  const [callState, dispatch] = useReducer(reducer, initialCallState);

  const toggle = useCallback(
    (toggle: keyof typeof initialCallState) => {
      if (!room) return;
      dispatch({ toggle, room });
    },
    [room]
  );

  return { callState, toggle };
};
