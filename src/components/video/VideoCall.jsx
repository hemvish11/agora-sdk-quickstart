// const appId = 'd161698ce592405b9efdcd3f84f31584'; // Replace with your Agora App ID
// const channelName = 'hemant';
// const token = '007eJxTYCh2/uW7qOG6hzrf3lNtDD82SqX/fun8/sXL00lh4RruO7gVGFIMzQzNLC2SU00tjUwMTJMsU9NSklOM0yxM0owNTS1M1uzNTm8IZGRovfWOlZEBAkF8NoaM1NzEvBIGBgD9QiI7'; // Replace with a valid token

import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const VideoCallApp = () => {
  const [client] = useState(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );
  const [localTracks, setLocalTracks] = useState({
    audioTrack: null,
    videoTrack: null,
  });
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localContainerRef = useRef(null);
  const appId = import.meta.env.VITE_APP_ID;
  const channelName = import.meta.env.VITE_CHANNEL_NAME;
  const token = import.meta.env.VITE_TOKEN;
  
  // Join Channel and Initialize Tracks
  const joinChannel = async () => {
    try {
      await client.join(appId, channelName, token, null);
      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      setLocalTracks({ audioTrack, videoTrack });

      // Play local video track
      videoTrack.play(localContainerRef.current);

      // Publish tracks
      await client.publish([audioTrack, videoTrack]);
      console.log("Local tracks published");
    } catch (error) {
      console.error("Failed to join channel or publish tracks", error);
    }
  };

  // Leave Channel
  const leaveChannel = async () => {
    try {
      if (localTracks.audioTrack) {
        localTracks.audioTrack.stop();
        localTracks.audioTrack.close();
      }
      if (localTracks.videoTrack) {
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }
      await client.leave();
      setRemoteUsers({});
      console.log("Left the channel");
    } catch (error) {
      console.error("Failed to leave channel", error);
    }
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (localTracks.audioTrack) {
      const enabled = !isAudioEnabled;
      localTracks.audioTrack.setEnabled(enabled);
      setIsAudioEnabled(enabled);
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localTracks.videoTrack) {
      const enabled = !isVideoEnabled;
      localTracks.videoTrack.setEnabled(enabled);
      setIsVideoEnabled(enabled);
    }
  };

  // Handle Remote Users
  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      console.log("User published:", user);

      if (mediaType === "video") {
        const remoteVideoTrack = user.videoTrack;
        setRemoteUsers((prev) => ({
          ...prev,
          [user.uid]: { ...user, videoTrack: remoteVideoTrack },
        }));
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play(); // Play remote audio directly
      }
    });

    client.on("user-unpublished", (user) => {
      console.log("User unpublished:", user);
      setRemoteUsers((prev) => {
        const updatedUsers = { ...prev };
        delete updatedUsers[user.uid];
        return updatedUsers;
      });
    });

    return () => {
      client.removeAllListeners();
    };
  }, [client]);

  return (
    <div>
      <h1>Agora Video Call with Mic and Multiple Users</h1>
      <div>
        <h2>Local Video</h2>
        <div
          ref={localContainerRef}
          style={{
            width: "300px",
            height: "300px",
            backgroundColor: "#000",
            border: "1px solid #ccc",
          }}
        />
        <button onClick={toggleAudio}>
          {isAudioEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button onClick={toggleVideo}>
          {isVideoEnabled ? "Turn Off Video" : "Turn On Video"}
        </button>
      </div>
      <div>
        <h2>Remote Users</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "10px",
          }}
        >
          {Object.values(remoteUsers).map((user) => (
            <div
              key={user.uid}
              style={{
                width: "300px",
                height: "300px",
                backgroundColor: "#000",
                border: "1px solid #ccc",
              }}
              id={`remote-user-${user.uid}`}
            >
              {user.videoTrack &&
                user.videoTrack.play(`remote-user-${user.uid}`)}
            </div>
          ))}
        </div>
      </div>
      <button onClick={joinChannel}>Join Channel</button>
      <button onClick={leaveChannel}>Leave Channel</button>
    </div>
  );
};

export default VideoCallApp;
