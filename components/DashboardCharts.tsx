"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ChartSeries, PlaceGrain } from "@/lib/charts";
import { formatCount, formatDate, formatPercent } from "@/lib/format";

const TESTED = "#0d5c4d";
const TESTED_SOFT = "#3d7a68";
const POSITIVE = "#8d2b2b";
const MUTED = "#52645c";
const INK = "#14221c";
const GRID = "#d3dfd8";
const ME = TESTED;
const KE = INK;

const STATUS_COLOR: Record<string, string> = {
  Imekamilika: TESTED,
  Inaendelea: TESTED_SOFT,
  Haijaanza: MUTED,
  Imesitishwa: POSITIVE,
};

const PLACE_NAME: Record<PlaceGrain, string> = {
  kanda: "kanda",
  mkoa: "mkoa",
  halmashauri: "halmashauri",
};

type TipItem = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: { date?: string };
};

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);
  return reduce;
}

function sharedLead(labels: string[]): string {
  if (labels.length < 2) return "";
  const parts = labels.map((label) => label.trim().split(/\s+/));
  const limit = Math.min(...parts.map((part) => part.length)) - 1;
  const lead: string[] = [];
  for (let index = 0; index < limit; index += 1) {
    const word = parts[0]?.[index];
    if (!word || parts.some((part) => part[index] !== word)) break;
    lead.push(word);
  }
  return lead.length >= 2 ? `${lead.join(" ")} ` : "";
}

function wrapWords(value: string, max = 16): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const piece = word.length > max ? `${word.slice(0, max - 1)}…` : word;
    if (!current) {
      current = piece;
      continue;
    }
    if (`${current} ${piece}`.length <= max) {
      current = `${current} ${piece}`;
      continue;
    }
    lines.push(current);
    current = piece;
  }
  if (current) lines.push(current);
  if (lines.length <= 2) return lines;
  const second = lines[1] ?? "";
  const trimmed = second.length > max - 1 ? second.slice(0, max - 1).trimEnd() : second.trimEnd();
  return [lines[0] ?? "", trimmed.endsWith("…") ? trimmed : `${trimmed}…`];
}

type TickProps = {
  x?: number;
  y?: number;
  payload?: { value?: string };
};

function categoryTick(labels: string[]) {
  const lead = sharedLead(labels);
  return function Tick({ x = 0, y = 0, payload }: TickProps) {
    const full = String(payload?.value ?? "");
    const shown = lead && full.startsWith(lead) ? full.slice(lead.length) : full;
    const lines = wrapWords(shown);
    const firstDy = lines.length === 1 ? 4 : -4;
    return (
      <text x={x} y={y} textAnchor="end" fill={MUTED} fontSize={12}>
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? firstDy : 14}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };
}

function statusColor(label: string): string {
  return STATUS_COLOR[label] ?? INK;
}

function ChartTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TipItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const date = payload[0]?.payload?.date;
  const title = date ? formatDate(date) : label;
  return (
    <div className="rounded-lg bg-card px-3 py-2 text-sm shadow-sm ring-1 ring-foreground/10">
      {title ? <p className="mb-1 font-medium text-foreground">{title}</p> : null}
      <ul className="flex flex-col gap-0.5">
        {payload.map((item) => (
          <li key={String(item.name)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-2 rounded-sm" style={{ background: item.color ?? TESTED }} />
              {item.name}
            </span>
            <span className="font-medium text-foreground tabular-nums">
              {formatCount(Number(item.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={`overflow-visible shadow-none ${className ?? ""}`}>
      <CardHeader>
        <h3 className="text-base font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function Frame({ height, children }: { height: number; children: ReactElement }) {
  return (
    <div className="w-full min-w-0 text-muted-foreground" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const axisTick = { fill: MUTED, fontSize: 12 };

export function DashboardCharts({ series }: { series: ChartSeries }) {
  const reduceMotion = useReduceMotion();
  if (series.total === 0) return null;

  const slices = series.status.filter((item) => item.count > 0);
  const placeNoun = PLACE_NAME[series.placeGrain];
  const placeTitle =
    series.placeValue === "tested" ? `Waliopima kwa ${placeNoun}` : `Shughuli kwa ${placeNoun}`;
  const placeKey = series.placeValue === "tested" ? "tested" : "activities";
  const placeDescription = series.placesTruncated
    ? `Maeneo 8 ya juu. Mengine yamejumuishwa kwenye Nyingine.`
    : `Kila ${placeNoun} iliyo kwenye taarifa hizi.`;

  return (
    <section aria-labelledby="michoro-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="michoro-title" className="text-base font-medium">
          Michoro
        </h2>
        <p className="text-sm text-muted-foreground">Zinafuata vichujio vilivyochaguliwa.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCard
          title="Hali ya shughuli"
          description="Mgawanyo wa taarifa kwa hali ya utekelezaji."
        >
          <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="relative h-56">
              <div aria-hidden="true" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slices}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="88%"
                      paddingAngle={slices.length > 1 ? 2 : 0}
                      stroke="#ffffff"
                      strokeWidth={2}
                      cornerRadius={6}
                      isAnimationActive={!reduceMotion}
                    >
                      {slices.map((item) => (
                        <Cell key={item.label} fill={statusColor(item.label)} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} wrapperStyle={{ zIndex: 20, outline: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-[28px] leading-8 font-medium text-foreground tabular-nums">
                    {formatCount(series.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">shughuli</p>
                </div>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {series.status.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ background: statusColor(item.label) }}
                    />
                    {item.label}
                  </span>
                  <span className="font-medium tabular-nums">{formatCount(item.count)}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>

        <ChartCard
          title="Upimaji na maambukizi kwa jinsia"
          description="Me na Ke. Jumla ni Me + Ke, kama kwenye jedwali."
        >
          <Frame height={224}>
            <BarChart data={series.gender} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis
                tick={axisTick}
                axisLine={false}
                tickLine={false}
                width={44}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#eef3f0" }} wrapperStyle={{ zIndex: 20, outline: "none" }} />
              <Bar dataKey="me" name="Me" fill={ME} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={!reduceMotion} />
              <Bar dataKey="ke" name="Ke" fill={KE} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={!reduceMotion} />
            </BarChart>
          </Frame>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: ME }} />
              Me
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: KE }} />
              Ke
            </li>
          </ul>
          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm">
            {series.gender.map((item) => (
              <div key={item.label}>
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 font-medium tabular-nums">
                  Me {formatCount(item.me)} · Ke {formatCount(item.ke)}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted-foreground">
            {series.tested === 0
              ? "Bado hakuna waliopima, hivyo kiwango cha maambukizi hakijahesabiwa."
              : `Kiwango cha maambukizi: ${formatPercent(series.positivity)} ya waliopima. Waliounganishwa na huduma: ${formatCount(series.linked)}.`}
          </p>
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Mwenendo wa upimaji na maambukizi"
          description="Jumla ya kila siku. Siku bila taarifa hazionyeshwi."
        >
          <table className="sr-only">
            <caption>Waliopima na waliokutwa na maambukizi kwa kila siku</caption>
            <thead>
              <tr>
                <th>Siku</th>
                <th>Waliopima</th>
                <th>Maambukizi</th>
              </tr>
            </thead>
            <tbody>
              {series.days.map((day) => (
                <tr key={day.date || "bila-tarehe"}>
                  <td>{day.date ? formatDate(day.date) : "Bila tarehe"}</td>
                  <td>{formatCount(day.tested)}</td>
                  <td>{formatCount(day.positive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div aria-hidden="true">
            <Frame height={280}>
              <AreaChart data={series.days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis
                  dataKey="date"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={28}
                  tickFormatter={(value: string) => (value ? formatDate(value).slice(0, 5) : "—")}
                />
                <YAxis
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTip />} wrapperStyle={{ zIndex: 20, outline: "none" }} />
                <Area
                  type="monotone"
                  dataKey="tested"
                  name="Waliopima"
                  stroke={TESTED}
                  fill={TESTED}
                  fillOpacity={0.16}
                  strokeWidth={2}
                  dot={series.days.length <= 14}
                  isAnimationActive={!reduceMotion}
                />
                <Area
                  type="monotone"
                  dataKey="positive"
                  name="Maambukizi"
                  stroke={POSITIVE}
                  fill={POSITIVE}
                  fillOpacity={0.12}
                  strokeWidth={2}
                  dot={series.days.length <= 14}
                  isAnimationActive={!reduceMotion}
                />
              </AreaChart>
            </Frame>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: TESTED }} />
              Waliopima
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: POSITIVE }} />
              Maambukizi
            </li>
          </ul>
        </ChartCard>

        <ChartCard title={placeTitle} description={placeDescription}>
          <PlaceBars
            rows={series.places}
            dataKey={placeKey}
            name={series.placeValue === "tested" ? "Waliopima" : "Shughuli"}
            reduceMotion={reduceMotion}
          />
        </ChartCard>

        <ChartCard title="Aina ya shughuli" description="Idadi ya taarifa kwa kila aina.">
          <NamedBars
            rows={series.activities.map((item) => ({ label: item.label, value: item.count }))}
            name="Taarifa"
            reduceMotion={reduceMotion}
          />
        </ChartCard>

        <ChartCard
          className="lg:col-span-2"
          title="Vifaa vilivyogawanywa"
          description="Urefu wa kila mstari unafuata idadi kubwa zaidi kati ya vifaa hivi."
        >
          <SupplyBars supplies={series.supplies} />
        </ChartCard>
      </div>
    </section>
  );
}

function PlaceBars({
  rows,
  dataKey,
  name,
  reduceMotion,
}: {
  rows: ChartSeries["places"];
  dataKey: "tested" | "activities";
  name: string;
  reduceMotion: boolean;
}) {
  return (
    <NamedBars
      rows={rows.map((item) => ({ label: item.label, value: item[dataKey] }))}
      name={name}
      reduceMotion={reduceMotion}
    />
  );
}

function NamedBars({
  rows,
  name,
  reduceMotion,
}: {
  rows: Array<{ label: string; value: number }>;
  name: string;
  reduceMotion: boolean;
}) {
  const labels = rows.map((row) => row.label);
  const wraps = labels.some((label) => {
    const lead = sharedLead(labels);
    const shown = lead && label.startsWith(lead) ? label.slice(lead.length) : label;
    return wrapWords(shown).length > 1;
  });
  const height = Math.max(180, rows.length * (wraps ? 48 : 36) + 16);
  return (
    <>
      <table className="sr-only">
        <caption>{name}</caption>
        <thead>
          <tr>
            <th>Jina</th>
            <th>{name}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{formatCount(row.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div aria-hidden="true">
        <Frame height={height}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 0, right: 56, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={148}
              tick={categoryTick(labels)}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTip />} cursor={{ fill: "#eef3f0" }} wrapperStyle={{ zIndex: 20, outline: "none" }} />
            <Bar
              dataKey="value"
              name={name}
              fill={TESTED}
              radius={[0, 4, 4, 0]}
              maxBarSize={18}
              isAnimationActive={!reduceMotion}
              label={{
                position: "right",
                fill: INK,
                fontSize: 12,
                formatter: (value: unknown) => formatCount(Number(value ?? 0)),
              }}
            />
          </BarChart>
        </Frame>
      </div>
    </>
  );
}

function SupplyBars({ supplies }: { supplies: ChartSeries["supplies"] }) {
  const max = Math.max(...supplies.map((item) => item.value), 0);
  return (
    <ul className="flex flex-col gap-4">
      {supplies.map((item) => {
        const width = max === 0 ? 0 : (item.value / max) * 100;
        return (
          <li key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{item.label}</span>
              <span className="font-medium tabular-nums">{formatCount(item.value)}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded bg-secondary"
              role="img"
              aria-label={`${item.label}: ${formatCount(item.value)}`}
            >
              <span
                className="block h-full rounded bg-primary"
                style={{ width: item.value === 0 ? 0 : `max(${width}%, 8px)` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
