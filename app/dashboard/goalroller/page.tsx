import { getTranslations } from "next-intl/server";
import { Dices } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/page-header";
// Für Freundes-Test ohne Login deaktiviert (später wieder aktivieren):
// import { requireActiveUser } from "@/lib/authz";
// import { hasPlan } from "@/lib/entitlements/manage";
// import { GOALROLLER_PRODUCT_KEY } from "@/lib/goalroller/config";
import { goalrollerRollImageUrlsFor } from "./media";
import { GoalrollerTool } from "./ui";

export async function generateMetadata() {
  const t = await getTranslations("goalroller");
  return { title: t("title") };
}

function isMeaningfulText(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== ".";
}

export default async function GoalrollerPage() {
  // Für Freundes-Test ohne Login deaktiviert (später wieder aktivieren):
  // const session = await requireActiveUser();
  const session = {
    user: {
      id: "test-user-id",
      role: "member" as const,
    },
  };

  const t = await getTranslations("goalroller");
  const hasAccess = true;
  // const hasAccess = await hasPlan(session.user.id, GOALROLLER_PRODUCT_KEY);

  const showSubtitle = isMeaningfulText(t("subtitle"));
  const showFavoriteExplanation = isMeaningfulText(t("favoriteExplanation"));

  let imageUrls: Awaited<ReturnType<typeof goalrollerRollImageUrlsFor>> = {};
  if (hasAccess) {
    try {
      imageUrls = await goalrollerRollImageUrlsFor({
        memberId: session.user.id,
        role: session.user.role ?? null,
      });
    } catch {
      imageUrls = {};
    }
  }

  return (
    <>
      <PageHeader
        title={t("title")}
        descriptionBefore={
          <div className="text-foreground space-y-2.5 text-base leading-relaxed font-semibold md:text-lg">
            <p>{t("intro")}</p>
            {showFavoriteExplanation ? <p>{t("favoriteExplanation")}</p> : null}
          </div>
        }
        description={
          showSubtitle ? (
            <span className="text-foreground font-semibold">
              {t("subtitle")}
            </span>
          ) : undefined
        }
      >
        <div className="bg-card overflow-hidden rounded-lg border shadow-xs shrink-0">
          <img
            src="/goalroller/64x48bild.png"
            alt={t("title")}
            width={64}
            height={48}
            className="h-12 w-16 object-cover"
          />
        </div>
      </PageHeader>
      {hasAccess ? (
        <GoalrollerTool imageUrls={imageUrls} />
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