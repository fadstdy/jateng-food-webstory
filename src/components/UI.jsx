export const SourceTag = ({ text = "Sumber: BPS" }) => (
  <div className="mt-4 text-xs text-teks-sekunder italic">{text}</div>
);

export const InsightCard = ({ title, children }) => (
  <div className="bg-putih shadow-lg p-6 rounded-xl border border-garis">
    {title && <h4 className="font-bold text-hijau-utama mb-3">{title}</h4>}
    <div className="text-teks">{children}</div>
  </div>
);

export const LegendContainer = ({ children }) => (
  <div className="absolute bottom-6 right-6 bg-putih/90 backdrop-blur-sm p-4 shadow-lg rounded-lg border border-garis z-[400]">
    {children}
  </div>
);