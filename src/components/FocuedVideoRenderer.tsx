import {useParticipant, VideoRenderer} from "@livekit/react-core";
import {Participant} from "livekit-client";

interface FocusedVideoRendererProps {
  participant: Participant;
  className?: string;
}

export const FocusedVideoRenderer = ({participant, className}: FocusedVideoRendererProps) => {
  const {cameraPublication, screenSharePublication, isLocal} = useParticipant(participant);

  let videoTrack = cameraPublication?.track;
  if (screenSharePublication?.track) {
    videoTrack = screenSharePublication.track;
  }

  if (!videoTrack || videoTrack.isMuted) {
    return (
      <div className="w-full h-full bg-ui-primary grid place-items-center">
        <div>
          <figure className="w-24 h-24 rounded-full overflow-hidden bg-ui-light-gray flex justify-center items-center">
            <img src="https://picsum.photos/400" alt="user" />
          </figure>
          <h3 className="text-ui-light font-bold text-center mt-2 text-base">
            {participant.name || participant.identity}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <VideoRenderer
      key={videoTrack.sid}
      track={videoTrack}
      isLocal={isLocal}
      isMirrored={screenSharePublication?.track ? false : true}
      className={className}
    />
  );
};
