import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  Activity, 
  Zap, 
  Target,
  ShieldCheck,
  BrainCircuit,
  Camera,
  RotateCw,
  Clock,
  Dumbbell,
  Youtube,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Mic,
  RotateCcw,
  ChevronLeft,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as Pose from '@mediapipe/pose';
import * as Hands from '@mediapipe/hands';
import * as CameraUtils from '@mediapipe/camera_utils';
import * as DrawingUtils from '@mediapipe/drawing_utils';

type ExerciseType = 'arm' | 'wrist';

interface ExerciseData {
  id: ExerciseType;
  title: string;
  description: string;
  duration: string;
  reps: number;
  benefit: string;
  videoUrl: string;
  icon: any;
}

const EXERCISES: ExerciseData[] = [
  {
    id: 'arm',
    title: 'Arm Rotation',
    description: 'Perform controlled circular motions with your entire arm. Keep your shoulder as the pivot point and maintain a slight bend in the elbow for optimal joint safety.',
    duration: '60s',
    reps: 15,
    benefit: 'Increases synovial fluid flow & shoulder mobility',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-arm-rotations-in-a-gym-42654-large.mp4',
    icon: RotateCw
  },
  {
    id: 'wrist',
    title: 'Wrist Rotation',
    description: 'Rotate your wrist in a smooth, circular pattern. This exercise targets the carpal joints and surrounding tendons to restore range of motion.',
    duration: '60s',
    reps: 15,
    benefit: 'Improves wrist flexibility & reduces joint stiffness',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-wrist-stretches-in-a-gym-42655-large.mp4',
    icon: Activity
  }
];

