import { useRef } from "react";

function Intro() {
  return (
    <div className="max-w-screen min-w-full min-h-full py-5 max-h-screen flex content-center text-center">
      <div className="flex-[1.5] xl:flex-[0.5] w-full py-10 pl-20">
        <img
          src="./img/imgHome/P-ying.svg"
          alt=""
          className="w-full h-full ml-10 rounded-xl border-4 border-[#F0DA6F] object-cover"
        />
      </div>
      <div className="flex-auto p-10 flex flex-col justify-center content-center items-center text-center space-y-5">
        <div className="flex flex-col px-10 bg-[#23213B] min-w-[90%] min-h-full max-w-[20rem] rounded-xl ">
          <h1 className="text-2xl font-bold xl:Head1 my-8 xl:mt-15">
            Master Your Learning Journey
          </h1>
          <p className="text-sm text-start xl:text-xl mb-4">
            ก้าวสู่การพัฒนาทักษะอย่างมั่นใจด้วยคอร์สที่ออกแบบอย่างพิถีพิถันเรียบเรียง
            เนื้อหาและถ่ายทอดโดยผู้เชี่ยวชาญในสาขาต่าง ๆ พร้อมเนื้อหาที่เหมาะกับ
            ผู้เรียนตั้งแต่เริ่มต้นไปจนถึงผู้ที่อยากต่อยอดทักษะให้พร้อมใช้งานอยู่เสมอ
            ท่านจะได้พบกับหลักสูตรที่เข้าใจง่ายและเหมาะสำหรับการเรียนรู้อย่างเป็นระบบ
            และสามารถนำไปใช้ได้จริงในชีวิตประจำวันและการทำงาน
          </p>
          <p className="text-sm text-start xl:text-xl">คุณจะได้รับ :</p>
          <ul className="text-sm max-w-[80%] text-start xl:text-xl xl:max-w-full  list-disc pl-8">
            <li>ความแม่นยำ ในเนื้อหาที่ใช้งานได้จริง ไม่ซับซ้อน</li>
            <li>
              ความอุ่นใจ จากการดูแลโดยผู้สอนที่เข้าใจปัญหา และมีประสบการณ์จริง
            </li>
            <li>ความภาคภูมิใจ ในทักษะที่ช่วยเปิดโอกาสในสายอาชีพ</li>
          </ul>
          <div className="min-w-full lg:ml-25 xl:ml-70 h-full justify-center-safe items-center content-center ">
            <button className="px-10 xl:text-2xl flex items-center justify-center rounded-full py-4 bg-gradient-to-r from-[#464B9F] via-[#EA688E] to-[#F1F069]">
              <p className="align-middle text-center mt-1 font-bold SHtext">
                สมัครเรียนตอนนี้
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail() {
  return (
    <div className="w-screen min-h-screen p-10 pt-20 flex flex-col">
      <h1 className="lg:text-3xl lg:font-bold xl:Head1 text-center text-[#FBB1A9] mb-10">
        จุดเด่นของเรา
      </h1>

      <div className="flex my-10">
        <div className="flex-1 w-full pr-10 justify-items-end ">
          <img
            src="/img/icon/Teacher_icon.svg"
            alt=""
            className="max-w-20 xl:max-w-30 xl:max-w-35"
          />
        </div>
        <div className="flex-auto text-start pt-5">
          <h2 className="mb-2">ครูผู้สอนมืออาชีพ</h2>
          <p className="max-w-100">
            ทีมผู้สอนที่มีประสบการณ์จริงในหลากหลายสาขา
            <br />
            ถ่ายทอดความรู้ด้วยวิธีที่เข้าใจง่ายและเป็นขั้นตอน
          </p>
        </div>
      </div>

      <div className="flex my-10">
        <div className="flex-auto text-start pt-5 justify-items-end">
          <div>
            <h2 className="mb-2">หลักสูตรคุณภาพ</h2>
            <p className="max-w-100">
              ทุกบทเรียนถูกออกแบบอย่างพิถีพิถันเพื่อช่วย
              ให้ผู้เรียนเข้าใจเนื้อหาและนำไปใช้ได้อย่างมี
              ประสิทธิภาพในเวลาที่คุ้มค่า
            </p>
          </div>
        </div>
        <div className="flex-1 w-full pl-10 justify-items-strat">
          <img
            src="/img/icon/verified_icon.svg"
            alt=""
            className="max-w-25 xl:max-w-35 "
          />
        </div>
      </div>

      <div className="flex my-10">
        <div className="flex-1 w-full pl-20 xl:pl-10 pr-10 justify-items-end">
          <img
            src="/img/icon/wirte_icon.svg"
            alt=""
            className="mt-5 xl:mt-0 max-w-20 xl:max-w-30"
          />
        </div>
        <div className="flex-auto text-start pt-5">
          <h2 className="mb-2">เรียนรู้ตามจังหวะของคุณ</h2>
          <p className="max-w-100">
            เข้าเรียนได้ทุกที่ทุกเวลาพร้อมปรับรูปแบบการเรียน
            ตามความสะดวกของแต่ละคน
          </p>
        </div>
      </div>

      <div className="flex my-10">
        <div className="flex-auto text-start pt-5 justify-items-end">
          <div className="pr-10">
            <h2 className="mb-2">ชุมชนผู้เรียน</h2>
            <p className="max-w-100">
              เชื่อมต่อกับผู้เรียนคนอื่นๆและแลกเปลี่ยนประสบการณ์
              <br />
              เพื่อเติบโตไปด้วยกัน
            </p>
          </div>
        </div>
        <div className="flex-1 w-full pl-10 justify-items-strat">
          <img
            src="/img/icon/conversation_icon.svg"
            alt=""
            className="max-w-25  xl:max-w-35"
          />
        </div>
      </div>
    </div>
  );
}

function Coures() {
  return (
    <div className="w-screen min-h-screen p-10 pt-20 flex flex-col">
      <h1 className="lg:text-3xl lg:font-bold xl:Head1 text-center text-[#FBB1A9] mb-20">
        คอร์สเรียน
      </h1>
      <div className="flex flex-col w-full px-10 xl:px-30  items-center  space-y-10">
        <img
          src="./img/imgHome/test.svg"
          alt=""
          className="w-180 rounded-2xl"
        />
        <p className="lg:text-2xl lg:font-bold xl:Head1 font-bold mt-15 mb-22">
          เลือกแพ็คเกจของคุณ
        </p>
        {/* HEADER */}
        <div className="flex flex-col relative w-full justify-center items-center rounded-2xl bg-gradient-to-t from-[#04071A]/40 via-[#050B2A]/40 to-[#07103A]/40">
          {/* HEADER */}

          {/* Details Header*/}
          <div className="flex w-full h-[120px] text-2xl xl:text-3xl items-center font-bold z-40">
            <div className="flex-[0.8] flex pl-20 font-bold">
              <h1 className="">รายการเปรียบเทียบ</h1>
            </div>

            <div className="flex-1 flex justify-center ">
              <h1>พื้นฐาน</h1>
            </div>

            <div className="flex-1 flex justify-center ">
              <h1 className="gradient-text">พรีเมี่ยม</h1>
            </div>
          </div>
          {/* Details Header */}

          {/* Details */}
          {/* 1 */}
          <div className="flex w-full h-[90px] text-base xl:text-xl items-center font-medium z-40">
            <div className="flex-[0.8] flex pl-20 font-bold">
              <h1>รูปแบบการเรียน</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1>วีดีโอบันทึกเท่านั้น</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1 className="text-center">
                เรียนตามเวลาตัวเอง วีดีโอ +<br /> ส่งการบ้าน + Feedback จากครู
              </h1>
            </div>
          </div>

          {/* 2 */}
          <div className="flex w-full h-[120px] text-base xl:text-xl items-center font-medium z-40">
            <div className="flex-[0.8] flex pl-20 font-bold">
              <h1>การบ้าน / Assignment</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1>❌</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1 className="">✅</h1>
            </div>
          </div>

          {/* 3 */}
          <div className="flex w-full h-[90px] text-base xl:text-xl items-center font-medium z-40">
            <div className="flex-[0.8] flex pl-20 font-bold">
              <h1>ซัพพอร์ต / ที่ปรึกษา</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1>❌</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1 className="">✅</h1>
            </div>
          </div>

          {/* 4 */}
          <div className="flex w-full h-[120px] text-base xl:text-xl items-center font-medium z-40">
            <div className="flex-[0.8] flex pl-20 font-bold">
              <h1>ระดับความเข้มข้นของการเรียน</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1>❌</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1 className="">✅</h1>
            </div>
          </div>

          {/* 5 */}
          <div className="flex w-full h-[90px] text-base xl:text-xl items-center font-medium z-40">
            <div className="flex-[0.8] flex pl-20 font-bold">
              <h1>ผู้เหมาะสม คนที่อยากเรียนพื้นฐานทั่วไป</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1>Low</h1>
            </div>

            <div className="flex-1 flex justify-center">
              <h1 className="">High</h1>
            </div>
          </div>
          {/* Details */}

          {/* Button */}
          <div className="flex w-full  h-[120px] text-base xl:text-xl items-center font-medium z-40">
            <div className="flex-[0.8] flex pl-20 font-bold"></div>
            <div className="flex-1 flex justify-center">
              <a href="/InfoCourse" className="">
                <button
                  type="button"
                  className="z-80 px-10 py-4 \ rounded-full align-middle flex bg-[#2B32A3]/30 font-bold"
                >
                  <p className="text-center h-full w-full mt-1">ซื้อพื้นฐาน</p>
                </button>
              </a>
            </div>
            <div className="flex-1 flex justify-center">
              <a href="/InfoCourse" className="">
                <button
                  type="button"
                  className="z-80 px-10 py-4 rounded-full align-middle flex font-bold bg-gradient-to-r from-[#464B9F] via-[#EA688E] to-[#F1F069]"
                >
                  <p className="text-center h-full w-full mt-1">
                    ซื้อพรีเมี่ยม
                  </p>
                </button>
              </a>
            </div>
          </div>
          {/* Button */}

          {/* Background */}
          <div className="flex flex-col absolute w-full h-full z-10">
            <div className="lg:hidden xl:flex">
              <img
                src=".\img\imgHome\Rectangle 199.svg"
                alt=""
                className="max-w-80 xl:max-w-100 absolute right-3.5 top-3"
              />
            </div>
            <div className="lg:flex xl:hidden">
              <img
                src=".\img\imgHome\Rectangle 199 (1).svg"
                alt=""
                className="max-w-67 absolute right-2 top-3"
              />
            </div>
            <div className="flex w-full h-[120px] text-xl "></div>
            <div className="flex w-full h-[90px] text-xl bg-[#60628C]/30"></div>
            <div className="flex w-full h-[120px] text-xl "></div>
            <div className="flex w-full h-[90px] text-xl bg-[#60628C]/30"></div>
            <div className="flex w-full h-[120px] text-xl "></div>
            <div className="flex w-full h-[90px] text-xl bg-[#60628C]/30"></div>
          </div>
          {/* Background */}
        </div>
      </div>
    </div>
  );
}

const testimonials = [
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan1",
    role: "นักเรียนคอร์ส english",
  },
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan2",
    role: "นักเรียนคอร์ส english",
  },
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan3",
    role: "นักเรียนคอร์ส english",
  },
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan4",
    role: "นักเรียนคอร์ส english",
  },
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan5",
    role: "นักเรียนคอร์ส english",
  },
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan6",
    role: "นักเรียนคอร์ส english",
  },
  {
    quote:
      "คอร์สเรียนที่ดีมาก อธิบายง่าย เข้าใจง่าย ครูสอนดีมากครับ แนะนำเลยสำหรับคนที่อยากเริ่มต้นเรียนพูดอังกฤษ",
    name: "Dakudan7",
    role: "นักเรียนคอร์ส english",
  },
];

