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
    },
    
    createOrImport: {
      title: 'Vamos começar',
      subtitle: 'Crie uma nova carteira ou importe uma existente',
      createNew: 'Criar nova carteira',
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