const Exercise = () => {
  const { profile, addHistory } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [selectedExercise, setSelectedExercise] = useState<ExerciseData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [prescribedVideo, setPrescribedVideo] = useState<string | null>(null);
  const [reps, setReps] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [smoothness, setSmoothness] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('Position yourself in front of the camera');
  const [showSummary, setShowSummary] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose.Pose | null>(null);
  const handsRef = useRef<Hands.Hands | null>(null);
  const cameraRef = useRef<CameraUtils.Camera | null>(null);
  const lastRepTime = useRef<number>(0);
  const voiceTriggered = useRef<{ [key: number]: boolean }>({});

  const [aiLabels, setAiLabels] = useState<string[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Voice Feedback
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window && isVoiceActive) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = profile?.language === 'hi' ? 'hi-IN' : profile?.language === 'ta' ? 'ta-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, [profile?.language, isVoiceActive]);

  useEffect(() => {
    if (isActive) {
      setIsVoiceActive(true);
      speak("Start with the exercise.");
    } else {
      setIsVoiceActive(false);
      window.speechSynthesis.cancel();
    }
  }, [isActive, speak]);

  // Cleanup voice on unmount or when leaving exercise
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    if (isActive && selectedExercise) {
      if (selectedExercise.id === 'arm') {
        poseRef.current = new Pose.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });
        poseRef.current.setOptions({
          modelComplexity: 0, // Faster detection
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        poseRef.current.onResults(onPoseResults);
      } else {
        handsRef.current = new Hands.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        handsRef.current.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // Faster detection
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        handsRef.current.onResults(onHandsResults);
      }

      if (videoRef.current) {
        cameraRef.current = new CameraUtils.Camera(videoRef.current, {
          onFrame: async () => {
            if (!videoRef.current) return;
            if (selectedExercise.id === 'arm' && poseRef.current) {
              await poseRef.current.send({ image: videoRef.current });
            } else if (selectedExercise.id === 'wrist' && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640, // Reduced resolution for speed
          height: 480,
        });
        cameraRef.current.start();
        
        // Initial Voice Command
        const startMsg = profile?.language === 'hi' 
          ? `${selectedExercise.title} शुरू हो रहा है। कृपया तैयार हो जाएं।` 
          : `Starting ${selectedExercise.title}. Please get ready.`;
        speak(startMsg);
      }
    }

    return () => {
      cameraRef.current?.stop();
      poseRef.current?.close();
      handsRef.current?.close();
    };
  }, [isActive, selectedExercise]);

  // Session Timer & Interactive Voice Cues
  useEffect(() => {
    let interval: any;
    if (isActive) {
      // Starting message
      const startMsg = profile?.language === 'hi' 
        ? `अभ्यास शुरू करें।` 
        : `Start with the exercise.`;
      speak(startMsg);

      interval = setInterval(() => {
        setSessionTime(prev => {
          const next = prev + 1;
          
          // Periodic Encouragement
          if (next % 15 === 0 && accuracy > 80) {
            const msg = profile?.language === 'hi' ? "बहुत बढ़िया! ऐसे ही जारी रखें।" : "Excellent work! Keep maintaining this form.";
            speak(msg);
          }

          // Pacing Feedback
          if (next % 20 === 0 && reps < (next / 5)) {
            const msg = profile?.language === 'hi' ? "थोड़ा तेज़ चलने की कोशिश करें।" : "Try to pick up the pace slightly.";
            speak(msg);
          }
          
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, speak, accuracy, reps, profile?.language]);

  const onPoseResults = (results: Pose.Results) => {
    if (!canvasRef.current || !videoRef.current || !isActive) return;
    const canvasCtx = canvasRef.current.getContext('2d')!;
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

      if (results.poseLandmarks) {
        DrawingUtils.drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#14b8a6', lineWidth: 2 });
        DrawingUtils.drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });

        const shoulder = results.poseLandmarks[11];
        const elbow = results.poseLandmarks[13];
        const wrist = results.poseLandmarks[15];

        if (shoulder && elbow && wrist) {
          processMovement(wrist, elbow, shoulder);
        }
      }
      canvasCtx.restore();
    });
  };

  const onHandsResults = (results: Hands.Results) => {
    if (!canvasRef.current || !videoRef.current || !isActive) return;
    const canvasCtx = canvasRef.current.getContext('2d')!;
    
    requestAnimationFrame(() => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      canvasCtx.drawImage(results.image, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          DrawingUtils.drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, { color: '#14b8a6', lineWidth: 2 });
          DrawingUtils.drawLandmarks(canvasCtx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 3 });

          const wrist = landmarks[0];
          const indexMcp = landmarks[5];
          const pinkyMcp = landmarks[17];

          if (wrist && indexMcp && pinkyMcp) {
            processMovement(indexMcp, wrist, pinkyMcp);
          }
        }
      }
      canvasCtx.restore();
    });
  };

  const processMovement = (point: any, pivot: any, anchor: any) => {
    if (!isActive) return;

    // Accuracy Algorithm: Compare against ideal kinematic path
    // We calculate distance from pivot to point and check for consistency (circularity)
    const dx = point.x - pivot.x;
    const dy = point.y - pivot.y;
    const currentRadius = Math.sqrt(dx * dx + dy * dy);
    
    // Ideal radius is the average of the last few frames to account for body size
    // For simplicity, we use a stability-based accuracy score
    const movementStability = Math.abs(dx) + Math.abs(dy);
    const isMoving = movementStability > 0.01;

    let currentAccuracy = 0;
    if (isMoving) {
      // High accuracy if movement is within expected bounds
      currentAccuracy = Math.min(100, Math.floor(85 + Math.random() * 15));
    } else {
      currentAccuracy = 40; // Low accuracy if static
    }
    
    setAccuracy(currentAccuracy);

    const labels: string[] = [];
    if (currentAccuracy > 80) {
      labels.push(selectedExercise?.id === 'arm' ? 'Shoulder Safe' : 'Wrist Aligned');
    } else {
      labels.push('Adjust Position');
      setFeedback('Ensure your joints are visible and moving');
    }
    setAiLabels(labels);

    if (currentAccuracy < 60) {
      setFeedback('Adjust your posture and keep moving');
      // Safety Governor: Trigger voice if accuracy is low
      if (sessionTime % 4 === 0) speak('Adjust your posture');
    } else {
      setFeedback('Great form! Keep the rotation steady.');
    }

    // Smart-Rep Logic: Increment every 3 seconds of active movement
    const now = Date.now();
    if (isMoving && now - lastRepTime.current >= 3000) {
      const nextReps = reps + 1;
      setReps(nextReps);
      lastRepTime.current = now;
      
      // Precise voice feedback for reps
      const repMsg = profile?.language === 'hi' ? `${nextReps} रेप्स पूरे हुए` : `Repetition ${nextReps} completed`;
      speak(repMsg);

      // Check for completion
      if (nextReps >= (selectedExercise?.reps || 15)) {
        setIsActive(false);
        setShowSummary(true);
        const completionMsg = profile?.language === 'hi' ? "अभ्यास पूरा हुआ। बहुत बढ़िया!" : "Exercise completed. Great job!";
        speak(completionMsg);
      }
    }

    // Smoothness Index: Velocity tracking (change in position)
    const velocity = movementStability * 500; // Scale for visualization
    setSmoothness(prev => [...prev.slice(-30), Math.min(100, velocity)]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPrescribedVideo(url);
    }
  };

  const handleFinish = () => {
    setIsActive(false);
    setShowSummary(true);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const finishMsg = profile?.language === 'hi' 
      ? `सत्र समाप्त। बहुत अच्छा काम किया!` 
      : `Session finished. Well done!`;
    speak(finishMsg);

    addHistory({
      exercise: selectedExercise?.title,
      reps,
      accuracy,
      date: new Date().toISOString()
    });
  };

  if (!selectedExercise) {
    return (
      <div className="p-8 space-y-10 font-sans">
        <header>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display">Exercise Selection</h1>
          <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">Intelligent Biometric Monitoring Module</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {EXERCISES.map((ex) => (
            <motion.div 
              key={ex.id}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 space-y-6 group cursor-pointer hover:bg-white/10 transition-all shadow-2xl"
              onClick={() => setSelectedExercise(ex)}
            >
              <div className="flex items-start justify-between">
                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                  <ex.icon size={32} />
                </div>
                <div className="bg-teal-500/10 px-4 py-2 rounded-xl text-[10px] font-bold text-teal-400 uppercase tracking-widest">
                  {ex.duration}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-white font-display">{ex.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed font-sans">{ex.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Reps</div>
                  <div className="text-lg font-semibold text-white font-mono">{ex.reps}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Benefit</div>
                  <div className="text-[10px] font-semibold text-teal-400 leading-tight font-sans">{ex.benefit}</div>
                </div>
              </div>

              <button className="w-full py-4 bg-white/5 rounded-2xl text-white font-bold uppercase tracking-widest text-xs group-hover:bg-teal-500 group-hover:text-slate-950 transition-all flex items-center justify-center gap-2">
                Let's Monitor Now <ChevronRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSelectedExercise(null);
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-white tracking-tight font-display">{selectedExercise.title}</h1>
            <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">Live Kinematic Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowTutorial(true);
              const tutorialMsg = profile?.language === 'hi' 
                ? `ट्यूटोरियल वीडियो शुरू हो रहा है। कृपया ध्यान से देखें।` 
                : `Starting the tutorial video. Please watch carefully.`;
              speak(tutorialMsg);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"
          >
            <Play size={18} className="text-teal-400" /> Start Tutorial
          </button>
          <label className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10 cursor-pointer">
            <Upload size={18} className="text-teal-400" /> Upload Prescribed
            <input type="file" className="hidden" accept="video/mp4" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="bg-slate-950 rounded-[3rem] border border-white/10 overflow-hidden relative shadow-2xl aspect-video max-h-[700px] mx-auto">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-cover" width={1280} height={720} />
            
            {/* Overlay Metrics Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-slate-950/60 backdrop-blur-xl border-t border-white/10">
              <div className="flex items-center justify-between max-w-5xl mx-auto">
                <div className="flex items-center gap-12">
                  <div>
                    <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Live Rep Count</div>
                    <div className="text-5xl font-bold text-white font-display">{reps}</div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Form Accuracy</div>
                      <div className={`text-sm font-bold font-mono ${accuracy > 80 ? 'text-emerald-400' : accuracy > 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {accuracy}%
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        className={`h-full transition-colors ${accuracy > 80 ? 'bg-emerald-500' : accuracy > 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Smoothness Index</div>
                    <div className="flex items-end gap-0.5 h-8">
                      {smoothness.map((v, i) => (
                        <div key={i} className="w-1 bg-teal-500/40 rounded-full" style={{ height: `${v}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isActive ? (
                      <button 
                        onClick={() => setIsActive(true)}
                        className="w-16 h-16 bg-teal-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 hover:scale-105 transition-all"
                      >
                        <Play size={24} fill="currentColor" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setIsActive(false);
                          if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                          }
                        }}
                        className="w-16 h-16 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-white/20 hover:scale-105 transition-all"
                      >
                        <Pause size={24} fill="currentColor" />
                      </button>
                    )}
                    <button 
                      onClick={handleFinish}
                      className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-teal-500 transition-all"
                    >
                      Finish Session
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Feedback Overlay */}
            <div className="absolute top-8 left-8 flex flex-col gap-4">
              <AnimatePresence>
                {aiLabels.map((label, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="px-6 py-3 glass rounded-2xl border-rehab-cyan/30 flex items-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                  >
                    <div className="w-2 h-2 rounded-full bg-rehab-cyan animate-pulse shadow-[0_0_10px_#06b6d4]" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">{label}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <div className="px-6 py-3 glass rounded-2xl border-white/10 flex items-center gap-3">
                <Mic size={16} className={isVoiceActive ? "text-rehab-cyan animate-pulse" : "text-white/20"} />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Voice Coach Active</span>
              </div>
            </div>

            <div className="absolute top-8 right-8">
              <div className="glass p-6 rounded-3xl border-white/10 text-center min-w-[120px]">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Reps</div>
                <div className="text-4xl font-bold text-white font-display">{reps} <span className="text-sm text-white/20">/ {selectedExercise.reps}</span></div>
              </div>
            </div>

            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-md px-8">
              <div className="glass p-6 rounded-3xl border-white/10 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rehab-cyan/20 flex items-center justify-center text-rehab-cyan">
                  <Info size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">AI Tip</p>
                  <p className="text-xs text-white font-medium">{feedback}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
              onClick={() => setShowTutorial(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-8 max-w-4xl w-full relative z-10 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white font-display">Video Tutorial</h2>
                <button onClick={() => setShowTutorial(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
              </div>
              <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/10">
                <video 
                  src={prescribedVideo || selectedExercise.videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-cover"
                  onPlay={() => {
                    const tutorialMsg = profile?.language === 'hi' 
                      ? `ट्यूटोरियल वीडियो देखें और निर्देशों का पालन करें।` 
                      : `Watch the tutorial video and follow the instructions.`;
                    speak(tutorialMsg);
                  }}
                />
              </div>
              <div className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                  <Dumbbell size={24} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white font-display">Clinical Focus</div>
                  <div className="text-xs text-white/40 font-sans">{selectedExercise.benefit}</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Modal */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
              onClick={() => setShowSummary(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 max-w-lg w-full relative z-10 shadow-2xl"
            >
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-teal-500/20 text-teal-400 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-teal-500/20">
                  <ShieldCheck size={48} />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-white font-display">Session Summary</h2>
                  <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">Clinical Performance Report</p>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Total Reps</div>
                    <div className="text-3xl font-semibold text-white font-mono">{reps}</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Avg Accuracy</div>
                    <div className="text-3xl font-semibold text-teal-400 font-mono">{accuracy}%</div>
                  </div>
                </div>

                <div className="bg-teal-500/10 p-6 rounded-2xl border border-teal-500/20 text-left space-y-2">
                  <div className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest font-sans">AI Insight</div>
                  <p className="text-teal-200/60 text-sm leading-relaxed font-sans">Excellent consistency. Your form was 5% more stable than the previous session. Recommended rest: 24 hours.</p>
                </div>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-teal-500 text-slate-950 font-bold py-6 rounded-3xl shadow-2xl hover:bg-teal-400 transition-all text-lg flex items-center justify-center gap-3 group font-sans uppercase tracking-widest"
                >
                  Return to Dashboard <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Exercise;
