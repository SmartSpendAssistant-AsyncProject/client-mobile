// services/registerApi.ts
// API service specifically for user registration with error handling

const API_BASE_URL = 'https://ssa-server-omega.vercel.app';

// Type definitions matching your backend validation schema
export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

// Custom error class for API-specific registration errors
export class RegisterApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'RegisterApiError';
  }
}

// Helper function to generate username from name (matching backend logic)
function generateUsername(name: string): string {
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-zA-Z0-9_]/g, '') // Keep only letters, numbers, underscores
    .substring(0, 20); // Limit to 20 characters max
}

// Register user function with comprehensive error handling
export async function registerUser(
  userData: Omit<RegisterRequest, 'username'>
): Promise<RegisterResponse> {
  try {
    // Generate username from name following backend rules
    const username = generateUsername(userData.name);

    // Prepare request payload with auto-generated username
    const requestBody: RegisterRequest = {
      name: userData.name.trim(),
      username: username,
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    };

    // Log request for debugging (remove in production)
    console.log('Sending registration request to:', `${API_BASE_URL}/api/register`);
    console.log('Request payload:', { ...requestBody, password: '[HIDDEN]' });

    // Make POST request to register endpoint
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Parse response body as JSON
    const data = await response.json();

    // Log response for debugging (remove in production)
    console.log('Registration response status:', response.status);
    console.log('Registration response data:', data);

    // Check if response status indicates success (201 for created)
    if (!response.ok) {
      // Throw custom API error with specific status and message
      throw new RegisterApiError(data.message || 'Registration failed', response.status, data);
    }

    // Return parsed response data for successful registration
    return data;
  } catch (error) {
    // Re-throw RegisterApiError instances without modification
    if (error instanceof RegisterApiError) {
      throw error;
    }

    // Handle network errors (no internet, server down, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new RegisterApiError(
        'Network error. Please check your internet connection and try again.',
        0
      );
    }

    // Handle JSON parsing errors (invalid response format)
    if (error instanceof SyntaxError) {
      throw new RegisterApiError('Invalid response from server. Please try again.', 0);
    }

    // Handle all other unexpected errors
    console.error('Unexpected registration error:', error);
    throw new RegisterApiError(
      'An unexpected error occurred during registration. Please try again.',
      0
    );
  }
}
