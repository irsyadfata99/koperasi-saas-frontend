"use client";

import { useClients } from "@/hooks/useClient";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Store, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CreateClientDialog } from "@/components/superadmin/create-client-dialog";
import { EditClientDialog } from "@/components/superadmin/edit-client-dialog";
import { Client } from "@/hooks/useClient";

export default function ClientsPage() {
  const { clients, isLoading, isError, mutate } = useClients();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsEditOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        Error loading clients
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">
            Manage registered stores and their subscription status.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sub. End</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Store className="mb-2 h-8 w-8" />
                    No clients found
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-mono text-xs">{client.code}</TableCell>
                  <TableCell className="font-medium">
                    {client.businessName}
                  </TableCell>
                  <TableCell>{client.ownerName || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.subscriptionPlan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {client.subscriptionEnd
                      ? new Date(client.subscriptionEnd).toLocaleDateString(
                        "id-ID", { day: 'numeric', month: 'short', year: 'numeric' }
                      )
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(client)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateClientDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => mutate()}
      />

      <EditClientDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        client={selectedClient}
        onSuccess={() => {
          mutate();
          setSelectedClient(null);
        }}
      />
    </div>
  );
}
