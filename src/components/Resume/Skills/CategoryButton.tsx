interface CategoryButtonProps {
  label: string;
  active: boolean;
  handleClick: (label: string) => void;
}

const CategoryButton = ({ handleClick, active, label }: CategoryButtonProps) => (
  <button
    className={`skillbutton ${active ? 'skillbutton-active' : ''}`}
    type="button"
    onClick={() => handleClick(label)}
  >
    {label}
  </button>
);

export default CategoryButton;
