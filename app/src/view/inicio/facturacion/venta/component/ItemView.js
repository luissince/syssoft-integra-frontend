import { images } from "../../../../../helper";

const ItemView = (props) => {

    const { name, price, inventory, handleAddItem } = props;

    return (
        <button
            type='button'
            className='item-view'
            onClick={handleAddItem}
        >
            <div
                className='item-view_favorite btn px-1 py-1 position-absolute'
                onClick={(e) => {
                    e.stopPropagation();

                }}>
                <img src={images.start} alt='Preferido' />
            </div>
            <div className='item-view_describe'>
                <p className='item-view_describe-title position-absolute'>Inv {inventory}</p>
                <div className='item-view_describe-image'>
                    <img src={images.sale} alt='Venta' width={96} height={96} />
                </div>
            </div>
            <span className='text-center d-block w-100 my-1'><strong>{name}</strong></span>
            <span className='text-center d-block w-100 ml-1 mr-1 mt-1 mb-3 text-xl '>S/ {price}</span>
        </button>
    );
}

export default ItemView;