import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- DEFINISI SCHEMA LOKAL (MENGGANTIKAN IMPOR) ---
// Schema untuk satu item konsumsi
const konsumsiItemSchema = z.object({
  jenis: z.string().min(1, { message: "Jenis konsumsi wajib diisi." }),
  satuan: z.string().min(1, { message: "Satuan wajib diisi." }),
  qty: z.string().min(1, { message: "Qty wajib diisi." }), // Menggunakan string karena default value ""
});

// Schema utama untuk keseluruhan form
export const formSchema = z.object({
  acara: z.string().min(1, { message: "Nama acara wajib diisi." }),
  tanggalPermintaan: z.string().min(1, { message: "Tanggal permintaan wajib diisi." }),
  tanggalPengiriman: z.string().min(1, { message: "Tanggal pengiriman wajib diisi." }),
  waktu: z.string().min(1, { message: "Waktu wajib diisi." }),
  lokasi: z.string().min(1, { message: "Lokasi wajib diisi." }),
  tamu: z.string().min(1, { message: "Jenis tamu wajib diisi." }),
  yangMengajukan: z.string(),
  untukBagian: z.string().min(1, { message: "Bagian wajib diisi." }),
  approval: z.string().min(1, { message: "Approval wajib diisi." }),
  konsumsi: z.array(konsumsiItemSchema)
    .min(1, { message: "Minimal harus ada 1 item konsumsi." }),
  catatan: z.string().optional(),
});

