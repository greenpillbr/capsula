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
    },
    
    createOrImport: {
      title: 'Empecemos',
      subtitle: 'Crea una nueva billetera o importa una existente',
      createNew: 'Crear nueva billetera',
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
