"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Gender } from "@/types";
import { memberRegistrationSchema } from "@/lib/validations";

type MemberCreateFormType = z.infer<typeof memberRegistrationSchema>;

interface MemberCreateFormProps {
    onSubmit: (data: MemberCreateFormType) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export function MemberCreateForm({ onSubmit, onCancel, isLoading }: MemberCreateFormProps) {
    const form = useForm<MemberCreateFormType>({
        resolver: zodResolver(memberRegistrationSchema),
        defaultValues: {
            nik: "",
            fullName: "",
            address: "",
            regionCode: "",
            whatsapp: "",
            gender: undefined,
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* NIK */}
                <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIK KTP *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="16 digit NIK"
                                    maxLength={16}
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Nama Lengkap */}
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap *</FormLabel>
                            <FormControl>
                                <Input {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Notelp/WA */}
                <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nomor WhatsApp *</FormLabel>
                            <FormControl>
                                <Input placeholder="08xxxxxxxxxx" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Jenis Kelamin */}
                <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Jenis Kelamin *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={Gender.MALE}>{Gender.MALE}</SelectItem>
                                    <SelectItem value={Gender.FEMALE}>{Gender.FEMALE}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Region - Changed to free text input for SaaS flexibility */}
                <FormField
                    control={form.control}
                    name="regionCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Wilayah *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Contoh: Bandung, Jakarta Selatan, Kec. Coblong"
                                    maxLength={50}
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                                Kode wilayah ini akan digunakan sebagai prefix ID member
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Address */}
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Alamat *</FormLabel>
                            <FormControl>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                    disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Member"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
