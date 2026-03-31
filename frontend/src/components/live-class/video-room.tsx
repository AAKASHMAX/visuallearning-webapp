"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  useHMSNotifications,
  useVideo,
  useScreenShare,
  selectPeers,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectLocalPeer,
  selectPeerCount,
  selectPeersScreenSharing,
  selectScreenShareByPeerID,
  selectHMSMessages,
  HMSNotificationTypes,
} from "@100mslive/react-sdk";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorOff,
  Users, Maximize2, Minimize2, Hand, MessageSquare, Send, X,
} from "lucide-react";

interface VideoRoomProps {
  token: string;
  userName: string;
  isHost?: boolean;
  onLeave?: () => void;
}

function isHandRaised(peer: any): boolean {
  try {
    const meta = typeof peer.metadata === "string" ? JSON.parse(peer.metadata) : peer.metadata;
    return !!meta?.isHandRaised;
  } catch {
    return false;
  }
}

function ScreenShareTile({ peerId }: { peerId: string }) {
  const screenShareTrack = useHMSStore(selectScreenShareByPeerID(peerId));
  const { videoRef } = useVideo({ trackId: screenShareTrack?.id });
  if (!screenShareTrack) return null;

  return (
    <div className="relative bg-black rounded-xl overflow-hidden aspect-video mb-3 border-2 border-blue-500">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
        <MonitorUp className="w-3 h-3" />
        Screen Share
      </div>
    </div>
  );
}

