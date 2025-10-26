import React, { useState, useMemo, forwardRef, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";

// --- IMPOR SCHEMA ---
// Menggunakan path relatif yang sama dengan Dashboard
import type { Pemesanan } from '../../lib/schema';
import { formSchema } from '../../lib/schema';

// --- IMPOR UI DAN IKON ---
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { 
    Card, 
    CardHeader, 
    CardTitle, 
    CardDescription, 
    CardContent, 
    CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    CheckCircle2, ChevronDown, SearchIcon, Trash2, Plus, Info, AlertTriangle, Calendar, Users
} from 'lucide-react';

// ==================================================================
// --- DEFINISI KOMPONEN & IKON MANUAL DIHAPUS ---
// ==================================================================
// const cn = ... (DIHAPUS)
// const konsumsiItemSchema = ... (DIHAPUS, impor dari schema)
// const formSchema = ... (DIHAPUS, impor dari schema)
// const Button = ... (DIHAPUS)
// const Card = ... (DIHAPUS)
// ...dan semua varian Card... (DIHAPUS)
// const Input = ... (DIHAPUS)
// const Label = ... (DIHAPUS)
// ...semua ikon manual SVG... (DIHAPUS)
// ==================================================================


// --- Info Card Component ---
const InfoCard = ({ icon, title, children, variant = 'info' }: { icon: React.ReactNode, title: string, children: React.ReactNode, variant?: 'info' | 'warning' }) => {
    const variants = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
    };
    const iconVariants = {
        info: 'text-blue-500',
        warning: 'text-amber-500',
    }

    return (
        <div className={cn('rounded-lg p-4 flex gap-4 border-l-4', variants[variant])}>
            <div className={cn("flex-shrink-0 mt-1", iconVariants[variant])}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold">{title}</h4>
                <div className="text-sm opacity-90">{children}</div>
            </div>
        </div>
    );
};

