import { styled } from "linaria/react";

const ToggleSeachButton: React.FC<{
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ onClick }) => {
  const ToggleSearch = styled.button`
    background: transparent url("~@mdn/dinocons/general/search.svg") center
      center no-repeat;
    background-size: 16px;
    height: 16px;
    vertical-align: middle;
    width: 16px;
  `;
  return (
    <ToggleSearch className="ghost-button" onClick={onClick}>
      <span className="visually-hidden">Show search input</span>
    </ToggleSearch>
  );
};

export default ToggleSeachButton;
