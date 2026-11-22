// Copyright (c) 2026 Digistore24 Inc, St. Petersburg, USA
// SPDX-License-Identifier: MIT

import Link from "next/link";
import { redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { CalendarClock, CreditCard, Dices } from "lucide-react";

import { auth } from "@/auth";
import { hasDigistoreApiKey } from "@/lib/digistore/settings";
import { nextPaymentForMember } from "@/lib/digistore/subscriptions";
import { purchaseNoticeFor } from "@/lib/digistore/member-billing";
import { entitlementsFor } from "@/lib/entitlements/manage";
import { isOwner } from "@/lib/roles";
import { getTokenAccount } from "@/lib/tokens/account";
import { findProduct } from "@/lib/digistore/products";
import { sellsPlans, sellsTokens } from "@/lib/billing-mode";
import {
  NEXT_PAYMENT_FORMAT,
  isUpcoming,
  todayInUtc,
  toUtcDate,
} from "@/lib/digistore/next-payment";
import { FlashToast } from "@/components/flash-toast";
import {
  OnboardingChecklist,
  type OnboardingStepView,
} from "@/components/onboarding-checklist";
import { PageHeader } from "@/components/page-header";
import { RoleBadge } from "@/components/role-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata() {
  const t = await getTranslations("dashboard");
  return { title: t("title") };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ purchase?: string }>;
}) {
  // const session = await auth();
  // if (!session?.user) redirect("/login");

  // Für Freundes-Test ohne Log-in deaktiviert, (später wieder aktivieren):
  const session = {
    user: { id: "test-user-id", email: "tester@goalroller.local", role: "member" },
  };

  const t = await getTranslations("dashboard");
  const format = await getFormatter();

  const { purchase } = await searchParams;
  const notice = purchase
    ? await purchaseNoticeFor(session.user.id, purchase)
    : null;

  const connected = hasDigistoreApiKey();
  const isOperator = isOwner(session.user.role);

  const nextPaymentAt = sellsPlans()
    ? await nextPaymentForMember(session.user.id)
    : null;
  const showNextPayment = isUpcoming(nextPaymentAt, todayInUtc());

  const owned = sellsPlans()
    ? await entitlementsFor(session.user.id)
    : [];
  const tokenBalance = sellsTokens()
    ? ((await getTokenAccount(session.user.id))?.balance ?? 0)
    : 0;

  const ownedNames = owned.map(
    (e) => findProduct(e.productKey)?.name ?? e.productKey,
  );

  const showBalance = sellsTokens() || tokenBalance > 0;
  const holdsSomething = owned.length > 0 || tokenBalance > 0;

  const offer = sellsPlans()
    ? { title: t("planTitle"), body: t("planBody"), cta: t("planCta") }
    : {
        title: t("onboardingTokensTitle"),
        body: t("onboardingTokensBody"),
        cta: t("onboardingTokensCta"),
      };

  const onboardingSteps: OnboardingStepView[] = [];
  if (sellsPlans()) {
    onboardingSteps.push({
      id: "plan",
      done: owned.length > 0,
      title: t("onboardingPlanTitle"),
      description:
        owned.length > 0
          ? t("onboardingPlanDone", { products: ownedNames.join(", ") })
          : t("onboardingPlanBody"),
      href: "/plans",
      cta: t("onboardingPlanCta"),
    });
  }
  if (sellsTokens()) {
    onboardingSteps.push({
      id: "tokens",
      done: tokenBalance > 0,
      title: t("onboardingTokensTitle"),
      description:
        tokenBalance > 0
          ? t("onboardingTokensDone", { balance: tokenBalance })
          : t("onboardingTokensBody"),
      href: "/plans",
      cta: t("onboardingTokensCta"),
    });
  }

  return (
    <>
      {notice && (
        <FlashToast
          message={
            notice.kind === "tokens"
              ? t("purchaseTokens", { credits: notice.credits })
              : notice.kind === "plan"
                ? t("purchasePlan", { product: notice.product })
                : t("purchaseGeneric")
          }
          clearParam="purchase"
        />
      )}

      {notice && (
        <Callout variant="info" className="mb-6">
          {t("purchaseReseller")}
        </Callout>
      )}

      <PageHeader
        title={t("welcome")}
        description={t("signedInAs", { email: session.user.email ?? "" })}
      >
        <RoleBadge role={session.user.role} />
      </PageHeader>

      <OnboardingChecklist steps={onboardingSteps} className="mb-6" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="sm:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle level="h2">{t("goalrollerTitle")}</CardTitle>
            <CardDescription className="text-foreground/90 text-base font-medium leading-relaxed">
              <span>{t("goalrollerBody")} </span>
              <span className="font-extrabold underline decoration-2 underline-offset-4">
                GoalRoller würfelt immer auf den Favoriten.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/goalroller">
                <Dices aria-hidden />
                {t("goalrollerCta")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:row-span-2">
          <CardHeader>
            <CardTitle level="h2">{t("holdingTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {holdsSomething ? (
              <div className="space-y-6">
                {owned.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground text-sm font-medium">
                      {t("holdingPlanLabel")}
                    </p>
                    <ul className="space-y-1">
                      {owned.map((entitlement, index) => (
                        <li
                          key={entitlement.productKey}
                          className="text-2xl leading-tight font-semibold text-pretty"
                        >
                          {ownedNames[index]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {showBalance && (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground text-sm font-medium">
                      {t("holdingTokensLabel")}
                    </p>
                    <p className="text-2xl leading-tight font-semibold tabular-nums">
                      {format.number(tokenBalance)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={CreditCard}
                title={offer.title}
                description={offer.body}
              >
                <Button asChild variant="outline" size="sm">
                  <Link href="/plans">{offer.cta}</Link>
                </Button>
              </EmptyState>
            )}
          </CardContent>
        </Card>

        {isOperator && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {t("statusTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={connected ? "default" : "secondary"}>
                {connected ? t("statusConnected") : t("statusDisconnected")}
              </Badge>
            </CardContent>
          </Card>
        )}

        {showNextPayment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {t("nextPaymentTitle")}
              </CardTitle>
              <CardDescription>{t("nextPaymentBody")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <CalendarClock
                aria-hidden
                className="text-muted-foreground size-4"
              />
              <time dateTime={nextPaymentAt!} className="text-sm font-medium">
                {format.dateTime(toUtcDate(nextPaymentAt!), NEXT_PAYMENT_FORMAT)}
              </time>
            </CardContent>
          </Card>
        )}
      </div>

      {isOperator && !connected && (
        <Callout variant="warning" title={t("ds24Title")} className="mt-6">
          {t.rich("ds24Body", { code: (chunks) => <code>{chunks}</code> })}
          <pre className="bg-background mt-2 overflow-x-auto rounded-md border p-2 font-mono text-xs">
            node run.mjs ds24-connect
          </pre>
        </Callout>
      )}
    </>
  );
}

