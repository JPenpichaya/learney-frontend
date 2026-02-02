import { Star, Sparkles } from "lucide-react";

const testimonials = [
  {
    name: "คุณมิ้นท์",
    role: "พนักงานบริษัท",
    content: "เรียนภาษาอังกฤษมาหลายที่แล้ว แต่ที่นี่คือที่แรกที่ทำให้รู้สึกว่า \"อ๋อ เข้าใจแล้ว\" จริง ๆ เพราะมีเส้นทางชัดเจน ไม่ต้องเดาว่าควรเรียนอะไรต่อ",
    rating: 5,
  },
  {
    name: "คุณเบส",
    role: "นักศึกษาปี 3",
    content: "Feedback จากครูช่วยมาก! ก่อนหน้านี้ทำแบบฝึกหัดไปเรื่อย ๆ ไม่รู้ว่าถูกหรือผิด พอมีครูช่วยดู รู้เลยว่าต้องปรับตรงไหน",
    rating: 5,
  },
  {
    name: "คุณแนน",
    role: "เจ้าของธุรกิจ",
    content: "ชอบที่เรียนได้ตามเวลาว่าง ไม่ต้องนัดเรียนสด แต่ก็ยังมีครูคอยดูให้ ราคาคุ้มมาก ๆ เมื่อเทียบกับเรียนครูส่วนตัว",
    rating: 5,
  },
  {
    name: "คุณต้น",
    role: "โปรแกรมเมอร์",
    content: "เป็นคนที่เรียนภาษาอังกฤษด้วยตัวเองมาตลอด แต่ไม่เคยมั่นใจ พอมาเรียนที่นี่และได้ Feedback ทำให้รู้สึกว่ากำลังไปถูกทาง",
    rating: 5,
  },
];

// Floating star component
const FloatingStar = ({ 
  className, 
  delay = "0s", 
  size = "w-3 h-3" 
}: { 
  className?: string; 
  delay?: string; 
  size?: string;
}) => (
  <div 
    className={`absolute ${size} ${className}`}
    style={{ 
      animation: `float 3s ease-in-out infinite`,
      animationDelay: delay 
    }}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" className="text-[hsl(48,95%,70%)] drop-shadow-[0_0_6px_hsl(48,95%,70%)]">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  </div>
);

const TestimonialsSection = () => {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[hsl(260,60%,15%)] via-[hsl(255,50%,25%)] to-[hsl(250,45%,20%)]">
      {/* Dreamy background effects */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[hsl(280,70%,40%)] rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[hsl(35,90%,60%)] rounded-full blur-[100px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(270,60%,50%)] rounded-full blur-[150px] opacity-15" />
      </div>

      {/* Floating stars */}
      <FloatingStar className="top-[10%] left-[5%]" delay="0s" size="w-4 h-4" />
      <FloatingStar className="top-[15%] right-[10%]" delay="0.5s" size="w-3 h-3" />
      <FloatingStar className="top-[25%] left-[15%]" delay="1s" size="w-2 h-2" />
      <FloatingStar className="top-[20%] right-[25%]" delay="1.5s" size="w-5 h-5" />
      <FloatingStar className="top-[40%] left-[8%]" delay="2s" size="w-3 h-3" />
      <FloatingStar className="top-[60%] right-[5%]" delay="0.3s" size="w-4 h-4" />
      <FloatingStar className="top-[70%] left-[20%]" delay="0.8s" size="w-2 h-2" />
      <FloatingStar className="bottom-[15%] right-[15%]" delay="1.2s" size="w-3 h-3" />
      <FloatingStar className="bottom-[25%] left-[10%]" delay="1.8s" size="w-4 h-4" />
      <FloatingStar className="top-[50%] right-[12%]" delay="2.2s" size="w-2 h-2" />

      {/* Small sparkle dots */}
      <div className="absolute top-[30%] left-[30%] w-1 h-1 bg-[hsl(48,95%,80%)] rounded-full animate-pulse" />
      <div className="absolute top-[45%] right-[20%] w-1.5 h-1.5 bg-[hsl(48,95%,80%)] rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
      <div className="absolute bottom-[40%] left-[25%] w-1 h-1 bg-[hsl(280,70%,80%)] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[65%] left-[45%] w-1.5 h-1.5 bg-[hsl(48,95%,80%)] rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[hsl(48,95%,70%)]" />
            <p className="text-[hsl(48,95%,75%)] font-medium tracking-wide">
              เสียงจากผู้เรียน
            </p>
            <Sparkles className="w-5 h-5 text-[hsl(48,95%,70%)]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(0,0%,98%)] mb-4">
            หลายคนเปลี่ยนไปแล้ว
            <br />
            <span className="bg-gradient-to-r from-[hsl(280,70%,70%)] via-[hsl(300,60%,75%)] to-[hsl(48,90%,70%)] bg-clip-text text-transparent">
              คุณก็ทำได้
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-[hsl(260,40%,20%)]/60 backdrop-blur-md rounded-2xl p-6 border border-[hsl(280,50%,50%)]/30 hover:border-[hsl(48,90%,60%)]/50 transition-all duration-500 hover:shadow-[0_0_30px_hsl(280,60%,50%,0.3)]"
            >
              {/* Card glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(280,60%,50%)]/0 via-transparent to-[hsl(48,90%,60%)]/0 group-hover:from-[hsl(280,60%,50%)]/10 group-hover:to-[hsl(48,90%,60%)]/10 transition-all duration-500" />
              
              {/* Rating */}
              <div className="relative flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[hsl(48,95%,65%)] text-[hsl(48,95%,65%)] drop-shadow-[0_0_4px_hsl(48,95%,65%)]"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="relative text-[hsl(270,30%,85%)] leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[hsl(280,60%,60%)] to-[hsl(48,80%,60%)] rounded-full flex items-center justify-center shadow-[0_0_15px_hsl(280,60%,50%,0.4)]">
                  <span className="text-[hsl(0,0%,98%)] font-semibold text-sm">
                    {testimonial.name.charAt(3)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[hsl(0,0%,98%)]">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-[hsl(280,40%,75%)]">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[hsl(48,80%,75%)] mt-12 flex items-center justify-center gap-2">
          <span>✨</span>
          และอีกหลายร้อยคนที่พัฒนาภาษาอังกฤษได้จริง
          <span>✨</span>
        </p>
      </div>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) rotate(10deg);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
