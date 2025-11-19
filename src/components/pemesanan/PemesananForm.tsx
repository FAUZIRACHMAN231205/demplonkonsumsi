import React, { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formSchema, type Pemesanan } from "@/lib/schema";
import {
    APPROVAL_OPTIONS,
    BAGIAN_OPTIONS,
    DEFAULT_ACARA_OPTIONS,
    LOKASI_OPTIONS,
    SATUAN_OPTIONS,
    TAMU_OPTIONS,
    WAKTU_OPTIONS,
} from "@/lib/constants/pemesanan";

const confettiColors = ['#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15'];

const createConfettiPieces = () =>
    Array.from({ length: 16 }).map((_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        delay: idx * 0.12,
        duration: 2.2 + Math.random() * 1.2,
        color: confettiColors[idx % confettiColors.length],
    }));

const INITIAL_FORM_VALUES: z.infer<typeof formSchema> = {
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
};


// --- IMPOR UI DAN IKON ---
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
    CheckCircle2, ChevronDown, SearchIcon, Trash2, Plus, Info, AlertTriangle, Users,
    // --- IKON BARU DITAMBAHKAN ---
    CalendarDays, MapPin, Clock, User, Briefcase, UserCheck, Utensils, Box, Hash, FileText,
    Sparkles, PartyPopper, RefreshCw, ArrowLeft
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

const DAY_IN_MS = 86_400_000;

const startOfDay = (date: Date) => {
    const clone = new Date(date);
    clone.setHours(0, 0, 0, 0);
    return clone;
};

const addDays = (date: Date, amount: number) => {
    const clone = new Date(date);
    clone.setDate(clone.getDate() + amount);
    return clone;
};

