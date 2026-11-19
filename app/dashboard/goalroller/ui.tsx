"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy, Dices, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  faceCounts,
  parseFavoriteOdds,
  tipForOutcome,
  type Favorite,
  type DieId,
  type Outcome,
} from "@/lib/goalroller/dice";
import { recordFirstSuccessfulRoll } from "./actions";

type RollResult = {
  oddsCents: number;
  dieId: DieId;
  counts: Record<Outcome, number>;
  outcome: Outcome;
  tip: Outcome;
  awayNotice: "favoriteWins" | "favoriteLoses" | null;
};

export function GoalrollerTool() {
  const t = useTranslations("goalroller");
  const locale = useLocale();
  const [odds, setOdds] = useState("");
  const [favorite, setFavorite] = useState<Favorite>("home");
  const [rolling, setRolling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shownOutcome, setShownOutcome] = useState<Outcome | null>(null);
  const [result, setResult] = useState<RollResult | null>(null);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const parsed = useMemo(() => parseFavoriteOdds(odds), [odds]);
  const die = parsed.ok ? parsed.die : null;
  const busy = rolling || saving;
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }),
    [locale],
  );
  const formatOdds = (cents: number) => numberFormat.format(cents / 100);

  function dieLabel(dieId: DieId): string {
    switch (dieId) {
      case "yellow":
        return t("dice.yellow");
      case "green":
        return t("dice.green");
      case "red":
        return t("dice.red");
      case "blue":
        return t("dice.blue");
      case "black":
        return t("dice.black");
    }
  }

  useEffect(
    () => () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  function roll() {
    if (!parsed.ok || busy) return;

    const selectedDie = parsed.die;
    const selectedFavorite = favorite;
    const selectedOdds = parsed.oddsCents;
    setResult(null);
    setFeedback(null);
    setRolling(true);
    setShownOutcome(selectedDie.faces[0]);

    intervalRef.current = window.setInterval(() => {
      const face =
        selectedDie.faces[
          Math.floor(Math.random() * selectedDie.faces.length)
        ];
      setShownOutcome(face);
    }, 85);

    timeoutRef.current = window.setTimeout(() => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      timeoutRef.current = null;
      setRolling(false);
      setSaving(true);

      const outcome =
        selectedDie.faces[
          Math.floor(Math.random() * selectedDie.faces.length)
        ];
      const mapped = tipForOutcome(outcome, selectedFavorite);

      void recordFirstSuccessfulRoll()
        .then((response) => {
          if (!response.ok) {
            setFeedback({
              variant: "danger",
              message: t("accessLost"),
            });
            return;
          }

          setShownOutcome(outcome);
          setResult({
            oddsCents: selectedOdds,
            dieId: selectedDie.id,
            counts: faceCounts(selectedDie),
            outcome,
            tip: mapped.tip,
            awayNotice: mapped.awayNotice,
          });
        })
        .catch((error: unknown) => {
          console.error("[goalroller] Could not record first-roll activation", error);
          setFeedback({
            variant: "danger",
            message: t("activationFailed"),
          });
        })
        .finally(() => setSaving(false));
    }, 1000);
  }

  function resultText(value: RollResult): string {
    const dieName = dieLabel(value.dieId);
    const tipLabel =
      value.tip === "1"
        ? t("homeWin")
        : value.tip === "2"
          ? t("awayWin")
          : t("draw");

    return t("shareText", {
      odds: formatOdds(value.oddsCents),
      die: dieName,
      one: value.counts["1"],
      draw: value.counts.X,
      two: value.counts["2"],
      result: value.outcome,
      tip: tipLabel,
    });
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(resultText(result));
      setFeedback({ variant: "success", message: t("copySuccess") });
    } catch (error: unknown) {
      console.error("[goalroller] Could not copy tip", error);
      setFeedback({ variant: "danger", message: t("copyFailed") });
    }
  }

  async function shareResult() {
    if (!result) return;
    const text = resultText(result);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: t("shareTitle"), text });
        setFeedback({ variant: "success", message: t("shareSuccess") });
        return;
      }
      await navigator.clipboard.writeText(text);
      setFeedback({ variant: "success", message: t("copySuccess") });
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("[goalroller] Could not share tip", error);
      setFeedback({ variant: "danger", message: t("shareFailed") });
    }
  }

  const oddsError =
    odds.trim() && !parsed.ok
      ? parsed.reason === "range"
        ? t("rangeError")
        : t("formatError")
      : null;

  const dieName = die ? dieLabel(die.id) : null;
  const counts = die ? faceCounts(die) : null;
  const outcomeLabel =
    result?.tip === "1"
      ? t("homeWin")
      : result?.tip === "2"
        ? t("awayWin")
        : result
          ? t("draw")
          : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle level="h2">{t("setupTitle")}</CardTitle>
          <CardDescription>{t("setupBody")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div className="space-y-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">{t("favoriteLabel")}</legend>
              <div className="grid gap-2 sm:grid-cols-2" role="group">
                <Button
                  type="button"
                  variant={favorite === "home" ? "default" : "outline"}
                  aria-pressed={favorite === "home"}
                  disabled={busy}
                  onClick={() => {
                    setFavorite("home");
                    setResult(null);
                    setShownOutcome(null);
                    setFeedback(null);
                  }}
                >
                  {t("homeFavorite")}
                </Button>
                <Button
                  type="button"
                  variant={favorite === "away" ? "default" : "outline"}
                  aria-pressed={favorite === "away"}
                  disabled={busy}
                  onClick={() => {
                    setFavorite("away");
                    setResult(null);
                    setShownOutcome(null);
                    setFeedback(null);
                  }}
                >
                  {t("awayFavorite")}
                </Button>
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="favorite-odds">{t("oddsLabel")}</Label>
              <Input
                id="favorite-odds"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={t("oddsPlaceholder")}
                value={odds}
                aria-invalid={Boolean(oddsError)}
                aria-describedby="favorite-odds-help"
                disabled={busy}
                onChange={(event) => {
                  setOdds(event.target.value);
                  setResult(null);
                  setShownOutcome(null);
                  setFeedback(null);
                }}
              />
              <p
                id="favorite-odds-help"
                className="text-muted-foreground text-sm"
              >
                {oddsError ?? t("oddsHelp")}
              </p>
            </div>

            {oddsError && (
              <Callout variant="warning" title={t("invalidOddsTitle")}>
                {oddsError}
              </Callout>
            )}

            <Button type="button" onClick={roll} disabled={!die || busy}>
              <Dices aria-hidden />
              {rolling
                ? t("rolling")
                : saving
                  ? t("checking")
                  : result
                    ? t("rollAgain")
                    : t("roll")}
            </Button>
          </div>

          {die && counts && dieName ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-muted/40 p-5 text-center">
              <p className="text-sm font-semibold">{t("selectedDie")}</p>
              <svg
                aria-label={t("dieAria", {
                  die: dieName,
                  min: formatOdds(die.minCents),
                  max: formatOdds(die.maxCents),
                })}
                className={`goalroller-die${rolling ? " goalroller-die--rolling" : ""}${result ? " goalroller-die--landed" : ""}`}
                role="img"
                viewBox="0 0 220 220"
              >
                <polygon
                  points="110,8 158,21 194,57 208,110 194,163 158,199 110,212 62,199 26,163 12,110 26,57 62,21"
                  fill={die.color}
                  stroke={die.textColor}
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M110 10 151 66 203 71 168 110 194 160 145 153 110 210 75 153 26 160 52 110 17 71 69 66Z M69 66 110 110 151 66 M52 110 110 110 168 110 M75 153 110 110 145 153"
                  fill="none"
                  stroke={die.textColor}
                  strokeOpacity=".36"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <text
                  x="110"
                  y="123"
                  fill={die.textColor}
                  textAnchor="middle"
                  className="goalroller-die__symbol"
                >
                  {shownOutcome ?? "W12"}
                </text>
              </svg>
              <div className="space-y-1">
                <p className="font-semibold">{dieName}</p>
                <p className="text-muted-foreground text-sm">
                  {t("activeRange", {
                    min: formatOdds(die.minCents),
                    max: formatOdds(die.maxCents),
                  })}
                </p>
                <p className="text-sm font-medium">
                  {t("distribution", {
                    one: counts["1"],
                    draw: counts.X,
                    two: counts["2"],
                  })}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Dices}
              title={t("emptyTitle")}
              description={t("emptyBody")}
            />
          )}
        </CardContent>
      </Card>

      {feedback && (
        <Callout variant={feedback.variant}>{feedback.message}</Callout>
      )}

      {result && outcomeLabel && (
        <Card aria-live="polite">
          <CardHeader>
            <CardTitle level="h2">{t("resultTitle")}</CardTitle>
            <CardDescription>
              {t("resultOdds", { odds: formatOdds(result.oddsCents) })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm">
                  {t("outcomeLabel")}
                </p>
                <p className="text-3xl font-semibold tabular-nums">
                  {result.outcome}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  {t("tipLabel")}
                </p>
                <p className="text-3xl font-semibold">{outcomeLabel}</p>
              </div>
            </div>
            {result.awayNotice && (
              <Callout variant="info">
                {result.awayNotice === "favoriteWins"
                  ? t("awayFavoriteWins")
                  : t("awayFavoriteLoses")}
              </Callout>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={copyResult}>
                <Copy aria-hidden />
                {t("copy")}
              </Button>
              <Button type="button" variant="outline" onClick={shareResult}>
                <Share2 aria-hidden />
                {t("share")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
