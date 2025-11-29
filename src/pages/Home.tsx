function Space() {
  return (
    <div className="max-w-screen w-full min-h-screen content-center text-center">
      space
    </div>
  );
}

function Home() {
  return (
    <div className="max-w-screen w-full min-h-screen bg-cover bg-bottom bg-[url('/img/imgHome/Bg-home.svg')]">
      <div className=" z-20  max-w-screen min-h-screen opacity-89 bg-linear-to-b from-[] to-[#070D2D] ">
        <div className=" z-30 w-full min-h-screen h-full flex flex-col justify-center content-center items-center text-center">
          <h1 className="text-6xl font-semibold">LEARNEY JOURNEY</h1>
          <p className="my-2 text-xl">
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
      <div className=" z-10 w-full max-w-screen  opacity-60 from-[#070D2D] via-[#7168D7] via-[#DE8391] to-[#070D2D] bg-linear-to-b min-h-full ">
        <Space />
        <Space />
        <Space />
        <Space />
        <Space />
        <Space />
      </div>
    </div>
  );
}
