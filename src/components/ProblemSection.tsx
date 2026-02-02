import { AlertCircle, HelpCircle, RefreshCw, TrendingDown } from "lucide-react";

const problems = [
  {
    icon: HelpCircle,
    title: "เรียนคนเดียวแล้วงง",
    description: "ดูวิดีโอไปเยอะ แต่ไม่รู้ว่าเข้าใจถูกหรือเปล่า",
  },
  {
    icon: AlertCircle,
    title: "ไม่รู้ควรเริ่มจากไหน",
    description: "มีเนื้อหามากมาย แต่ไม่รู้ว่าบทไหนควรเรียนก่อน",
  },
  {
    icon: RefreshCw,
    title: "เรียนซ้ำหลายรอบ",
    description: "เคยเรียนมาหลายครั้ง แต่ก็ลืมหมด ไม่เห็นผลจริง",
  },
  {
    icon: TrendingDown,
    title: "พยายามแล้วก็ไม่ก้าวหน้า",
    description: "รู้สึกท้อ อยากมีคนบอกว่าทำถูกหรือผิด",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-accent-foreground font-medium mb-3">
            คุณรู้สึกแบบนี้ไหม?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
            เรียนภาษาอังกฤษมาตั้งนาน
            <br />
            <span className="text-muted">แต่ทำไมยังไม่เห็นผล</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-background rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent rounded-lg shrink-0">
                  <problem.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-12 max-w-2xl mx-auto">
          ถ้าคุณรู้สึกแบบนี้... คุณไม่ได้อยู่คนเดียว
          <br />
          การเรียนภาษาอังกฤษคนเดียวมันยากจริง ๆ
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;
