import svgPaths from "./svg-803vo6v2c0";
type DiaryItemProps = {
  className?: string;
  no?: boolean;
  selected?: boolean;
};

function DiaryItem({ className, no = true, selected = true }: DiaryItemProps) {
  return (
    <div className={className || "h-[81px] relative w-[24px]"} data-name="diary item">
      {no && (
        <div className="absolute inset-[0_0_70.37%_0]" data-name="diary icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_154)" id="diary icon">
              <path d={svgPaths.p18f31900} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_154">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
      {selected && (
        <div className="absolute inset-[70.37%_0_0_0]" data-name="diary icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_128)" id="diary icon">
              <path d={svgPaths.p18f31900} fill="#E0EEA3" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_128">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
type ProfileItemProps = {
  className?: string;
  no?: boolean;
  selected?: boolean;
};

function ProfileItem({ className, no = true, selected = true }: ProfileItemProps) {
  return (
    <div className={className || "h-[81px] relative w-[24px]"} data-name="profile item">
      {no && (
        <div className="absolute inset-[0_0_70.37%_0]" data-name="profile icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_145)" id="profile icon">
              <path d={svgPaths.pcbfc100} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_145">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
      {selected && (
        <div className="absolute inset-[70.37%_0_0_0]" data-name="profile icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_137)" id="profile icon">
              <path d={svgPaths.pcbfc100} fill="#E0EEA3" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_137">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
type InsightsItemProps = {
  className?: string;
  no?: boolean;
  selected?: boolean;
};

function InsightsItem({ className, no = true, selected = true }: InsightsItemProps) {
  return (
    <div className={className || "h-[81px] relative w-[24px]"} data-name="insights item">
      {no && (
        <div className="absolute inset-[0_0_70.37%_0]" data-name="insights icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_152)" id="insights icon">
              <path d={svgPaths.p10166780} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_152">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
      {selected && (
        <div className="absolute inset-[70.37%_0_0_0]" data-name="insights icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_139)" id="insights icon">
              <path d={svgPaths.p10166780} fill="#E0EEA3" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_139">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
type ScanItemProps = {
  className?: string;
  no?: boolean;
  selected?: boolean;
};

function ScanItem({ className, no = true, selected = true }: ScanItemProps) {
  return (
    <div className={className || "h-[81px] relative w-[24px]"} data-name="scan item">
      {no && (
        <div className="absolute inset-[0_0_70.37%_0]" data-name="scan icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_158)" id="scan icon">
              <path d={svgPaths.p7faba00} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_158">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
      {selected && (
        <div className="absolute inset-[70.37%_0_0_0]" data-name="scan icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_147)" id="scan icon">
              <path d={svgPaths.p7faba00} fill="#E0EEA3" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_147">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}

function DiaryIcon({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[24px]"} data-name="diary icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <path d={svgPaths.p18f31900} fill="#7E7E7C" id="Vector" />
      </svg>
    </div>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[24px]"} data-name="profile icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <path d={svgPaths.pcbfc100} fill="#7E7E7C" id="Vector" />
      </svg>
    </div>
  );
}

function InsightsIcon({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[24px]"} data-name="insights icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <path d={svgPaths.p10166780} fill="#7E7E7C" id="Vector" />
      </svg>
    </div>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <div className={className || "overflow-clip relative size-[24px]"} data-name="scan icon">
      <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
        <path d={svgPaths.p7faba00} fill="#7E7E7C" id="Vector" />
      </svg>
    </div>
  );
}
type ComponentProps = {
  className?: string;
  property1?: "profile" | "home item" | "scan" | "insights" | "home" | "diary";
};

export default function Component({ className, property1 = "home" }: ComponentProps) {
  if (property1 === "profile") {
    return (
      <div className={className || "h-[134px] relative w-[430px]"} data-name="Property 1=profile">
        <div className="absolute bg-white h-[65px] left-0 overflow-clip rounded-tl-[20px] rounded-tr-[20px] top-[69px] w-[430px]" data-name="nav bar">
          <ScanIcon className="absolute left-[203px] overflow-clip size-[24px] top-[12px]" />
          <InsightsIcon className="absolute left-[286px] overflow-clip size-[24px] top-[12px]" />
          <ProfileIcon className="absolute left-[365px] overflow-clip size-[24px] top-[12px]" />
          <DiaryIcon className="absolute left-[121px] overflow-clip size-[24px] top-[12px]" />
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[61px] not-italic text-[10px] text-black text-center top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-1/2 not-italic text-[10px] text-black text-center top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[132.5px] not-italic text-[10px] text-black text-center top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[301px] not-italic text-[10px] text-black text-center top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[379.5px] not-italic text-[10px] text-black text-center top-[36px] w-[31px]">Profile</p>
        </div>
        <div className="[word-break:break-word] absolute bg-white font-['Poppins:Medium',sans-serif] h-[65px] leading-[normal] left-0 not-italic overflow-clip rounded-tl-[20px] rounded-tr-[20px] text-[10px] text-black text-center top-[69px] w-[430px]" data-name="nav bar">
          <p className="-translate-x-1/2 absolute left-[51px] top-[37px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 absolute left-1/2 top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 absolute left-[132.5px] top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 absolute left-[301px] top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 absolute left-[379.5px] top-[36px] w-[31px]">Profile</p>
        </div>
        <div className="absolute h-[49px] left-[328px] top-[51px] w-[101.5px]">
          <svg className="absolute block inset-0 size-full" fill="none" height="49" preserveAspectRatio="none" viewBox="0 0 101.5 49" width="101.5">
            <g id="Group 2">
              <path d={svgPaths.p3f7604b0} fill="#F0FDF8" id="Ellipse 2" />
              <path d={svgPaths.p24ad9200} fill="white" id="Ellipse 1" />
            </g>
          </svg>
        </div>
        <DiaryItem className="absolute block cursor-pointer h-[81px] left-[121px] top-[81px] w-[24px]" selected={false} />
        <ScanItem className="absolute block cursor-pointer h-[81px] left-[202px] top-[82px] w-[24px]" selected={false} />
        <InsightsItem className="absolute block cursor-pointer h-[81px] left-[289px] top-[82px] w-[24px]" selected={false} />
        <ProfileItem className="absolute h-[81px] left-[368px] top-[2px] w-[24px]" no={false} />
      </div>
    );
  }
  if (property1 === "home item") {
    return (
      <button className={className || "block cursor-pointer h-[81px] relative w-[24px]"} data-name="Property 1=home item">
        <div className="absolute inset-[0_0_70.37%_0]" data-name="home icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_169)" id="home icon">
              <path d={svgPaths.p13474100} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_169">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </button>
    );
  }
  if (property1 === "insights") {
    return (
      <div className={className || "h-[134px] relative w-[430px]"} data-name="Property 1=insights">
        <div className="absolute bg-white h-[65px] left-0 overflow-clip rounded-tl-[20px] rounded-tr-[20px] top-[69px] w-[430px]" data-name="nav bar">
          <ScanIcon className="absolute left-[203px] overflow-clip size-[24px] top-[12px]" />
          <InsightsIcon className="absolute left-[286px] overflow-clip size-[24px] top-[12px]" />
          <ProfileIcon className="absolute left-[365px] overflow-clip size-[24px] top-[12px]" />
          <DiaryIcon className="absolute left-[121px] overflow-clip size-[24px] top-[12px]" />
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[61px] not-italic text-[10px] text-black text-center top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-1/2 not-italic text-[10px] text-black text-center top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[132.5px] not-italic text-[10px] text-black text-center top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[301px] not-italic text-[10px] text-black text-center top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[379.5px] not-italic text-[10px] text-black text-center top-[36px] w-[31px]">Profile</p>
        </div>
        <div className="[word-break:break-word] absolute bg-white font-['Poppins:Medium',sans-serif] h-[65px] leading-[normal] left-[-1px] not-italic overflow-clip rounded-tl-[20px] rounded-tr-[20px] text-[10px] text-black text-center top-[69px] w-[430px]" data-name="nav bar">
          <p className="-translate-x-1/2 absolute left-[51px] top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 absolute left-1/2 top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 absolute left-[132.5px] top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 absolute left-[301px] top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 absolute left-[379.5px] top-[36px] w-[31px]">Profile</p>
        </div>
        <DiaryItem className="absolute block cursor-pointer h-[81px] left-[121px] top-[81px] w-[24px]" selected={false} />
        <ScanItem className="absolute block cursor-pointer h-[81px] left-[202px] top-[82px] w-[24px]" selected={false} />
        <ProfileItem className="absolute block cursor-pointer h-[81px] left-[368px] top-[81px] w-[24px]" selected={false} />
        <div className="absolute contents left-[249px] top-[3px]">
          <div className="absolute h-[31.255px] left-[249px] top-[68.75px] w-[101.5px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="31.255" preserveAspectRatio="none" viewBox="0 0 101.5 31.255" width="101.5">
              <path d={svgPaths.p6836180} fill="#F0FDF8" id="Ellipse 2" />
            </svg>
          </div>
          <div className="absolute h-[42.933px] left-[277px] top-[51px] w-[46px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="42.9333" preserveAspectRatio="none" viewBox="0 0 46 42.9333" width="46">
              <path d={svgPaths.p18581200} fill="white" id="Ellipse 1" />
            </svg>
          </div>
          <InsightsItem className="absolute h-[81px] left-[288px] top-[3px] w-[24px]" no={false} />
        </div>
      </div>
    );
  }
  if (property1 === "home item") {
    return (
      <button className={className || "block cursor-pointer h-[81px] relative w-[24px]"} data-name="Property 1=home item">
        <div className="absolute inset-[0_0_70.37%_0]" data-name="home icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_169)" id="home icon">
              <path d={svgPaths.p13474100} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_169">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </button>
    );
  }
  if (property1 === "scan") {
    return (
      <div className={className || "h-[134px] relative w-[430px]"} data-name="Property 1=scan">
        <div className="absolute bg-white h-[65px] left-0 overflow-clip rounded-tl-[20px] rounded-tr-[20px] top-[69px] w-[430px]" data-name="nav bar">
          <ScanIcon className="absolute left-[203px] overflow-clip size-[24px] top-[12px]" />
          <InsightsIcon className="absolute left-[286px] overflow-clip size-[24px] top-[12px]" />
          <ProfileIcon className="absolute left-[365px] overflow-clip size-[24px] top-[12px]" />
          <DiaryIcon className="absolute left-[121px] overflow-clip size-[24px] top-[12px]" />
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[61px] not-italic text-[10px] text-black text-center top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-1/2 not-italic text-[10px] text-black text-center top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[132.5px] not-italic text-[10px] text-black text-center top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[301px] not-italic text-[10px] text-black text-center top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[379.5px] not-italic text-[10px] text-black text-center top-[36px] w-[31px]">Profile</p>
        </div>
        <div className="[word-break:break-word] absolute bg-white font-['Poppins:Medium',sans-serif] h-[65px] leading-[normal] left-0 not-italic overflow-clip rounded-tl-[20px] rounded-tr-[20px] text-[10px] text-black text-center top-[69px] w-[430px]" data-name="nav bar">
          <p className="-translate-x-1/2 absolute left-[51px] top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 absolute left-1/2 top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 absolute left-[132.5px] top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 absolute left-[301px] top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 absolute left-[379.5px] top-[36px] w-[31px]">Profile</p>
        </div>
        <DiaryItem className="absolute block cursor-pointer h-[81px] left-[121px] top-[81px] w-[24px]" selected={false} />
        <InsightsItem className="absolute block cursor-pointer h-[81px] left-[289px] top-[82px] w-[24px]" selected={false} />
        <ProfileItem className="absolute block cursor-pointer h-[81px] left-[368px] top-[81px] w-[24px]" selected={false} />
        <div className="absolute contents left-[164px] top-[3px]">
          <div className="absolute h-[31.255px] left-[164px] top-[68.75px] w-[101.5px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="31.255" preserveAspectRatio="none" viewBox="0 0 101.5 31.255" width="101.5">
              <path d={svgPaths.p6836180} fill="#F0FDF8" id="Ellipse 2" />
            </svg>
          </div>
          <div className="absolute h-[42.933px] left-[192px] top-[51px] w-[46px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="42.9333" preserveAspectRatio="none" viewBox="0 0 46 42.9333" width="46">
              <path d={svgPaths.p18581200} fill="white" id="Ellipse 1" />
            </svg>
          </div>
          <ScanItem className="absolute h-[81px] left-[203px] top-[3px] w-[24px]" no={false} />
        </div>
      </div>
    );
  }
  if (property1 === "home item") {
    return (
      <button className={className || "block cursor-pointer h-[81px] relative w-[24px]"} data-name="Property 1=home item">
        <div className="absolute inset-[0_0_70.37%_0]" data-name="home icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_169)" id="home icon">
              <path d={svgPaths.p13474100} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_169">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </button>
    );
  }
  if (property1 === "diary") {
    return (
      <div className={className || "h-[134px] relative w-[430px]"} data-name="Property 1=diary">
        <div className="absolute bg-white h-[65px] left-0 overflow-clip rounded-tl-[20px] rounded-tr-[20px] top-[69px] w-[430px]" data-name="nav bar">
          <ScanIcon className="absolute left-[203px] overflow-clip size-[24px] top-[12px]" />
          <InsightsIcon className="absolute left-[286px] overflow-clip size-[24px] top-[12px]" />
          <ProfileIcon className="absolute left-[365px] overflow-clip size-[24px] top-[12px]" />
          <DiaryIcon className="absolute left-[121px] overflow-clip size-[24px] top-[12px]" />
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[61px] not-italic text-[10px] text-black text-center top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-1/2 not-italic text-[10px] text-black text-center top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[132.5px] not-italic text-[10px] text-black text-center top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[301px] not-italic text-[10px] text-black text-center top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[379.5px] not-italic text-[10px] text-black text-center top-[36px] w-[31px]">Profile</p>
        </div>
        <div className="[word-break:break-word] absolute bg-white font-['Poppins:Medium',sans-serif] h-[65px] leading-[normal] left-0 not-italic overflow-clip rounded-tl-[20px] rounded-tr-[20px] text-[10px] text-black text-center top-[69px] w-[430px]" data-name="nav bar">
          <p className="-translate-x-1/2 absolute left-[51px] top-[36px] w-[30px]">Home</p>
          <p className="-translate-x-1/2 absolute left-1/2 top-[37px] w-[26px]">Scan</p>
          <p className="-translate-x-1/2 absolute left-[132.5px] top-[36px] w-[27px]">Diary</p>
          <p className="-translate-x-1/2 absolute left-[301px] top-[36px] w-[40px]">Insights</p>
          <p className="-translate-x-1/2 absolute left-[379.5px] top-[36px] w-[31px]">Profile</p>
        </div>
        <ScanItem className="absolute block cursor-pointer h-[81px] left-[202px] top-[82px] w-[24px]" selected={false} />
        <InsightsItem className="absolute block cursor-pointer h-[81px] left-[289px] top-[82px] w-[24px]" selected={false} />
        <ProfileItem className="absolute block cursor-pointer h-[81px] left-[368px] top-[81px] w-[24px]" selected={false} />
        <div className="absolute contents left-[79px] top-[7px]">
          <div className="absolute h-[31.255px] left-[79px] top-[69px] w-[101.5px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="31.255" preserveAspectRatio="none" viewBox="0 0 101.5 31.255" width="101.5">
              <path d={svgPaths.p6836180} fill="#F0FDF8" id="Ellipse 2" />
            </svg>
          </div>
          <div className="absolute h-[42.933px] left-[107px] top-[52px] w-[46px]">
            <svg className="absolute block inset-0 size-full" fill="none" height="42.9333" preserveAspectRatio="none" viewBox="0 0 46 42.9333" width="46">
              <path d={svgPaths.p18581200} fill="white" id="Ellipse 1" />
            </svg>
          </div>
          <DiaryItem className="absolute h-[81px] left-[118px] top-[7px] w-[24px]" no={false} />
        </div>
      </div>
    );
  }
  if (property1 === "home item") {
    return (
      <button className={className || "block cursor-pointer h-[81px] relative w-[24px]"} data-name="Property 1=home item">
        <div className="absolute inset-[0_0_70.37%_0]" data-name="home icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_169)" id="home icon">
              <path d={svgPaths.p13474100} fill="#7E7E7C" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_169">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </button>
    );
  }
  return (
    <div className={className || "h-[134px] relative w-[430px]"} data-name="Property 1=home">
      <div className="absolute bg-white h-[65px] left-0 overflow-clip rounded-tl-[20px] rounded-tr-[20px] top-[69px] w-[430px]" data-name="nav bar">
        <ScanIcon className="absolute left-[203px] overflow-clip size-[24px] top-[12px]" />
        <InsightsIcon className="absolute left-[286px] overflow-clip size-[24px] top-[12px]" />
        <ProfileIcon className="absolute left-[365px] overflow-clip size-[24px] top-[12px]" />
        <DiaryIcon className="absolute left-[121px] overflow-clip size-[24px] top-[12px]" />
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[61px] not-italic text-[10px] text-black text-center top-[36px] w-[30px]">Home</p>
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-1/2 not-italic text-[10px] text-black text-center top-[37px] w-[26px]">Scan</p>
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[132.5px] not-italic text-[10px] text-black text-center top-[36px] w-[27px]">Diary</p>
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[301px] not-italic text-[10px] text-black text-center top-[36px] w-[40px]">Insights</p>
        <p className="-translate-x-1/2 [word-break:break-word] absolute font-['Poppins:Medium',sans-serif] leading-[normal] left-[379.5px] not-italic text-[10px] text-black text-center top-[36px] w-[31px]">Profile</p>
      </div>
      <div className="absolute h-[81px] left-[49px] top-0 w-[24px]" data-name="home item">
        <div className="absolute inset-[70.37%_0_0_0]" data-name="home icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_163)" id="home icon">
              <path d={svgPaths.p13474100} fill="#E0EEA3" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_163">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="[word-break:break-word] absolute bg-white font-['Poppins:Medium',sans-serif] h-[65px] leading-[normal] left-0 not-italic overflow-clip rounded-tl-[20px] rounded-tr-[20px] text-[10px] text-black text-center top-[69px] w-[430px]" data-name="nav bar">
        <p className="-translate-x-1/2 absolute left-[51px] top-[36px] w-[30px]">Home</p>
        <p className="-translate-x-1/2 absolute left-1/2 top-[37px] w-[26px]">Scan</p>
        <p className="-translate-x-1/2 absolute left-[132.5px] top-[36px] w-[27px]">Diary</p>
        <p className="-translate-x-1/2 absolute left-[301px] top-[36px] w-[40px]">Insights</p>
        <p className="-translate-x-1/2 absolute left-[379.5px] top-[36px] w-[31px]">Profile</p>
      </div>
      <div className="absolute h-[49px] left-0 top-[49px] w-[101.5px]">
        <svg className="absolute block inset-0 size-full" fill="none" height="49" preserveAspectRatio="none" viewBox="0 0 101.5 49" width="101.5">
          <g id="Group 2">
            <path d={svgPaths.p3f7604b0} fill="#F0FDF8" id="Ellipse 2" />
            <path d={svgPaths.p24ad9200} fill="white" id="Ellipse 1" />
          </g>
        </svg>
      </div>
      <div className="absolute h-[81px] left-[39px] top-0 w-[24px]" data-name="home item">
        <div className="absolute inset-[70.37%_0_0_0]" data-name="home icon">
          <svg className="absolute block inset-0 size-full" fill="none" height="24" preserveAspectRatio="none" viewBox="0 0 24 24" width="24">
            <g clipPath="url(#clip0_0_163)" id="home icon">
              <path d={svgPaths.p13474100} fill="#E0EEA3" id="Vector" />
            </g>
            <defs>
              <clipPath id="clip0_0_163">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <DiaryItem className="absolute block cursor-pointer h-[81px] left-[121px] top-[81px] w-[24px]" selected={false} />
      <ScanItem className="absolute block cursor-pointer h-[81px] left-[202px] top-[82px] w-[24px]" selected={false} />
      <InsightsItem className="absolute block cursor-pointer h-[81px] left-[289px] top-[82px] w-[24px]" selected={false} />
      <ProfileItem className="absolute block cursor-pointer h-[81px] left-[368px] top-[81px] w-[24px]" selected={false} />
    </div>
  );
}