const formatDateToInput = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const parseInputDate = (value?: string) => {
    if (!value) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return undefined;
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const isBeforeDay = (date: Date, minDate: Date) => {
    return startOfDay(date).getTime() < startOfDay(minDate).getTime();
};

const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

const getLeadTimeInfo = (date: Date) => {
    const diff = Math.max(0, Math.round((startOfDay(date).getTime() - startOfDay(new Date()).getTime()) / DAY_IN_MS));
    if (diff === 0) {
        return {
            badge: 'Hari ini',
            text: 'Tim konsumsi siap bergerak cepat untuk pesanan kilat.',
        };
    }
    if (diff === 1) {
        return {
            badge: 'H+1',
            text: 'Masih ada satu hari untuk menyiapkan detail terbaik.',
        };
    }
    return {
        badge: `${diff} hari lagi`,
        text: `Timeline aman, masih ada ${diff} hari untuk persiapan matang.`,
    };
};

interface DatePickerFieldProps {
    label: string;
    placeholder: string;
    description?: string;
    value?: string;
    onChange: (value: string) => void;
    minDate?: Date;
    quickPicks?: { label: string; date: Date }[];
    error?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label,
    placeholder,
    description = "Atur tanggal terbaikmu",
    value,
    onChange,
    minDate,
    quickPicks = [],
    error,
}) => {
    const selectedDate = value ? parseInputDate(value) : undefined;
    const friendlyDate = selectedDate ? formatFullDate(selectedDate) : placeholder;
    const dayName = selectedDate?.toLocaleDateString('id-ID', { weekday: 'long' });
    const leadTimeInfo = selectedDate ? getLeadTimeInfo(selectedDate) : undefined;

    const handleSelect = (date?: Date) => {
        if (!date) {
            onChange("");
            return;
        }
        onChange(formatDateToInput(startOfDay(date)));
    };

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <Label className="text-sm text-slate-700 dark:text-slate-200">{label}</Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                        {description}
                    </p>
                </div>
                {leadTimeInfo && (
                    <Badge variant="outline" className="border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-200">
                        {leadTimeInfo.badge}
                    </Badge>
                )}
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/70 p-3 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{friendlyDate}</p>
                        {selectedDate && (
                            <p className="text-xs text-slate-500 dark:text-slate-300">{`Mood ${dayName}`}</p>
                        )}
                        {leadTimeInfo && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>{leadTimeInfo.text}</span>
                            </div>
                        )}
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                className="shrink-0 border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/70"
                            >
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Buka Kalender
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <CalendarComponent
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleSelect}
                                disabled={(date) => (minDate ? isBeforeDay(date, minDate) : false)}
                                initialFocus
                            />
                            {quickPicks.length > 0 && (
                                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Shortcut ceria</p>
                                    <div className="flex flex-wrap gap-2">
                                        {quickPicks.map((pick) => (
                                            <Button
                                                key={pick.label}
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                className="border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/80"
                                                onClick={() => handleSelect(startOfDay(pick.date))}
                                            >
                                                {pick.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
                {dayName && (
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {dayName}
                        </Badge>
                    </div>
                )}
            </div>
            {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
        </div>
    );
};

// --- Form Step Component ---
const FormStep = ({ children, step, currentStep }: { children: React.ReactNode, step: number, currentStep: number }) => {
    const isActive = step === currentStep;
    return (
        <div
            data-active={isActive}
            className={cn(
                "mb-8 transition-all duration-300",
                isActive ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2 h-0 overflow-hidden"
            )}
        >
            {isActive && children}
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

const specialKonsumsiByTamu: Record<string, {label: string, value: string}[]> = {
    perta: [
        { label: "Snack Box Energi", value: "Snack Box Energi" },
        { label: "Kopi & Teh Premium", value: "Kopi & Teh Premium" },
    ],
    reguler: [
        { label: "Gorengan Varian", value: "Gorengan Varian" },
        { label: "Air Mineral Botol", value: "Air Mineral Botol" },
    ],
    standar: [
        { label: "Snack Box Standar", value: "Snack Box Standar" },
        { label: "Buah Potong", value: "Buah Potong" },
    ],
    vip: [
        { label: "High Tea Set", value: "High Tea Set" },
        { label: "Dessert Premium", value: "Dessert Premium" },
    ],
    vvip: [
        { label: "Fine Dining Set", value: "Fine Dining Set" },
        { label: "Canape Eksklusif", value: "Canape Eksklusif" },
    ],
};

// Tipe Props
interface PemesananFormProps {
    riwayat: Pemesanan[];
    onFormSubmit: (values: z.infer<typeof formSchema>) => boolean;
    onReturnToDashboard?: () => void;
    onRequestClose?: () => void;
}

const STEP_LABELS = ["Isi Form", "Review", "Selesai"];

const PemesananForm: React.FC<PemesananFormProps> = ({ riwayat = [], onFormSubmit, onReturnToDashboard, onRequestClose }) => {
    const [step, setStep] = useState(1);
    const [showSuccessEffect, setShowSuccessEffect] = useState(false);
    const [confettiPieces, setConfettiPieces] = useState(() => createConfettiPieces());

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: INITIAL_FORM_VALUES,
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "konsumsi",
    });
    
    const waktuValue = form.watch("waktu");
    const tamuValue = form.watch("tamu");

    const dynamicJenisKonsumsiOptions = useMemo(() => {
        const waktuSpecific = specialKonsumsiByWaktu[waktuValue] || [];
        const tamuSpecific = specialKonsumsiByTamu[tamuValue] || [];
        const combinedSpecial = [...waktuSpecific, ...tamuSpecific].filter((option, index, array) =>
            array.findIndex((item) => item.value === option.value) === index
        );
        const specialValues = new Set(combinedSpecial.map((opt) => opt.value));
        const filteredStandardOptions = standardKonsumsiOptions.filter((opt) => !specialValues.has(opt.value));
        return [...combinedSpecial, ...filteredStandardOptions];
    }, [tamuValue, waktuValue]);

    useEffect(() => {
        const currentKonsumsi = form.getValues('konsumsi');
        const validJenisValues = new Set(dynamicJenisKonsumsiOptions.map(opt => opt.value));

        currentKonsumsi.forEach((item, index) => {
            if (item.jenis && !validJenisValues.has(item.jenis)) {
                form.setValue(`konsumsi.${index}.jenis`, '', { shouldValidate: true });
            }
        });
    }, [tamuValue, waktuValue, dynamicJenisKonsumsiOptions, form]);


    const uniqueAcaraOptions = useMemo(() => {
        const acaraNames = new Set([
            ...DEFAULT_ACARA_OPTIONS.map((option) => option.value),
            ...riwayat.map((r) => r.acara),
        ]);
        return Array.from(acaraNames).map((name) => ({ label: name, value: name }));
    }, [riwayat]);

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
    const bagianValue = form.watch("untukBagian");
    const approvalValue = form.watch("approval");
    const tanggalPermintaanValue = form.watch("tanggalPermintaan");

    const today = useMemo(() => startOfDay(new Date()), []);
    const permintaanDateObj = useMemo(() => parseInputDate(tanggalPermintaanValue), [tanggalPermintaanValue]);
    const permintaanQuickPicks = useMemo(() => ([
        { label: "Hari ini", date: today },
        { label: "Besok", date: addDays(today, 1) },
        { label: "3 hari lagi", date: addDays(today, 3) },
    ]), [today]);
    const pengirimanQuickPicks = useMemo(() => {
        const base = permintaanDateObj || today;
        return [1, 2, 3].map((offset) => ({ label: `H+${offset}`, date: addDays(base, offset) }));
    }, [permintaanDateObj, today]);
    const pengirimanMinDate = permintaanDateObj || today;

    const values = form.getValues();
    const formatTanggal = (tanggal?: string) => {
        if (!tanggal) return "-";
        const parsed = new Date(tanggal);
        if (Number.isNaN(parsed.getTime())) return tanggal;
        return parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    const successHighlights = [
        { label: 'Acara', value: values.acara || '-' },
        { label: 'Tanggal Pengiriman', value: formatTanggal(values.tanggalPengiriman) },
        { label: 'Lokasi', value: values.lokasi || '-' },
        { label: 'Total Menu', value: `${values?.konsumsi?.length ?? 0} item` },
    ];

    useEffect(() => {
        if (step === 3) {
            setConfettiPieces(createConfettiPieces());
            setShowSuccessEffect(true);
            const timeout = setTimeout(() => setShowSuccessEffect(false), 3200);
            return () => clearTimeout(timeout);
        }
    }, [step]);

    const requestClose = () => {
        if (onRequestClose) {
            onRequestClose();
            return;
        }
        onReturnToDashboard?.();
    };

    const handleCreateAnother = () => {
        form.reset(INITIAL_FORM_VALUES);
        setStep(1);
    };
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
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 pb-28 md:p-8 md:pb-12">
            <style>{`
                @keyframes confettiFall {
                    0% { transform: translateY(-20%) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
                }
                @keyframes smoothPop {
                    0% { transform: scale(0.6); opacity: 0; }
                    80% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeUp {
                    0% { transform: translateY(16px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                .confetti-piece {
                    position: absolute;
                    top: -20px;
                    width: 0.55rem;
                    height: 0.55rem;
                    border-radius: 9999px;
                    opacity: 0;
                    animation-name: confettiFall;
                    animation-timing-function: ease-in;
                }
                .animate-smooth-pop {
                    animation: smoothPop 0.6s ease-out forwards;
                }
                .animate-fade-up {
                    animation: fadeUp 0.45s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
            
            <div className="max-w-4xl mx-auto">
                <div className="sm:hidden sticky top-0 z-30 -mx-4 mb-6 rounded-b-2xl border-b border-slate-200/70 dark:border-slate-800/70 bg-white/95 dark:bg-slate-900/90 backdrop-blur px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-300">
                        <span>Langkah {step}/{STEP_LABELS.length}</span>
                        {step > 1 && step < STEP_LABELS.length && (
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" /> Kembali
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{STEP_LABELS[step - 1]}</p>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${((step - 1) / (STEP_LABELS.length - 1 || 1)) * 100}%` }}
                        />
                    </div>
                </div>
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
                <div className="mb-6 sm:mb-10">
                    {/* Desktop stepper */}
                    <div className="hidden sm:flex w-full max-w-2xl mx-auto justify-center items-start gap-4">
                        {STEP_LABELS.map((label, index) => (
                            <React.Fragment key={label}>
                                <div className="flex flex-col items-center gap-2">
                                    <div
                                        className={cn(
                                            "w-11 h-11 flex items-center justify-center rounded-full font-semibold text-base",
                                            step > index + 1 && "bg-green-500 text-white",
                                            step === index + 1 && "bg-blue-500 text-white",
                                            step < index + 1 && "bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-slate-300"
                                        )}
                                    >
                                        {step > index + 1 ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                                    </div>
                                    <p className={cn(
                                        "text-sm font-semibold text-center",
                                        step >= index + 1 ? "text-gray-800 dark:text-slate-200" : "text-gray-400 dark:text-slate-500"
                                    )}>
                                        {label}
                                    </p>
                                </div>
                                {index < STEP_LABELS.length - 1 && (
                                    <div className={cn(
                                        "flex-1 h-1 rounded-full mt-5 transition-colors",
                                        step > index + 1 ? "bg-green-500" : "bg-gray-200 dark:bg-slate-600"
                                    )} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
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
                                        <Controller
                                            control={form.control}
                                            name="tanggalPermintaan"
                                            render={({ field }) => (
                                                <DatePickerField
                                                    label="Tanggal Permintaan"
                                                    placeholder="Pilih tanggal permintaan"
                                                    description="Pastikan minimal H-1 ya"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    minDate={today}
                                                    quickPicks={permintaanQuickPicks}
                                                    error={form.formState.errors.tanggalPermintaan?.message}
                                                />
                                            )}
                                        />
                                        <Controller
                                            control={form.control}
                                            name="tanggalPengiriman"
                                            render={({ field }) => (
                                                <DatePickerField
                                                    label="Tanggal Pengiriman"
                                                    placeholder="Pilih tanggal pengiriman"
                                                    description="Cari slot kirim yang paling pas"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    minDate={pengirimanMinDate}
                                                    quickPicks={pengirimanQuickPicks}
                                                    error={form.formState.errors.tanggalPengiriman?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="lokasi">Lokasi</Label>
                                        {/* --- TAMBAH IKON --- */}
                                        <SearchableSelect
                                            icon={<MapPin className="h-4 w-4" />}
                                            placeholder="Pilih lokasi"
                                            options={LOKASI_OPTIONS}
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
                                                options={WAKTU_OPTIONS}
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
                                                options={TAMU_OPTIONS}
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
                                                readOnly
                                                aria-readonly="true"
                                                className="pl-10 bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 cursor-text focus-visible:ring-0" // tetap non-edit tapi visual aktif
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
                                            options={BAGIAN_OPTIONS}
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
                                            options={APPROVAL_OPTIONS}
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
                                                                    options={SATUAN_OPTIONS}
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
                            <CardFooter className="hidden sm:flex justify-between bg-slate-50/70 dark:bg-slate-800/70 p-6">
                                <Button variant="outline" onClick={requestClose} className="shadow-sm hover:shadow-md transition-all active:scale-95">Batal</Button>
                                <Button onClick={form.handleSubmit(handleNextStep)} className="shadow-md hover:shadow-lg transition-all active:scale-95">Lanjut ke Review</Button>
                            </CardFooter>
                        </Card>
                        <div className="sm:hidden sticky bottom-0 left-0 right-0 z-30 -mx-4 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 shadow-xl space-y-3">
                                <Button variant="outline" onClick={requestClose} className="w-full">Batal</Button>
                                <Button onClick={form.handleSubmit(handleNextStep)} className="w-full">Lanjut ke Review</Button>
                            </div>
                        </div>
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
                            <CardFooter className="hidden sm:flex justify-between bg-slate-50/70 dark:bg-slate-800/70 p-6">
                                <Button variant="outline" onClick={handlePrevStep} className="shadow-sm hover:shadow-md transition-all active:scale-95">Kembali</Button>
                                <Button onClick={form.handleSubmit(handleFinalSubmit)} className="shadow-md hover:shadow-lg transition-all active:scale-95">Kirim Pesanan</Button>
                            </CardFooter>
                        </Card>
                        <div className="sm:hidden sticky bottom-0 left-0 right-0 z-30 -mx-4 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-4 shadow-xl space-y-3">
                                <Button variant="outline" onClick={handlePrevStep} className="w-full">Kembali</Button>
                                <Button onClick={form.handleSubmit(handleFinalSubmit)} className="w-full">Kirim Pesanan</Button>
                            </div>
                        </div>
                    </FormStep>

                    {/* Step 3 */}
                    <FormStep key="step3" step={3} currentStep={step}>
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl p-6 md:p-10">
                            {showSuccessEffect && (
                                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                    {confettiPieces.map((piece) => (
                                        <span
                                            key={`confetti-${piece.id}-${piece.left}`}
                                            className="confetti-piece"
                                            style={{
                                                left: `${piece.left}%`,
                                                animationDelay: `${piece.delay}s`,
                                                animationDuration: `${piece.duration}s`,
                                                backgroundColor: piece.color,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="relative text-center">
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner animate-smooth-pop">
                                    <CheckCircle2 className="h-12 w-12" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Pemesanan Berhasil!
                                </h2>
                                <p className="mt-3 text-base text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2">
                                    <Sparkles className="h-4 w-4 text-emerald-500" />
                                    Pesanan {values.acara ? `"${values.acara}"` : 'Anda'} telah ditambahkan ke riwayat dan siap diproses.
                                </p>

                                <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
                                    {successHighlights.map((item, index) => (
                                        <div
                                            key={item.label}
                                            className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/40 p-4 animate-fade-up"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                                {item.label}
                                            </p>
                                            <p className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-center">
                                    <Button onClick={requestClose} className="h-12 px-8 shadow-lg hover:shadow-xl active:scale-95">
                                        Kembali ke Dasbor
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCreateAnother}
                                        className="h-12 px-8 border-2 gap-2 text-slate-700 dark:text-slate-200"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Buat Pesanan Baru
                                    </Button>
                                </div>
                                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                                    <PartyPopper className="h-4 w-4 text-emerald-500" />
                                    Riwayat dapat Anda pantau di Dasbor dan status bisa diperbarui kapan saja.
                                </p>
                            </div>
                        </div>
                    </FormStep>
            </div>
        </div>
    );
};

export default PemesananForm;

