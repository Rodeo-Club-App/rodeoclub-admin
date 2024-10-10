import React, { useState } from "react";

import { Copy, CreditCard, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrderItem {
  imageUrl: string;
  name: string;
  quantity: number;
  price: string;
}

interface OrderCardProps {
  orderId: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: string;
  shippingAddress: string;
  shippingValue: string;
  billingAddress: string;
  total: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
  };

  payment?: {
    method: string;
    number: string;
  };
}

const OrderCard: React.FC<OrderCardProps> = ({
  orderId,
  orderDate,
  items,
  subtotal,
  shippingAddress,
  shippingValue,
  billingAddress,
  total,
  customer,
  payment,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            Pedido {orderId}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleCopyOrderId}
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copiar ID do pedido</span>
            </Button>
            {copySuccess && (
              <span className="text-xs text-green-500">ID copiado!</span>
            )}
          </CardTitle>
          <CardDescription>Data: {orderDate}</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Exportar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Deletar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="font-semibold">Detalhes do pedido</div>
          <ul className="grid gap-3 ">
            {items.map((item, index) => (
              <li key={index} className="flex flex-col md:flex-row lg:flex-col xl:flex-row items-center">
                <img
                  src={item.imageUrl}
                  width={100}
                  height={100}
                  className="rounded-md object-contain"
                />

                <span className="text-muted-foreground px-2">
                  {item.name} <span>x {item.quantity}</span>
                </span>

                <span>{item.price}</span>
              </li>
            ))}
          </ul>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{subtotal}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>{shippingValue}</span>
            </li>
            <li className="flex items-center justify-between font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span>{total}</span>
            </li>
          </ul>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-3">
            <div className="font-semibold">Informações de envio</div>
            <address className="grid gap-0.5 not-italic text-muted-foreground">
              <span>{shippingAddress}</span>
            </address>
          </div>
          <div className="grid auto-rows-max gap-3">
            <div className="font-semibold">Informações de pagamento</div>
            <div className="text-muted-foreground">
              <span>{billingAddress}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3">
          <div className="font-semibold">Informações do cliente</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd>{customer.name}</dd>
            </div>
            {/*    <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Telefone</dt>
              <dd>
                <a href={`tel:${customer.phone}`}>{customer.phone}</a>
              </dd>
            </div> */}
          </dl>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3">
          <div className="font-semibold">Informações do pagamento</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                {payment?.method}
              </dt>
              <dd>{payment?.number}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
      {/* 
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous Order</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next Order</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter> */}
    </Card>
  );
};

export default OrderCard;
