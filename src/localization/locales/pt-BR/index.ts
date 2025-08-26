const ptBR = {
  // Common terms
  common: {
    welcome: 'Bem-vindo ao Capsula',
    continue: 'Continuar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Excluir',
    back: 'Voltar',
    next: 'Próximo',
    done: 'Concluído',
    skip: 'Pular',
    retry: 'Tentar novamente',
    close: 'Fechar',
    ok: 'OK',
    yes: 'Sim',
    no: 'Não',
  },

  // Wallet-specific terms
  wallet: {
    balance: 'Saldo',
    send: 'Enviar',
    receive: 'Receber',
    history: 'Histórico',
    transaction: 'Transação',
    transactions: 'Transações',
    address: 'Endereço',
    amount: 'Valor',
    fee: 'Taxa',
    total: 'Total',
    
    // Wallet creation/import
    createWallet: 'Criar Carteira',
    importWallet: 'Importar Carteira',
    seedPhrase: 'Frase de Recuperação',
    seedPhraseExplanation: 'Sua frase de recuperação é como a chave mestra da sua carteira. Guarde-a em local seguro e nunca a compartilhe!',
    confirmSeedPhrase: 'Confirmar Frase de Recuperação',
    enterSeedPhrase: 'Digite sua frase de recuperação',
    invalidSeedPhrase: 'Frase de recuperação inválida',
    
    // Passkey Authentication
    passkeySetup: 'Configurar Passkey',
    passkeyEnabled: 'Passkey ativado',
    passkeyDisabled: 'Passkey desativado',
    unlockWithPasskey: 'Desbloquear com Passkey',
    createWithPasskey: 'Criar Carteira com Passkey',
    enterWithPasskey: 'Entrar com Passkey',
    passkeyAuthentication: 'Autenticação Passkey',
    passkeyNotSupported: 'Passkeys Não Suportados',
    passkeyRegistrationFailed: 'Falha no Registro do Passkey',
    passkeyAuthenticationFailed: 'Falha na Autenticação do Passkey',
    
    // Seed Phrase Backup & Verification
    backupRecoveryPhrase: 'Backup da Frase de Recuperação',
    backupDescription: 'Sua frase de recuperação é a chave mestra da sua carteira. Anote-a e guarde-a com segurança.',
    securityNotice: 'Aviso de Segurança',
    securityWarnings: 'Nunca compartilhe • Guarde offline • Capsula não pode recuperar frases perdidas',
    yourRecoveryPhrase: 'Sua Frase de Recuperação',
    writeDownWords: 'Anote essas 12 palavras em ordem:',
    backupInstructions: 'Como fazer backup com segurança:',
    instruction1: 'Escreva as palavras no papel na ordem exata mostrada',
    instruction2: 'Guarde o papel em local seguro e offline',
    instruction3: 'Considere fazer várias cópias em locais diferentes',
    instruction4: 'Nunca tire screenshots ou armazene digitalmente',
    confirmBackup: 'Anotei e guardei minha frase de recuperação com segurança',
    continueToVerification: 'Continuar para Verificação',
    skipBackup: 'Pular Backup (Não Recomendado)',
    
    // Seed Phrase Verification
    verifyRecoveryPhrase: 'Verificar Frase de Recuperação',
    verificationDescription: 'Selecione a palavra correta para cada posição para verificar se você salvou sua frase de recuperação',
    verificationProgress: '{{current}} de {{total}}',
    whatIsWord: 'Qual é a palavra #{{position}}?',
    positionInPhrase: 'Posição na sua frase de recuperação:',
    selectCorrectWord: 'Selecione a palavra correta:',
    skipVerification: 'Pular Verificação',
    verificationComplete: 'Verificação Completa!',
    verificationSuccess: 'Você verificou com sucesso sua frase de recuperação. Seu backup da carteira está seguro.',
    incorrectWord: 'Palavra incorreta. A palavra correta para a posição {{position}} é "{{word}}". Tente novamente.',
    skipVerificationWarning: 'Pular a verificação significa que você não confirmou que pode recuperar sua carteira. Isso é arriscado e não recomendado.',
    skipBackupWarning: 'Sem fazer backup da sua frase de recuperação, você perderá acesso à sua carteira se:\n• Perder seu dispositivo\n• Seu dispositivo for danificado\n• Desinstalar o aplicativo\n\nIsso é ALTAMENTE ARRISCADO e não recomendado.',
    
    // Security
    biometricSetup: 'Configurar Biometria',
    biometricEnabled: 'Biometria ativada',
    biometricDisabled: 'Biometria desativada',
    unlockWithBiometric: 'Desbloquear com biometria',
    unlockWithPasscode: 'Desbloquear com código',
    
    // Transactions
    transactionSent: 'Transação enviada com sucesso',
    transactionFailed: 'Falha na transação',
    insufficientFunds: 'Saldo insuficiente',
    invalidAddress: 'Endereço inválido',
    confirmTransaction: 'Confirmar transação',
    transactionDetails: 'Detalhes da transação',
    
    // Networks
    network: 'Rede',
    switchNetwork: 'Trocar rede',
    networkUnsupported: 'Rede não suportada',
  },

  // Mini-apps
  modules: {
    availableModules: 'Módulos Disponíveis',
    installedModules: 'Módulos Instalados',
    installModule: 'Instalar Módulo',
    uninstallModule: 'Desinstalar Módulo',
    moduleStore: 'Loja de Módulos',
    featuredModules: 'Módulos em Destaque',
    recentlyUsed: 'Usados recentemente',
    
    categories: {
      defi: 'DeFi',
      nft: 'NFTs',
      social: 'Social',
      utility: 'Utilidades',
      game: 'Jogos',
    },
    
    collections: {
      followedCollections: 'Coleções Seguidas',
      featuredCollections: 'Coleções em Destaque',
      communityCollections: 'Coleções da Comunidade',
      officialCollections: 'Coleções Oficiais',
    },
    
    permissions: {
      wallet: 'Acesso à carteira',
      storage: 'Armazenamento local',
      network: 'Acesso à rede',
      camera: 'Acesso à câmera',
      location: 'Acesso à localização',
    },
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: 'Bem-vindo ao Capsula',
      subtitle: 'Sua carteira regenerativa para a economia do futuro',
      description: 'Gerencie seus ativos digitais e participe de comunidades regenerativas de forma simples e segura.',
      welcomeBack: 'Bem-vindo de volta! Escolha como gostaria de acessar sua carteira.',
    },
    
    // Simplified Onboarding
    simplified: {
      passkeyButton: 'Criar Carteira com Passkey',
      passkeyButtonExisting: 'Entrar com Passkey',
      passkeyDescription: 'Crie uma nova carteira protegida com autenticação Passkey',
      passkeyDescriptionExisting: 'Use autenticação Passkey para acessar sua carteira existente',
      passkeyDescriptionBiometric: 'Passkeys não disponíveis, mas autenticação biométrica é suportada',
      passkeyDescriptionLimited: 'Recursos de segurança limitados disponíveis neste dispositivo',
      
      manualButton: 'Configuração Manual',
      manualButtonExisting: 'Entrar com Frase de Recuperação',
      manualDescription: 'Criar ou restaurar carteira usando frase de recuperação',
      manualDescriptionExisting: 'Use sua frase de recuperação de 12 palavras para restaurar sua carteira',
      
      securityHigh: 'Alta Segurança',
      securityMedium: 'Segurança Média',
      securityLow: 'Segurança Básica',
      
      capabilityPasskey: 'Seu dispositivo suporta autenticação Passkey para segurança e conveniência aprimoradas.',
      capabilityBiometric: 'Seu dispositivo suporta autenticação biométrica. Passkeys não estão disponíveis, mas você pode usar impressão digital ou reconhecimento facial.',
      capabilityBasic: 'Seu dispositivo suporta armazenamento seguro. Você pode usar senhas de transação para proteção da carteira.',
      capabilityLimited: 'Seu dispositivo tem recursos de segurança limitados. Gerenciamento manual de frase de recuperação é recomendado.',
      
      securityNote: 'Os dados da sua carteira são criptografados e armazenados com segurança no seu dispositivo. A Capsula nunca tem acesso às suas chaves privadas ou frase de recuperação.',
    },
    
    createOrImport: {
      title: 'Vamos começar',
      subtitle: 'Crie uma nova carteira ou importe uma existente',
      createNew: 'Criar nova carteira',
      createNewDescription: 'Gere uma nova carteira com uma frase de recuperação segura',
      importPasskey: 'Importar com Passkey',
      importPasskeyDescription: 'Use sua autenticação biométrica para restaurar sua carteira',
      importSeedPhrase: 'Importar com Frase de Recuperação',
      importSeedPhraseDescription: 'Restaure sua carteira usando sua frase de recuperação de 12 palavras',
      educationalNote: 'Novo em cripto? Recomendamos criar uma nova carteira para aprender passo a passo com orientação educacional.',
      importExisting: 'Importar carteira existente',
    },
    
    security: {
      title: 'Proteja sua carteira',
      subtitle: 'Configure a segurança da sua carteira',
      biometricTitle: 'Ativar biometria',
      biometricDescription: 'Use sua impressão digital ou reconhecimento facial para acessar rapidamente sua carteira',
      backupTitle: 'Fazer backup',
      backupDescription: 'Salve sua frase de recuperação em local seguro',
    },
    
    complete: {
      title: 'Tudo pronto!',
      subtitle: 'Sua carteira Capsula foi configurada com sucesso',
      description: 'Agora você pode começar a explorar o mundo das finanças regenerativas.',
      startExploring: 'Começar a explorar',
    },
  },

  // Settings
  settings: {
    title: 'Configurações',
    general: 'Geral',
    security: 'Segurança',
    about: 'Sobre',
    
    language: 'Idioma',
    currency: 'Moeda',
    theme: 'Tema',
    notifications: 'Notificações',
    
    backup: 'Backup',
    changePasscode: 'Alterar código',
    biometric: 'Biometria',
    autoLock: 'Bloqueio automático',
    
    version: 'Versão',
    support: 'Suporte',
    privacy: 'Privacidade',
    terms: 'Termos de uso',
  },

  // Errors
  errors: {
    generic: 'Algo deu errado. Tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    invalidInput: 'Entrada inválida',
    unauthorized: 'Não autorizado',
    notFound: 'Não encontrado',
    timeout: 'Tempo esgotado',
    
    wallet: {
      creation: 'Erro ao criar carteira',
      import: 'Erro ao importar carteira',
      unlock: 'Erro ao desbloquear carteira',
      transaction: 'Erro na transação',
    },
    
    passkey: {
      notSupported: 'Seu dispositivo não suporta autenticação Passkey',
      registrationFailed: 'Falha ao registrar Passkey',
      authenticationFailed: 'Falha ao autenticar com Passkey',
      browserNotSupported: 'Seu navegador não suporta WebAuthn/Passkeys ou o recurso está desabilitado',
      iosRequirement: 'Passkeys requerem iOS 16+ e hardware compatível',
      androidRequirement: 'Passkeys requerem Android 9+ com Google Play Services e hardware compatível',
      platformNotSupported: 'Passkeys não são suportados nesta plataforma',
      fallbackSuggestion: 'Use entrada manual de frase de recuperação ou senha de transação',
      biometricFallback: 'Você pode tentar usar autenticação biométrica ou senha de transação como alternativas',
      manualFallback: 'Considere usar entrada manual de frase de recuperação para melhor segurança',
    },
    
    miniApp: {
      install: 'Erro ao instalar módulo',
      uninstall: 'Erro ao desinstalar módulo',
      load: 'Erro ao carregar módulo',
      permission: 'Permissão negada',
    },
  },

  // Navigation
  navigation: {
    home: 'Início',
    modules: 'Módulos',
    settings: 'Configurações',
    wallet: 'Carteira',
    discover: 'Descobrir',
  },

  // Time formats
  time: {
    now: 'agora',
    minutesAgo: '{{count}} min atrás',
    hoursAgo: '{{count}}h atrás',
    daysAgo: '{{count}}d atrás',
    weeksAgo: '{{count}}sem atrás',
  },
}

export default ptBR
