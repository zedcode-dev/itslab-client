'use client';

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Cookies from 'js-cookie';

interface VideoPlayerProps {
    options: any;
    onReady?: (player: any) => void;
    onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ options, onReady, onEnded }) => {
    const videoRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const onEndedRef = useRef<(() => void) | undefined>(onEnded);

    // Keep the end callback ref in sync with latest props
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    // Initial player setup
    useEffect(() => {
        // Only run if the container exists and player doesn't
        if (!videoRef.current || playerRef.current) return;

        // Create the video element dynamically inside the container
        const videoElement = document.createElement('video-js');
        videoElement.classList.add('vjs-big-play-centered', 'vjs-default-skin');
        videoRef.current.appendChild(videoElement);

        const token = Cookies.get('accessToken');

        const player = playerRef.current = videojs(videoElement, {
            ...options,
            fill: true,
            userActions: {
                hotkeys: true,
                doubleClick: true,
            },
            controlBar: options.controls ? {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'liveDisplay',
                    'remainingTimeDisplay',
                    'customControlSpacer',
                    'playbackRateMenuButton',
                    'chaptersButton',
                    'descriptionsButton',
                    'subsCapsButton',
                    'audioTrackButton',
                    'fullscreenToggle',
                ],
            } : false,
            html5: {
                vhs: {
                    withCredentials: true,
                    overrideNative: true,
                    handlePartialData: false,
                    xhrSetup: function (options: any) {
                        if (token) {
                            options.beforeSend = function (xhr: any) {
                                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                            };
                        }
                        return options;
                    }
                },
                nativeTextTracks: false,
                nativeAudioTracks: false,
                nativeVideoTracks: false,
                hls: {
                    withCredentials: true
                }
            }
        }, () => {
            // Set attributes to prevent download
            const videoTag = videoElement.getElementsByTagName('video')[0];
            if (videoTag) {
                videoTag.setAttribute('controlsList', 'nodownload');
                videoTag.setAttribute('oncontextmenu', 'return false;');
                videoTag.setAttribute('disablePictureInPicture', 'true');
            }
            onReady && onReady(player);
        });

        // Event listener for video end
        player.on('ended', () => {
            onEndedRef.current?.();
        });

        // Cleanup on unmount
        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, []); // Empty dependency array means this runs only once on mount

    // Separate effect for source changes
    useEffect(() => {
        const player = playerRef.current;
        if (player && options.sources && options.sources.length > 0) {
            // Only update if source actually changed to avoid flickering
            const currentSrc = player.src();
            const newSrc = options.sources[0].src;

            if (currentSrc !== newSrc) {
                player.src(options.sources);
            }
        }
    }, [options.sources]);

    return (
        <div data-vjs-player className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black">
            <div ref={videoRef} className="w-full h-full" />
            <style jsx global>{`
                .video-js {
                    width: 100%;
                    height: 100%;
                    border-radius: inherit;
                }
                .vjs-big-play-button {
                    background-color: rgba(var(--primary), 0.8) !important;
                    border-radius: 50% !important;
                    width: 2.5em !important;
                    height: 2.5em !important;
                    line-height: 2.5em !important;
                    margin-top: -1.25em !important;
                    margin-left: -1.25em !important;
                    border: none !important;
                    transition: transform 0.2s ease;
                }
                .vjs-big-play-button:hover {
                    transform: scale(1.1);
                }
                .vjs-control-bar {
                    background-color: rgba(0, 0, 0, 0.7) !important;
                    backdrop-filter: blur(10px);
                    height: 4em !important;
                }
                .vjs-slider {
                    background-color: rgba(255, 255, 255, 0.2) !important;
                }
                .vjs-load-progress {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
                .vjs-play-progress {
                    background-color: hsl(var(--primary)) !important;
                }
                .vjs-volume-level {
                    background-color: hsl(var(--primary)) !important;
                }
                .video-js video {
                    object-fit: contain !important;
                }
            `}</style>
        </div>
    );
};

export default VideoPlayer;