function VideoTile({
  peer, isLocal, isHost, isLarge, onToggleMute,
}: {
  peer: any; isLocal: boolean; isHost?: boolean; isLarge?: boolean;
  onToggleMute?: (peer: any) => void;
}) {
  const trackId = peer.videoTrack;
  const { videoRef } = useVideo({ trackId });
  const handUp = isHandRaised(peer);

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video group">
      {trackId ? (
        <video ref={videoRef} autoPlay muted={isLocal} playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {peer.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      {handUp && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full p-1.5 animate-bounce shadow-lg">
          <Hand className="w-4 h-4" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1.5">
        {!peer.audioTrack && <MicOff className="w-3 h-3 text-red-400" />}
        <span>{isLocal ? `${peer.name} (You)` : peer.name}</span>
        {peer.roleName === "host" && (
          <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded font-medium ml-1">Teacher</span>
        )}
      </div>
      {isHost && !isLocal && peer.roleName !== "host" && onToggleMute && (
        <button
          onClick={() => onToggleMute(peer)}
          className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          title={peer.audioTrack ? "Mute student" : "Request unmute"}
        >
          {peer.audioTrack ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
        </button>
      )}
    </div>
  );
}

function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const hmsActions = useHMSActions();
  const messages = useHMSStore(selectHMSMessages);
  const localPeer = useHMSStore(selectLocalPeer);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await hmsActions.sendBroadcastMessage(trimmed);
      setText("");
    } catch (e) {
      console.error("Send message error:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Chat
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-xs text-center mt-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg: any) => {
            const isMe = msg.sender === localPeer?.id;
            const isTeacher = msg.senderRole === "host";
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  isMe
                    ? "bg-primary text-white"
                    : isTeacher
                      ? "bg-red-500/20 text-white border border-red-500/30"
                      : "bg-gray-800 text-white"
                }`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold ${
                      isMe ? "text-white/80" : isTeacher ? "text-red-400" : "text-gray-400"
                    }`}>
                      {isMe ? "You" : msg.senderName}
                    </span>
                    {isTeacher && !isMe && (
                      <span className="bg-red-500 text-[8px] px-1 py-0.5 rounded font-medium text-white">Teacher</span>
                    )}
                  </div>
                  <p className="text-sm break-words leading-relaxed">{msg.message}</p>
                </div>
                <span className="text-[10px] text-gray-600 mt-0.5 px-1">
                  {new Date(msg.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim()}
            className="bg-primary hover:bg-primary/90 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg p-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
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
  const peersScreenSharing = useHMSStore(selectPeersScreenSharing);
  const messages = useHMSStore(selectHMSMessages);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomEnded, setRoomEnded] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenMsgCount = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const joinAttemptRef = useRef(false);
  const notification = useHMSNotifications();

  const { amIScreenSharing, toggleScreenShare } = useScreenShare();

  // Track unread messages when chat is closed
  useEffect(() => {
    if (chatOpen) {
      setUnreadCount(0);
      lastSeenMsgCount.current = messages.length;
    } else if (messages.length > lastSeenMsgCount.current) {
      setUnreadCount(messages.length - lastSeenMsgCount.current);
    }
  }, [messages.length, chatOpen]);

  useEffect(() => {
    if (!notification) return;
    switch (notification.type) {
      case HMSNotificationTypes.ROOM_ENDED:
      case HMSNotificationTypes.REMOVED_FROM_ROOM:
        setRoomEnded(true);
        hmsActions.leave().catch(() => {});
        break;
    }
  }, [notification, hmsActions]);

  useEffect(() => {
    if (joinAttemptRef.current) return;
    joinAttemptRef.current = true;
    let cancelled = false;

    const join = async () => {
      await new Promise((r) => setTimeout(r, 100));
      if (cancelled) return;
      try {
        await hmsActions.join({
          userName,
          authToken: token,
          settings: { isAudioMuted: !isHost, isVideoMuted: false },
        });
        if (isHost) {
          setTimeout(async () => {
            try {
              await hmsActions.setLocalAudioEnabled(true);
              await hmsActions.setLocalVideoEnabled(true);
            } catch (e) {
              console.error("[HMS] Failed to enable media:", e);
            }
          }, 1000);
        }
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

  const toggleHandRaise = useCallback(async () => {
    const newState = !handRaised;
    try {
      await hmsActions.changeMetadata({ isHandRaised: newState });
      setHandRaised(newState);
    } catch (e) {
      console.error("Hand raise error:", e);
    }
  }, [hmsActions, handRaised]);

  const toggleRemoteMute = useCallback(async (peer: any) => {
    if (!peer.audioTrack) return;
    try {
      await hmsActions.setRemoteTrackEnabled(peer.audioTrack, false);
    } catch (e) {
      console.error("Remote mute error:", e);
    }
  }, [hmsActions]);

  if (roomEnded) {
    return (
      <div className="bg-gray-900 rounded-xl p-12 text-center">
        <p className="text-white mb-2 font-medium text-lg">Live class has ended</p>
        <p className="text-gray-400 text-sm mb-4">The teacher has ended this session.</p>
        <button onClick={onLeave} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
          Go Back
        </button>
      </div>
    );
  }

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

  const hostPeer = peers.find((p) => p.roleName === "host");
  const guestPeers = peers.filter((p) => p.roleName !== "host");
  const sortedGuests = [...guestPeers].sort((a, b) => {
    return (isHandRaised(b) ? 1 : 0) - (isHandRaised(a) ? 1 : 0);
  });
  const raisedCount = guestPeers.filter(isHandRaised).length;

  return (
    <div ref={containerRef} className="bg-gray-950 rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Main video area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
          <div className="flex items-center gap-2 text-white text-sm">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>LIVE</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400 text-sm">
            {isHost && raisedCount > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Hand className="w-4 h-4" />
                <span>{raisedCount} hand{raisedCount !== 1 ? "s" : ""} raised</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{peerCount}</span>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {peersScreenSharing.length > 0 && (
            <ScreenShareTile peerId={peersScreenSharing[0].id} />
          )}
          {hostPeer && (
            <div className="mb-3">
              <VideoTile peer={hostPeer} isLocal={hostPeer.id === localPeer?.id} isHost={isHost} isLarge />
            </div>
          )}
          {sortedGuests.length > 0 && (
            <div className={`grid gap-2 ${
              sortedGuests.length === 1 ? "grid-cols-1 max-w-md" :
              sortedGuests.length <= 4 ? "grid-cols-2" :
              sortedGuests.length <= 9 ? "grid-cols-3" : "grid-cols-4"
            }`}>
              {sortedGuests.map((peer) => (
                <VideoTile
                  key={peer.id}
                  peer={peer}
                  isLocal={peer.id === localPeer?.id}
                  isHost={isHost}
                  onToggleMute={isHost ? toggleRemoteMute : undefined}
                />
              ))}
            </div>
          )}
          {!hostPeer && localPeer && peers.length === 1 && (
            <VideoTile peer={localPeer} isLocal isLarge />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-900/80 border-t border-gray-800">
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

          {!isHost && (
            <button
              onClick={toggleHandRaise}
              className={`p-3 rounded-full transition-colors ${handRaised ? "bg-yellow-400 text-yellow-900" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
              title={handRaised ? "Lower hand" : "Raise hand"}
            >
              <Hand className="w-5 h-5" />
            </button>
          )}

          {isHost && (
            <button
              onClick={() => { toggleScreenShare?.(); }}
              className={`p-3 rounded-full transition-colors ${amIScreenSharing ? "bg-blue-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
              title={amIScreenSharing ? "Stop sharing" : "Share screen"}
            >
              {amIScreenSharing ? <MonitorOff className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
            </button>
          )}

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-3 rounded-full transition-colors relative ${chatOpen ? "bg-primary text-white" : "bg-gray-700 hover:bg-gray-600 text-white"}`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
            {!chatOpen && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

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

      {/* Chat Panel */}
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
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
