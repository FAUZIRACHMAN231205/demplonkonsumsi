import React, { useState, useMemo, forwardRef, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";

// --- UTILITY: Class Name Merger ---
function cn(...inputs) {
    const classes = new Set();
    inputs.forEach(arg => {
        if (!arg) return;
        if (typeof arg === 'string' || typeof arg === 'number') {
            classes.add(String(arg));
        } else if (Array.isArray(arg)) {
            arg.forEach(c => c && classes.add(String(c)));
        } else if (typeof arg === 'object') {
            Object.keys(arg).forEach(key => arg[key] && classes.add(key));
        }
    });
    return Array.from(classes).join(' ');
}

// --- SCHEMA DEFINITION ---
const konsumsiItemSchema = z.object({
  jenis: z.string().min(1, "Jenis harus dipilih."),
  satuan: z.string().min(1, "Satuan harus dipilih."),
  qty: z.string().refine((val) => /^\d+$/.test(val) && parseInt(val, 10) > 0, {
    message: "Qty harus > 0.",
  }),
});

const formSchema = z.object({
  acara: z.string().min(3, "Nama acara harus diisi (minimal 3 karakter)."),
  tanggalPermintaan: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Tanggal permintaan harus valid.",
  }),
  tanggalPengiriman: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Tanggal pengiriman harus valid.",
  }),
  waktu: z.string().min(1, "Waktu harus dipilih."),
  lokasi: z.string().min(3, "Lokasi harus diisi (minimal 3 karakter)."),
  tamu: z.string().min(1, "Jenis tamu harus dipilih."),
  yangMengajukan: z.string().min(3, "Yang mengajukan harus dipilih."),
  untukBagian: z.string().min(3, "Bagian harus dipilih."),
  approval: z.string().min(3, "Approval harus dipilih."),
  konsumsi: z.array(konsumsiItemSchema).min(1, "Minimal harus ada satu jenis konsumsi."),
  catatan: z.string().optional(),
});


// --- UI COMPONENTS ---
const Button = forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-600/90",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-slate-300 hover:bg-slate-100",
        secondary: "bg-slate-200 text-slate-800 hover:bg-slate-200/80",
        ghost: "hover:bg-slate-100",
    };
    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
    };
    return <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />;
});

const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-lg border bg-white text-slate-900 shadow-sm", className)} {...props} />
));
const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-500", className)} {...props} />
));
const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));

const Input = forwardRef(({ className, icon, ...props }, ref) => (
    <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input className={cn("flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-70", icon ? "pl-10 pr-3" : "px-3", className)} ref={ref} {...props} />
    </div>
));

const Label = forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />
));

// --- HELPER ICONS FOR COMPONENTS ---
const CheckCircle2 = ({className=""}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></svg>;
const ChevronDown = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>;
const SearchIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const Trash2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>;
const InfoIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const AlertTriangleIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></svg>;
const CalendarDays = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
const Users = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const File = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>

// --- Info Card Component ---
const InfoCard = ({ icon, title, children, variant = 'info' }) => {
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
const SearchableSelect = ({ options, value, onChange, placeholder = "Pilih opsi...", icon }) => {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const filteredOptions = useMemo(() =>
        options.filter(opt =>
            opt.label?.toLowerCase().includes(search.toLowerCase())
        ),
    [options, search]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
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

    const handleOptionClick = (val) => {
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
                    "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-transparent py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
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
                                className="w-full rounded-md border border-gray-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
const FormStep = ({ children, step, currentStep }) => {
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

const specialKonsumsiByWaktu = {
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

const PemesananForm = ({ riwayat = [], onFormSubmit, onReturnToDashboard }) => {
    const [step, setStep] = useState(1);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acara: "",
            tanggalPermintaan: "",
            tanggalPengiriman: "",
            waktu: "",
            lokasi: "",
            tamu: "standar",
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

    const handleFinalSubmit = (values) => {
        const success = onFormSubmit(values);
        if (success) {
            handleNextStep();
        }
    };

    const acaraValue = form.watch("acara");
    const lokasiValue = form.watch("lokasi");
    const tamuValue = form.watch("tamu");
    const bagianValue = form.watch("untukBagian");
    const approvalValue = form.watch("approval");

    const values = form.getValues();
    const labels = {
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
                        icon={<InfoIcon className="h-6 w-6" />}
                        title="Informasi Order"
                    >
                        <p>Order dilakukan minimal H-1 kegiatan</p>
                        <p>Order dapat dilakukan pada pukul 07:00 - 14:00</p>
                    </InfoCard>
                    <InfoCard
                        variant="warning"
                        icon={<AlertTriangleIcon className="h-6 w-6" />}
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
                                {step > index + 1 ? <CheckCircle2 /> : index + 1}
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

            {/* Step 1 */}
            <FormStep step={1} currentStep={step}>
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
                                    className="bg-slate-100"
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
            <FormStep step={2} currentStep={step}>
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
            <FormStep step={3} currentStep={step}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center bg-white p-8 rounded-lg shadow-md border border-gray-200"
                >
                    <div className="text-green-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
                        <CheckCircle2 />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Pemesanan Berhasil!</h2>
                    <p className="text-gray-600 mt-2">Pesanan Anda telah ditambahkan ke riwayat.</p>
                    <Button onClick={onReturnToDashboard} className="mt-6">Kembali ke Dasbor</Button>
                </motion.div>
            </FormStep>
        </div>
    );
};

export default PemesananForm;

