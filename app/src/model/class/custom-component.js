import React from 'react';

class CustomComponent extends React.Component {

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

}

export default CustomComponent;