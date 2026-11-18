import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCount, formatDate } from "@/lib/format";
import type { Submission } from "@/lib/types";

export function DailyTable({
  rows,
  empty,
}: {
  rows: Submission[];
  empty: "none" | "filtered";
}) {
  return (
    <section aria-labelledby="matokeo-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="matokeo-title" className="text-base font-medium">
          Matokeo ya kila siku
        </h2>
        <p className="text-sm text-muted-foreground">
          Jumla ya upimaji na maambukizi ni Me + Ke, kama kwenye dashibodi.
        </p>
      </div>
      {rows.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-2">
            {empty === "none" ? (
              <>
                <p className="text-base">Bado hakuna taarifa.</p>
                <p className="text-sm text-muted-foreground">
                  Viashiria viko sifuri mpaka mtu mwenye kiungo ahifadhi taarifa ya kwanza.
                </p>
                <Link href="/jaza" className={buttonVariants()}>
                  <AppIcon icon={PencilEdit02Icon} />
                  Tengeneza kiungo
                </Link>
              </>
            ) : (
              <>
                <p className="text-base">Hakuna taarifa zinazolingana na vichujio.</p>
                <p className="text-sm text-muted-foreground">Ondoa vichujio ili kuona taarifa zote.</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 py-0 shadow-none">
          <p className="px-4 pt-3 text-sm text-muted-foreground sm:hidden">
            Sogeza jedwali kando kuona safu zote.
          </p>
          <Table className="w-max min-w-full text-sm">
            <caption className="sr-only">
              Taarifa za kila siku: shughuli, waliopima VVU, waliokutwa na maambukizi, na vifaa vilivyogawanywa
            </caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead rowSpan={2}>Na.</TableHead>
                <TableHead rowSpan={2}>Siku</TableHead>
                <TableHead rowSpan={2}>Kanda</TableHead>
                <TableHead rowSpan={2}>Mkoa</TableHead>
                <TableHead rowSpan={2}>Halmashauri</TableHead>
                <TableHead rowSpan={2}>Shughuli iliyopangwa</TableHead>
                <TableHead rowSpan={2}>Aina ya shughuli</TableHead>
                <TableHead rowSpan={2}>Hali ya utekelezaji</TableHead>
                <TableHead colSpan={3} className="bg-secondary text-center text-secondary-foreground">
                  Waliopima VVU
                </TableHead>
                <TableHead colSpan={3} className="bg-secondary text-center text-secondary-foreground">
                  Waliokutwa na Maambukizi ya VVU
                </TableHead>
                <TableHead rowSpan={2}>Waliounganishwa na Huduma</TableHead>
                <TableHead rowSpan={2}>Waliofikiwa elimu</TableHead>
                <TableHead rowSpan={2}>Kondomu</TableHead>
                <TableHead rowSpan={2}>PEP/PrEP</TableHead>
                <TableHead rowSpan={2}>Jipime</TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-secondary/70 text-right">Me</TableHead>
                <TableHead className="bg-secondary/70 text-right">Ke</TableHead>
                <TableHead className="bg-secondary/70 text-right">Jumla</TableHead>
                <TableHead className="bg-secondary/70 text-right">Me</TableHead>
                <TableHead className="bg-secondary/70 text-right">Ke</TableHead>
                <TableHead className="bg-secondary/70 text-right">Jumla</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {index + 1}
                    {row.sample ? (
                      <Badge variant="secondary" className="ml-2">
                        Sampuli
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatDate(row.tarehe)}</TableCell>
                  <TableCell className="whitespace-normal">{row.kanda}</TableCell>
                  <TableCell className="whitespace-normal">{row.mkoa}</TableCell>
                  <TableCell className="whitespace-normal">{row.halmashauri}</TableCell>
                  <TableCell className="max-w-56 whitespace-normal">{row.shughuli}</TableCell>
                  <TableCell className="whitespace-normal">{row.aina}</TableCell>
                  <TableCell>{row.hali}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.vvuMe)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.vvuKe)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCount(row.vvuMe + row.vvuKe)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.maambukiziMe)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.maambukiziKe)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCount(row.maambukiziMe + row.maambukiziKe)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.waliounganishwa)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.elimu)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.kondomu)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.pep)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCount(row.jipime)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}
