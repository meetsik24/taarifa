import { PencilEdit02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { DownloadFormButton } from "@/components/download-form-button";
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
import { getCopy, getLocale } from "@/lib/locale";
import { describeActivities, translateTerm } from "@/lib/messages";
import type { Submission } from "@/lib/types";

export async function DailyTable({
  rows,
  empty,
}: {
  rows: Submission[];
  empty: "none" | "filtered";
}) {
  const t = await getCopy();
  const locale = await getLocale();
  return (
    <section aria-labelledby="matokeo-title" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="matokeo-title" className="text-base font-medium">
          {t.table.title}
        </h2>
        <p className="text-sm text-muted-foreground">{t.table.note}</p>
      </div>
      {rows.length === 0 ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-start gap-2">
            {empty === "none" ? (
              <>
                <p className="text-base">{t.table.empty}</p>
                <p className="text-sm text-muted-foreground">{t.table.emptyHint}</p>
                <Link href="/jaza" className={buttonVariants()}>
                  <AppIcon icon={PencilEdit02Icon} />
                  {t.table.createLink}
                </Link>
              </>
            ) : (
              <>
                <p className="text-base">{t.table.filtered}</p>
                <p className="text-sm text-muted-foreground">{t.table.filteredHint}</p>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-0 py-0 shadow-none">
          <p className="px-4 pt-3 text-sm text-muted-foreground sm:hidden">
            {t.table.scroll}
          </p>
          <Table className="w-max min-w-full text-sm">
            <caption className="sr-only">{t.table.caption}</caption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead rowSpan={2}>{t.words.number}</TableHead>
                <TableHead rowSpan={2}>{t.words.day}</TableHead>
                <TableHead rowSpan={2}>{t.fields.zone}</TableHead>
                <TableHead rowSpan={2}>{t.fields.region}</TableHead>
                <TableHead rowSpan={2}>{t.fields.council}</TableHead>
                <TableHead rowSpan={2}>{t.fields.activity}</TableHead>
                <TableHead rowSpan={2}>{t.fields.activityType}</TableHead>
                <TableHead rowSpan={2}>{t.fields.status}</TableHead>
                <TableHead colSpan={3} className="bg-secondary text-center text-secondary-foreground">
                  {t.table.testedGroup}
                </TableHead>
                <TableHead colSpan={3} className="bg-secondary text-center text-secondary-foreground">
                  {t.table.positiveGroup}
                </TableHead>
                <TableHead rowSpan={2}>{t.table.linked}</TableHead>
                <TableHead rowSpan={2}>{t.table.educated}</TableHead>
                <TableHead rowSpan={2}>{t.table.condoms}</TableHead>
                <TableHead rowSpan={2}>PEP/PrEP</TableHead>
                <TableHead rowSpan={2}>{t.export.selfTest}</TableHead>
                <TableHead rowSpan={2}>{t.table.download}</TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-secondary/70 text-right">{t.words.me}</TableHead>
                <TableHead className="bg-secondary/70 text-right">{t.words.ke}</TableHead>
                <TableHead className="bg-secondary/70 text-right">{t.words.total}</TableHead>
                <TableHead className="bg-secondary/70 text-right">{t.words.me}</TableHead>
                <TableHead className="bg-secondary/70 text-right">{t.words.ke}</TableHead>
                <TableHead className="bg-secondary/70 text-right">{t.words.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {index + 1}
                    {row.sample ? (
                      <Badge variant="secondary" className="ml-2">
                        {t.words.sample}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatDate(row.tarehe)}</TableCell>
                  <TableCell className="whitespace-normal">{row.kanda}</TableCell>
                  <TableCell className="whitespace-normal">{row.mkoa}</TableCell>
                  <TableCell className="whitespace-normal">{row.halmashauri}</TableCell>
                  <TableCell className="max-w-56 whitespace-normal">{row.shughuli}</TableCell>
                  <TableCell className="whitespace-normal">{describeActivities(locale, row.aina, row.nyingine)}</TableCell>
                  <TableCell>{translateTerm(locale, row.hali)}</TableCell>
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
                  <TableCell>
                    <DownloadFormButton row={row} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </section>
  );
}
