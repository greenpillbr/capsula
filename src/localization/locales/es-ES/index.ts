const esES = {
  // Common terms
  common: {
    welcome: 'Bienvenido a Capsula',
    continue: 'Continuar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    skip: 'Omitir',
    retry: 'Reintentar',
    close: 'Cerrar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No',
  },

  // Wallet-specific terms
  wallet: {
    balance: 'Saldo',
    send: 'Enviar',
    receive: 'Recibir',
    history: 'Historial',
    transaction: 'Transacción',
    transactions: 'Transacciones',
    address: 'Dirección',
    amount: 'Cantidad',
    fee: 'Comisión',
    total: 'Total',
    
    // Wallet creation/import
    createWallet: 'Crear Billetera',
    importWallet: 'Importar Billetera',
    seedPhrase: 'Frase de Recuperación',
    seedPhraseExplanation: 'Tu frase de recuperación es como la llave maestra de tu billetera. ¡Manténla segura y nunca la compartas!',
    confirmSeedPhrase: 'Confirmar Frase de Recuperación',
    enterSeedPhrase: 'Ingresa tu frase de recuperación',
    invalidSeedPhrase: 'Frase de recuperación inválida',
    
    // Passkey Authentication
    passkeySetup: 'Configurar Passkey',
    passkeyEnabled: 'Passkey activado',
    passkeyDisabled: 'Passkey desactivado',
    unlockWithPasskey: 'Desbloquear con Passkey',
    createWithPasskey: 'Crear Billetera con Passkey',
    enterWithPasskey: 'Entrar con Passkey',
    passkeyAuthentication: 'Autenticación Passkey',
    passkeyNotSupported: 'Passkeys No Soportados',
    passkeyRegistrationFailed: 'Fallo en el Registro del Passkey',
    passkeyAuthenticationFailed: 'Fallo en la Autenticación del Passkey',
    
    // Seed Phrase Backup & Verification
    backupRecoveryPhrase: 'Respaldar Frase de Recuperación',
    backupDescription: 'Tu frase de recuperación es la llave maestra de tu billetera. Escríbela y guárdala de forma segura.',
    securityNotice: 'Aviso de Seguridad',
    securityWarnings: 'Nunca compartir • Guardar offline • Capsula no puede recuperar frases perdidas',
    yourRecoveryPhrase: 'Tu Frase de Recuperación',
    writeDownWords: 'Escribe estas 12 palabras en orden:',
    backupInstructions: 'Cómo hacer respaldo de forma segura:',
    instruction1: 'Escribe las palabras en papel en el orden exacto mostrado',
    instruction2: 'Guarda el papel en un lugar seguro y offline',
    instruction3: 'Considera hacer varias copias en diferentes lugares',
    instruction4: 'Nunca tomes capturas de pantalla o almacenes digitalmente',
    confirmBackup: 'He escrito y guardado mi frase de recuperación de forma segura',
    continueToVerification: 'Continuar a Verificación',
    skipBackup: 'Omitir Respaldo (No Recomendado)',
    
    // Seed Phrase Verification
    verifyRecoveryPhrase: 'Verificar Frase de Recuperación',
    verificationDescription: 'Selecciona la palabra correcta para cada posición para verificar que has guardado tu frase de recuperación',
    verificationProgress: '{{current}} de {{total}}',
    whatIsWord: '¿Cuál es la palabra #{{position}}?',
    positionInPhrase: 'Posición en tu frase de recuperación:',
    selectCorrectWord: 'Selecciona la palabra correcta:',
    skipVerification: 'Omitir Verificación',
    verificationComplete: '¡Verificación Completa!',
    verificationSuccess: 'Has verificado exitosamente tu frase de recuperación. Tu respaldo de billetera está seguro.',
    incorrectWord: 'Palabra incorrecta. La palabra correcta para la posición {{position}} es "{{word}}". Inténtalo de nuevo.',
    skipVerificationWarning: 'Omitir la verificación significa que no has confirmado que puedes recuperar tu billetera. Esto es arriesgado y no recomendado.',
    skipBackupWarning: 'Sin respaldar tu frase de recuperación, perderás acceso a tu billetera si:\n• Pierdes tu dispositivo\n• Tu dispositivo se daña\n• Desinstalas la aplicación\n\nEsto es ALTAMENTE ARRIESGADO y no recomendado.',
    
    // Security
    biometricSetup: 'Configurar Biometría',
    biometricEnabled: 'Biometría activada',
    biometricDisabled: 'Biometría desactivada',
    unlockWithBiometric: 'Desbloquear con biometría',
    unlockWithPasscode: 'Desbloquear con código',
    
    // Transactions
    transactionSent: 'Transacción enviada exitosamente',
    transactionFailed: 'Transacción fallida',
    insufficientFunds: 'Fondos insuficientes',
    invalidAddress: 'Dirección inválida',
    confirmTransaction: 'Confirmar transacción',
    transactionDetails: 'Detalles de la transacción',
    
    // Networks
    network: 'Red',
    switchNetwork: 'Cambiar red',
    networkUnsupported: 'Red no soportada',
  },

  // Mini-apps
  modules: {
    availableModules: 'Módulos Disponibles',
    installedModules: 'Módulos Instalados',
    installModule: 'Instalar Módulo',
    uninstallModule: 'Desinstalar Módulo',
    moduleStore: 'Tienda de Módulos',
    featuredModules: 'Módulos Destacados',
    recentlyUsed: 'Usados recientemente',
    
    categories: {
      defi: 'DeFi',
      nft: 'NFTs',
      social: 'Social',
      utility: 'Utilidades',
      game: 'Juegos',
    },
    
    collections: {
      followedCollections: 'Colecciones Seguidas',
      featuredCollections: 'Colecciones Destacadas',
      communityCollections: 'Colecciones de la Comunidad',
      officialCollections: 'Colecciones Oficiales',
    },
    
    permissions: {
      wallet: 'Acceso a billetera',
      storage: 'Almacenamiento local',
      network: 'Acceso a red',
      camera: 'Acceso a cámara',
      location: 'Acceso a ubicación',
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Bienvenido a Capsula',
      subtitle: 'Tu billetera regenerativa para la economía del futuro',
      description: 'Gestiona tus activos digitales y participa en comunidades regenerativas de forma simple y segura.',
      welcomeBack: '¡Bienvenido de vuelta! Elige cómo te gustaría acceder a tu billetera.',
    },
    
    // Simplified Onboarding
    simplified: {
      passkeyButton: 'Crear Billetera con Passkey',
      passkeyButtonExisting: 'Entrar con Passkey',
      passkeyDescription: 'Crea una nueva billetera protegida con autenticación Passkey',
      passkeyDescriptionExisting: 'Usa autenticación Passkey para acceder a tu billetera existente',
      passkeyDescriptionBiometric: 'Passkeys no disponibles, pero autenticación biométrica es soportada',
      passkeyDescriptionLimited: 'Características de seguridad limitadas disponibles en este dispositivo',
      
      manualButton: 'Configuración Manual',
      manualButtonExisting: 'Entrar con Frase de Recuperación',
      manualDescription: 'Crear o restaurar billetera usando frase de recuperación',
      manualDescriptionExisting: 'Usa tu frase de recuperación de 12 palabras para restaurar tu billetera',
      
      securityHigh: 'Alta Seguridad',
      securityMedium: 'Seguridad Media',
      securityLow: 'Seguridad Básica',
      
      capabilityPasskey: 'Tu dispositivo soporta autenticación Passkey para seguridad y conveniencia mejoradas.',
      capabilityBiometric: 'Tu dispositivo soporta autenticación biométrica. Passkeys no están disponibles, pero puedes usar huella dactilar o reconocimiento facial.',
      capabilityBasic: 'Tu dispositivo soporta almacenamiento seguro. Puedes usar contraseñas de transacción para protección de billetera.',
      capabilityLimited: 'Tu dispositivo tiene características de seguridad limitadas. Se recomienda gestión manual de frase de recuperación.',
      
      securityNote: 'Los datos de tu billetera están encriptados y almacenados de forma segura en tu dispositivo. Capsula nunca tiene acceso a tus llaves privadas o frase de recuperación.',
    },
    
    createOrImport: {
      title: 'Empecemos',
      subtitle: 'Crea una nueva billetera o importa una existente',
      createNew: 'Crear nueva billetera',
      createNewDescription: 'Genera una nueva billetera con una frase de recuperación segura',
      importPasskey: 'Importar con Passkey',
      importPasskeyDescription: 'Usa tu autenticación biométrica para restaurar tu billetera',
      importSeedPhrase: 'Importar con Frase de Recuperación',
      importSeedPhraseDescription: 'Restaura tu billetera usando tu frase de recuperación de 12 palabras',
      educationalNote: '¿Nuevo en cripto? Recomendamos crear una nueva billetera para aprender paso a paso con orientación educativa.',
      importExisting: 'Importar billetera existente',
    },
    
    security: {
      title: 'Asegura tu billetera',
      subtitle: 'Configura la seguridad de tu billetera',
      biometricTitle: 'Activar biometría',
      biometricDescription: 'Usa tu huella dactilar o reconocimiento facial para acceder rápidamente a tu billetera',
      backupTitle: 'Respaldo',
      backupDescription: 'Guarda tu frase de recuperación en un lugar seguro',
    },
    
    complete: {
      title: '¡Todo listo!',
      subtitle: 'Tu billetera Capsula ha sido configurada exitosamente',
      description: 'Ahora puedes comenzar a explorar el mundo de las finanzas regenerativas.',
      startExploring: 'Comenzar a explorar',
    },
  },

  // Settings
  settings: {
    title: 'Configuraciones',
    general: 'General',
    security: 'Seguridad',
    about: 'Acerca de',
    
    language: 'Idioma',
    currency: 'Moneda',
    theme: 'Tema',
    notifications: 'Notificaciones',
    
    backup: 'Respaldo',
    changePasscode: 'Cambiar código',
    biometric: 'Biometría',
    autoLock: 'Bloqueo automático',
    
    version: 'Versión',
    support: 'Soporte',
    privacy: 'Privacidad',
    terms: 'Términos de uso',
  },

  // Errors
  errors: {
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    network: 'Error de conexión. Verifica tu internet.',
    invalidInput: 'Entrada inválida',
    unauthorized: 'No autorizado',
    notFound: 'No encontrado',
    timeout: 'Tiempo agotado',
    
    wallet: {
      creation: 'Error al crear billetera',
      import: 'Error al importar billetera',
      unlock: 'Error al desbloquear billetera',
      transaction: 'Error en transacción',
    },
    
    passkey: {
      notSupported: 'Tu dispositivo no soporta autenticación Passkey',
      registrationFailed: 'Fallo al registrar Passkey',
      authenticationFailed: 'Fallo al autenticar con Passkey',
      browserNotSupported: 'Tu navegador no soporta WebAuthn/Passkeys o la característica está deshabilitada',
      iosRequirement: 'Passkeys requieren iOS 16+ y hardware compatible',
      androidRequirement: 'Passkeys requieren Android 9+ con Google Play Services y hardware compatible',
      platformNotSupported: 'Passkeys no son soportados en esta plataforma',
      fallbackSuggestion: 'Usa entrada manual de frase de recuperación o contraseña de transacción',
      biometricFallback: 'Puedes intentar usar autenticación biométrica o contraseña de transacción como alternativas',
      manualFallback: 'Considera usar entrada manual de frase de recuperación para mejor seguridad',
    },
    
    miniApp: {
      install: 'Error al instalar módulo',
      uninstall: 'Error al desinstalar módulo',
      load: 'Error al cargar módulo',
      permission: 'Permiso denegado',
    },
  },

  // Navigation
  navigation: {
    home: 'Inicio',
    modules: 'Módulos',
    settings: 'Configuraciones',
    wallet: 'Billetera',
    discover: 'Descubrir',
  },

  // Time formats
  time: {
    now: 'ahora',
    minutesAgo: 'hace {{count}} min',
    hoursAgo: 'hace {{count}}h',
    daysAgo: 'hace {{count}}d',
    weeksAgo: 'hace {{count}}sem',
  },
}

export default esES
