"use client";

import { useAccount } from "wagmi";

import { ConfigurePanels } from "@/app/[community]/distributor-admin/ConfigurePanels";
import { CreateDistributionPanels } from "@/app/[community]/distributor-admin/CreateDistributionPanels";
import { Panel } from "@/components/Panel";
import type { DistributorToken } from "@/lib/contracts";
import { useTranslation } from "@/lib/i18n/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/types";

/**
 * Every admin panel for one distributor, stacked. Both panel groups guard on the
 * connection themselves, so the check is hoisted here to show one notice rather
 * than the same message twice.
 */
export function DistributorAdmin({
  distributor,
  fundDescriptionKey,
}: {
  distributor: DistributorToken;
  fundDescriptionKey: TranslationKey;
}) {
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  if (!isConnected) {
    return (
      <Panel>
        <p className="text-gray-600">{t("configure.connectWallet")}</p>
      </Panel>
    );
  }

  return (
    <>
      <CreateDistributionPanels
        distributor={distributor}
        fundDescriptionKey={fundDescriptionKey}
      />
      <ConfigurePanels distributor={distributor} />
    </>
  );
}
