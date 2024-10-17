import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppLayout } from "@/pages/_layout";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Title } from "./title-page";

export function SkeletonDashboard() {
  return (
    <AppLayout>
      <Title name="Dashboard" />
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-6 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-32 h-8 mb-2" />
              <Skeleton className="w-20 h-4" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="w-48 h-6" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Skeleton className="w-24 h-4" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="w-24 h-4" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="w-24 h-4" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(4)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="w-32 h-6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="w-16 h-6" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="w-20 h-6" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
