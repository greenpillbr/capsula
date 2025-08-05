import { Colors, LAYOUT } from '@/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo placeholder */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌱</Text>
          <Text style={styles.appName}>Capsula</Text>
        </View>

        {/* Welcome content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t('onboarding.welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.welcome.subtitle')}</Text>
          <Text style={styles.description}>{t('onboarding.welcome.description')}</Text>
        </View>

        {/* Action button */}
        <TouchableOpacity style={styles.button} onPress={onGetStarted}>
          <Text style={styles.buttonText}>{t('common.continue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding.xl * 2,
  },
  logoText: {
    fontSize: 80,
    marginBottom: LAYOUT.padding.md,
  },
  appName: {
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding.xl * 2,
  },
  title: {
    fontSize: LAYOUT.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.md,
  },
  subtitle: {
    fontSize: LAYOUT.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.padding.lg,
  },
  description: {
    fontSize: LAYOUT.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: LAYOUT.padding.xl,
    paddingVertical: LAYOUT.padding.lg,
    borderRadius: LAYOUT.borderRadius.lg,
    minWidth: 200,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: LAYOUT.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
})
