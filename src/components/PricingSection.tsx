import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, X } from "lucide-react";

const FloatingStar = ({ delay, left, top, size = 16 }: { delay: number; left: string; top: string; size?: number }) => (
  <div 
    className="absolute animate-pulse"
    style={{ 
      left, 
      top, 
      animationDelay: `${delay}s`,
      animation: `float ${3 + delay}s ease-in-out infinite`
    }}
  >
    <Sparkles className="text-amber-300/40" style={{ width: size, height: size }} />
  </div>
);

const PricingSection = () => {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, hsl(258, 50%, 22%), hsl(258, 55%, 16%))' }}>
      {/* Floating Stars */}
      <FloatingStar delay={0.5} left="10%" top="15%" size={18} />
      <FloatingStar delay={1.3} left="88%" top="20%" size={14} />
      <FloatingStar delay={0.8} left="5%" top="70%" size={16} />
      <FloatingStar delay={2} left="95%" top="65%" size={20} />
      <FloatingStar delay={1.5} left="55%" top="8%" size={12} />

      {/* Glowing Orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'hsl(258, 70%, 50%)' }} />
      <div className="absolute bottom-20 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'hsl(45, 90%, 55%)' }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
      `}</style>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="font-medium mb-3" style={{ color: 'hsl(45, 80%, 65%)' }}>
            เลือกแพ็กเกจที่เหมาะกับคุณ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            เริ่มเรียนได้ทันที
          </h2>
          <p className="text-lg" style={{ color: 'hsl(258, 30%, 75%)' }}>
            ลองเรียนก่อนก็ได้ หรือเริ่มเต็มที่เลยก็ได้
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Trial Package */}
          <div className="rounded-2xl p-8 backdrop-blur-md border transition-all duration-300 hover:scale-105" style={{ background: 'hsla(258, 50%, 25%, 0.4)', borderColor: 'hsla(258, 50%, 50%, 0.3)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🪙</span>
              <span className="text-sm font-medium" style={{ color: 'hsl(258, 30%, 70%)' }}>
                ทดลองเรียน
              </span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">1</span>
                <span className="pb-1" style={{ color: 'hsl(258, 30%, 70%)' }}>บาท</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(258, 70%, 70%)' }} />
                <span style={{ color: 'hsl(258, 30%, 75%)' }}>วิดีโอบางส่วน</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(258, 70%, 70%)' }} />
                <span style={{ color: 'hsl(258, 30%, 75%)' }}>Worksheet จำกัด</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(258, 70%, 70%)' }} />
                <span style={{ color: 'hsl(258, 30%, 75%)' }}>เข้าใจรูปแบบคอร์ส</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <X className="w-5 h-5 shrink-0" style={{ color: 'hsl(258, 30%, 50%)' }} />
                <span style={{ color: 'hsl(258, 30%, 60%)' }}>ไม่มี Feedback ครู</span>
              </li>
            </ul>

            <p className="text-sm mb-6" style={{ color: 'hsl(258, 30%, 65%)' }}>
              เหมาะสำหรับคนที่อยากลองวิธีการเรียนก่อน
            </p>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full border-2 transition-all duration-300"
              style={{ 
                borderColor: 'hsla(258, 50%, 60%, 0.5)',
                color: 'hsl(258, 30%, 80%)',
                background: 'hsla(258, 50%, 30%, 0.3)'
              }}
            >
              เริ่มเรียน 1 บาท
            </Button>
          </div>

          {/* Full Package */}
          <div className="rounded-2xl p-8 backdrop-blur-md border-2 relative transition-all duration-300 hover:scale-105" style={{ background: 'hsla(45, 50%, 50%, 0.1)', borderColor: 'hsla(45, 80%, 60%, 0.5)', boxShadow: '0 0 40px hsla(45, 80%, 50%, 0.2)' }}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="text-xs font-medium px-4 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, hsl(45, 90%, 55%), hsl(35, 90%, 50%))', color: 'hsl(258, 50%, 15%)' }}>
                ✨ แนะนำ
              </span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: 'hsl(45, 90%, 65%)' }} />
              <span className="text-sm font-medium" style={{ color: 'hsl(45, 80%, 65%)' }}>
                คอร์สเต็ม + Feedback ครู
              </span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">2,999</span>
                <span className="pb-1" style={{ color: 'hsl(45, 60%, 70%)' }}>บาท</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(45, 90%, 60%)' }} />
                <span className="text-white">เข้าถึงบทเรียนทั้งหมด</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(45, 90%, 60%)' }} />
                <span className="text-white">Worksheet ครบทุกบท</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(45, 90%, 60%)' }} />
                <span className="text-white font-medium">ครูให้ Feedback งาน</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 shrink-0" style={{ color: 'hsl(45, 90%, 60%)' }} />
                <span className="text-white">เส้นทางการเรียนชัดเจน</span>
              </li>
            </ul>

            <p className="text-sm font-medium mb-6" style={{ color: 'hsl(45, 80%, 70%)' }}>
              "เหมาะสำหรับคนที่ไม่อยากเรียนคนเดียวอีกต่อไป"
            </p>

            <Button 
              size="lg" 
              className="w-full transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, hsl(45, 90%, 55%), hsl(35, 90%, 50%))',
                color: 'hsl(258, 50%, 15%)',
                boxShadow: '0 0 30px hsla(45, 90%, 50%, 0.4)'
              }}
            >
              ปลดล็อกคอร์สเต็ม + Feedback ครู
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
