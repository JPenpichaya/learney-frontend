const Footer = () => {
  return (
    <footer id="Contact" className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg font-medium mb-4">
            เรียนภาษาอังกฤษ ชัดเจน ไม่หลงทาง
          </p>
          <p className="text-background/60 text-sm mb-8">
            คอร์สออนไลน์ที่มีเส้นทางการเรียนชัดเจน พร้อมครูให้ Feedback
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-background/60 mb-8">
            <a href="#" className="hover:text-background transition-colors">
              เกี่ยวกับเรา
            </a>
            <a href="#" className="hover:text-background transition-colors">
              ติดต่อ
            </a>
            <a href="#" className="hover:text-background transition-colors">
              นโยบายความเป็นส่วนตัว
            </a>
            <a href="#" className="hover:text-background transition-colors">
              เงื่อนไขการใช้งาน
            </a>
          </div>

          <div className=" flex flex-wrap justify-center gap-6 text-sm text-background/60 mb-8">
            <a href=""><img src="./img/icon/TwitterX_icon.svg" className=""/></a>
            <a href=""><img src="./img/icon/Facebook_icon.svg" className=""/></a>
            <a href=""><img src="./img/icon/TikTok_icon.svg" className=""/></a>

          </div>

          <p className="text-background/40 text-sm">
            © 2024 English Course. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
