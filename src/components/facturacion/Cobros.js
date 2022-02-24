import React from 'react';

class Cobros extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <div className='row pb-3'>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'>
                        <section className="content-header">
                        <h5 className="no-margin"> Cobros <small style={{ color: 'gray'}}> Lista </small> </h5>
                        </section>
                    </div>
                </div>

                <div className='row' style={{ border: '1px solid green' }}>
                    <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12'></div>
                </div>
            </>
        );
    }
}

export default Cobros;