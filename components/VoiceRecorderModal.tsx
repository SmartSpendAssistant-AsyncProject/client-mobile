import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Mic, Square, X, Send } from 'lucide-react-native';
import { useVoiceRecording, RecordingState } from '../utils/useVoiceRecording';

//   Define props interface for VoiceRecorder component
interface VoiceRecorderProps {
  onTranscriptionComplete: (transcription: string, audioUri: string) => void;
  onCancel: () => void;
  isVisible: boolean;
  currentMode: 'ask' | 'input';
}

//   Voice recorder component with modal interface
export const VoiceRecorderModal: React.FC<VoiceRecorderProps> = ({
  onTranscriptionComplete,
  onCancel,
  isVisible,
  currentMode,
}) => {
  //   Voice recording hook for audio functionality
  const {
    recordingState,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording,
    errorMessage,
  } = useVoiceRecording();

  //   Animation for recording pulse effect
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  //   Start pulse animation when recording begins
  React.useEffect(() => {
    if (isRecording) {
      //   Create infinite pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      //   Stop animation and reset scale
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }
  }, [isRecording, pulseAnimation]);

  //   Format recording duration to MM:SS format
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  //   Handle record button press based on current state
  const handleRecordPress = async () => {
    if (recordingState === RecordingState.IDLE) {
      //   Start new recording
      await startRecording();
    } else if (recordingState === RecordingState.RECORDING) {
      //   Stop recording and process audio
      const audioUri = await stopRecording();
      if (audioUri) {
        //   Trigger transcription process
        onTranscriptionComplete('', audioUri); // Empty transcription, will be filled by parent
      }
    }
  };

  //   Handle cancel button press
  const handleCancel = async () => {
    if (isRecording) {
      await cancelRecording();
    }
    onCancel();
  };

  //   Get appropriate button icon based on recording state
  const getRecordButtonIcon = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return <Square size={32} color="#FFFFFF" fill="#FFFFFF" />;
      case RecordingState.PROCESSING:
        return <Send size={32} color="#FFFFFF" />;
      default:
        return <Mic size={32} color="#FFFFFF" />;
    }
  };

  //   Get button color based on recording state
  const getRecordButtonColor = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return '#DC2626'; // Red for stop
      case RecordingState.PROCESSING:
        return '#10B981'; // Green for send
      case RecordingState.ERROR:
        return '#EF4444'; // Red for error
      default:
        return '#3b667c'; // Default blue
    }
  };

  //   Get status text based on recording state
  const getStatusText = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return `Recording... ${formatDuration(recordingDuration)}`;
      case RecordingState.PROCESSING:
        return 'Processing audio...';
      case RecordingState.ERROR:
        return errorMessage || 'Error occurred';
      default:
        return currentMode === 'ask' ? 'Tap to ask your question' : 'Tap to input transaction';
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade" statusBarTranslucent={true}>
      {/*   Modal overlay background */}
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
        {/*   Main modal content container */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            paddingHorizontal: 24,
            paddingVertical: 32,
            width: '100%',
            maxWidth: 320,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}>
          {/*   Close button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              padding: 8,
            }}
            onPress={handleCancel}
            activeOpacity={0.7}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>

          {/*   Mode indicator */}
          <View
            style={{
              backgroundColor: '#3b667c',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginBottom: 24,
            }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '600',
                textTransform: 'capitalize',
              }}>
              {currentMode} Mode
            </Text>
          </View>

          {/*   Recording visualization */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnimation }],
              marginBottom: 24,
            }}>
            <TouchableOpacity
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: getRecordButtonColor(),
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={handleRecordPress}
              activeOpacity={0.8}
              disabled={recordingState === RecordingState.PROCESSING}>
              {getRecordButtonIcon()}
            </TouchableOpacity>
          </Animated.View>

          {/*   Status text display */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: recordingState === RecordingState.ERROR ? '#DC2626' : '#1F2937',
              textAlign: 'center',
              marginBottom: 8,
            }}>
            {getStatusText()}
          </Text>

          {/*   Instruction text */}
          {recordingState === RecordingState.IDLE && (
            <Text
              style={{
                fontSize: 14,
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 20,
              }}>
              {currentMode === 'ask'
                ? 'Ask questions about your finances, get insights and recommendations'
                : 'Describe your transaction: "I bought coffee for 25000"'}
            </Text>
          )}

          {/*   Error retry button */}
          {recordingState === RecordingState.ERROR && (
            <TouchableOpacity
              style={{
                backgroundColor: '#3b667c',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginTop: 16,
              }}
              onPress={() => {
                //   Reset error state and allow retry
                handleRecordPress();
              }}
              activeOpacity={0.8}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                Try Again
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};
