// Local server for voice transcription, Vercel for AI chat
const TRANSCRIBE_BASE_URL = 'http://192.168.1.2:3000/api';
const AI_CHAT_BASE_URL = 'https://ssa-server-omega.vercel.app/api';

//   Interface for transcription API response
interface TranscriptionResponse {
  transcription: string;
}

//   Interface for AI chat response
interface ChatResponse {
  aiResponse: {
    _id: string;
    text: string;
    chat_status: string;
    room_id: string;
    wallet_id: string;
    timestamp?: string;
  };
}

//   Class for handling voice-related API calls
export class VoiceApiService {
  //   Transcribe audio file using OpenAI Whisper API
  static async transcribeAudio(audioUri: string): Promise<string> {
    try {
      console.log('  Starting audio transcription for URI:', audioUri);

      //   Create FormData with audio file for React Native
      const formData = new FormData();

      //   Append audio file to form data with proper format for React Native
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice_recording.m4a',
      } as any);

      //   Send transcription request to local backend
      const transcriptionResponse = await fetch(`${TRANSCRIBE_BASE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      //   Check if transcription request was successful
      if (!transcriptionResponse.ok) {
        const errorData = await transcriptionResponse.json();
        throw new Error(errorData.message || 'Transcription failed');
      }

      //   Parse transcription response
      const transcriptionData: TranscriptionResponse = await transcriptionResponse.json();

      //   Extract and validate transcribed text
      if (transcriptionData.transcription) {
        const transcription = transcriptionData.transcription.trim();
        
        console.log('🎙️ Raw transcription:', transcription);
        
        // Algorithm: Validate transcription quality
        if (this.isValidTranscription(transcription)) {
          console.log('✅ Audio transcription successful');
          return transcription;
        } else {
          console.log('❌ Transcription seems invalid (noise/hallucination)');
          throw new Error('Recording unclear or too short. Please try speaking again.');
        }
      } else {
        throw new Error('No transcription received from server');
      }
    } catch (error) {
      console.error('  Audio transcription failed:', error);
      throw error;
    }
  }

  //   Send transcribed text to AI chat API
  static async sendMessageToAI(
    text: string,
    chatStatus: 'ask' | 'input',
    walletId: string,
    authToken: string
  ): Promise<ChatResponse> {
    try {
      console.log('  Sending message to AI:', { text, chatStatus, walletId });
      console.log(' Using AI Chat URL:', `${AI_CHAT_BASE_URL}/messages`);

      //   Prepare message payload for AI API
      const messagePayload = {
        text: text.trim(),
        chat_status: chatStatus,
        wallet_id: walletId,
      };

      console.log(' Payload:', JSON.stringify(messagePayload));

      //   Send message to AI chat API on Vercel
      const chatResponse = await fetch(`${AI_CHAT_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(messagePayload),
      });

      console.log(' Response status:', chatResponse.status);
      console.log(' Response ok:', chatResponse.ok);

      //   Check if AI chat request was successful
      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.log('  Error response:', errorText);
        throw new Error(`AI chat request failed: ${chatResponse.status} - ${errorText}`);
      }

      //   Parse and return AI response
      const chatData: ChatResponse = await chatResponse.json();
      console.log('  AI response received successfully');

      return chatData;
    } catch (error) {
      console.error('  AI chat request failed:', error);
      throw error;
    }
  }

  //   Combined function to transcribe audio and get AI response
  static async processVoiceMessage(
    audioUri: string,
    chatStatus: 'ask' | 'input',
    walletId: string,
    authToken: string
  ): Promise<{ transcription: string; aiResponse: ChatResponse }> {
    try {
      console.log(' Processing complete voice message workflow');

      //   Step 1 - Transcribe audio to text
      const transcription = await this.transcribeAudio(audioUri);

      //   Validate transcription result
      if (!transcription || transcription.trim().length === 0) {
        throw new Error('Audio transcription returned empty result');
      }

      //   Step 2 - Send transcribed text to AI
      const aiResponse = await this.sendMessageToAI(transcription, chatStatus, walletId, authToken);

      console.log('  Voice message processing completed successfully');

      //   Return both transcription and AI response
      return {
        transcription,
        aiResponse,
      };
    } catch (error) {
      console.error('  Voice message processing failed:', error);
      throw error;
    }
  }

  //   Algorithm: Validate transcription to filter out hallucinations and noise
  static isValidTranscription(transcription: string): boolean {
    // Remove whitespace and convert to lowercase for analysis
    const cleanText = transcription.trim().toLowerCase();
    
    // Algorithm: Check minimum length (very short transcriptions are often noise)
    if (cleanText.length < 3) {
      console.log('❌ Transcription too short:', cleanText.length, 'characters');
      return false;
    }

    // Algorithm: Check for common Whisper hallucinations in Indonesian
    const commonHallucinations = [
      'selamat menikmati',
      'terima kasih',
      'thank you',
      'thanks for watching',
      'subscribe',
      'like and subscribe',
      'music',
      'subtitle',
      'subtitles',
      'www.',
      'http',
      'youtube',
      'facebook',
      'instagram',
      'follow me',
      'follow us',
    ];

    // Algorithm: Check if transcription matches common hallucinations
    for (const hallucination of commonHallucinations) {
      if (cleanText.includes(hallucination)) {
        console.log('❌ Detected hallucination pattern:', hallucination);
        return false;
      }
    }

    // Algorithm: Check for repeated characters (often indicates noise)
    const repeatedCharPattern = /(.)\1{4,}/;
    if (repeatedCharPattern.test(cleanText)) {
      console.log('❌ Detected repeated character pattern (noise)');
      return false;
    }

    // Algorithm: Check for very repetitive words
    const words = cleanText.split(/\s+/);
    if (words.length > 1) {
      const wordCounts = new Map();
      words.forEach(word => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
      
      // If any word appears more than 50% of the time, likely noise
      const maxCount = Math.max(...wordCounts.values());
      const repetitionRatio = maxCount / words.length;
      if (repetitionRatio > 0.5) {
        console.log('❌ High word repetition detected:', repetitionRatio);
        return false;
      }
    }

    // Algorithm: Check for meaningful content (contains some vowels and consonants)
    const hasVowels = /[aiueo]/i.test(cleanText);
    const hasConsonants = /[bcdfghjklmnpqrstvwxyz]/i.test(cleanText);
    
    if (!hasVowels || !hasConsonants) {
      console.log('❌ Text lacks meaningful structure (vowels/consonants)');
      return false;
    }

    console.log('✅ Transcription appears valid:', cleanText);
    return true;
  }

  //   Test API connectivity for transcription service
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${TRANSCRIBE_BASE_URL}/transcribe`, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      console.error('  API connection test failed:', error);
      return false;
    }
  }
}
