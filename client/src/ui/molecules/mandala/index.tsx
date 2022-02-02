import "./index.scss";

function Mandala({ animate = false }: { animate: boolean }) {
  return (
    <div className={`mandala-container ${animate ? "animate" : ""}`}>
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
          >
            {/*<!--<animateMotion dur="20s" repeatCount="indefinite" rotate="auto"
				path="M1,1 a1,1 0 1,0 2,0 a1,1 0 1,0 -2,0" />-->*/}
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="500s"
              type="rotate"
              from="0 337.5 337.5"
              to="360 337.5 337.5"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M337.5,337.5 m-280,0 a280,280 0 1,1 560,0 a280,280 0 1,1 -560,0"
            id="circle2"
          >
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="500s"
              type="rotate"
              from="360 337.5 337.5"
              to="0 337.5 337.5"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M337.5,337.5 m-240,0 a240,240 0 1,1 480,0 a240,240 0 1,1 -480,0"
            id="circle3"
          >
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="500s"
              type="rotate"
              from="0 337.5 337.5"
              to="360 337.5 337.5"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M337.5,337.5 m-200,0 a200,200 0 1,1 400,0 a200,200 0 1,1 -400,0"
            id="circle4"
          >
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="500s"
              type="rotate"
              from="360 337.5 337.5"
              to="360 337.5 337.5"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M337.5,337.5 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0"
            id="circle5"
          >
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="500s"
              type="rotate"
              from="0 337.5 337.5"
              to="360 337.5 337.5"
              repeatCount="indefinite"
            />
          </path>
        </defs>
        <text className="mandala-accent-1" dy="70" textLength="2010">
          <textPath textLength="2010" href="#circle1">
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
            &nbsp;/<tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>/
            <tspan>/</tspan>/<tspan>/</tspan>/<tspan>/</tspan>
          </textPath>
        </text>
        <text className="mandala-accent-2" dy="70" textLength="1760">
          <textPath textLength="1760" href="#circle2">
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
            &nbsp;+<tspan>+</tspan>+<tspan>+</tspan>+<tspan>+</tspan>
          </textPath>
        </text>
        <text className="mandala-accent-3" dy="70" textLength="1507">
          <textPath textLength="1507" href="#circle3">
            &nbsp;<tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;
            <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>&#125; &nbsp;
            <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;
            <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>&#125; &nbsp;
            <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;
            <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>&#125; &nbsp;
            <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;
            <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>&#125; &nbsp;
            <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;
            <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>&#125; &nbsp;
            <tspan>&#123;</tspan>&#123;<tspan>&#123;</tspan>&#123;
            <tspan>&#125;</tspan>&#125;<tspan>&#125;</tspan>&#125;
          </textPath>
        </text>
        <text className="mandala-accent-4" dy="70" textLength="1257">
          <textPath textLength="1257" href="#circle4">
            &nbsp;../../&nbsp;../../&nbsp;../../&nbsp;../../&nbsp;../../&nbsp;../../&nbsp;../../
          </textPath>
        </text>
        <text className="mandala-accent-5" dy="70" textLength="1005">
          <textPath textLength="1005" href="#circle5">
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
      </svg>
    </div>
  );
}

export default Mandala;
