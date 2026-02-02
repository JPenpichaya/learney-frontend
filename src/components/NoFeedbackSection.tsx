import { AlertTriangle } from "lucide-react";

const NoFeedbackSection = () => {
  return (
    <section className="py-20 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-6">
            <AlertTriangle className="w-8 h-8 text-accent-foreground" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            ถ้าไม่มี Feedback จะเกิดอะไรขึ้น?
          </h2>

          <div className="space-y-6 text-left max-w-2xl mx-auto">
            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">ทำผิดซ้ำ ๆ โดยไม่รู้ตัว</span>
                <br />
                เมื่อไม่มีคนบอก เราอาจจะทำผิดซ้ำไปเรื่อย ๆ จนกลายเป็นนิสัย
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">ไม่มั่นใจว่าเข้าใจถูก</span>
                <br />
                ดูวิดีโอไปเยอะ แต่ก็ไม่แน่ใจว่าเข้าใจถูกต้องหรือเปล่า
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <p className="text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">พัฒนาช้ากว่าที่ควร</span>
                <br />
                การมีครูช่วยดู ช่วยให้เห็นจุดที่ต้องปรับปรุง และพัฒนาได้เร็วขึ้น
              </p>
            </div>
          </div>

          <p className="text-muted-foreground mt-8">
            แน่นอนว่าเรียนเองก็ได้ประโยชน์
            <br />
            แต่ถ้ามีครูช่วยดู จะช่วยให้ก้าวหน้าเร็วขึ้นอีกมาก 💪
          </p>
        </div>
      </div>
    </section>
  );
};

export default NoFeedbackSection;