// --- SEARCHABLE SELECT COMPONENT ---
// Komponen ini tetap ada karena ini adalah komponen kustom
const SearchableSelect = ({ options, value, onChange, placeholder = "Pilih opsi...", icon }: { options: {label: string, value: string}[], value: string, onChange: (val: string) => void, placeholder?: string, icon?: React.ReactNode }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const filteredOptions = useMemo(() =>
        options.filter(opt =>
            opt.label?.toLowerCase().includes(search.toLowerCase())
        ),
    [options, search]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if(isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleOptionClick = (val: string) => {
        onChange(val);
        setSearch("");
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || "";

    return (
        <div className="relative w-full" ref={containerRef}>
             {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
            <button
                type="button"
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500", // Menggunakan Tailwind/Shadcn border
                    !selectedLabel && "text-slate-500",
                     icon ? "pl-10 pr-3" : "px-3"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedLabel || placeholder}
                <ChevronDown className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    <div className="p-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Cari..."
                                className="w-full rounded-md border border-gray-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" // Menggunakan Tailwind/Shadcn
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleOptionClick(option.value)}
                                    className={cn(
                                        "cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-slate-100",
                                        value === option.value && "bg-slate-100 font-medium"
                                    )}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-center text-gray-500">Tidak ada hasil</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Form Step Component ---
const FormStep = ({ children, step, currentStep }: { children: React.ReactNode, step: number, currentStep: number }) => {
    // Render child if it's the current step
    if (step !== currentStep) return null;
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="mb-8"
        >
            {children}
        </motion.div>
    );
};


// --- MAIN PEMESANAN FORM COMPONENT ---
const standardKonsumsiOptions = [
    { label: "Nasi Box", value: "Nasi Box" },
    { label: "Snack Box", value: "Snack Box" },
    { label: "Prasmanan", value: "Prasmanan" },
    { label: "Kopi & Teh", value: "Kopi & Teh" },
    { label: "Buah", value: "Buah" },
];

const specialKonsumsiByWaktu: Record<string, {label: string, value: string}[]> = {
    "Pagi": [
        { label: "Teh", value: "Teh" },
        { label: "Bubur Ayam", value: "Bubur Ayam" },
        { label: "Kopi", value: "Kopi" },
    ],
    "Siang": [ { label: "Makan Siang Prasmanan", value: "Makan Siang Prasmanan" }],
    "Malam": [ { label: "Makan Malam Prasmanan", value: "Makan Malam Prasmanan" }],
    "Buka Puasa": [
        { label: "Takjil", value: "Takjil" },
        { label: "Kurma", value: "Kurma" },
    ],
    "Sahur": [ { label: "Menu Sahur Box", value: "Menu Sahur Box" }],
};

// Tipe Props
interface PemesananFormProps {
    riwayat: Pemesanan[]; // Gunakan tipe Pemesanan
    onFormSubmit: (values: z.infer<typeof formSchema>) => boolean; // Sesuaikan tipe
    onReturnToDashboard: () => void;
}

const PemesananForm: React.FC<PemesananFormProps> = ({ riwayat = [], onFormSubmit, onReturnToDashboard }) => {
    const [step, setStep] = useState(1);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acara: "",
            tanggalPermintaan: "",
            tanggalPengiriman: "",
            waktu: "",
            lokasi: "",
            tamu: "",
            yangMengajukan: "Riza Ilhamsyah (12231149)",
            untukBagian: "Dep. Teknologi Informasi PKC (C001370000)",
            approval: "Jojok Satriadi (1140122)",
            konsumsi: [{ jenis: "", satuan: "", qty: "" }],
            catatan: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "konsumsi",
    });
    
    const waktuValue = form.watch("waktu");

    const dynamicJenisKonsumsiOptions = useMemo(() => {
        const specialOptions = specialKonsumsiByWaktu[waktuValue] || [];
        const specialValues = new Set(specialOptions.map(opt => opt.value));
        const filteredStandardOptions = standardKonsumsiOptions.filter(
            opt => !specialValues.has(opt.value)
        );
        return [...specialOptions, ...filteredStandardOptions];
    }, [waktuValue]);

    useEffect(() => {
        const currentKonsumsi = form.getValues('konsumsi');
        const validJenisValues = new Set(dynamicJenisKonsumsiOptions.map(opt => opt.value));

        currentKonsumsi.forEach((item, index) => {
            if (item.jenis && !validJenisValues.has(item.jenis)) {
                form.setValue(`konsumsi.${index}.jenis`, '', { shouldValidate: true });
            }
        });
    }, [waktuValue, dynamicJenisKonsumsiOptions, form]);


    const uniqueAcaraOptions = useMemo(() => {
        const defaultAcaraOptions = [ "Bahan Minum Karyawan", "Baporkes", "BK3N", "Extra fooding", "Extra Fooding Shift", "Extra Fooding SKJ", "Festival Inovasi", "Halal bil halal", "Rapat Koordinasi", "Pelatihan Internal", "Acara Departemen", "Lainnya" ];
        const acaraNames = new Set([ ...defaultAcaraOptions, ...riwayat.map((r) => r.acara) ]);
        return Array.from(acaraNames).map((name) => ({ label: name, value: name, }));
    }, [riwayat]);
    
    const waktuOptions = [
      { label: "Pagi", value: "Pagi" },
      { label: "Siang", value: "Siang" },
      { label: "Sore", value: "Sore" },
      { label: "Malam", value: "Malam" },
      { label: "Sahur", value: "Sahur" },
      { label: "Buka Puasa", value: "Buka Puasa" },
    ];

    const lokasiOptions = [
        { label: "Gedung Utama, Ruang Rapat Cempaka", value: "Gedung Utama, Ruang Rapat Cempaka" },
        { label: "Gedung Produksi, Area Istirahat", value: "Gedung Produksi, Area Istirahat" },
        { label: "Wisma Kujang, Aula Serbaguna", value: "Wisma Kujang, Aula Serbaguna" },
        { label: "Gedung Training Center, Ruang 1", value: "Gedung Training Center, Ruang 1" },
        { label: "Kantor Departemen TI", value: "Kantor Departemen TI" },
    ];

    const tamuOptions = [
        { label: "Perta", value: "perta" },
        { label: "Reguler", value: "reguler" },
        { label: "Standar", value: "standar" },
        { label: "VIP", value: "vip" },
        { label: "VVIP", value: "vvip" },
    ];

    const bagianOptions = [
        { label: "Dep. Teknologi Informasi PKC (C001370000)", value: "Dep. Teknologi Informasi PKC (C001370000)" },
        { label: "Dep. Keuangan (C001380000)", value: "Dep. Keuangan (C001380000)" },
        { label: "Dep. SDM (C001390000)", value: "Dep. SDM (C001390000)" },
    ];

    const approvalOptions = [
        { label: "Jojok Satriadi (1140122)", value: "Jojok Satriadi (1140122)" },
        { label: "Budi Santoso (1120321)", value: "Budi Santoso (1120321)" },
        { label: "Citra Lestari (1150489)", value: "Citra Lestari (1150489)" },
    ];

    const satuanOptions = [
        { label: "Box", value: "Box" },
        { label: "Porsi", value: "Porsi" },
        { label: "Paket", value: "Paket" },
        { label: "Kg", value: "Kg" },
        { label: "Cup", value: "Cup" },
    ];

    const handleNextStep = () => setStep((prev) => prev + 1);
    const handlePrevStep = () => setStep((prev) => prev - 1);

    const handleFinalSubmit = (values: z.infer<typeof formSchema>) => {
        try {
            if (onFormSubmit && typeof onFormSubmit === 'function') {
                onFormSubmit(values); 
            } else {
                console.warn("PemesananForm: prop 'onFormSubmit' tidak ada atau bukan fungsi.");
            }
        } catch (error) {
            console.error("Error saat menjalankan onFormSubmit:", error);
        }
        
        handleNextStep(); 
    };

    const acaraValue = form.watch("acara");
    const lokasiValue = form.watch("lokasi");
    const tamuValue = form.watch("tamu");
    const bagianValue = form.watch("untukBagian");
    const approvalValue = form.watch("approval");

    const values = form.getValues();
    const labels: Record<string, string> = {
        acara: "Nama Acara",
        tanggalPermintaan: "Tanggal Permintaan",
        tanggalPengiriman: "Tanggal Pengiriman",
        waktu: "Waktu",
        lokasi: "Lokasi",
        tamu: "Jenis Tamu",
        yangMengajukan: "Yang Mengajukan",
        untukBagian: "Untuk Bagian",
        approval: "Approval",
        konsumsi: "Detail Konsumsi",
        catatan: "Catatan Tambahan",
    };

    return (
        <div className="font-['Poppins',_sans-serif]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>
            
            {step === 1 && (
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <InfoCard
                        variant="info"
                        icon={<Info className="h-6 w-6" />}
                        title="Informasi Order"
                    >
                        <p>Order dilakukan minimal H-1 kegiatan</p>
                        <p>Order dapat dilakukan pada pukul 07:00 - 14:00</p>
                    </InfoCard>
                    <InfoCard
                        variant="warning"
                        icon={<AlertTriangle className="h-6 w-6" />}
                        title="Informasi Transaksi"
                    >
                        <p>Informasi untuk pemesanan order wajib di approve oleh approval</p>
                    </InfoCard>
                </div>
            )}


            {/* Stepper UI */}
            <div className="flex justify-center items-start gap-4 mb-8">
                {["Isi Form", "Review", "Selesai"].map((label, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-300 ${ step > index + 1 ? "bg-green-500 text-white" : step === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`} >
                                {step > index + 1 ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                            </div>
                            <p className={`text-xs font-semibold ${step >= index + 1 ? "text-gray-800" : "text-gray-400"}`}>
                                {label}
                            </p>
                        </div>
                        {index < 2 && (
                            <div className={`flex-1 h-1 rounded-full mt-5 ${step > index + 1 ? "bg-green-500" : "bg-gray-200"}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1 */}
                <FormStep key="step1" step={1} currentStep={step}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Form Pemesanan Konsumsi</CardTitle>
                            <CardDescription>Isi detail acara Anda di bawah ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="acara">Nama Acara</Label>
                                    <SearchableSelect
                                        placeholder="Pilih jenis acara"
                                        options={uniqueAcaraOptions}
                                        value={acaraValue}
                                        onChange={(val) => form.setValue("acara", val, { shouldValidate: true })}
                                    />
                                    {form.formState.errors.acara && (
                                        <p className="text-sm font-medium text-red-500">{form.formState.errors.acara.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggalPermintaan">Tanggal Permintaan</Label>
                                        {/* Menggunakan Input shadcn */}
                                        <Input id="tanggalPermintaan" type="date" {...form.register("tanggalPermintaan")} />
                                        {form.formState.errors.tanggalPermintaan && (
                                            <p className="text-sm font-medium text-red-500">{form.formState.errors.tanggalPermintaan.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggalPengiriman">Tanggal Pengiriman</Label>
                                        <Input id="tanggalPengiriman" type="date" {...form.register("tanggalPengiriman")} />
                                        {form.formState.errors.tanggalPengiriman && (
                                            <p className="text-sm font-medium text-red-500">{form.formState.errors.tanggalPengiriman.message}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="lokasi">Lokasi</Label>
                                    <SearchableSelect
                                        placeholder="Pilih lokasi"
                                        options={lokasiOptions}
                                        value={lokasiValue}
                                        onChange={(val) => form.setValue("lokasi", val, { shouldValidate: true })}
                                    />
                                    {form.formState.errors.lokasi && (
                                        <p className="text-sm font-medium text-red-500">{form.formState.errors.lokasi.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="waktu">Waktu</Label>
                                        <SearchableSelect
                                            placeholder="Pilih waktu"
                                            options={waktuOptions}
                                            value={waktuValue}
                                            onChange={(val) => form.setValue("waktu", val, { shouldValidate: true })}
                                        />
                                        {form.formState.errors.waktu && (
                                            <p className="text-sm font-medium text-red-500">{form.formState.errors.waktu.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tamu">Tamu</Label>
                                        <SearchableSelect
                                            placeholder="Pilih jenis tamu"
                                            options={tamuOptions}
                                            value={tamuValue}
                                            onChange={(val) => form.setValue("tamu", val, { shouldValidate: true })}
                                        />
                                        {form.formState.errors.tamu && (
                                            <p className="text-sm font-medium text-red-500">{form.formState.errors.tamu.message}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="yangMengajukan">Yang Mengajukan</Label>
                                    <Input
                                        id="yangMengajukan"
                                        {...form.register("yangMengajukan")}
                                        disabled
                                        className="bg-slate-100" // shadcn/ui style
                                    />
                                    {form.formState.errors.yangMengajukan && (
                                        <p className="text-sm font-medium text-red-500">{form.formState.errors.yangMengajukan.message}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="untukBagian">Untuk Bagian</Label>
                                    <SearchableSelect
                                        placeholder="Pilih bagian"
                                        options={bagianOptions}
                                        value={bagianValue}
                                        onChange={(val) => form.setValue("untukBagian", val, { shouldValidate: true })}
                                    />
                                    {form.formState.errors.untukBagian && (
                                        <p className="text-sm font-medium text-red-500">{form.formState.errors.untukBagian.message}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="approval">Approval</Label>
                                    <SearchableSelect
                                        placeholder="Pilih approval"
                                        options={approvalOptions}
                                        value={approvalValue}
                                        onChange={(val) => form.setValue("approval", val, { shouldValidate: true })}
                                    />
                                    {form.formState.errors.approval && (
                                        <p className="text-sm font-medium text-red-500">{form.formState.errors.approval.message}</p>
                                    )}
                                </div>

                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Detail Konsumsi</Label>
                                        <Button type="button" size="sm" onClick={() => append({ jenis: "", satuan: "", qty: "" })}>
                                            <Plus className="h-4 w-4 mr-2"/>
                                            Tambah
                                        </Button>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-3 p-2 border-b last:border-b-0">
                                            <span className="pt-2 text-sm font-medium text-slate-600">{index + 1}.</span>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                                                <div className="w-full space-y-1">
                                                    <Controller
                                                        control={form.control}
                                                        name={`konsumsi.${index}.jenis`}
                                                        render={({ field }) => (
                                                            <SearchableSelect
                                                                placeholder="Jenis Konsumsi"
                                                                options={dynamicJenisKonsumsiOptions}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    {form.formState.errors.konsumsi?.[index]?.jenis && (
                                                        <p className="text-xs text-red-500">{form.formState.errors.konsumsi?.[index]?.jenis?.message}</p>
                                                    )}
                                                </div>
                                                <div className="w-full space-y-1">
                                                    <Controller
                                                        control={form.control}
                                                        name={`konsumsi.${index}.satuan`}
                                                        render={({ field }) => (
                                                            <SearchableSelect
                                                                placeholder="Satuan"
                                                                options={satuanOptions}
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    {form.formState.errors.konsumsi?.[index]?.satuan && (
                                                        <p className="text-xs text-red-500">{form.formState.errors.konsumsi?.[index]?.satuan?.message}</p>
                                                    )}
                                                </div>
                                                <div className="w-full space-y-1">
                                                    <Input
                                                        type="number"
                                                        placeholder="Qty"
                                                        {...form.register(`konsumsi.${index}.qty`)}
                                                    />
                                                    {form.formState.errors.konsumsi?.[index]?.qty && (
                                                        <p className="text-xs text-red-500">{form.formState.errors.konsumsi?.[index]?.qty?.message}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(index)}
                                                className="mt-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                disabled={fields.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                    {form.formState.errors.konsumsi?.root && (
                                        <p className="text-sm font-medium text-red-500">{form.formState.errors.konsumsi.root.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                                    <Input id="catatan" {...form.register("catatan")} placeholder="Contoh: 5 porsi vegetarian"/>
                                </div>
                            </form>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={onReturnToDashboard}>Batal</Button>
                            <Button onClick={form.handleSubmit(handleNextStep)}>Lanjut ke Review</Button>
                        </CardFooter>
                    </Card>
                </FormStep>

                {/* Step 2 */}
                <FormStep key="step2" step={2} currentStep={step}>
                    <Card>
                        <CardHeader><CardTitle>Review Pesanan Anda</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(values).map(([key, val]) => {
                                if (key === 'konsumsi' && Array.isArray(val)) {
                                    return (
                                        <div key={key} className="pt-2 border-t">
                                            <h4 className="text-sm font-semibold text-slate-800 mb-2">{labels[key]}:</h4>
                                            <div className="space-y-2 pl-4">
                                                {val.map((item, index) => (
                                                    <div key={index} className="flex justify-between text-sm p-2 bg-slate-50 rounded-md">
                                                        <span className="font-medium text-slate-700">{index + 1}. {item.jenis}</span>
                                                        <span className="text-slate-600">{item.qty} {item.satuan}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                if (!val && key !== 'catatan') return null;

                                return (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{labels[key]}:</span>
                                        <span className="font-medium text-slate-900 text-right">{String(val) || "-"}</span>
                                    </div>
                                );
                            })}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={handlePrevStep}>Kembali</Button>
                            <Button onClick={form.handleSubmit(handleFinalSubmit)}>Kirim Pesanan</Button>
                        </CardFooter>
                    </Card>
                </FormStep>

                {/* Step 3 */}
                <FormStep key="step3" step={3} currentStep={step}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center bg-white p-8 rounded-lg shadow-md border border-gray-200"
                    >
                        <div className="text-green-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Pemesanan Berhasil!</h2>
                        <p className="text-gray-600 mt-2">Pesanan Anda telah ditambahkan ke riwayat.</p>
                        <Button onClick={onReturnToDashboard} className="mt-6">Kembali ke Dasbor</Button>
                    </motion.div>
                </FormStep>
            </AnimatePresence>
        </div>
    );
};

export default PemesananForm;
