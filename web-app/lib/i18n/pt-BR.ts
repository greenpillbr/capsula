import type { Translations } from "./types";

export const ptBR: Translations = {
  "meta.title": "Capsule Admin",
  "meta.description":
    "Interface de administração para distribuições Capsula Attendance na Celo",
  "nav.home": "Início",
  "nav.createDistribution": "Criar distribuição",
  "nav.claim": "Resgatar",
  "nav.configure": "Configurar",
  "common.yes": "Sim",
  "common.no": "Não",
  "common.loading": "…",
  "common.dash": "—",
  "common.confirmInWallet": "Confirme na carteira…",
  "common.success": "Sucesso",
  "common.tryAgain": "Tentar novamente",
  "home.intro":
    "Essa é a capsula, camada de abstração da comunidade GreenPillBR.",
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
  "createDistribution.distributionsCreated": "Distribuições criadas",
  "createDistribution.fundContract": "Financiar contrato",
  "createDistribution.fundDescription":
    "Transfira tokens GPBR para o contrato Attendance. O valor usa 6 decimais (ex.: 1 = 1 GPBR).",
  "createDistribution.amountGpbr": "Valor (GPBR)",
  "createDistribution.errorInvalidAmount": "Informe um valor GPBR válido",
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
  "configure.amountGpbr": "Valor (GPBR)",
  "configure.periodBlocks": "Período (blocos)",
  "configure.errorInvalidAmount": "Informe um valor GPBR válido",
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
};
