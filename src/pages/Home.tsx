function Intro() {
  return (
    <div className="max-w-screen min-w-full min-h-full py-5 max-h-screen flex content-center text-center">
      <div className="flex-[0.5] w-full py-10 pl-20">
        <img
          src=".\img\imgHome\P-ying.svg"
          alt=""
          className="w-full h-full ml-10 rounded-xl border-4 border-[#F0DA6F] object-cover"
        />
      </div>
      <div className="flex-auto p-10 flex flex-col justify-center content-center items-center text-center space-y-5">
        <div className="flex flex-col px-10 bg-[#23213B] min-w-[90%] min-h-full max-w-[20rem] rounded-xl ">
          <h1 className=" text-4xl font-semibold my-8 mt-15 ">
            Master Your Learning Journey
          </h1>
          <p className="text-start mb-4">
            ก้าวสู่การพัฒนาทักษะอย่างมั่นใจด้วยคอร์สที่ออกแบบอย่างพิถีพิถันเรียบเรียง
            เนื้อหาและถ่ายทอดโดยผู้เชี่ยวชาญในสาขาต่าง ๆ พร้อมเนื้อหาที่เหมาะกับ
            ผู้เรียนตั้งแต่เริ่มต้นไปจนถึงผู้ที่อยากต่อยอดทักษะให้พร้อมใช้งานอยู่เสมอ
            ท่านจะได้พบกับหลักสูตรที่เข้าใจง่ายและเหมาะสำหรับการเรียนรู้อย่างเป็นระบบ
            และสามารถนำไปใช้ได้จริงในชีวิตประจำวันและการทำงาน
          </p>
          <h1 className="text-start">คุณจะได้รับ :</h1>
          <ul className="text-start list-disc pl-8">
            <li className=" ">
              ความแม่นยำ ในเนื้อหาที่ใช้งานได้จริง ไม่ซับซ้อน
            </li>
            <li className="">
              ความอุ่นใจ จากการดูแลโดยผู้สอนที่เข้าใจปัญหา และมีประสบการณ์จริง
            </li>
            <li className="">
              ความภาคภูมิใจ ในทักษะที่ช่วยเปิดโอกาสในสายอาชีพ
            </li>
          </ul>
          <div className="min-w-full ml-70 h-full justify-center-safe items-center content-center ">
            <button className=" px-10 text-2xl flex items-center justify-center  rounded-full  py-4 bg-gradient-to-r from-[#464B9F] via-[#EA688E] to-[#F1F069]">
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

function Space() {
  return <div className="w-screen h-screen"></div>;
}

function Home() {
  return (
    <div className="max-w-screen w-full min-h-screen bg-cover bg-bottom bg-[url('/img/imgHome/Bg-home.svg')]">
      <div className=" z-20  max-w-screen min-h-screen  bg-linear-to-b from-[] to-[#070D2D]/89 ">
        <div className=" z-30 w-full min-h-screen h-full flex flex-col justify-center content-center items-center text-center">
          <h1 className="text-6xl font-semibold gradient-text">
            LEARNEY JOURNEY
          </h1>
          <p className="my-2 text-xl gradient-text-light mt-6 ">
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
    <div className="max-w-screen w-full bg-center min-h-screen bg-cover bg-[#070D2D] ">
      <div className="z-40">
        <Home />
      </div>
      <div className=" z-10 w-full max-w-screen   from-[#070D2D]/60 via-[#7168D7]/60 via-[#DE8391]/60 to-[#070D2D]/60 bg-linear-to-b min-h-full ">
        <Intro />
        <Space />
        <Space />
        <Space />
        <Space />
      </div>
    </div>
  );
}
