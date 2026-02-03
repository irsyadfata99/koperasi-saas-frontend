"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
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
import { useClientActions } from "@/hooks/useClient";
import { Loader2, User, Store, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const createClientSchema = z.object({
    code: z.string().optional(), // Optional - backend will auto-generate
    businessName: z.string().min(1, "Business name is required"),
    ownerName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    subscriptionPlan: z.enum(["FREE", "BASIC", "PREMIUM"]),
    subscriptionEnd: z.string().optional(),

    // Admin User (Required by backend)
    adminUsername: z.string().min(3, "Username required"),
    adminEmail: z.string().email("Invalid email"),
    adminPassword: z.string().min(6, "Password min 6 chars"),
    adminName: z.string().optional(), // Defaults to "Admin {businessName}" if empty

    // Cashier User (Optional)
    createCashier: z.boolean(),
    cashierUsername: z.string().optional(),
    cashierEmail: z.string().optional().or(z.literal("")),
    cashierPassword: z.string().optional(),
    cashierName: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.createCashier) {
        if (!data.cashierUsername || data.cashierUsername.length < 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cashier username required (min 3 chars)",
                path: ["cashierUsername"],
            });
        }
        if (!data.cashierEmail || !/^\S+@\S+\.\S+$/.test(data.cashierEmail)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Valid cashier email required",
                path: ["cashierEmail"],
            });
        }
        if (!data.cashierPassword || data.cashierPassword.length < 6) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Cashier password required (min 6 chars)",
                path: ["cashierPassword"],
            });
        }
    }
});

type CreateClientValues = z.infer<typeof createClientSchema>;

interface CreateClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateClientDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreateClientDialogProps) {
    const { createClient, isLoading } = useClientActions();

    const form = useForm<CreateClientValues>({
        resolver: zodResolver(createClientSchema),
        defaultValues: {
            code: "",
            businessName: "",
            ownerName: "",
            phone: "",
            address: "",
            subscriptionPlan: "FREE",
            // Admin
            adminUsername: "",
            adminEmail: "",
            adminPassword: "",
            adminName: "",
            // Cashier
            createCashier: false,
            cashierUsername: "",
            cashierEmail: "",
            cashierPassword: "",
            cashierName: "",
        },
    });

    const watchCreateCashier = form.watch("createCashier");

    const onSubmit = async (data: CreateClientValues) => {
        try {
            await createClient({
                code: data.code || undefined, // Let backend auto-generate if empty
                businessName: data.businessName,
                ownerName: data.ownerName,
                phone: data.phone,
                address: data.address,
                subscriptionPlan: data.subscriptionPlan,
                subscriptionEnd: data.subscriptionEnd || undefined,
                status: "ACTIVE",
                // Nested Admin
                adminUser: {
                    username: data.adminUsername,
                    email: data.adminEmail,
                    password: data.adminPassword,
                    name: data.adminName || `Admin ${data.businessName}`,
                },
                // Nested Cashier (Conditional)
                cashierUser: data.createCashier
                    ? {
                        username: data.cashierUsername!,
                        email: data.cashierEmail!,
                        password: data.cashierPassword!,
                        name: data.cashierName || `Kasir ${data.businessName}`,
                    }
                    : undefined,
            });
            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Client & Users</DialogTitle>
                    <DialogDescription>
                        Register a store and create initial Admin/Cashier accounts.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* --- Store Info --- */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Store className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-sm">Store Information</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Store Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Auto-generate (kosongkan)" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Kosongkan untuk auto: CLI-2026-XXXX
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subscriptionPlan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plan</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
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

                            <div className="mt-3">
                                <FormField
                                    control={form.control}
                                    name="businessName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Toko Sukses" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="08..." {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="subscriptionEnd"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subscription End</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* --- Admin Info --- */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <User className="h-4 w-4 text-primary" />
                                <h4 className="font-semibold text-sm">Initial Admin Account (Required)</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="adminUsername"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin.store" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adminEmail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="admin@email.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adminPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="******" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="adminName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Admin" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* --- Cashier Info (Optional) --- */}
                        <div>
                            <FormField
                                control={form.control}
                                name="createCashier"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <UserPlus className="h-4 w-4 text-primary" />
                                                <FormLabel>Create Cashier Account</FormLabel>
                                            </div>
                                            <FormDescription>
                                                Optionally create a cashier account now.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {watchCreateCashier && (
                                <div className="mt-4 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <FormField
                                        control={form.control}
                                        name="cashierUsername"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cashier Username</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="cashier.store" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cashierEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cashier Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="cashier@email.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cashierPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="******" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="cashierName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jane Cashier" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
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
                                Create Client & Users
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
