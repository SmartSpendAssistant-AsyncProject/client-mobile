import { useState, useRef } from 'react';
import { Audio } from 'expo-av';

//   Define voice recording states enum
export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  ERROR = 'error',
}

//   Define custom hook interface for voice recording functionality
interface UseVoiceRecordingReturn {
  recordingState: RecordingState;
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  isRecording: boolean;
  errorMessage: string | null;
}

//   Custom hook for managing voice recording with expo-av
export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  //   State management for recording functionality
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //   Refs for audio recording and duration tracking
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  //   Clear any existing error messages
  const clearError = () => {
    setErrorMessage(null);
  };

  //   Start duration tracking when recording begins
  const startDurationTracking = () => {
    setRecordingDuration(0);
    durationIntervalRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  //   Stop duration tracking and clear interval
  const stopDurationTracking = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  //   Request audio recording permissions from device
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      return permission.status === 'granted';
    } catch (error) {
      console.error('  Permission request failed:', error);
      setErrorMessage('Failed to request microphone permission');
      return false;
    }
  };

  //   Configure audio mode for recording
  const configureAudioMode = async (): Promise<void> => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('  Audio mode configuration failed:', error);
      throw new Error('Failed to configure audio mode');
    }
  };

  //   Start audio recording process
  const startRecording = async (): Promise<void> => {
    try {
      clearError();
      setRecordingState(RecordingState.PROCESSING);

      //   Check and request permissions
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setErrorMessage('Microphone permission denied');
        setRecordingState(RecordingState.ERROR);
        return;
      }

      //   Configure audio mode for recording
      await configureAudioMode();

      //   Create new recording instance with optimal settings
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      //   Store recording reference and start tracking
      recordingRef.current = recording;
      setRecordingState(RecordingState.RECORDING);
      startDurationTracking();

      console.log('  Recording started successfully');
    } catch (error) {
      console.error('  Failed to start recording:', error);
      setErrorMessage('Failed to start recording');
      setRecordingState(RecordingState.ERROR);
      stopDurationTracking();
    }
  };

  //   Stop recording and return audio file URI
  const stopRecording = async (): Promise<string | null> => {
    try {
      setRecordingState(RecordingState.PROCESSING);
      stopDurationTracking();

      //   Check if recording exists
      if (!recordingRef.current) {
        setErrorMessage('No active recording found');
        setRecordingState(RecordingState.ERROR);
        return null;
      }

      //   Algorithm: Validate recording duration (minimum 1 second)
      if (recordingDuration < 1) {
        setErrorMessage('Recording too short. Please speak for at least 1 second.');
        setRecordingState(RecordingState.ERROR);
        
        // Clean up short recording
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
        });
        
        return null;
      }

      console.log('🎙️ Recording duration:', recordingDuration, 'seconds');

      //   Stop recording and get URI
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      //   Reset audio mode after recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      //   Clean up recording reference
      recordingRef.current = null;
      setRecordingState(RecordingState.IDLE);
      setRecordingDuration(0);

      console.log('  Recording stopped successfully, URI:', uri);
      return uri;
    } catch (error) {
      console.error('  Failed to stop recording:', error);
      setErrorMessage('Failed to stop recording');
      setRecordingState(RecordingState.ERROR);
      return null;
    }
  };

  //   Cancel ongoing recording without saving
  const cancelRecording = async (): Promise<void> => {
    try {
      stopDurationTracking();

      //   Stop and unload recording if exists
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      //   Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      //   Reset state to idle
      setRecordingState(RecordingState.IDLE);
      setRecordingDuration(0);
      clearError();

      console.log(' Recording cancelled successfully');
    } catch (error) {
      console.error('  Failed to cancel recording:', error);
      setErrorMessage('Failed to cancel recording');
      setRecordingState(RecordingState.ERROR);
    }
  };

  //   Return hook interface with all recording controls
  return {
    recordingState,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: recordingState === RecordingState.RECORDING,
    errorMessage,
  };
};
