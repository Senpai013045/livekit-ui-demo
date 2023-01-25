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
    const room = action.room;
    room.localParticipant.setCameraEnabled(nextState.isCameraOn);
    room.localParticipant.setMicrophoneEnabled(nextState.isMicOn);
    room.localParticipant.setScreenShareEnabled(nextState.isScreenShareOn);
    return nextState;
};

export const useCallState = (room?: Room) => {
    const [callState, dispatch] = useReducer(reducer, initialCallState);

    const toggle = useCallback((toggle: keyof typeof initialCallState) => {
        if (!room) return;
        dispatch({ toggle, room });
    }, [room]);

    return { callState, toggle };

}