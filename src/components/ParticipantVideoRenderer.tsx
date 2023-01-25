import {useParticipant, VideoRenderer} from "@livekit/react-core";
import {Participant} from "livekit-client";

interface ParticipantVideoRendererProps {
  participant: Participant;
  className?: string;
}

export const ParticipantVideoRenderer = ({
  participant,
  className,
}: ParticipantVideoRendererProps) => {
  const {cameraPublication, screenSharePublication, isLocal} = useParticipant(participant);

  let videoTrack = cameraPublication?.track;
  if (screenSharePublication?.track) {
    videoTrack = screenSharePublication.track;
  }

  if (!videoTrack) {
    return (
      <div className="w-full h-full grid place-items-center">
        {participant.name || participant.identity}
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
      objectFit="contain"
    />
  );
};
