import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, LAYOUT } from '../constants';

interface SeedPhraseVerificationProps {
  originalSeedPhrase: string;
  onVerificationComplete: (verified: boolean) => void;
  onCancel: () => void;
}

export const SeedPhraseVerification: React.FC<SeedPhraseVerificationProps> = ({
  originalSeedPhrase,
  onVerificationComplete,
  onCancel,
}) => {
  const [verificationWords, setVerificationWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ [key: number]: string }>({});
  const [verificationIndices, setVerificationIndices] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const seedWords = originalSeedPhrase.split(' ');

  useEffect(() => {
    generateVerificationTest();
  }, []);

  const generateVerificationTest = () => {
    // Select 4 random word positions for verification
    const indices: number[] = [];
    while (indices.length < 4) {
      const randomIndex = Math.floor(Math.random() * seedWords.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    indices.sort((a, b) => a - b);
    setVerificationIndices(indices);

    // Create shuffled word options for each verification step
    const allWords = [...seedWords];
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setVerificationWords(shuffledWords);
  };

  const handleWordSelection = (word: string) => {
    const currentIndex = verificationIndices[currentStep];
    const correctWord = seedWords[currentIndex];

    if (word === correctWord) {
      setSelectedWords(prev => ({ ...prev, [currentIndex]: word }));
      
      if (currentStep < verificationIndices.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsComplete(true);
        setTimeout(() => {
          onVerificationComplete(true);
        }, 1000);
      }
    } else {
      // Wrong word selected
      if (Platform.OS === 'web') {
        window.alert(`Incorrect word. The correct word for position ${currentIndex + 1} is "${correctWord}". Please try again.`);
      } else {
        Alert.alert(
          'Incorrect Word',
          `The correct word for position ${currentIndex + 1} is "${correctWord}". Please try again.`,
          [{ text: 'OK' }]
        );
      }
      
      // Reset verification
      setSelectedWords({});
      setCurrentStep(0);
      generateVerificationTest();
    }
  };

  const handleSkipVerification = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Skip Verification?\n\nSkipping verification means you haven\'t confirmed you can recover your wallet. This is risky and not recommended.\n\nAre you sure you want to skip?'
      );
      if (confirmed) {
        onVerificationComplete(false);
      }
    } else {
      Alert.alert(
        'Skip Verification?',
        'Skipping verification means you haven\'t confirmed you can recover your wallet. This is risky and not recommended.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip Anyway', style: 'destructive', onPress: () => onVerificationComplete(false) }
        ]
      );
    }
  };

  const currentVerificationIndex = verificationIndices[currentStep];
  const progress = ((currentStep + 1) / verificationIndices.length) * 100;

  if (isComplete) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Verification Complete!</Text>
          <Text style={styles.successDescription}>
            You've successfully verified your recovery phrase. Your wallet backup is secure.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Verify Recovery Phrase</Text>
        <Text style={styles.subtitle}>
          Select the correct word for each position to verify you've saved your recovery phrase
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {verificationIndices.length}
          </Text>
        </View>
      </View>

      {/* Current Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          What is word #{currentVerificationIndex + 1}?
        </Text>
        
        {/* Word Position Context */}
        <View style={styles.contextContainer}>
          <Text style={styles.contextText}>Position in your recovery phrase:</Text>
          <View style={styles.wordPositionContainer}>
            {seedWords.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.wordPosition,
                  index === currentVerificationIndex && styles.wordPositionActive,
                  selectedWords[index] && styles.wordPositionCompleted
                ]}
              >
                <Text style={[
                  styles.wordPositionText,
                  index === currentVerificationIndex && styles.wordPositionTextActive
                ]}>
                  {index + 1}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Word Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.optionsTitle}>Select the correct word:</Text>
        <View style={styles.wordsGrid}>
          {verificationWords.slice(0, 12).map((word, index) => (
            <TouchableOpacity
              key={`${word}-${index}`}
              style={styles.wordOption}
              onPress={() => handleWordSelection(word)}
            >
              <Text style={styles.wordOptionText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipVerification}>
          <Text style={styles.skipButtonText}>Skip Verification</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: LAYOUT.padding.lg,
  },
  header: {
    marginBottom: LAYOUT.padding.xl,
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
    marginBottom: LAYOUT.padding.lg,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: LAYOUT.padding.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  questionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: LAYOUT.padding.lg,
    marginBottom: LAYOUT.padding.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.md,
  },
  contextContainer: {
    alignItems: 'center',
  },
  contextText: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: LAYOUT.padding.sm,
  },
  wordPositionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  wordPosition: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  wordPositionActive: {
    backgroundColor: Colors.primary,
  },
  wordPositionCompleted: {
    backgroundColor: Colors.success || '#4CAF50',
  },
  wordPositionText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  wordPositionTextActive: {
    color: Colors.surface,
  },
  optionsContainer: {
    flex: 1,
    marginBottom: LAYOUT.padding.xl,
  },
  optionsTitle: {
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: LAYOUT.padding.md,
    textAlign: 'center',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: LAYOUT.padding.sm,
  },
  wordOption: {
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: '30%',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  wordOptionText: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: LAYOUT.padding.md,
  },
  skipButton: {
    flex: 1,
    backgroundColor: Colors.warning || '#FF9800',
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    alignItems: 'center',
  },
  skipButtonText: {
    color: Colors.surface,
    fontSize: LAYOUT.fontSize.md,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.padding.lg,
  },
  successTitle: {
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.success || '#4CAF50',
    textAlign: 'center',
    marginBottom: LAYOUT.padding.md,
  },
  successDescription: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});