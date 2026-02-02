import { Heart, Award, Users, Sparkles } from "lucide-react";

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

const GuideSection = () => {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, hsl(258, 60%, 12%), hsl(258, 55%, 18%))' }}>
      {/* Floating Stars */}
      <FloatingStar delay={0} left="5%" top="10%" size={20} />
      <FloatingStar delay={1.5} left="90%" top="15%" size={14} />
      <FloatingStar delay={0.8} left="15%" top="70%" size={18} />
      <FloatingStar delay={2} left="85%" top="60%" size={16} />
      <FloatingStar delay={1.2} left="50%" top="5%" size={12} />

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: 'hsl(258, 70%, 50%)' }} />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: 'hsl(45, 90%, 60%)' }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
      `}</style>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Empathy */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-md border" style={{ background: 'hsla(45, 80%, 60%, 0.15)', borderColor: 'hsla(45, 80%, 60%, 0.3)', color: 'hsl(45, 80%, 70%)' }}>
              <Heart className="w-4 h-4" />
              เราเข้าใจ
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              เราเข้าใจว่าการเรียนภาษาอังกฤษ
              <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, hsl(45, 90%, 65%), hsl(35, 90%, 55%))' }}>
                คนเดียวมันยากแค่ไหน
              </span>
            </h2>
            
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'hsl(258, 30%, 75%)' }}>
              หลายคนพยายามเรียนด้วยตัวเอง ดูวิดีโอ อ่านหนังสือ 
              แต่สุดท้ายก็ไม่รู้ว่าเข้าใจถูกหรือเปล่า
              ไม่มีใครบอกว่าควรเรียนอะไรต่อ
            </p>
          </div>

          {/* Authority */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105" style={{ background: 'hsla(258, 50%, 30%, 0.3)', borderColor: 'hsla(258, 50%, 50%, 0.3)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(258, 70%, 60%, 0.2)' }}>
                <Award className="w-8 h-8" style={{ color: 'hsl(258, 70%, 70%)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                ออกแบบโดยครูผู้เชี่ยวชาญ
              </h3>
              <p style={{ color: 'hsl(258, 30%, 70%)' }}>
                คอร์สถูกออกแบบจากประสบการณ์สอนจริง มีโครงสร้างชัดเจน
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105" style={{ background: 'hsla(258, 50%, 30%, 0.3)', borderColor: 'hsla(258, 50%, 50%, 0.3)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(258, 70%, 60%, 0.2)' }}>
                <Users className="w-8 h-8" style={{ color: 'hsl(258, 70%, 70%)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                มี Feedback จากครู
              </h3>
              <p style={{ color: 'hsl(258, 30%, 70%)' }}>
                ในแพ็กเกจเต็ม มีครูช่วยดูงาน บอกว่าถูกหรือผิด
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105" style={{ background: 'hsla(258, 50%, 30%, 0.3)', borderColor: 'hsla(258, 50%, 50%, 0.3)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(258, 70%, 60%, 0.2)' }}>
                <Sparkles className="w-8 h-8" style={{ color: 'hsl(45, 90%, 65%)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                เส้นทางที่ชัดเจน
              </h3>
              <p style={{ color: 'hsl(258, 30%, 70%)' }}>
                ไม่ต้องเดาว่าควรเรียนอะไรต่อ ทุกอย่างเรียงลำดับไว้ให้
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideSection;
