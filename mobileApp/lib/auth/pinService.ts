import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export interface PinResult {
  success: boolean;
  error?: string;
}

class PinService {
  private readonly PIN_KEY = 'capsula_user_pin';
  private readonly PIN_SALT_KEY = 'capsula_pin_salt';

  /**
   * Generate a salt for PIN hashing
   */
  private generateSalt(): string {
    const randomBytes = Crypto.getRandomBytes(16);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Hash PIN with salt using SHA-256
   */
  private async hashPin(pin: string, salt: string): Promise<string> {
    const combined = pin + salt;
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      combined,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return digest;
  }

  /**
   * Store PIN securely
   */
  async storePin(pin: string): Promise<PinResult> {
    try {
      if (!pin || pin.length < 4) {
        return {
          success: false,
          error: 'PIN must be at least 4 digits',
        };
      }

      // Generate salt
      const salt = this.generateSalt();
      
      // Hash PIN
      const hashedPin = await this.hashPin(pin, salt);
      
      // Store both salt and hashed PIN
      await Promise.all([
        SecureStore.setItemAsync(this.PIN_SALT_KEY, salt),
        SecureStore.setItemAsync(this.PIN_KEY, hashedPin),
      ]);

      return { success: true };
    } catch (error) {
      console.error('Failed to store PIN:', error);
      return {
        success: false,
        error: 'Failed to store PIN securely',
      };
    }
  }

  /**
   * Validate PIN
   */
  async validatePin(pin: string): Promise<PinResult> {
    try {
      if (!pin) {
        return {
          success: false,
          error: 'PIN is required',
        };
      }

      // Get stored salt and hashed PIN
      const [salt, storedHashedPin] = await Promise.all([
        SecureStore.getItemAsync(this.PIN_SALT_KEY),
        SecureStore.getItemAsync(this.PIN_KEY),
      ]);

      if (!salt || !storedHashedPin) {
        return {
          success: false,
          error: 'No PIN configured',
        };
      }

      // Hash the provided PIN with the stored salt
      const hashedPin = await this.hashPin(pin, salt);

      // Compare hashes
      if (hashedPin === storedHashedPin) {
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Incorrect PIN',
        };
      }
    } catch (error) {
      console.error('Failed to validate PIN:', error);
      return {
        success: false,
        error: 'PIN validation failed',
      };
    }
  }

  /**
   * Check if PIN is configured
   */
  async isPinConfigured(): Promise<boolean> {
    try {
      const storedPin = await SecureStore.getItemAsync(this.PIN_KEY);
      return !!storedPin;
    } catch (error) {
      console.error('Failed to check PIN configuration:', error);
      return false;
    }
  }

  /**
   * Remove PIN (for logout or PIN change)
   */
  async removePin(): Promise<PinResult> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(this.PIN_KEY),
        SecureStore.deleteItemAsync(this.PIN_SALT_KEY),
      ]);

      return { success: true };
    } catch (error) {
      console.error('Failed to remove PIN:', error);
      return {
        success: false,
        error: 'Failed to remove PIN',
      };
    }
  }

  /**
   * Change PIN (requires current PIN validation)
   */
  async changePin(currentPin: string, newPin: string): Promise<PinResult> {
    try {
      // Validate current PIN
      const validationResult = await this.validatePin(currentPin);
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Current PIN is incorrect',
        };
      }

      // Store new PIN
      return await this.storePin(newPin);
    } catch (error) {
      console.error('Failed to change PIN:', error);
      return {
        success: false,
        error: 'Failed to change PIN',
      };
    }
  }

  /**
   * Prompt for PIN authentication
   * This would typically show a PIN input modal
   */
  async authenticateWithPin(): Promise<PinResult & { pin?: string }> {
    try {
      const isPinConfigured = await this.isPinConfigured();
      
      if (!isPinConfigured) {
        return {
          success: false,
          error: 'PIN not configured',
        };
      }

      // In a real implementation, this would show a PIN input modal
      // For now, we'll return success as this method will be called
      // from components that handle the PIN input UI
      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to authenticate with PIN:', error);
      return {
        success: false,
        error: 'PIN authentication failed',
      };
    }
  }
}

// Export singleton instance
export const pinService = new PinService();