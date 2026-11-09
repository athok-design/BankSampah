import Image from "next/image";

// Logo BankSampah. variant "terang" untuk latar putih, "gelap" untuk sidebar hijau tua.
export default function Logo({ variant = "terang", ukuran = "md", tagline = false }) {
  const besar = ukuran === "lg";
  if (variant === "gelap") {
    return (
      <div className="flex items-center gap-2.5">
        <Image src="/logo-square.png" alt="" width={36} height={36} className="rounded-lg" />
        <span className="text-lg font-bold tracking-tight text-white">
          Bank<span className="text-emerald-300">Sampah</span>
        </span>
      </div>
    );
  }
  return (
    <div className={`flex ${besar ? "flex-col" : "flex-row"} items-center gap-2`}>
      <Image
        src="/logo.png"
        alt="Logo BankSampah"
        width={besar ? 72 : 36}
        height={besar ? 78 : 39}
        priority
      />
      <div className={besar ? "text-center" : ""}>
        <p className={`${besar ? "text-2xl" : "text-lg"} font-bold tracking-tight leading-tight`}>
          <span className="text-emerald-800">Bank</span>
          <span className="text-emerald-600">Sampah</span>
        </p>
        {tagline && <p className="text-xs font-medium text-emerald-700">Menabung Menjaga Lingkungan</p>}
      </div>
    </div>
  );
}