// Tipe Pemesanan (dulu diimpor)
export type Pemesanan = z.infer<typeof formSchema>;
// --- AKHIR DEFINISI SCHEMA LOKAL ---


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
    CheckCircle2, ChevronDown, SearchIcon, Trash2, Plus, Info, AlertTriangle, Calendar, Users,
    // --- IKON BARU DITAMBAHKAN ---
    CalendarDays, CalendarCheck, MapPin, Clock, User, Briefcase, UserCheck, Utensils, Box, Hash, FileText
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
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    } as const;
    const iconVariants = {
        info: 'text-blue-500 dark:text-blue-400',
        warning: 'text-amber-500 dark:text-amber-400',
    } as const

    return (
        <div className={cn(
            'rounded-lg p-4 flex gap-4 border-l-4 hover:shadow-lg', 
            variants[variant]
        )}>
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
             {/* --- UBAH --- Ikon sekarang dirender di sini */}
             {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500">{icon}</div>}
                                     <button
                type="button"
                className={cn(
                                                    "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-slate-100 py-2 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-50 dark:hover:bg-slate-600/80",
                    !selectedLabel && "text-slate-500 dark:text-slate-400",
                    // --- UBAH --- Logika padding disesuaikan
                     icon ? "pl-10 pr-3" : "px-3"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedLabel || placeholder}
                <ChevronDown className={`h-4 w-4 opacity-50 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                                        className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-lg"
                >
                    <div className="p-2">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Cari..."
                                                                className="w-full rounded-md border border-gray-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 dark:text-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" // Menggunakan Tailwind/Shadcn
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
                                        "cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 dark:text-slate-100",
                                        value === option.value && "bg-slate-100 dark:bg-slate-600 font-medium"
                                    )}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-center text-gray-500 dark:text-slate-400">Tidak ada hasil</div>
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
        <div
            className="mb-8"
        >
            {children}
        </div>
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
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 md:p-8 font-['Poppins',_sans-serif]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
            `}</style>
            
            <div className="max-w-4xl mx-auto">
                {step === 1 && (
                    <div
                        className="grid md:grid-cols-2 gap-4 mb-8"
                    >
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
                <div className="w-full max-w-lg mx-auto flex justify-center items-start gap-2 md:gap-4 mb-12">
                    {["Isi Form", "Review", "Selesai"].map((label, index) => (
                        <React.Fragment key={index}>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${ step > index + 1 ? "bg-green-500 text-white" : step === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300"}`} 
                                >
                                    {step > index + 1 ? (
                                        <div>
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                <p className={`text-xs font-semibold ${step >= index + 1 ? "text-gray-800 dark:text-slate-200" : "text-gray-400 dark:text-slate-500"}`}>
                                    {label}
                                </p>
                            </div>
                            {index < 2 && (
                                <div className={`flex-1 h-1 rounded-full mt-5 ${step > index + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-slate-600"}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1 */}
                <FormStep key="step1" step={1} currentStep={step}>
                        <Card className="shadow-xl border border-slate-200/60 dark:border-slate-700 overflow-hidden">
                            <CardHeader>
                                <CardTitle>Form Pemesanan Konsumsi</CardTitle>
                                <CardDescription>Isi detail acara Anda di bawah ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="acara">Nama Acara</Label>
                                        {/* --- TAMBAH IKON --- */}
                                        <SearchableSelect
                                            icon={<CalendarDays className="h-4 w-4" />}
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
                                            {/* --- TAMBAH IKON (WRAPPER) --- */}
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                <Input id="tanggalPermintaan" type="date" {...form.register("tanggalPermintaan")} className="pl-10 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                            </div>
                                            {form.formState.errors.tanggalPermintaan && (
                                                <p className="text-sm font-medium text-red-500">{form.formState.errors.tanggalPermintaan.message}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tanggalPengiriman">Tanggal Pengiriman</Label>
                                            {/* --- TAMBAH IKON (WRAPPER) --- */}
                                            <div className="relative">
                                                <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                                <Input id="tanggalPengiriman" type="date" {...form.register("tanggalPengiriman")} className="pl-10 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                            </div>
                                            {form.formState.errors.tanggalPengiriman && (
                                                <p className="text-sm font-medium text-red-500">{form.formState.errors.tanggalPengiriman.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="lokasi">Lokasi</Label>
                                        {/* --- TAMBAH IKON --- */}
                                        <SearchableSelect
                                            icon={<MapPin className="h-4 w-4" />}
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
                                            {/* --- TAMBAH IKON --- */}
                                            <SearchableSelect
                                                icon={<Clock className="h-4 w-4" />}
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
                                            {/* --- TAMBAH IKON --- */}
                                            <SearchableSelect
                                                icon={<Users className="h-4 w-4" />}
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
                                        {/* --- TAMBAH IKON (WRAPPER) --- */}
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <Input
                                                id="yangMengajukan"
                                                {...form.register("yangMengajukan")}
                                                disabled
                                                className="bg-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 pl-10" // shadcn/ui style
                                            />
                                        </div>
                                        {form.formState.errors.yangMengajukan && (
                                            <p className="text-sm font-medium text-red-500">{form.formState.errors.yangMengajukan.message}</p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="untukBagian">Untuk Bagian</Label>
                                        {/* --- TAMBAH IKON --- */}
                                        <SearchableSelect
                                            icon={<Briefcase className="h-4 w-4" />}
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
                                        {/* --- TAMBAH IKON --- */}
                                        <SearchableSelect
                                            icon={<UserCheck className="h-4 w-4" />}
                                            placeholder="Pilih approval"
                                            options={approvalOptions}
                                            value={approvalValue}
                                            onChange={(val) => form.setValue("approval", val, { shouldValidate: true })}
                                        />
                                        {form.formState.errors.approval && (
                                            <p className="text-sm font-medium text-red-500">{form.formState.errors.approval.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4 rounded-lg border bg-slate-50/50 dark:bg-slate-800/70 dark:border-slate-700 p-4">
                                        <div className="flex justify-between items-center gap-2">
                                            <Label className="text-slate-800 dark:text-slate-200">Detail Konsumsi</Label>
                                            <Button type="button" size="sm" onClick={() => append({ jenis: "", satuan: "", qty: "" })} className="shadow-sm">
                                                <Plus className="h-4 w-4 mr-2"/>
                                                Tambah
                                            </Button>
                                        </div>
                                        {fields.map((field, index) => (
                                            <div
                                                key={field.id}
                                                className="flex items-start gap-3 p-3 bg-white dark:bg-slate-700/70 dark:hover:bg-slate-600/70 rounded-lg border border-slate-200/90 dark:border-slate-500 shadow-sm"
                                            >
                                                <span className="pt-2 text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}.</span>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                                                    <div className="w-full space-y-1">
                                                        <Controller
                                                            control={form.control}
                                                            name={`konsumsi.${index}.jenis`}
                                                            render={({ field }) => (
                                                                // --- TAMBAH IKON ---
                                                                <SearchableSelect
                                                                    icon={<Utensils className="h-4 w-4" />}
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
                                                                // --- TAMBAH IKON ---
                                                                <SearchableSelect
                                                                    icon={<Box className="h-4 w-4" />}
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
                                                        {/* --- TAMBAH IKON (WRAPPER) --- */}
                                                        <div className="relative">
                                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-400" />
                                                            <Input
                                                                type="number"
                                                                placeholder="Qty"
                                                                {...form.register(`konsumsi.${index}.qty`)}
                                                                className="pl-10 bg-white dark:bg-slate-600 dark:border-slate-500 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-300"
                                                            />
                                                        </div>
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
                                                    className="mt-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300"
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
                                        {/* --- TAMBAH IKON (WRAPPER) --- */}
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                                            <Input id="catatan" {...form.register("catatan")} placeholder="Contoh: 5 porsi vegetarian" className="pl-10 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-between bg-slate-50/70 dark:bg-slate-800/70 p-6">
                                <Button variant="outline" onClick={onReturnToDashboard} className="shadow-sm hover:shadow-md transition-all active:scale-95">Batal</Button>
                                <Button onClick={form.handleSubmit(handleNextStep)} className="shadow-md hover:shadow-lg transition-all active:scale-95">Lanjut ke Review</Button>
                            </CardFooter>
                        </Card>
                    </FormStep>

                    {/* Step 2 */}
                    <FormStep key="step2" step={2} currentStep={step}>
                        <Card className="shadow-xl border border-slate-200/60 overflow-hidden">
                            <CardHeader>
                                <CardTitle>Review Pesanan Anda</CardTitle>
                                <CardDescription>Mohon periksa kembali detail pesanan Anda sebelum mengirim.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Object.entries(values).map(([key, val]) => {
                                    if (key === 'konsumsi' && Array.isArray(val)) {
                                        return (
                                            <div key={key} className="pt-3 border-t dark:border-slate-700">
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{labels[key]}:</h4>
                                                <div className="space-y-2 pl-4">
                                                    {val.map((item, index) => (
                                                        <div key={index} className="flex justify-between text-sm p-2 bg-slate-100 dark:bg-slate-800/60 rounded-md">
                                                            <span className="font-medium text-slate-700 dark:text-slate-200">{index + 1}. {item.jenis}</span>
                                                            <span className="text-slate-600 dark:text-slate-300">{item.qty} {item.satuan}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    
                                    if (!val && key !== 'catatan') return null;

                                    return (
                                        <div key={key} className="flex justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
                                            <span className="text-slate-500 dark:text-slate-400">{labels[key]}:</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-200 text-right">{String(val) || "-"}</span>
                                        </div>
                                    );
                                })}
                            </CardContent>
                            <CardFooter className="flex justify-between bg-slate-50/70 dark:bg-slate-800/70 p-6">
                                <Button variant="outline" onClick={handlePrevStep} className="shadow-sm hover:shadow-md transition-all active:scale-95">Kembali</Button>
                                <Button onClick={form.handleSubmit(handleFinalSubmit)} className="shadow-md hover:shadow-lg transition-all active:scale-95">Kirim Pesanan</Button>
                            </CardFooter>
                        </Card>
                    </FormStep>

                    {/* Step 3 */}
                    <FormStep key="step3" step={3} currentStep={step}>
                        <div
                            className="text-center bg-white dark:bg-slate-800 p-8 md:p-12 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600"
                        >
                            <div
                                className="text-green-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full"
                            >
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h2
                                className="text-2xl font-bold text-gray-800 dark:text-slate-100"
                            >
                                Pemesanan Berhasil!
                            </h2>
                            <p
                                className="text-gray-600 dark:text-slate-400 mt-2"
                            >
                                Pesanan Anda telah ditambahkan ke riwayat.
                            </p>
                            <div>
                                <Button onClick={onReturnToDashboard} className="mt-6 shadow-md hover:shadow-lg active:scale-95">
                                    Kembali ke Dasbor
                                </Button>
                            </div>
                        </div>
                    </FormStep>
            </div>
        </div>
    );
};

export default PemesananForm;

