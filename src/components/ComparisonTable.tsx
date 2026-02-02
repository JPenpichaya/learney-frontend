import { CheckCircle, X } from "lucide-react";

const features = [
  {
    name: "เข้าถึงบทเรียน",
    trial: "บางส่วน",
    full: "ทั้งหมด",
    trialCheck: true,
    fullCheck: true,
  },
  {
    name: "Worksheet แบบฝึกหัด",
    trial: "จำกัด",
    full: "ครบทุกบท",
    trialCheck: true,
    fullCheck: true,
  },
  {
    name: "Feedback จากครู",
    trial: "ไม่มี",
    full: "มี",
    trialCheck: false,
    fullCheck: true,
  },
  {
    name: "เส้นทางการเรียน",
    trial: "ลองดู",
    full: "พัฒนาได้จริง",
    trialCheck: true,
    fullCheck: true,
  },
  {
    name: "คำแนะนำส่วนตัว",
    trial: "ไม่มี",
    full: "มี",
    trialCheck: false,
    fullCheck: true,
  },
];

const ComparisonTable = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            เปรียบเทียบแพ็กเกจ
          </h2>
          <p className="text-muted-foreground text-lg">
            ดูความแตกต่างระหว่าง 2 แพ็กเกจ
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-muted-foreground font-medium">
                    รายละเอียด
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-lg">🪙</span>
                      <span className="font-medium text-foreground">1 บาท</span>
                    </span>
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                      <span className="text-lg">💎</span>
                      <span className="font-medium text-primary">500+ บาท</span>
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-4 px-4 text-foreground">
                      {feature.name}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {feature.trialCheck ? (
                          <CheckCircle className="w-5 h-5 text-muted" />
                        ) : (
                          <X className="w-5 h-5 text-muted" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {feature.trial}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground font-medium">
                          {feature.full}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
