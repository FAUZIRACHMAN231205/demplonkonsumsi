import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import * as z from 'zod';

import { formSchema, Pemesanan } from '../../lib/schema';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import SearchableSelect from './SearchableSelect';

// --- Helper Icons (as SVG components) ---
const CheckCircle2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;


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

const PemesananForm = ({ riwayat, onFormSubmit, onReturnToDashboard }) => {
  const [step, setStep] = useState(1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { acara: "", tanggal: "", lokasi: "", jumlah: "", catatan: "" },
  });

  const uniqueAcaraNames = useMemo(() => {
    const acaraNames = new Set<string>(riwayat.map(r => r.acara));
    return Array.from(acaraNames);
  }, [riwayat]);

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);
  
  const handleFinalSubmit = (values: z.infer<typeof formSchema>) => {
    const success = onFormSubmit(values);
    if (success) {
      handleNextStep();
    }
  };
  
  const acaraValue = form.watch("acara");
  const values = form.getValues();
  const labels = { acara: "Nama Acara", tanggal: "Tanggal", lokasi: "Lokasi", jumlah: "Jumlah Porsi", catatan: "Catatan Tambahan" };

  return (
    <>
      {/* --- Stepper UI --- */}
      <div className="flex justify-center items-start gap-4 mb-8">
          {["Isi Form", "Review", "Selesai"].map((label, index) => (
              <React.Fragment key={index}>
                  <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-300 ${step > index + 1 ? 'bg-green-500 text-white' : step === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {step > index + 1 ? <CheckCircle2 /> : index + 1}
                      </div>
                      <p className={`text-xs font-semibold ${step >= index + 1 ? 'text-gray-800' : 'text-gray-400'}`}>{label}</p>
                  </div>
                  {index < 2 && <div className={`flex-1 h-1 rounded-full mt-5 ${step > index + 2 ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
          ))}
      </div>

      {/* --- Form Steps --- */}
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
                    placeholder="Ketik atau pilih nama acara"
                    options={uniqueAcaraNames}
                    value={acaraValue}
                    onChange={(val) => form.setValue("acara", val, { shouldValidate: true })}
                />
                {form.formState.errors.acara && <p className="text-sm font-medium text-red-500">{form.formState.errors.acara.message}</p>}
              </div>
              {/* Other form fields */}
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input id="tanggal" type="date" {...form.register("tanggal")} />
                {form.formState.errors.tanggal && <p className="text-sm font-medium text-red-500">{form.formState.errors.tanggal.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input id="lokasi" {...form.register("lokasi")} placeholder="Contoh: Aula Utama" />
                {form.formState.errors.lokasi && <p className="text-sm font-medium text-red-500">{form.formState.errors.lokasi.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jumlah">Jumlah Porsi</Label>
                <Input id="jumlah" type="number" {...form.register("jumlah")} placeholder="50" />
                {form.formState.errors.jumlah && <p className="text-sm font-medium text-red-500">{form.formState.errors.jumlah.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                <Input id="catatan" {...form.register("catatan")} placeholder="Contoh: 5 porsi vegetarian" />
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onReturnToDashboard}>Batal</Button>
            <Button onClick={form.handleSubmit(handleNextStep)}>Lanjut ke Review</Button>
          </CardFooter>
        </Card>
      </FormStep>

      <FormStep step={2} currentStep={step}>
        <Card>
          <CardHeader><CardTitle>Review Pesanan Anda</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(values).map(([key, val]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-slate-500">{labels[key]}:</span>
                <span className="font-medium text-slate-900 text-right">{String(val) || "-"}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrevStep}>Kembali</Button>
            <Button onClick={form.handleSubmit(handleFinalSubmit)}>Kirim Pesanan</Button>
          </CardFooter>
        </Card>
      </FormStep>
      
      <FormStep step={3} currentStep={step}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <div className="text-green-500 w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
                <CheckCircle2 />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Pemesanan Berhasil!</h2>
            <p className="text-gray-600 mt-2">Pesanan Anda telah ditambahkan ke riwayat.</p>
            <Button onClick={onReturnToDashboard} className="mt-6">
                Kembali ke Dasbor
            </Button>
        </motion.div>
      </FormStep>
    </>
  );
};

export default PemesananForm;

