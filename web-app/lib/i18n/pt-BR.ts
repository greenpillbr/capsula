import type { Translations } from "./types";

export const ptBR: Translations = {
  "meta.title": "Capsula",
  "meta.description":
    "Interface de administração para distribuições Capsula Attendance na Celo",
  "nav.home": "Início",
  "nav.registerAttendance": "Registrar presença",
  "nav.claim": "Resgatar",
  "nav.configure": "Configurar",
  "nav.gpbrvSwap": "Swap GPBRV",
  "nav.tools": "Ferramentas",
  "nav.empaticTech": "Desanuveador Tech Empático",
  "nav.empaticTechTooltip":
    "Um assistente conversacional empático que ajuda pessoas a escolherem o computador ideal, linguagem simplificada com metáforas do dia a dia.",
  "footer.developedByPrefix": "2026 - Desenvolvido por",
  "common.yes": "Sim",
  "common.no": "Não",
  "common.loading": "…",
  "common.dash": "—",
  "common.confirmInWallet": "Confirme na carteira…",
  "common.success": "Sucesso",
  "common.tryAgain": "Tentar novamente",
  "home.title": "O que é a capsula?",
  "home.tagline":
    "Framework customizável para gerenciamento de comunidades com poder descentralizado.",
  "home.selectCommunity": "Escolha sua comunidade",
  "home.switchCommunity": "Trocar comunidade",
  "community.notDeployed":
    "Este recurso ainda não foi implantado para esta comunidade.",
  "community.greenpillbr.description":
    "Comunidade online para organizar ações de regeneração, economia solidária e descentralização",
  "community.greenpillbr.intro":
    "É a interface das atividades on-chain da comunidade GreenPillBR",
  "community.grow.description":
    "Empresa decentralizada habilitadora de frameworks de governança, mrv e desenvolvimento rural inteligente",
  "community.grow.intro":
    "É a interface das atividades on-chain da GrowEcossistemas",
  "home.participate.title":
    "Quer participar? Compareça nos encontros da comunidade!",
  "home.participate.time": "⏰ As quartas-feiras das 17h30 às 19h00 (horário de São Paulo)",
  "home.participate.meetLabel": "🔗 Sala dos encontros:",
  "home.resources.title": "Recursos úteis",
  "home.resources.onboarding": "Tarefas de onboarding na balaio",
  "home.resources.gardens": "Comunidade no Gardens",
  "home.resources.voucherPool": "Piscina de vouchers no Sarafu",
  "home.resources.liquidityPool": "Piscina de liquidez no Sarafu",
  "registerAttendance.title": "Registrar presença",
  "registerAttendance.description":
    "Registre sua presença no nosso encontro de hoje, durante a janela ativa.",
  "registerAttendance.latestDistribution": "Última distribuição",
  "registerAttendance.activeNow": "Ativa agora",
  "registerAttendance.youClaimed": "Você registrou",
  "registerAttendance.errorNoDistribution": "Nenhuma distribuição foi criada ainda.",
  "registerAttendance.errorConnectWallet": "Conecte sua carteira para registrar presença",
  "registerAttendance.connectWalletNotice":
    "Conecte sua carteira para registrar presença.",
  "registerAttendance.buttonLabel": "Registrar presença",
  "registerAttendance.buttonPending": "Registrando…",
  "registerAttendance.buttonSuccess": "Presença registrada",
  "resgatar.title": "Resgatar",
  "resgatar.description":
    "Resgate sua recompensa Good Dollar (G$) da distribuição criada mais recentemente, durante a janela ativa.",
  "resgatar.latestDistribution": "Última distribuição",
  "resgatar.activeNow": "Ativa agora",
  "resgatar.youClaimed": "Você resgatou",
  "resgatar.errorNoDistribution": "Nenhuma distribuição foi criada ainda.",
  "resgatar.errorConnectWallet": "Conecte sua carteira para resgatar",
  "resgatar.connectWalletNotice":
    "Conecte sua carteira para enviar um resgate.",
  "resgatar.buttonLabel": "Resgatar distribuição",
  "resgatar.buttonPending": "Resgatando…",
  "resgatar.buttonSuccess": "Resgatado",
  "claim.title": "Resgatar",
  "claim.description":
    "Resgate sua recompensa GPBR da distribuição criada mais recentemente, durante a janela ativa.",
  "claim.latestDistribution": "Última distribuição",
  "claim.activeNow": "Ativa agora",
  "claim.youClaimed": "Você resgatou",
  "claim.errorNoDistribution": "Nenhuma distribuição foi criada ainda.",
  "claim.errorConnectWallet": "Conecte sua carteira para resgatar",
  "claim.connectWalletNotice":
    "Conecte sua carteira para enviar um resgate.",
  "claim.buttonLabel": "Resgatar distribuição",
  "claim.buttonPending": "Resgatando…",
  "claim.buttonSuccess": "Resgatado",
  "createDistribution.title": "Criar distribuição",
  "createDistribution.connectWallet":
    "Conecte sua carteira para acessar esta página.",
  "createDistribution.notAllowlisted":
    "Sua carteira não está na lista de permissão de criadores do contrato.",
  "createDistribution.contractPool": "Pool do contrato",
  "createDistribution.gpbrInContract": "GPBR no contrato",
  "createDistribution.tokenInContract": "no contrato",
  "createDistribution.distributionsCreated": "Distribuições criadas",
  "createDistribution.fundContract": "Financiar contrato",
  "createDistribution.fundDescriptionGpbr":
    "Transfira tokens GPBR para o contrato TokenDistributor.",
  "createDistribution.fundDescriptionGoodDollar":
    "Transfira tokens Good Dollar (G$) para o contrato TokenDistributor.",
  "createDistribution.amountToken": "Valor",
  "createDistribution.errorInvalidAmount": "Informe um valor válido",
  "createDistribution.errorAmountZero": "O valor deve ser maior que zero",
  "createDistribution.errorInvalidAmountGeneric": "Valor inválido",
  "createDistribution.fundButton": "Financiar contrato",
  "createDistribution.fundButtonPending": "Financiando…",
  "createDistribution.fundButtonSuccess": "Financiado",
  "createDistribution.createDistribution": "Criar distribuição",
  "createDistribution.createDescription":
    "Abre uma nova janela de resgate usando o valor de recompensa e o período configurados no contrato. Apenas criadores na lista de permissão podem concluir on-chain.",
  "createDistribution.maxClaimers": "Máximo de resgates (0 = ilimitado)",
  "createDistribution.errorInvalidMaxClaimers":
    "Informe um inteiro não negativo válido (0 = ilimitado)",
  "createDistribution.createButton": "Criar distribuição",
  "createDistribution.createButtonPending": "Criando…",
  "createDistribution.createButtonSuccess": "Distribuição criada",
  "configure.title": "Configurar",
  "configure.connectWallet":
    "Conecte sua carteira para acessar esta página.",
  "configure.notAuthorized":
    "Sua carteira não está autorizada a configurar este contrato.",
  "configure.contractConfig": "Configuração do contrato",
  "configure.configDescription":
    "Defina o valor padrão da recompensa e a duração da janela de resgate (em blocos) para novas distribuições. Apenas o proprietário do contrato pode enviar isso on-chain.",
  "configure.notOwnerConfig":
    "Sua carteira não é o proprietário do contrato. Atualizações de configuração falharão on-chain.",
  "configure.amountToken": "Valor",
  "configure.periodBlocks": "Período (blocos)",
  "configure.errorInvalidAmount": "Informe um valor válido",
  "configure.errorInvalidPeriod": "Informe um período válido em blocos",
  "configure.errorAmountPeriodZero":
    "Valor e período devem ser maiores que zero",
  "configure.errorInvalidAmountOrPeriod": "Valor ou período inválido",
  "configure.saveConfig": "Salvar configuração",
  "configure.saveConfigPending": "Salvando…",
  "configure.saveConfigSuccess": "Configuração salva",
  "configure.creatorAllowlist": "Lista de criadores",
  "configure.allowlistDescription":
    "Gerencie quais endereços podem criar e cancelar distribuições. Apenas o proprietário do contrato pode alterar a lista on-chain.",
  "configure.notOwnerAllowlist":
    "Sua carteira não é o proprietário do contrato. Alterações na lista falharão on-chain.",
  "configure.address": "Endereço",
  "configure.isCreator": "isCreator:",
  "configure.errorInvalidAddress": "Informe um endereço válido",
  "configure.addCreator": "Adicionar criador",
  "configure.addCreatorPending": "Adicionando…",
  "configure.addCreatorSuccess": "Criador adicionado",
  "configure.removeCreator": "Remover criador",
  "configure.removeCreatorPending": "Removendo…",
  "configure.removeCreatorSuccess": "Criador removido",
  "gpbrvSwap.tabConfigure": "Configurar",
  "gpbrvSwap.tabSwapWithdraw": "Sacar",
  "gpbrvSwap.tabSwapDeposit": "Depositar",
  "gpbrvSwap.tabMinipay": "MiniPay",
  "gpbrvSwap.minipayTabDeposit": "Depositar",
  "gpbrvSwap.minipayTabConfigure": "Configurar",
  "gpbrvSwap.openInMinipayTitle": "Abra esta página no MiniPay",
  "gpbrvSwap.openInMinipayBody":
    "Esta seção só funciona dentro do navegador do app MiniPay, onde a carteira conectada é a sua MiniPay. Abra o MiniPay no celular e acesse este endereço:",
  "gpbrvSwap.openInMinipayConfigureCta":
    "Sua carteira ainda não tem um endereço MiniPay vinculado. Você pode vincular por aqui mesmo, pela carteira principal:",
  "gpbrvSwap.openInMinipayConfigureLink": "Ir para Configurar",
  "gpbrvSwap.swapWithdrawTitle": "Sacar (GPBRV para stablecoin)",
  "gpbrvSwap.swapWithdrawDescription":
    "Gaste GPBRV da sua carteira e receba a stablecoin escolhida na mesma carteira. Nenhuma configuração necessária.",
  "gpbrvSwap.swapDepositTitle": "Depositar (stablecoin para GPBRV)",
  "gpbrvSwap.swapDepositDescription":
    "Gaste a stablecoin escolhida da sua carteira e receba GPBRV na mesma carteira. Nenhuma configuração necessária.",
  "gpbrvSwap.connectWallet": "Conecte sua carteira para acessar esta página.",
  "gpbrvSwap.notDeployed":
    "O endereço do GPBRVSwapper não está configurado para esta comunidade.",
  "gpbrvSwap.configureTitle": "Vincule sua carteira MiniPay",
  "gpbrvSwap.configureDescription":
    "Armazene o endereço MiniPay que deve receber USDM ao sacar e gastar USDM ao depositar. Este vínculo é necessário antes de sacar ou depositar.",
  "gpbrvSwap.minipayAddress": "Endereço MiniPay",
  "gpbrvSwap.currentMinipay": "MiniPay vinculado atualmente",
  "gpbrvSwap.notConfiguredYet": "Nenhuma carteira MiniPay vinculada ao seu endereço ainda.",
  "gpbrvSwap.errorInvalidAddress": "Informe um endereço válido",
  "gpbrvSwap.errorInvalidAmount": "Informe um valor válido",
  "gpbrvSwap.errorSameAddress":
    "O endereço da carteira principal deve ser diferente da sua carteira MiniPay",
  "gpbrvSwap.saveButton": "Salvar vínculo",
  "gpbrvSwap.savePending": "Salvando…",
  "gpbrvSwap.saveSuccess": "Vinculado",
  "gpbrvSwap.configureFromMinipayTitle": "Vincule sua carteira principal",
  "gpbrvSwap.configureFromMinipayDescription":
    "Você está no MiniPay. Informe o endereço da sua carteira principal para receber GPBRV ao depositar por aqui.",
  "gpbrvSwap.userAddress": "Endereço da carteira principal",
  "gpbrvSwap.currentUser": "Carteira principal vinculada",
  "gpbrvSwap.notConfiguredYetMinipay":
    "Nenhuma carteira principal vinculada a esta MiniPay ainda.",
  "gpbrvSwap.sendToMinipayLabel":
    "Enviar a stablecoin para minha carteira MiniPay vinculada",
  "gpbrvSwap.sendToMinipayNotLinked":
    "Disponível apenas com uma carteira MiniPay vinculada. Vincule na aba Configurar.",
  "gpbrvSwap.notConfiguredWarningMinipay":
    "Sua carteira não está registrada como MiniPay. O proprietário deve vinculá-la na aba Configurar antes de depositar.",
  "gpbrvSwap.amountGpbrv": "Valor (GPBRV)",
  "gpbrvSwap.amountUsdm": "Valor (USDM)",
  "gpbrvSwap.amountLabel": "Valor",
  "gpbrvSwap.balanceOf": "Saldo",
  "gpbrvSwap.payWith": "Pagar com",
  "gpbrvSwap.youReceive": "Receber",
  "gpbrvSwap.slippage": "Slippage",
  "gpbrvSwap.slippageEdit": "Editar slippage",
  "gpbrvSwap.minReceived": "Mínimo recebido",
  "gpbrvSwap.slippageNote":
    "Calculado a partir da saída estimada menos a taxa Sarafu e o slippage configurado. Ajuste o slippage na engrenagem acima.",
  "gpbrvSwap.estimating": "Buscando cotação ao vivo…",
  "gpbrvSwap.estimatedOutput": "Saída estimada",
  "gpbrvSwap.exchangeRate": "Taxa",
  "gpbrvSwap.mentoQuote": "Cotação",
  "gpbrvSwap.quoteNote": "Com base na cotação Mento ao vivo, menos 5% de taxa do pool Sarafu.",
  "gpbrvSwap.quoteFailed": "Não foi possível obter cotação ao vivo. Informe um mínimo manualmente.",
  "gpbrvSwap.gpbrvBalance": "Saldo GPBRV",
  "gpbrvSwap.usdmBalance": "Saldo USDM",
  "gpbrvSwap.recipientMinipay": "Destinatário USDM (MiniPay)",
  "gpbrvSwap.recipientUser": "Destinatário GPBRV (usuário)",
  "gpbrvSwap.approveButton": "Aprovar",
  "gpbrvSwap.approvePending": "Aprovando…",
  "gpbrvSwap.approveSuccess": "Aprovado",
  "gpbrvSwap.resetApproveButton": "Redefinir aprovação",
  "gpbrvSwap.resetApprovePending": "Redefinindo aprovação…",
  "gpbrvSwap.resetApproveSuccess": "Aprovação redefinida",
  "gpbrvSwap.withdrawButton": "Sacar",
  "gpbrvSwap.withdrawPending": "Sacando…",
  "gpbrvSwap.withdrawSuccess": "Sacado",
  "gpbrvSwap.depositTitle": "Depositar (USDM para GPBRV)",
  "gpbrvSwap.depositDescription":
    "Gaste USDM da sua carteira MiniPay; a carteira de usuário vinculada recebe GPBRV.",
  "gpbrvSwap.depositButton": "Depositar",
  "gpbrvSwap.depositPending": "Depositando…",
  "gpbrvSwap.depositSuccess": "Depositado",
};
