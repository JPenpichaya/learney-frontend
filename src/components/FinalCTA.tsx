import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

// Floating star component for dreamy effect
const FloatingStar = ({ className, delay, size = 4 }: { className?: string; delay?: string; size?: number }) => (
  <div 
    className={`absolute text-[hsl(45,80%,60%)] opacity-60 ${className}`}
    style={{ 
      animation: `float 6s ease-in-out infinite`,
      animationDelay: delay
    }}
  >
    <Sparkles style={{ width: size * 4, height: size * 4 }} />
  </div>
);

const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[hsl(258,60%,20%)] via-[hsl(258,50%,25%)] to-[hsl(258,60%,15%)]">
      {/* Floating Stars */}
      <FloatingStar className="top-[10%] left-[5%]" delay="0s" size={3} />
      <FloatingStar className="top-[20%] right-[10%]" delay="0.8s" size={4} />
      <FloatingStar className="top-[50%] left-[10%]" delay="1.5s" size={2} />
      <FloatingStar className="top-[70%] right-[8%]" delay="2s" size={3} />
      <FloatingStar className="bottom-[20%] left-[20%]" delay="0.5s" size={2} />
      <FloatingStar className="top-[30%] right-[25%]" delay="1.2s" size={2} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(45,80%,50%,0.15)] rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[hsl(280,70%,50%,0.1)] rounded-full blur-3xl" />

      {/* Decorative circles */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border border-[hsl(45,80%,60%)] rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-primary/50 rounded-full" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-[hsl(280,70%,60%)] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Glassmorphism badge */}
          <div className="inline-flex items-center gap-2 bg-[hsl(45,80%,60%,0.15)] backdrop-blur-md border border-[hsl(45,80%,60%,0.3)] text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-[hsl(45,80%,60%)]" />
            พร้อมเริ่มเรียนแล้วหรือยัง?
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6 drop-shadow-lg">
            เลือกระดับการสนับสนุน
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(45,80%,60%)] via-[hsl(280,90%,75%)] to-primary">
              ที่เหมาะกับคุณ
            </span>
          </h2>

          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            ไม่ว่าจะลองเรียนก่อน หรือเริ่มเต็มที่เลย
            <br />
            คุณก็จะได้เส้นทางการเรียนที่ชัดเจน
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#Courespackage">
                <Button size="lg" variant="hero" className="text-lg px-8 py-6 group shadow-[0_0_40px_hsl(45,80%,50%,0.3)]">
                    เริ่มคอร์สเต็ม พร้อมพัฒนาอย่างเห็นผล
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </a>
              <a href="#Courespackage"><Button size="lg" variant="heroOutline" className="text-lg px-8 py-6 backdrop-blur-md">
                  ลองเรียน 1 บาทก่อน
              </Button></a>

          </div>

          <p className="text-primary-foreground/60 text-sm mt-8 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-[hsl(45,80%,60%)]" />
            เริ่มเรียนได้ทันทีหลังจากชำระเงิน • ดูได้ตลอดชีพ
            <Sparkles className="w-3 h-3 text-[hsl(45,80%,60%)]" />
          </p>
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </section>
  );
};

export default FinalCTA;
