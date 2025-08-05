import { Colors } from '@/constants'
import i18n from '@/localization/i18n'
import { WelcomeScreen } from '@/screens/onboarding/WelcomeScreen'
import { useWalletStore } from '@/stores/walletStore'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false)
  const { isInitialized, isUnlocked, initializeWallet } = useWalletStore()

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Initialize wallet store
        await initializeWallet()
        
        // Add any other initialization logic here
        // e.g., load fonts, check for updates, etc.
        
        setIsAppReady(true)
      } catch (error) {
        console.error('Error preparing app:', error)
        setIsAppReady(true) // Still show the app even if there's an error
      }
    }

    prepareApp()
  }, [initializeWallet])

  const handleGetStarted = () => {
    // For now, just log that the user wants to get started
    // Later this will navigate to wallet creation/import flow
    console.log('User wants to get started!')
  }

  if (!isAppReady) {
    // You could show a splash screen here
    return null
  }

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        
        {/* For now, always show the welcome screen */}
        {/* Later this will have proper navigation based on wallet state */}
        <WelcomeScreen onGetStarted={handleGetStarted} />
      </I18nextProvider>
    </SafeAreaProvider>
  )
}
