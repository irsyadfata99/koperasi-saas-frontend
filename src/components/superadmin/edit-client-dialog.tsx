"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useClientActions, Client } from "@/hooks/useClient";
import { Loader2 } from "lucide-react";

const editClientSchema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    ownerName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
    subscriptionPlan: z.enum(["FREE", "BASIC", "PREMIUM"]),
    subscriptionEnd: z.string().optional(),
});

type EditClientValues = z.infer<typeof editClientSchema>;

interface EditClientDialogProps {
    client: Client | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditClientDialog({
    client,
    open,
    onOpenChange,
    onSuccess,
}: EditClientDialogProps) {
    const { updateClient, deleteClient, isLoading } = useClientActions();

    const form = useForm<EditClientValues>({
        resolver: zodResolver(editClientSchema),
        defaultValues: {
            businessName: "",
            ownerName: "",
            phone: "",
            address: "",
            status: "ACTIVE",
            subscriptionPlan: "FREE",
            subscriptionEnd: "",
        },
    });

    // Populate form when client changes
    useEffect(() => {
        if (client) {
            form.reset({
                businessName: client.businessName,
                ownerName: client.ownerName || "",
                phone: client.phone || "",
                address: client.address || "",
                status: client.status,
                subscriptionPlan: client.subscriptionPlan,
                subscriptionEnd: client.subscriptionEnd
                    ? new Date(client.subscriptionEnd).toISOString().split("T")[0]
                    : "",
            });
        }
    }, [client, form]);

    const onDelete = async () => {
        if (!client) return;
        if (
            confirm(
                "Are you sure you want to DELETE this client?\n\nThis action cannot be undone. All data (transactions, users, products) associated with this client will be permanently removed."
            )
        ) {
            try {
                await deleteClient(client.id);
                onOpenChange(false);
                onSuccess?.();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const onSubmit = async (data: EditClientValues) => {
        if (!client) return;
        try {
            await updateClient(client.id, {
                ...data,
                subscriptionEnd: data.subscriptionEnd || undefined,
            });
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                    <DialogDescription>
                        Update details for {client?.code} - {client?.businessName}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subscriptionPlan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subscription Plan</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select plan" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="FREE">Free</SelectItem>
                                                <SelectItem value="BASIC">Basic</SelectItem>
                                                <SelectItem value="PREMIUM">Premium</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Business Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Owner Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Owner full name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Address..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subscriptionEnd"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subscription End Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}

                        <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={onDelete}
                                disabled={isLoading}
                            >
                                Delete Client
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
