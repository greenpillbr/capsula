import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SeedPhraseVerification } from '../../components/SeedPhraseVerification';
import { Colors, LAYOUT } from '../../constants';

interface SeedPhraseBackupScreenProps {
  seedPhrase: string;
  onBackupComplete: (verified: boolean) => void;
  onCancel: () => void;
}

export const SeedPhraseBackupScreen: React.FC<SeedPhraseBackupScreenProps> = ({
  seedPhrase,
  onBackupComplete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<'display' | 'verify'>('display');
  const [hasConfirmedBackup, setHasConfirmedBackup] = useState(false);

  const seedWords = seedPhrase.split(' ');

  const handleContinueToVerification = () => {
    if (!hasConfirmedBackup) {
      if (Platform.OS === 'web') {
        window.alert('Please confirm that you have safely stored your recovery phrase before continuing.');
      } else {
        Alert.alert(
          'Backup Required',
          'Please confirm that you have safely stored your recovery phrase before continuing.',
          [{ text: 'OK' }]
        );
      }
      return;
    }
    setCurrentStep('verify');
  };

  const handleVerificationComplete = (verified: boolean) => {
    onBackupComplete(verified);
  };

  const handleSkipBackup = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Skip Recovery Phrase Backup?\n\nWithout backing up your recovery phrase, you will lose access to your wallet if:\n• You lose your device\n• Your device is damaged\n• You uninstall the app\n\nThis is HIGHLY RISKY and not recommended.\n\nAre you absolutely sure you want to skip?'
      );
      if (confirmed) {
        onBackupComplete(false);
      }
    } else {
      Alert.alert(
        'Skip Recovery Phrase Backup?',
        'Without backing up your recovery phrase, you will lose access to your wallet if:\n• You lose your device\n• Your device is damaged\n• You uninstall the app\n\nThis is HIGHLY RISKY and not recommended.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip Anyway', style: 'destructive', onPress: () => onBackupComplete(false) }
        ]
      );
    }
  };

  if (currentStep === 'verify') {
    return (
      <SeedPhraseVerification
        originalSeedPhrase={seedPhrase}
        onVerificationComplete={handleVerificationComplete}
        onCancel={() => setCurrentStep('display')}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Backup Recovery Phrase</Text>
        <Text style={styles.subtitle}>
          Your recovery phrase is the master key to your wallet. Write it down and store it safely.
        </Text>
      </View>

      {/* Warning Box */}
      <View style={styles.warningContainer}>
        <Text style={styles.warningEmoji}>⚠️</Text>
        <Text style={styles.warningTitle}>Security Notice</Text>
        <Text style={styles.warningText}>
          Never share • Store offline • Capsula cannot recover lost phrases
        </Text>
      </View>

      {/* Seed Phrase Display */}
      <View style={styles.seedContainer}>
        <Text style={styles.seedTitle}>Your Recovery Phrase</Text>
        <Text style={styles.seedSubtitle}>Write down these 12 words in order:</Text>
        
        <View style={styles.seedGrid}>
          {Array.from({ length: Math.ceil(seedWords.length / 4) }, (_, rowIndex) => (
            <View key={rowIndex} style={styles.seedRow}>
              {seedWords.slice(rowIndex * 4, (rowIndex + 1) * 4).map((word, colIndex) => {
                const wordIndex = rowIndex * 4 + colIndex;
                return (
                  <View key={wordIndex} style={styles.seedWordContainer}>
                    <Text style={styles.seedWordNumber}>{wordIndex + 1}</Text>
                    <Text style={styles.seedWord}>{word}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Backup Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to backup safely:</Text>
        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Write the words on paper in the exact order shown
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Store the paper in a secure, offline location
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Consider making multiple copies in different locations
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Never take screenshots or store digitally
            </Text>
          </View>
        </View>
      </View>

      {/* Confirmation Checkbox */}
      <TouchableOpacity
        style={styles.confirmationContainer}
        onPress={() => setHasConfirmedBackup(!hasConfirmedBackup)}
      >
        <View style={[styles.checkbox, hasConfirmedBackup && styles.checkboxChecked]}>
          {hasConfirmedBackup && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.confirmationText}>
          I have safely written down and stored my recovery phrase
        </Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !hasConfirmedBackup && styles.continueButtonDisabled]}
          onPress={handleContinueToVerification}
        >
          <Text style={[styles.continueButtonText, !hasConfirmedBackup && styles.continueButtonTextDisabled]}>
            Continue to Verification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipBackup}>
          <Text style={styles.skipButtonText}>Skip Backup (Not Recommended)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: LAYOUT.padding.lg,
    paddingBottom: LAYOUT.padding.xl,
  },
  header: {
    marginBottom: LAYOUT.padding.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.sm,
  },
  subtitle: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    marginBottom: LAYOUT.padding.lg,
    alignItems: 'center',
  },
  warningEmoji: {
    fontSize: 20,
    marginRight: LAYOUT.padding.xs,
  },
  warningTitle: {
    fontSize: LAYOUT.fontSize.md,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: LAYOUT.padding.xs,
    textAlign: 'center',
  },
  warningText: {
    fontSize: LAYOUT.fontSize.xs,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
  seedContainer: {
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: LAYOUT.padding.lg,
    marginBottom: LAYOUT.padding.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  seedTitle: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.sm,
  },
  seedSubtitle: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.lg,
  },
  seedGrid: {
    gap: LAYOUT.padding.sm,
  },
  seedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: LAYOUT.padding.xs,
  },
  seedWordContainer: {
    backgroundColor: Colors.background,
    borderRadius: LAYOUT.borderRadius.sm,
    padding: LAYOUT.padding.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  seedWordNumber: {
    fontSize: LAYOUT.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginRight: LAYOUT.padding.xs,
    minWidth: 16,
  },
  seedWord: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  instructionsContainer: {
    marginBottom: LAYOUT.padding.xl,
  },
  instructionsTitle: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: LAYOUT.padding.md,
  },
  instructionsList: {
    gap: LAYOUT.padding.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: LAYOUT.fontSize.md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: LAYOUT.padding.sm,
    minWidth: 20,
  },
  instructionText: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  confirmationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.padding.xl,
    padding: LAYOUT.padding.md,
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: LAYOUT.padding.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationText: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: LAYOUT.padding.md,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.lg,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.border,
  },
  continueButtonText: {
    color: Colors.surface,
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  skipButton: {
    backgroundColor: Colors.warning || '#FF9800',
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Colors.surface,
    fontSize: LAYOUT.fontSize.sm,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '600',
  },
});