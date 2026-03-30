"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useVideo,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectLocalPeer,
  selectPeerCount,
} from "@100mslive/react-sdk";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, Users, Maximize2, Minimize2 } from "lucide-react";

interface VideoRoomProps {
  token: string;
  userName: string;
  isHost?: boolean;
  onLeave?: () => void;
}

function VideoTile({ peer, isLocal, isLarge }: { peer: any; isLocal: boolean; isLarge?: boolean }) {
  const trackId = peer.videoTrack;
  const { videoRef } = useVideo({ trackId });

  return (
    <div className={`relative bg-gray-900 rounded-xl overflow-hidden aspect-video`}>
      {trackId ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {peer.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
        {!peer.audioTrack && <MicOff className="w-3 h-3 text-red-400" />}
        <span>{isLocal ? `${peer.name} (You)` : peer.name}</span>
        {peer.roleName === "host" && (
          <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded font-medium ml-1">Teacher</span>
        )}
      </div>
    </div>
  );
}

function RoomContent({ token, userName, isHost, onLeave }: VideoRoomProps) {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const peerCount = useHMSStore(selectPeerCount);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const joinAttemptRef = useRef(false);

  useEffect(() => {
    // Prevent double-join from React Strict Mode
    if (joinAttemptRef.current) return;
    joinAttemptRef.current = true;

    let cancelled = false;

    const join = async () => {
      // Small delay to let React Strict Mode's unmount pass
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;

      try {
        await hmsActions.join({
          userName,
          authToken: token,
          settings: {
            isAudioMuted: false,
            isVideoMuted: false,
          },
        });
      } catch (e: any) {
        if (!cancelled) {
          console.error("[HMS] Failed to join:", e);
          setJoinError(e?.description || e?.message || "Failed to connect to live class");
        }
      }
    };
    join();

    return () => {
      cancelled = true;
      joinAttemptRef.current = false;
      hmsActions.leave().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleAudio = useCallback(() => {
    hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  }, [hmsActions, isLocalAudioEnabled]);

  const toggleVideo = useCallback(() => {
    hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  }, [hmsActions, isLocalVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    try {
      await hmsActions.setScreenShareEnabled(!isScreenSharing);
      setIsScreenSharing(!isScreenSharing);
    } catch (e) {
      console.error("Screen share error:", e);
    }
  }, [hmsActions, isScreenSharing]);

  const handleLeave = useCallback(async () => {
    await hmsActions.leave();
    onLeave?.();
  }, [hmsActions, onLeave]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  if (joinError) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center">
        <p className="text-red-400 mb-2 font-medium">Connection Failed</p>
        <p className="text-gray-400 text-sm">{joinError}</p>
        <button onClick={onLeave} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600">
          Go Back
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-white">Connecting to live class...</p>
        <p className="text-gray-400 text-xs mt-2">Please allow camera and microphone access when prompted</p>
      </div>
    );
  }

  // Separate host and guests
  const hostPeer = peers.find((p) => p.roleName === "host");
  const guestPeers = peers.filter((p) => p.roleName !== "host");

  return (
    <div ref={containerRef} className="bg-gray-950 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center gap-2 text-white text-sm">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>LIVE</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Users className="w-4 h-4" />
          <span>{peerCount} participant{peerCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="p-3">
        {/* Host (teacher) - large view */}
        {hostPeer && (
          <div className="mb-3">
            <VideoTile peer={hostPeer} isLocal={hostPeer.id === localPeer?.id} isLarge />
          </div>
        )}

        {/* Guests - smaller grid */}
        {guestPeers.length > 0 && (
          <div className={`grid gap-2 ${
            guestPeers.length === 1 ? "grid-cols-1 max-w-md" :
            guestPeers.length <= 4 ? "grid-cols-2" :
            guestPeers.length <= 9 ? "grid-cols-3" : "grid-cols-4"
          }`}>
            {guestPeers.map((peer) => (
              <VideoTile key={peer.id} peer={peer} isLocal={peer.id === localPeer?.id} />
            ))}
          </div>
        )}

        {/* Show self if no host visible and only person in room */}
        {!hostPeer && localPeer && peers.length === 1 && (
          <VideoTile peer={localPeer} isLocal isLarge />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-4 bg-gray-900/80 border-t border-gray-800">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${isLocalAudioEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          title={isLocalAudioEnabled ? "Mute" : "Unmute"}
        >
          {isLocalAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${isLocalVideoEnabled ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
          title={isLocalVideoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {isLocalVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {isHost && (
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-colors ${isScreenSharing ? "bg-blue-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
            title="Share screen"
          >
            <MonitorUp className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={toggleFullscreen}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Leave"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function VideoRoom(props: VideoRoomProps) {
  return (
    <HMSRoomProvider>
      <RoomContent {...props} />
    </HMSRoomProvider>
  );
}
