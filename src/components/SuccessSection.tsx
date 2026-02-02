import { Smile, BookOpen, MessageCircle, Target } from "lucide-react";

const successPoints = [
  {
    icon: Smile,
    title: "มั่นใจมากขึ้น",
    description: "รู้ว่าตัวเองเข้าใจถูกต้อง ไม่ต้องลังเลอีกต่อไป",
  },
  {
    icon: BookOpen,
    title: "เข้าใจโครงสร้างภาษา",
    description: "เห็นภาพรวมของภาษาอังกฤษชัดเจน เชื่อมโยงได้",
  },
  {
    icon: MessageCircle,
    title: "กล้าพูด กล้าเขียน",
    description: "มีความมั่นใจที่จะใช้ภาษาอังกฤษในชีวิตจริง",
  },
  {
    icon: Target,
    title: "รู้ว่ากำลังไปถูกทาง",
    description: "ไม่หลงทาง ไม่ต้องเดา รู้ว่าต้องทำอะไรต่อ",
  },
];

const SuccessSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent-foreground font-medium mb-3">
            หลังจากเรียนจบ
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            ลองจินตนาการดู...
            <br />
            <span className="text-primary">ถ้าคุณรู้สึกแบบนี้</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {successPoints.map((point, index) => (
            <div
              key={index}
              className="bg-background rounded-xl p-8 border border-border shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-xl mb-2">
                    {point.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12 text-lg max-w-2xl mx-auto">
          นี่คือความรู้สึกที่ผู้เรียนหลายคนได้รับ
          <br />
          หลังจากเรียนคอร์สเต็มและได้รับ Feedback จากครู ✨
        </p>
      </div>
    </section>
  );
};

export default SuccessSection;
