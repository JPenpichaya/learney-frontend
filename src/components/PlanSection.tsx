import { Play, FileText, MessageSquare, Sparkles } from "lucide-react";

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

const steps = [
  {
    number: "1",
    icon: Play,
    title: "ดูวิดีโอสั้น ๆ",
    description: "วิดีโออธิบายเข้าใจง่าย ดูได้เมื่อไหร่ก็ได้ ตามจังหวะของคุณ",
  },
  {
    number: "2",
    icon: FileText,
    title: "ฝึกทำ Worksheet",
    description: "ฝึกใช้สิ่งที่เรียนมา ด้วยแบบฝึกหัดที่ออกแบบมาให้ใช้งานจริงได้",
  },
  {
    number: "3",
    icon: MessageSquare,
    title: "รับ Feedback จากครู",
    description: "ในแพ็กเกจเต็ม ครูจะช่วยดูงานและบอกว่าควรปรับปรุงตรงไหน",
  },
];

const PlanSection = () => {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, hsl(258, 55%, 18%), hsl(258, 50%, 22%))' }}>
      {/* Floating Stars */}
      <FloatingStar delay={0.3} left="8%" top="20%" size={18} />
      <FloatingStar delay={1.8} left="92%" top="25%" size={14} />
      <FloatingStar delay={0.5} left="20%" top="80%" size={16} />
      <FloatingStar delay={2.2} left="75%" top="75%" size={20} />
      <FloatingStar delay={1} left="45%" top="10%" size={12} />

      {/* Glowing Orbs */}
      <div className="absolute top-40 right-20 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: 'hsl(258, 70%, 55%)' }} />
      <div className="absolute bottom-10 left-20 w-60 h-60 rounded-full opacity-20 blur-3xl" style={{ background: 'hsl(45, 85%, 55%)' }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
      `}</style>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="font-medium mb-3" style={{ color: 'hsl(45, 80%, 65%)' }}>
            วิธีการเรียนง่าย ๆ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            แค่ 3 ขั้นตอน
            <br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, hsl(45, 90%, 65%), hsl(35, 90%, 55%))' }}>
              ก็พัฒนาภาษาอังกฤษได้จริง
            </span>
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5" style={{ background: 'linear-gradient(to right, hsla(258, 50%, 50%, 0.5), hsla(258, 50%, 50%, 0.1))' }} />
                )}
                
                <div className="relative rounded-2xl p-8 text-center backdrop-blur-md border transition-all duration-300 hover:scale-105 group" style={{ background: 'hsla(258, 50%, 25%, 0.4)', borderColor: 'hsla(258, 50%, 50%, 0.3)' }}>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 transition-shadow duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, hsl(258, 70%, 55%), hsl(280, 70%, 50%))',
                      color: 'white',
                      boxShadow: '0 0 20px hsla(258, 70%, 55%, 0.4)'
                    }}
                  >
                    {step.number}
                  </div>
                  
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsla(45, 80%, 60%, 0.15)' }}>
                    <step.icon className="w-7 h-7" style={{ color: 'hsl(45, 80%, 65%)' }} />
                  </div>
                  
                  <h3 className="font-semibold text-xl mb-3 text-white">
                    {step.title}
                  </h3>
                  
                  <p className="leading-relaxed" style={{ color: 'hsl(258, 30%, 70%)' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-12 text-lg" style={{ color: 'hsl(45, 80%, 70%)' }}>
            ไม่ยาก และทำได้จริง ✨
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlanSection;
