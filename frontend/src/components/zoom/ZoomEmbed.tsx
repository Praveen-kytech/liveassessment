import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded';
import { api } from '@/lib/api';
import { useAuthStore } from '@/features/auth/hooks/authStore';

interface ZoomEmbedProps {
  meetingLink: string;
  participantLink?: string; // Add this to extract pwd if meetingLink is a host start_url
  role: 0 | 1; // 0 = Participant, 1 = Host
}

export function ZoomEmbed({ meetingLink, participantLink, role }: ZoomEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    let client: any = null;

    const initZoom = async () => {
      try {
        if (!meetingLink) return;

        // Parse meeting ID and passcode from Zoom URL
        // Example: https://zoom.us/j/123456789?pwd=xyz
        // Parse meeting ID from Zoom URL
        const urlObj = new URL(meetingLink);
        const pathSegments = urlObj.pathname.split('/');
        const meetingNumber = pathSegments[pathSegments.length - 1];
        
        // Extract zak from meetingLink if it exists
        const zakToken = urlObj.searchParams.get('zak') || undefined;

        // Extract pwd from participantLink (or meetingLink if it's the only one)
        const linkWithPwd = participantLink ? new URL(participantLink) : urlObj;
        const passWord = linkWithPwd.searchParams.get('pwd') || '';

        // 1. Fetch Signature from Backend
        const sigResponse = await api.post('/zoom/signature', {
          meeting_number: meetingNumber,
          role: role
        });
        
        const signature = sigResponse.data.signature;

        if (!isMounted || !containerRef.current) return;

        // 2. Initialize Zoom SDK Component View
        client = ZoomMtgEmbedded.createClient();
        clientRef.current = client;
        
        let meetingSDKElement = document.getElementById('meetingSDKElement');
        if (!meetingSDKElement) {
          meetingSDKElement = document.createElement('div');
          meetingSDKElement.id = 'meetingSDKElement';
          
          // Let Zoom handle its own internal positioning
          meetingSDKElement.style.width = '100%';
          meetingSDKElement.style.height = '100%';
          meetingSDKElement.style.position = 'relative'; // CRITICAL: Zoom requires this to position its controls correctly
          
          containerRef.current.appendChild(meetingSDKElement);
        }

        // Measure exactly the size of our card container to feed into Zoom
        const rect = containerRef.current.getBoundingClientRect();
        // Zoom requires a minimum size to render the toolbar properly
        const initWidth = Math.max(Math.floor(rect.width || 800), 800);
        const initHeight = Math.max(Math.floor(rect.height || 600), 500);

        await client.init({
          zoomAppRoot: meetingSDKElement,
          language: 'en-US',
          customize: {
            video: {
              isResizable: true,
              viewSizes: {
                default: { width: initWidth, height: initHeight },
                ribbon: { width: 300 } // Restored ribbon config without invalid height
              }
            }
          }
        });

        // 3. Join Meeting
        const userName = (user as any)?.full_name || (role === 1 ? 'Doctor' : 'Participant');
        
        const joinParams: any = {
          sdkKey: 'mock_sdk_key',
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName
        };

        if (zakToken) {
          joinParams.zak = zakToken;
        }
        if (passWord) {
          joinParams.password = passWord;
        }

        await client.join(joinParams);
      } catch (err: any) {
        console.error("Zoom Embed Error:", err);
        if (isMounted) setError(err.message || "Failed to embed Zoom");
      }
    };

    initZoom();

    return () => {
      isMounted = false;
      if (clientRef.current) {
        // Attempt to leave/clean up on unmount
        // Zoom SDK sometimes doesn't clean up well in React strict mode, but we try
        try {
          clientRef.current.leaveMeeting();
        } catch(e) {}
      }
    };
  }, [meetingLink, participantLink, role, user]);

  if (error) {
    return <div className="p-4 bg-rose-50 text-rose-600 rounded-md border border-rose-200 text-sm">{error}</div>;
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black relative shadow-inner">
      <div ref={containerRef} className="w-full h-full min-h-[400px]"></div>
    </div>
  );
}
