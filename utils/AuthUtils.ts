import * as SecureStore from 'expo-secure-store';

//   Utility function to get stored authentication token
export const getAuthToken = async (): Promise<string | null> => {
  try {
    //   Retrieve token from secure storage
    const token = await SecureStore.getItemAsync('access_token');
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

//   Utility function to get current user's wallet ID
// This should fetch from user's actual wallets via API
export const getCurrentWalletId = async (): Promise<string | null> => {
  try {
    //   Get auth token to make authenticated request
    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token available for wallet fetch');
      return null;
    }

    //   Fetch user's wallets from API
    const response = await fetch('https://ssa-server-omega.vercel.app/api/wallets', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('Failed to fetch wallets:', response.status);
      return null;
    }

    const wallets = await response.json();
    console.log('💰 Fetched wallets:', wallets);

    //   Return the first wallet ID if available
    if (wallets && wallets.length > 0) {
      return wallets[0]._id;
    }

    console.log('No wallets found for user');
    return null;
  } catch (error) {
    console.error('Failed to get wallet ID:', error);
    return null;
  }
};

//   Utility function to get all user wallets
export const getUserWallets = async (): Promise<any[] | null> => {
  try {
    //   Get auth token to make authenticated request
    const token = await getAuthToken();
    if (!token) {
      console.log('No auth token available for wallets fetch');
      return null;
    }

    //   Fetch user's wallets from API
    const response = await fetch('https://ssa-server-omega.vercel.app/api/wallets', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.log('Failed to fetch wallets:', response.status);
      return null;
    }

    const wallets = await response.json();
    console.log('💰 Fetched all wallets:', wallets);

    return wallets || [];
  } catch (error) {
    console.error('Failed to get user wallets:', error);
    return null;
  }
};
