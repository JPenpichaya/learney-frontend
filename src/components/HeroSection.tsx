import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

// Floating star component for dreamy effect
const FloatingStar = ({ className, delay, size = 4 }: { className?: string; delay?: string; size?: number }) => (
  <div 
    className={`absolute text-primary/60 animate-pulse ${className}`}
    style={{ 
      animationDelay: delay,
      animationDuration: '3s'
    }}
  >
    <Sparkles className={`w-${size} h-${size}`} style={{ width: size * 4, height: size * 4 }} />
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="เรียนภาษาอังกฤษอย่างมั่นใจ"
          className="w-full h-full object-cover"
        />
        {/* Dreamy gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(258,60%,15%,0.85)] via-[hsl(258,50%,20%,0.75)] to-[hsl(258,60%,12%,0.9)]" />
      </div>

      {/* Floating Stars */}
      <FloatingStar className="top-[10%] left-[5%]" delay="0s" size={3} />
      <FloatingStar className="top-[20%] right-[10%]" delay="0.5s" size={4} />
      <FloatingStar className="top-[40%] left-[15%]" delay="1s" size={2} />
      <FloatingStar className="top-[60%] right-[5%]" delay="1.5s" size={3} />
      <FloatingStar className="top-[80%] left-[8%]" delay="2s" size={2} />
      <FloatingStar className="top-[15%] left-[40%]" delay="0.3s" size={2} />
      <FloatingStar className="top-[70%] right-[20%]" delay="1.2s" size={3} />
      <FloatingStar className="bottom-[15%] left-[25%]" delay="0.8s" size={2} />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(45,80%,50%,0.15)] rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Glassmorphism badge */}
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-[hsl(45,80%,60%)]" />
            เส้นทางการเรียนที่ชัดเจน
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight drop-shadow-lg">
            เรียนภาษาอังกฤษ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[hsl(280,90%,75%)] to-[hsl(45,80%,60%)]">
              ชัดเจน ไม่หลงทาง
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            คอร์สออนไลน์ที่มีเส้นทางการเรียนชัดเจน เรียนตามจังหวะของตัวเอง
            <br className="hidden md:block" />
            พร้อมครูให้ Feedback งานในแพ็กเกจเต็ม
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" variant="hero" className="text-lg px-8 py-6 shadow-[0_0_30px_hsl(var(--primary)/0.4)]">
              เริ่มเรียนเลย
            </Button>
            <Button size="lg" variant="heroOutline" className="text-lg px-8 py-6 backdrop-blur-md">
              ลองเรียน 1 บาท
            </Button>
          </div>

          <p className="text-primary-foreground/70 text-sm pt-2 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[hsl(45,80%,60%)]" />
            มีผู้เรียนมากกว่า 1,000+ คนแล้ว
          </p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2 backdrop-blur-sm bg-primary/10">
          <div className="w-1.5 h-3 bg-primary-foreground/70 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
