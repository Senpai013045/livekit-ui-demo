import {Participant} from "livekit-client";

interface Props {
  participant: Participant;
}

export const ProfileChip = ({participant}: Props) => {
  // const {microphonePublication} = useParticipant(participant);
  // const isMuted = microphonePublication?.track?.isMuted || !participant.isMicrophoneEnabled;
  const firstLetter = (participant.name || participant.identity).charAt(0);
  return (
    <figure
      className="rounded-full bg-ui-primary w-12 h-12 flex justify-center items-center bg-cover
      bg-center relative overflow-hidden"
      style={{backgroundImage: "url(https://picsum.photos/200)"}}
    >
      {/* <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 w-6 h-6 bg-ui-light-gray rounded-full border-2 border-ui-light flex justify-center items-center">
        {isMuted ? (
          <img src="./mic-off-sm.svg" alt="mic off" className="w-3 h-3" />
        ) : (
          <img src="./mic-on-sm.svg" alt="mic" className="w-3 h-3" />
        )}
      </div> */}
      {/* first letter */}
      <div className="absolute inset-0 bg-ui-dark bg-opacity-50 flex justify-center items-center text-xl text-ui-light font-bold uppercase">
        {firstLetter}
      </div>
    </figure>
  );
};
