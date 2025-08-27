
const PriceCard = ({ symbol, name, price, currency }) => {
  return (
    <div className="bg-white border shadow rounded p-4 text-black">
      <div className="text-lg font-bold">{name || symbol}</div>
      {currency && <div className="text-sm">{currency}</div>}
      <div className="text-2xl font-semibold">{price}</div>
    </div>
  );
};

export default PriceCard;
