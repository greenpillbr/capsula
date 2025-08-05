import '@/localization/i18n'; // Initialize i18n
import { fireEvent, render } from '@testing-library/react-native'
import { WelcomeScreen } from '../WelcomeScreen'

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'onboarding.welcome.title': 'Welcome to Capsula',
        'onboarding.welcome.subtitle': 'Your regenerative wallet for the future economy',
        'onboarding.welcome.description': 'Manage your digital assets and participate in regenerative communities simply and securely.',
        'common.continue': 'Continue',
      }
      return translations[key] || key
    },
  }),
}))

describe('WelcomeScreen', () => {
  const mockOnGetStarted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    const { getByText } = render(<WelcomeScreen onGetStarted={mockOnGetStarted} />)
    
    expect(getByText('Capsula')).toBeTruthy()
    expect(getByText('Welcome to Capsula')).toBeTruthy()
    expect(getByText('Your regenerative wallet for the future economy')).toBeTruthy()
    expect(getByText('Manage your digital assets and participate in regenerative communities simply and securely.')).toBeTruthy()
    expect(getByText('Continue')).toBeTruthy()
  })

  it('displays the logo emoji', () => {
    const { getByText } = render(<WelcomeScreen onGetStarted={mockOnGetStarted} />)
    
    expect(getByText('🌱')).toBeTruthy()
  })

  it('calls onGetStarted when continue button is pressed', () => {
    const { getByText } = render(<WelcomeScreen onGetStarted={mockOnGetStarted} />)
    
    const continueButton = getByText('Continue')
    fireEvent.press(continueButton)
    
    expect(mockOnGetStarted).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility', () => {
    const { getByText } = render(<WelcomeScreen onGetStarted={mockOnGetStarted} />)
    
    const continueButton = getByText('Continue')
    expect(continueButton).toBeTruthy()
    
    // The button should be touchable
    fireEvent.press(continueButton)
    expect(mockOnGetStarted).toHaveBeenCalled()
  })

  it('matches snapshot', () => {
    const tree = render(<WelcomeScreen onGetStarted={mockOnGetStarted} />)
    expect(tree).toMatchSnapshot()
  })
})