const StarIcon = () => (
  <svg
    viewBox="0 0 20 20"
    className="h-6 w-6 md:h-9 md:w-9 fill-yellow-400"
    aria-hidden="true"
  >
    <path d="M10 1.5 12.6 7l5.4.5-4.1 3.6 1.3 5.3L10 13.7 4.8 16.4l1.3-5.3L2 7.5 7.4 7 10 1.5z" />
  </svg>
);

const Avatar = () => (
  <div className="flex h-7 w-7 xl:h-9 xl:w-9 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400/40">
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-indigo-200"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2a5 5 0 0 0-1 9.9V13H8a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4h-3v-1.1A5 5 0 0 0 12 2z"
      />
    </svg>
  </div>
);

const Testimonials = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 👉 กดแล้วเลื่อนไปทางนั้นทีละ "ชุด"
  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const firstCard = el.querySelector<HTMLElement>("[data-card]");
    if (!firstCard) return;

    // ดึง gap จริงจาก CSS (md:gap-6 = 24px)
    const styles = window.getComputedStyle(el);
    const gap = parseFloat(styles.gap || "0") || 0;

    const step = firstCard.offsetWidth + gap;

    // Desktop = 3 ใบ, Mobile = 1 ใบ
    const visibleCards = window.innerWidth >= 768 ? 3 : 1;

    const delta = step * visibleCards;
    const next =
      direction === "left" ? el.scrollLeft - delta : el.scrollLeft + delta;

    el.scrollTo({ left: next, behavior: "smooth" });
  };

  return (
    <section className="w-full py-10 md:py-14">
      <div className="mx-auto max-w-4xl xl:max-w-6xl px-4 md:px-6">
        <div className="relative">
          {/* ปุ่มเลื่อน */}
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-15 h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white"
          >
            <img src="/img/icon/Left_Icon.svg" alt="" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-15 h-10 w-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white"
          >
            <img src="/img/icon/Right_Icon.svg" alt="" />
          </button>

          {/* แถวรีวิว */}
          <div
            ref={scrollRef}
            className="
              w-full flex gap-4 md:gap-6
              overflow-x-auto overflow-y-hidden pb-2
              snap-x snap-mandatory scroll-smooth

              [-ms-overflow-style:none]
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {testimonials.map((t, idx) => (
              <article
                key={idx}
                data-card
                className="
                  shrink-0 snap-start
                  min-w-[260px]
                  md:basis-[calc((100%-2*24px)/3)] md:min-w-0
                  rounded-2xl bg-[#11152f]
                  px-5 py-4 md:px-6 md:py-7
                  shadow-[0_1px_4px_rgba(0,0,0,0.55)]
                "
              >
                <div className="flex mb-4 w-full justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>

                <p className="mb-5 text-sm leading-relaxed text-slate-100 md:text-[15px]">
                  “{t.quote}”
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <Avatar />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-50">
                      {t.name}
                    </span>
                    <span className="text-xs text-slate-400">{t.role}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

function ReviewsContract() {
  return (
    <div className="max-w-screen min-w-full min-h-full flex flex-col pt-20">
      <h1 className="lg:text-3xl lg:font-bold xl:Head1 text-center text-[#FBB1A9] mb-2">
        REVIEW รีวิว
      </h1>
      <Testimonials />
      <div className="bg-[#282341] w-full h-85 flex flex-col px-10">
        <div className="flex-1 flex w-full min-h-[90%]">
          <div className="flex-[0.8] pt-5 flex flex-col justify-center items-center">
            <img
              src="/img/Logo/Learney-Journey_logo-White.svg"
              alt=""
              className=" xl:w-60"
            />
            <div className="px-2 xl:px-10">
              <img
                src="/img/imgHome/P-picture.svg"
                alt=""
                className="w-40 h-40 object-cover rounded-xl mt-5 shadow-lg"
              />
            </div>
          </div>
          <div className="flex-[1.5] flex flex-col justify-center items-start pl-20 px-10 pt-5">
            <h1 className="Head1 mt-4 xl:mt-0">CONTACT</h1>
            <ul className="w-full text-lg xl:text-2xl">
              <div className="flex mb-2">
                <p className="flex-[0.5] w-full max-w-20 xl:max-w-30">
                  Facebook
                </p>
                <p className="flex-[0.5] max-w-10 text-center">:</p>
                <p className="flex-auto max-w-45 xl:max-w-60">Learny Journey</p>
              </div>
              <div className="flex mb-2">
                <p className="flex-[0.5] w-full max-w-20 xl:max-w-30">Line</p>
                <p className="flex-[0.5] max-w-10 text-center">:</p>
                <p className="flex-auto max-w-45 xl:max-w-60">LineOfficialID</p>
              </div>
              <div className="flex mb-2">
                <p className="flex-[0.5] w-full max-w-20 xl:max-w-30">TikTok</p>
                <p className="flex-[0.5] max-w-10 text-center">:</p>
                <p className="flex-auto max-w-45 xl:max-w-60">
                  Learny Journey TikTok
                </p>
              </div>
              <div className="flex mb-2">
                <p className="flex-[0.5] w-full max-w-20 xl:max-w-30">Email</p>
                <p className="flex-[0.5] max-w-10 text-center">:</p>
                <p className="flex-auto max-w-45 xl:max-w-60">
                  LearnyJourney@gmail.com
                </p>
              </div>
              <div className="flex mb-2">
                <p className="flex-[0.5] w-full max-w-20 xl:max-w-30">X</p>
                <p className="flex-[0.5] max-w-10 text-center">:</p>
                <p className="flex-auto max-w-45 xl:max-w-60">X account name</p>
              </div>
            </ul>
          </div>
          <div className="flex-1 xl:flex-[0.8] flex pt-20 xl:pt-5 justify-center items-center">
            <div className="flex-1 px-2">
              <ul className="mt-2">
                <button>
                  <img
                    src="/img/icon/Facebooklanding_icon.svg"
                    alt=""
                    className=""
                  />
                </button>
                <button>
                  <img src="/img/icon/TikTok_icon.svg" alt="" className="" />
                </button>
                <button>
                  <img src="/img/icon/TwitterX_icon.svg" alt="" className="" />
                </button>
              </ul>
            </div>
            <div className="flex-auto">
              <img src="/img/icon/Test.svg" alt="" className="w-41 xl:w-50" />
            </div>
          </div>
        </div>
        <div className="flex-[0.2] w-full">
          <p className="text-center">
            © 2025 LEARNY JOURNEY. ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="max-w-screen w-full min-h-screen bg-cover bg-bottom bg-[url('/img/imgHome/Bg-home.svg')]">
      <div className="z-20 max-w-screen min-h-screen bg-gradient-to-b from-transparent to-[#070D2D]/89">
        <div className="z-30 w-full min-h-screen h-full flex flex-col justify-center content-center items-center text-center">
          <h1 className="text-6xl font-semibold gradient-text">
            LEARNEY JOURNEY
          </h1>
          <p className="my-2 text-xl gradient-text-light mt-6">
            ร่วมเดินทางสู่โลกแห่งการเรียนรู้ ด้วยหลักสูตรคุณภาพ
            <br />
            และประสบการณ์การสอนที่เหนือระดับ
          </p>
          <button className="mt-5 text-xl bg-[#7168D7]/60 hover:bg-[#DE8391]/60 text-white font-medium py-2 px-10 rounded-full">
            เข้าสู่โลกการเรียนรู้
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Mainpage() {
  return (
    <div className="max-w-screen w-full bg-center min-h-screen bg-cover bg-[#070D2D]">
      <div className=" hidden lg:flex lg:flex-col">
        <div className="z-30">
          <Home />
        </div>
        <div className="z-10 w-full max-w-screen from-[#070D2D]/60 via-[#7168D7]/60 via-[#DE8391]/60 to-[#070D2D]/60 bg-gradient-to-b min-h-full">
          <Intro />
          <Detail />
          <Coures />
          <ReviewsContract />
        </div>
      </div>
    </div>
  );
}
