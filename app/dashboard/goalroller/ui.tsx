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
import { Figure } from "@/components/ui/figure";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  duelTipForOutcome,
  faceCounts,
  parseFavoriteOdds,
  tipForOutcome,
  type DuelFavoritePosition,
  type Favorite,
  type GameMode,
  type DieId,
  type OddsRange,
  type Outcome,
} from "@/lib/goalroller/dice";
import { recordFirstSuccessfulRoll } from "./actions";
import { displayOutcomeText, withMatchLine } from "./share-text";
import {
  goalrollerRollImageAssetFor,
  goalrollerPreviewImageFor,
  type GoalrollerRollImageUrls,
} from "./roll-images";
import { playGoalrollerSound, stopGoalrollerSound } from "./roll-audio";

type RollResult = {
  mode: GameMode;
  oddsCents: number;
  dieId: DieId;
  range: OddsRange;
  counts: Record<Outcome, number>;
  outcome: Outcome;
  tip: Outcome;
  awayNotice: "favoriteWins" | "favoriteLoses" | null;
  duelVerdict: "favoriteWin" | "underdogWin" | null;
};

type GoalrollerToolProps = {
  imageUrls: GoalrollerRollImageUrls;
};

export function GoalrollerTool({ imageUrls }: GoalrollerToolProps) {
  const t = useTranslations("goalroller");
  const locale = useLocale();
  const [mode, setMode] = useState<GameMode>("football");
  const [odds, setOdds] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [favorite, setFavorite] = useState<Favorite>("home");
  const [duelFavoritePosition, setDuelFavoritePosition] =
    useState<DuelFavoritePosition>("A");
  const [rolling, setRolling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shownOutcome, setShownOutcome] = useState<Outcome | null>(null);
  const [result, setResult] = useState<RollResult | null>(null);
  const [feedback, setFeedback] = useState<{
    variant: "success" | "danger";
    message: string;
  } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rollInProgressRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const parsed = useMemo(() => parseFavoriteOdds(odds, mode), [odds, mode]);
  const die = parsed.ok ? parsed.die : null;
  const busy = rolling || saving;
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 2 }),
    [locale],
  );
  const formatOdds = (cents: number) => numberFormat.format(cents / 100);

  useEffect(() => {
    const audio = new Audio("/sounds/wuerfel-rollen.wav");
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      stopGoalrollerSound(audio);
      audioRef.current = null;
    };
  }, []);

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
    if (!parsed.ok || busy || rollInProgressRef.current) return;

    rollInProgressRef.current = true;
    const selectedDie = parsed.die;
    const selectedRange = parsed.range;
    const selectedMode = mode;
    const selectedFavorite = favorite;
    const selectedDuelFavoritePosition = duelFavoritePosition;
    const selectedOdds = parsed.oddsCents;
    setResult(null);
    setFeedback(null);
    setRolling(true);
    setShownOutcome(selectedDie.faces[0]);
    playGoalrollerSound(audioRef.current);

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
      stopGoalrollerSound(audioRef.current);

      const outcome =
        selectedDie.faces[
          Math.floor(Math.random() * selectedDie.faces.length)
        ];
      setShownOutcome(outcome);
      setRolling(false);
      setSaving(true);
      let tip: Outcome;
      let awayNotice: RollResult["awayNotice"] = null;
      let duelVerdict: RollResult["duelVerdict"] = null;

      if (selectedMode === "duels") {
        const mapped = duelTipForOutcome(
          outcome,
          selectedDuelFavoritePosition,
        );
        tip = mapped.tip;
        duelVerdict = mapped.verdict;
      } else {
        const mapped = tipForOutcome(outcome, selectedFavorite);
        tip = mapped.tip;
        awayNotice = mapped.awayNotice;
      }

      void recordFirstSuccessfulRoll()
        .then((response) => {
          if (!response.ok) {
            setShownOutcome(null);
            setFeedback({
              variant: "danger",
              message: t("accessLost"),
            });
            return;
          }

          setShownOutcome(outcome);
          setResult({
            mode: selectedMode,
            oddsCents: selectedOdds,
            dieId: selectedDie.id,
            range: selectedRange,
            counts: faceCounts(selectedDie),
            outcome,
            tip,
            awayNotice,
            duelVerdict,
          });
        })
        .catch((error: unknown) => {
          console.error("[goalroller] Could not record first-roll activation", error);
          setShownOutcome(null);
          setFeedback({
            variant: "danger",
            message: t("activationFailed"),
          });
        })
        .finally(() => {
          setSaving(false);
          rollInProgressRef.current = false;
        });
    }, 3000);
  }

  function resultText(value: RollResult): string {
    const dieName = dieLabel(value.dieId);
    const tipLabel =
      value.mode === "duels" && value.duelVerdict
        ? t(
            value.duelVerdict === "favoriteWin"
              ? "duelFavoriteWin"
              : "duelUnderdogWin",
            { tip: value.tip === "1" ? "1 (A)" : "2 (B)" },
          )
        : value.tip === "1"
          ? t("homeWin")
          : value.tip === "2"
            ? t("awayWin")
            : t("draw");

    const shareValues = {
      odds: formatOdds(value.oddsCents),
      die: dieName,
      one: value.counts["1"],
      draw: value.counts.X,
      two: value.counts["2"],
      result: displayOutcomeText(
        value.mode,
        value.outcome,
        t("duelDrawResult"),
      ),
      tip: tipLabel,
    };

    const message = value.mode === "duels"
      ? t("duelShareText", shareValues)
      : t("shareText", shareValues);

    return withMatchLine(message, homeTeam, awayTeam);
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
        ? t("rangeError", {
            min: formatOdds(parsed.minCents),
            max: formatOdds(parsed.maxCents),
          })
        : t("formatError")
      : null;

  const dieName = die ? dieLabel(die.id) : null;
  const counts = die ? faceCounts(die) : null;
  const displayedImage =
    (result
      ? { dieId: result.dieId, outcome: result.outcome }
      : null) ?? goalrollerPreviewImageFor(die?.id ?? null, shownOutcome);
  const displayedImageAsset = displayedImage
    ? goalrollerRollImageAssetFor(
        displayedImage.dieId,
        displayedImage.outcome,
      )
    : null;
  const displayedImageUrl = displayedImage
    ? imageUrls[displayedImage.dieId]?.[displayedImage.outcome]
    : null;
  const displayedOutcomeText = result
    ? displayOutcomeText(result.mode, result.outcome, t("duelDrawResult"))
    : null;
  const tipLabel = result
    ? result.mode === "duels" && result.duelVerdict
      ? t(
          result.duelVerdict === "favoriteWin"
            ? "duelFavoriteWin"
            : "duelUnderdogWin",
          { tip: result.tip === "1" ? "1 (A)" : "2 (B)" },
        )
      : result.tip === "1"
        ? t("homeWin")
        : result.tip === "2"
          ? t("awayWin")
          : t("draw")
    : null;

  function selectMode(nextMode: GameMode) {
    setMode(nextMode);
    setResult(null);
    setShownOutcome(null);
    setFeedback(null);
  }

  return (
    <div className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("modeLabel")}</legend>
        <div className="grid gap-2 sm:grid-cols-2" role="group">
          <Button
            type="button"
            variant={mode === "football" ? "default" : "outline"}
            aria-pressed={mode === "football"}
            className={`h-auto min-h-10 whitespace-normal py-2 ${
              mode === "football"
                ? "bg-goalroller-mode-active text-goalroller-ink hover:bg-goalroller-mode-active active:bg-goalroller-mode-active"
                : "bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-secondary dark:bg-muted dark:hover:bg-secondary dark:hover:text-secondary-foreground dark:active:bg-secondary"
            }`}
            disabled={busy}
            onClick={() => selectMode("football")}
          >
            {t("footballMode")}
          </Button>
          <Button
            type="button"
            variant={mode === "duels" ? "default" : "outline"}
            aria-pressed={mode === "duels"}
            className={`h-auto min-h-10 whitespace-normal py-2 ${
              mode === "duels"
                ? "bg-goalroller-mode-active text-goalroller-ink hover:bg-goalroller-mode-active active:bg-goalroller-mode-active"
                : "bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-secondary dark:bg-muted dark:hover:bg-secondary dark:hover:text-secondary-foreground dark:active:bg-secondary"
            }`}
            disabled={busy}
            onClick={() => selectMode("duels")}
          >
            {t("duelMode")}
          </Button>
        </div>
      </fieldset>

      <Card>
        <CardHeader>
          <CardTitle level="h2">{t("setupTitle")}</CardTitle>
          <CardDescription>{t("setupBody")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="home-team">{t("homeTeamLabel")}</Label>
                <Input
                  id="home-team"
                  type="text"
                  placeholder={t("homeTeamPlaceholder")}
                  value={homeTeam}
                  disabled={busy}
                  className="bg-goalroller-team-base text-goalroller-ink placeholder:text-goalroller-ink/70 hover:bg-goalroller-team-active hover:text-goalroller-paper focus:bg-goalroller-team-active focus:text-goalroller-paper focus:placeholder:text-goalroller-paper/70 dark:bg-goalroller-team-base dark:hover:bg-goalroller-team-active dark:focus:bg-goalroller-team-active"
                  onChange={(event) => setHomeTeam(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="away-team">{t("awayTeamLabel")}</Label>
                <Input
                  id="away-team"
                  type="text"
                  placeholder={t("awayTeamPlaceholder")}
                  value={awayTeam}
                  disabled={busy}
                  className="bg-goalroller-team-base text-goalroller-ink placeholder:text-goalroller-ink/70 hover:bg-goalroller-team-active hover:text-goalroller-paper focus:bg-goalroller-team-active focus:text-goalroller-paper focus:placeholder:text-goalroller-paper/70 dark:bg-goalroller-team-base dark:hover:bg-goalroller-team-active dark:focus:bg-goalroller-team-active"
                  onChange={(event) => setAwayTeam(event.target.value)}
                />
              </div>
            </div>

            {mode === "football" ? (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  {t("favoriteLabel")}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2" role="group">
                  <Button
                    type="button"
                    variant={favorite === "home" ? "default" : "outline"}
                    aria-pressed={favorite === "home"}
                    className={
                      favorite === "home"
                        ? "bg-goalroller-football-favorite-active text-goalroller-ink hover:bg-goalroller-football-favorite-active active:bg-goalroller-football-favorite-active"
                        : "bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-secondary dark:bg-muted dark:hover:bg-secondary dark:hover:text-secondary-foreground dark:active:bg-secondary"
                    }
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
                    className={
                      favorite === "away"
                        ? "bg-goalroller-football-favorite-active text-goalroller-ink hover:bg-goalroller-football-favorite-active active:bg-goalroller-football-favorite-active"
                        : "bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-secondary dark:bg-muted dark:hover:bg-secondary dark:hover:text-secondary-foreground dark:active:bg-secondary"
                    }
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
            ) : (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">
                  {t("duelFavoritePosition")}
                </legend>
                <div className="grid gap-2 sm:grid-cols-2" role="group">
                  <Button
                    type="button"
                    variant={
                      duelFavoritePosition === "A" ? "default" : "outline"
                    }
                    aria-pressed={duelFavoritePosition === "A"}
                    className={
                      duelFavoritePosition === "A"
                        ? "bg-goalroller-favorite-active text-goalroller-paper hover:bg-goalroller-favorite-active"
                        : "bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-secondary dark:bg-muted dark:hover:bg-secondary dark:hover:text-secondary-foreground dark:active:bg-secondary"
                    }
                    disabled={busy}
                    onClick={() => {
                      setDuelFavoritePosition("A");
                      setResult(null);
                      setShownOutcome(null);
                      setFeedback(null);
                    }}
                  >
                    {t("duelFavoriteA")}
                  </Button>
                  <Button
                    type="button"
                    variant={
                      duelFavoritePosition === "B" ? "default" : "outline"
                    }
                    aria-pressed={duelFavoritePosition === "B"}
                    className={
                      duelFavoritePosition === "B"
                        ? "bg-goalroller-favorite-active text-goalroller-paper hover:bg-goalroller-favorite-active"
                        : "bg-muted text-foreground hover:bg-secondary hover:text-secondary-foreground active:bg-secondary dark:bg-muted dark:hover:bg-secondary dark:hover:text-secondary-foreground dark:active:bg-secondary"
                    }
                    disabled={busy}
                    onClick={() => {
                      setDuelFavoritePosition("B");
                      setResult(null);
                      setShownOutcome(null);
                      setFeedback(null);
                    }}
                  >
                    {t("duelFavoriteB")}
                  </Button>
                </div>
              </fieldset>
            )}

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
                className={
                  die
                    ? undefined
                    : "bg-goalroller-odds-base text-goalroller-ink placeholder:text-goalroller-ink/70 hover:bg-goalroller-odds-active hover:text-goalroller-paper focus:bg-goalroller-odds-active focus:text-goalroller-paper focus:placeholder:text-goalroller-paper/70 dark:bg-goalroller-odds-base dark:hover:bg-goalroller-odds-active dark:focus:bg-goalroller-odds-active"
                }
                style={
                  die
                    ? {
                        backgroundColor: die.color,
                        color: die.textColor,
                      }
                    : undefined
                }
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

            <Button
              type="button"
              onClick={roll}
              disabled={!die || busy}
              className={`text-goalroller-paper ${
                rolling
                  ? "bg-goalroller-dice-active hover:bg-goalroller-dice-active active:bg-goalroller-dice-active"
                  : "bg-goalroller-dice-base hover:bg-goalroller-dice-active active:bg-goalroller-dice-active"
              }`}
            >
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
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border bg-goalroller-dice-base p-5 text-center text-goalroller-paper dark:bg-goalroller-dice-base">
              <p className="text-sm font-semibold">{t("selectedDie")}</p>
              {displayedImage && displayedImageAsset && displayedImageUrl ? (
                <Figure
                  src={displayedImageUrl}
                  alt={t("dieImageAlt", {
                    die: dieLabel(displayedImage.dieId),
                    outcome: displayedImage.outcome,
                  })}
                  width={displayedImageAsset.width}
                  height={displayedImageAsset.height}
                  sizes="224px"
                  unoptimized
                  className={`goalroller-die${rolling ? " goalroller-die--rolling" : ""}${result ? " goalroller-die--landed" : ""}`}
                />
              ) : (
                <svg
                  aria-label={t("dieAria", {
                    die: dieName,
                    min: formatOdds(
                      parsed.ok ? parsed.range.minCents : die.minCents,
                    ),
                    max: formatOdds(
                      parsed.ok ? parsed.range.maxCents : die.maxCents,
                    ),
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
                    className={`goalroller-die__symbol${shownOutcome ? "" : " goalroller-die__brand"}`}
                  >
                    {shownOutcome ?? "GoalRoller"}
                  </text>
                </svg>
              )}
              <div className="space-y-1">
                <p className="font-semibold">{dieName}</p>
                <p className="text-goalroller-paper/80 text-sm">
                  {t("activeRange", {
                    min: formatOdds(
                      parsed.ok ? parsed.range.minCents : die.minCents,
                    ),
                    max: formatOdds(
                      parsed.ok ? parsed.range.maxCents : die.maxCents,
                    ),
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

      {result && tipLabel && (
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
                  {displayedOutcomeText}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  {t("tipLabel")}
                </p>
                <p className="text-xl font-semibold">{tipLabel}</p>
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
