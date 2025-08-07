import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { APP_CONFIG } from '../constants'

// Import localization files
import enUS from './locales/en-US'
import esES from './locales/es-ES'
import ptBR from './locales/pt-BR'

const resources = {
  'pt-BR': {
    translation: ptBR
  },
  'en-US': {
    translation: enUS
  },
  'es-ES': {
    translation: esES
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: APP_CONFIG.defaultLanguage,
    fallbackLng: 'en-US',
    
    interpolation: {
      escapeValue: false,
      format: (value, format, lng) => {
        if (format === 'currency') {
          return formatCurrency(value, lng || APP_CONFIG.defaultLanguage)
        }
        if (format === 'date') {
          return formatDate(value, lng || APP_CONFIG.defaultLanguage)
        }
        if (format === 'number') {
          return formatNumber(value, lng || APP_CONFIG.defaultLanguage)
        }
        return value
      }
    },
    
    react: {
      useSuspense: false,
    },
  })

// Brazilian-specific formatting functions
export const formatCurrency = (amount: number, locale: string = 'pt-BR'): string => {
  if (locale === 'pt-BR') {
    // Format as Brazilian Real
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }
  
  if (locale === 'en-US') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  if (locale === 'es-ES') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }
  
  return amount.toString()
}

export const formatCrypto = (amount: number, symbol: string): string => {
  const formatted = amount.toFixed(6).replace(/\.?0+$/, '')
  return `${formatted} ${symbol}`
}

export const formatDate = (date: Date, locale: string = 'pt-BR'): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export const formatNumber = (number: number, locale: string = 'pt-BR'): string => {
  return new Intl.NumberFormat(locale).format(number)
}

export const formatAddress = (address: string, length: number = 6): string => {
  if (!address) return ''
  if (address.length <= length * 2) return address
  
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

export default i18n
