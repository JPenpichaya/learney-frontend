import { CheckCircle } from "lucide-react";

const benefits = [
  "มีลำดับการเรียนที่ชัดเจน ไม่ต้องเดาว่าควรเรียนอะไรต่อ",
  "เรียนเมื่อไหร่ก็ได้ ตามจังหวะของตัวเอง",
  "มี Worksheet ให้ฝึกใช้งานจริง",
  "แพ็กเกจเต็มมีครูช่วยดูงาน ให้ Feedback",
  "ออกแบบมาให้เข้าใจง่าย ไม่ซับซ้อน",
];

const WhyDifferentSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent-foreground font-medium mb-3">
                ทำไมคอร์สนี้ถึงต่าง
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                ไม่ใช่แค่วิดีโอ
                <br />
                <span className="text-primary">แต่คือเส้นทางที่ชัดเจน</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                คอร์สออนไลน์ทั่วไปมักจะเป็นแค่วิดีโอเยอะ ๆ 
                แต่ไม่มีโครงสร้าง ไม่มีคนบอกว่าถูกหรือผิด
                <br /><br />
                คอร์สนี้ออกแบบมาเพื่อให้คุณ "เห็นทาง" ที่ชัดเจน
                และมีครูคอยช่วยดูในแพ็กเกจเต็ม
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 border border-border shadow-md">
              <h3 className="font-semibold text-card-foreground text-lg mb-6">
                สิ่งที่คุณจะได้
              </h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferentSection;
