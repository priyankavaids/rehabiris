import React, { useRef, useEffect, useState } from 'react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { useTranslation } from 'react-i18next';

interface ExerciseCameraProps {
  exerciseType: 'arm' | 'squat';
  onRepComplete: (accuracy: number) => void;
  onAttentionLost: () => void;
  onAlignmentWarning: (warning: string) => void;
  onFeedback: (feedbackKey: string) => void;
  onPoseUpdate?: (landmarks: any[]) => void;
}

const ExerciseCamera: React.FC<ExerciseCameraProps> = ({ exerciseType, onRepComplete, onAttentionLost, onAlignmentWarning, onFeedback, onPoseUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [repCount, setRepCount] = useState(0);
  const { t } = useTranslation();

  // State for tracking movement
  const stageRef = useRef<'down' | 'up'>('down');
  const lastAttentionRef = useRef(Date.now());
  const lastAlignmentWarningRef = useRef(Date.now());
  const lastFeedbackTimeRef = useRef(Date.now());

  // Stability & Smoothness tracking
  const velocityHistoryRef = useRef<number[]>([]);
  const centerOfMassHistoryRef = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Draw mirrored video
      canvasCtx.translate(canvasRef.current.width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.restore();

      if (results.poseLandmarks) {
        if (onPoseUpdate) onPoseUpdate(results.poseLandmarks);
        
        canvasCtx.save();
        canvasCtx.translate(canvasRef.current.width, 0);
        canvasCtx.scale(-1, 1);
        
        // Draw skeleton with custom styling for "Avatar" feel
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#4f46e5', lineWidth: 5 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });
        canvasCtx.restore();

        // Logic for Exercise Detection
        const landmarks = results.poseLandmarks;
        
        // Stability Analysis (Center of Mass)
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];
        const com = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
        centerOfMassHistoryRef.current.push(com);
        if (centerOfMassHistoryRef.current.length > 30) centerOfMassHistoryRef.current.shift();

        if (centerOfMassHistoryRef.current.length === 30) {
          const xVariance = calculateVariance(centerOfMassHistoryRef.current.map(p => p.x));
          if (xVariance > 0.005 && Date.now() - lastAlignmentWarningRef.current > 8000) {
            onAlignmentWarning(t('stability_warning'));
            lastAlignmentWarningRef.current = Date.now();
          }
        }

        // Check attention (face direction)
        const nose = landmarks[0];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        
        if (Math.abs(leftEar.x - rightEar.x) < 0.05) {
           if (Date.now() - lastAttentionRef.current > 2000) {
             onAttentionLost();
             lastAttentionRef.current = Date.now();
           }
        } else {
           lastAttentionRef.current = Date.now();
        }

        // Joint Alignment Analysis
        if (exerciseType === 'squat') {
          const leftKnee = landmarks[25];
          const rightKnee = landmarks[26];

          // Check for knee valgus (knees moving inward)
          const hipWidth = Math.abs(leftHip.x - rightHip.x);
          const kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
          
          if (kneeWidth < hipWidth * 0.8 && Date.now() - lastAlignmentWarningRef.current > 5000) {
            onAlignmentWarning(t('knee_inward_warning'));
            lastAlignmentWarningRef.current = Date.now();
          }
        }

        if (exerciseType === 'arm') {
          const shoulder = landmarks[11];
          const elbow = landmarks[13];
          const wrist = landmarks[15];

          const angle = calculateAngle(shoulder, elbow, wrist);
          
          // Smoothness Analysis (Velocity variance)
          velocityHistoryRef.current.push(angle);
          if (velocityHistoryRef.current.length > 10) {
            const diffs = [];
            for(let i=1; i<velocityHistoryRef.current.length; i++) {
              diffs.push(Math.abs(velocityHistoryRef.current[i] - velocityHistoryRef.current[i-1]));
            }
            const smoothness = calculateVariance(diffs);
            if (smoothness > 10 && Date.now() - lastFeedbackTimeRef.current > 5000) {
              onFeedback('voice_smooth');
              lastFeedbackTimeRef.current = Date.now();
            }
            velocityHistoryRef.current.shift();
          }

          if (angle > 160) stageRef.current = 'down';
          if (angle < 30 && stageRef.current === 'down') {
            stageRef.current = 'up';
            setRepCount(prev => prev + 1);
            onRepComplete(100 - Math.abs(angle - 30));
            onFeedback('voice_good');
            lastFeedbackTimeRef.current = Date.now();
          }
          
          if (angle > 30 && angle < 100 && stageRef.current === 'down' && Date.now() - lastFeedbackTimeRef.current > 3000) {
            onFeedback('voice_higher');
            lastFeedbackTimeRef.current = Date.now();
          }
        } else if (exerciseType === 'squat') {
          const hip = landmarks[23];
          const knee = landmarks[25];
          const ankle = landmarks[27];

          const angle = calculateAngle(hip, knee, ankle);

          // Smoothness Analysis
          velocityHistoryRef.current.push(angle);
          if (velocityHistoryRef.current.length > 10) {
            const diffs = [];
            for(let i=1; i<velocityHistoryRef.current.length; i++) {
              diffs.push(Math.abs(velocityHistoryRef.current[i] - velocityHistoryRef.current[i-1]));
            }
            const smoothness = calculateVariance(diffs);
            if (smoothness > 15 && Date.now() - lastFeedbackTimeRef.current > 5000) {
              onFeedback('voice_smooth');
              lastFeedbackTimeRef.current = Date.now();
            }
            velocityHistoryRef.current.shift();
          }

          if (angle > 160) stageRef.current = 'up';
          if (angle < 90 && stageRef.current === 'up') {
            stageRef.current = 'down';
            setRepCount(prev => prev + 1);
            onRepComplete(100 - Math.abs(angle - 90));
            onFeedback('voice_good');
            lastFeedbackTimeRef.current = Date.now();
          }

          if (angle > 90 && angle < 140 && stageRef.current === 'up' && Date.now() - lastFeedbackTimeRef.current > 3000) {
            onFeedback('voice_lower');
            lastFeedbackTimeRef.current = Date.now();
          }
        }
      }
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await pose.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      pose.close();
    };
  }, [exerciseType, onRepComplete, onAttentionLost, t]);

  const calculateAngle = (a: any, b: any, c: any) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  const calculateVariance = (arr: number[]) => {
    const n = arr.length;
    if (n === 0) return 0;
    const mean = arr.reduce((a, b) => a + b) / n;
    return arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-500">
      <video ref={videoRef} className="hidden" playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} className="w-full h-auto bg-black" />
      
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-lg border border-white/20">
        <div className="text-white text-sm uppercase tracking-widest opacity-70">{t('reps')}</div>
        <div className="text-white text-4xl font-bold">{repCount}</div>
      </div>
    </div>
  );
};

export default ExerciseCamera;
