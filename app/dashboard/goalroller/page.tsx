import { getTranslations } from "next-intl/server";
import { Dices } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
import { requireActiveUser } from "@/lib/authz";
import { hasPlan } from "@/lib/entitlements/manage";
import { GOALROLLER_PRODUCT_KEY } from "@/lib/goalroller/config";
import { GoalrollerTool } from "./ui";

export async function generateMetadata() {
  const t = await getTranslations("goalroller");
  return { title: t("title") };
}

export default async function GoalrollerPage() {
  const session = await requireActiveUser();
  const t = await getTranslations("goalroller");
  const hasAccess = await hasPlan(session.user.id, GOALROLLER_PRODUCT_KEY);

  return (
    <>
      <PageHeader title={t("title")} description={t("subtitle")} />
      {hasAccess ? (
        <GoalrollerTool />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Dices}
              title={t("lockedTitle")}
              description={t("lockedBody")}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
