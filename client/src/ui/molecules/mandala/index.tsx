import "./index.scss";

function Mandala({
  extraClasses = null,
  pride = false,
}: {
  extraClasses?: string | null;
  pride?: boolean;
}) {
  return (
    <div
      className={`mandala-container ${extraClasses || ""} ${pride ? "pride" : ""}`}
      aria-hidden="true"
    >
      <div className="mandala-translate">
        <div className="mandala-svg-container">
          <svg
            width="675"
            height="675"
            viewBox="0 0 675 675"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mandala"
          >
            <title>Mandala</title>
            <defs>
              <path
                d="M337.5,337.5 m-320,0 a320,320 0 1,1 640,0 a320,320 0 1,1 -640,0"
                id="circle1"
              ></path>
              <path
                d="M337.5,337.5 m-280,0 a280,280 0 1,1 560,0 a280,280 0 1,1 -560,0"
                id="circle2"
              ></path>
              <path
                d="M337.5,337.5 m-240,0 a240,240 0 1,1 480,0 a240,240 0 1,1 -480,0"
                id="circle3"
              ></path>
              <path
                d="M337.5,337.5 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0"
                id="circle4"
              ></path>
              <path
                d="M337.5,337.5 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"
                id="circle5"
              ></path>
            </defs>
            <text dy="70" textLength="2010">
              <textPath textLength="2010" href="#circle1">
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
                &nbsp;&nbsp;&nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
                <tspan>/</tspan>
              </textPath>
            </text>
            <text dy="70" textLength="1760">
              <textPath textLength="1760" href="#circle2">
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
                &nbsp;&nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
              </textPath>
            </text>
            <text dy="70" textLength="1507">
              <textPath textLength="1507" href="#circle3">
                <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;&nbsp;
                <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>
                &#125;&nbsp;&nbsp;
                <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;&nbsp;
                <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>
                &#125;&nbsp;&nbsp;
                <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;&nbsp;
                <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>
                &#125;&nbsp;&nbsp;
                <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;&nbsp;
                <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>
                &#125;&nbsp;&nbsp;
                <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;&nbsp;
                <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>
                &#125;&nbsp;&nbsp;
                <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;&nbsp;
                <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>
                &#125;&nbsp;&nbsp;
              </textPath>
            </text>
            <text dy="70" textLength="1257">
              <textPath textLength="1257" href="#circle4">
                &nbsp;&nbsp;&nbsp;../../ &nbsp;&nbsp;&nbsp;../../
                &nbsp;&nbsp;&nbsp;../../ &nbsp;&nbsp;&nbsp;../../
                &nbsp;&nbsp;&nbsp;../../ &nbsp;&nbsp;&nbsp;../../
                &nbsp;&nbsp;&nbsp;../../
              </textPath>
            </text>
            <text dy="70" textLength="1005">
              <textPath textLength="1005" href="#circle5">
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
                <tspan>&lt;&gt;</tspan>&lt;/&gt;
              </textPath>
            </text>
            {pride && (
              <text dy="70" textLength="754">
                <textPath textLength="754" href="#circle6">
                  <tspan>--&lt;3()</tspan>&nbsp;&nbsp; --&lt;3()&nbsp;&nbsp;
                  <tspan>--&lt;3()</tspan>&nbsp;&nbsp; --&lt;3()&nbsp;&nbsp;
                  <tspan>--&lt;3()</tspan>&nbsp;&nbsp; --&lt;3()&nbsp;&nbsp;
                </textPath>
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Mandala;
