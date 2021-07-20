import "./index.scss";

const ProductFeatures = ({ withIntro }) => {
  return (
    <>
      {withIntro && (
        <div className="product-features-intro">
          <div className="heading-group">
            <h3>Make MDN your own</h3>
            <h4 className="gradient-clip-text">What’s included</h4>
          </div>
          <p>Unlock premium features that you can use across all of MDN.</p>
        </div>
      )}
      <div className="product-features">
        <ul>
          <li className="bookmark">
            <h3>Build a permanent library</h3>
            <p>Bookmark free and paid content for reference across devices</p>
          </li>
          <li className="offline">
            <h3>Take MDN with you</h3>
            <p>
              Access MDN from your desktop, iOS or Android device also when
              you’re offline
            </p>
          </li>
          <li className="themes">
            <h3>MDN, day and night</h3>
            <p>Customize MDN’s appearance with a theme of your choice</p>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ProductFeatures;
