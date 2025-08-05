import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Colors, LAYOUT } from '../../constants'

interface CreateOrImportScreenProps {
  onCreateNew: () => void
  onImportPasskey: () => void
  onImportSeedPhrase: () => void
  onBack: () => void
}

export const CreateOrImportScreen: React.FC<CreateOrImportScreenProps> = ({
  onCreateNew,
  onImportPasskey,
  onImportSeedPhrase,
  onBack,
}) => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>← {t('common.back')}</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('onboarding.createOrImport.title')}</Text>
            <Text style={styles.subtitle}>{t('onboarding.createOrImport.subtitle')}</Text>
          </View>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Create New Wallet */}
          <TouchableOpacity style={styles.optionCard} onPress={onCreateNew}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>🌱</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{t('onboarding.createOrImport.createNew')}</Text>
              <Text style={styles.optionDescription}>
                {t('onboarding.createOrImport.createNewDescription')}
              </Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          {/* Import with Passkey */}
          <TouchableOpacity style={styles.optionCard} onPress={onImportPasskey}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>🔐</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{t('onboarding.createOrImport.importPasskey')}</Text>
              <Text style={styles.optionDescription}>
                {t('onboarding.createOrImport.importPasskeyDescription')}
              </Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>

          {/* Import with Recovery Phrase */}
          <TouchableOpacity style={styles.optionCard} onPress={onImportSeedPhrase}>
            <View style={styles.optionIcon}>
              <Text style={styles.optionEmoji}>📝</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{t('onboarding.createOrImport.importSeedPhrase')}</Text>
              <Text style={styles.optionDescription}>
                {t('onboarding.createOrImport.importSeedPhraseDescription')}
              </Text>
            </View>
            <Text style={styles.optionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Educational Note */}
        <View style={styles.educationalNote}>
          <Text style={styles.noteIcon}>💡</Text>
          <Text style={styles.noteText}>
            {t('onboarding.createOrImport.educationalNote')}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: LAYOUT.padding.lg,
    paddingTop: LAYOUT.padding.xl,
    paddingBottom: LAYOUT.padding.xl,
  },
  header: {
    marginBottom: LAYOUT.padding.xl * 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: LAYOUT.padding.sm,
    paddingHorizontal: LAYOUT.padding.md,
    marginBottom: LAYOUT.padding.lg,
  },
  backButtonText: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.primary,
    fontWeight: '500',
  },
  titleContainer: {
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
  optionsContainer: {
    gap: LAYOUT.padding.lg,
    marginBottom: LAYOUT.padding.xl * 2,
  },
  optionCard: {
    backgroundColor: Colors.surface,
    borderRadius: LAYOUT.borderRadius.lg,
    padding: LAYOUT.padding.lg,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.padding.md,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: LAYOUT.padding.xs,
  },
  optionDescription: {
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  optionArrow: {
    fontSize: LAYOUT.fontSize.lg,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  educationalNote: {
    backgroundColor: Colors.primaryLight,
    borderRadius: LAYOUT.borderRadius.md,
    padding: LAYOUT.padding.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteIcon: {
    fontSize: 20,
    marginRight: LAYOUT.padding.sm,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: LAYOUT.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
})
